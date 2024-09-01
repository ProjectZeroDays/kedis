import { loadRDB } from "./utils/rdp-loader";
import net from "net";
import crypto from "crypto";
import Parser from "./utils/parser";
import path from "path";
import fs from "fs";
import { commands } from "./utils/commands";
import getBytes from "./utils/get-bytes";
import { KServer } from "./k-server";
import buildKServer from "./utils/build-kserver";
import KDB from "./utils/kdb";
import logger from "./utils/logger";

interface Props {
  role: "master" | "slave";
  port: number;
  dir: string;
  dbfilename: string;
  master: string | undefined;
  masterId?: string;
  colllections: Collection[];
  kdb: KDB;
}

type StreamListeners = Record<string, [number, (data: StreamDBItem) => void][]>;

export default class DBStore {
  data: Record<string, Record<string, DBItem>> = { default: {} };
  collections: Collection[];
  collectionsIds: string[];

  dir: string;
  dbfilename: string;
  id: string = crypto.randomBytes(16).toString("hex");
  offset: number = 0;
  role: "master" | "slave";
  master?: { id: string; host: string; port: number };

  port: number;
  path: string;
  replicas: [string, net.Socket][] = [];
  streamListeners: StreamListeners = {};

  commands: string[] = [];
  commandsKeys: string[] = [];
  commandsLookup: Map<string, string> = new Map();

  constructor({
    role,
    port,
    dir,
    dbfilename,
    master,
    masterId,
    colllections,
    kdb,
  }: Props) {
    this.role = role;
    this.dir = dir;
    this.dbfilename = dbfilename;
    this.port = port;
    this.collections = colllections;
    this.collectionsIds = colllections.map((c) => c.id);

    const filePath = path.join(dir, dbfilename);
    this.path = filePath;

    if (role === "slave" && master && masterId) {
      const [host, port] = master.split(" ");
      this.master = { host, port: parseInt(port), id: masterId };
    }

    if (this.role === "slave") {
      this.connectMaster();
      return;
    }

    if (dbfilename.endsWith(".rdb")) {
      this.data["default"] = loadRDB(filePath);
      return;
    }

    const getStore = () => this;
    getStore.bind(this);


    kdb.load(this, () => kdb.writeLoop(getStore));
  }

  private connectMaster() {
    const master = this.master!;
    const socket = new net.Socket();
    const kserver = buildKServer(socket, this);
    kserver.queueWrite = (
      c: net.Socket | KServer,
      data: string | Uint8Array
    ) => {
      c.write(data);
    };

    socket.connect(master.port, master.host);
    let step = 0;
    let loadedFile: boolean = false;

    const steps = [
      () => socket.write(Parser.listResponse(["PING"])),
      () =>
        socket.write(
          Parser.listResponse([
            "REPLCONF",
            "listening-port",
            this.port.toString(),
          ])
        ),
      () => socket.write(Parser.listResponse(["REPLCONF", "capa", "psync2"])),
      () => socket.write(Parser.listResponse(["PSYNC", "?", "-1"])),
    ];

    socket.on("data", (data: Buffer) => {
      const file = `/tmp/${Date.now()}.rdb`;
      const contents = Parser.readRdbFile(data);

      if (!loadedFile && contents) {
        fs.writeFileSync(file, contents);
        this.data["default"] = loadRDB(file);
        fs.unlinkSync(file);
        loadedFile = true;
      }

      const parsed = Parser.parseBatch(data);

      for (const c of parsed) {
        if (!c) continue;

        const { command, params, txt } = c!;

        const func = commands[command];
        if (func) {
          func(kserver, params, this, data);
          console.log("txt:", txt);
          this.offset += getBytes(txt);
        }
      }

      step += 1;
      if (step <= steps.length - 1) {
        steps[step]();
      }
    });

    // start step
    steps[0]();
  }

  addReplica(c: net.Socket) {
    const id = `${crypto.randomUUID()}`;
    this.replicas.push([id, c]);

    c.on("close", () => {
      this.replicas = this.replicas.filter((r) => r[0] !== id);
    });
  }

  pushToReplicas(txt: string) {
    this.replicas.forEach((r) => r[1].write(txt));
  }

  set(
    key: string,
    value: string,
    px: number | undefined = undefined,
    type: BaseDBItem["type"] = "string",
    id?: string,
    collection: string = "default"
  ) {
    const expiration: Date | undefined = px
      ? new Date(Date.now() + px)
      : undefined;
    const typedValue = !isNaN(parseInt(value)) ? Number(value) : value;

    const item: BaseDBItem = {
      value: typedValue,
      px: expiration,
      type,
      itemType: "base",
      id: id || crypto.randomUUID(),
    };

    this.data[collection][key] = item;
    this.addSetCommand(key, value, collection);
  }

  addSetCommand(
    key: string,
    value: string,
    collection: string = "default"
  ) {
    const command = Parser.commandString(key, value, collection);
    this.commandsLookup.set(command.split("<-KC->")[0], command);
  }

  loadSetCommand(key: string, collection: string) {
    const commandKey = Parser.commandKey(key, collection);
    const exist = this.commandsLookup.get(commandKey);

    if (exist) return;

    const keyExist = this.commandsKeys.indexOf(commandKey);

    if (keyExist === -1) {
      logger.error(`set command doesn't exist: ${commandKey}`);
      return;
    }

    const parsed = Parser.readCommandString(this.commands[keyExist]);
    if (!parsed) return;

    this.set(
      parsed.key,
      parsed.value,
      undefined,
      "string",
      undefined,
      parsed.collection
    );
  }

  get(
    key: string,
    collection: string = "default",
    turn: boolean = false
  ): null | DBItem {
    const data = this.data[collection][key];
    if (!data && turn) return null;

    if (!data) {
      this.loadSetCommand(key, collection);
      return this.get(key, collection, true);
    }

    if (!data.px) return data;
    const now = new Date();

    if (data.px < now) {
      delete this.data[key];
      return null;
    }

    return data;
  }

  delete(key: string, collection: string = "default") {
    delete this.data[collection][key];
    this.commandsLookup.delete(key);
  }

  exists(
    key: string,
    collection: string = "default",
    turn: boolean = false
  ): boolean {
    const exist = this.data[collection][key];

    if (!exist && turn) return false;

    if (!exist) {
      this.loadSetCommand(key, collection);
      return this.exists(key, collection, true);
    }

    return true;
  }

  increment(
    key: string,
    value: number = 1,
    collection: string = "default",
    turn: boolean = false
  ): null | number {
    const item = this.get(key, collection);

    if (!item && turn) {
      this.set(key, value.toString());
      return value;
    }

    if (!item) {
      this.loadSetCommand(key, collection);
      return this.increment(key, value, collection, true);
    }

    if (typeof item.value !== "number") {
      return null;
    }

    this.set(key, (item.value + value).toString());
    return item.value + value;
  }

  setStream(
    key: string,
    value: Record<string, BaseDBItem>,
    type: StreamDBItem["type"] = "stream"
  ) {
    const existItem = this.data["default"][key] as StreamDBItem | undefined;
    const entries: StreamDBItem["entries"] = [];
    const keyValue: [string, string | number][] = [];

    for (const key of Object.keys(value)) {
      keyValue.push([key, value[key].value]);
    }

    if (existItem) {
      Object.keys(value).forEach((element) => {
        existItem.value[element] = value[element];
        existItem.entries.push([value[element].id, keyValue]);
        entries.push([value[element].id, keyValue]);
      });

      this.data["default"][key] = existItem;
      this.executeListeners(key, { ...existItem, entries: entries });

      return;
    } else {
      Object.keys(value).forEach((element) => {
        entries.push([value[element].id, keyValue]);
      });
    }

    const item: StreamDBItem = {
      value,
      type,
      itemType: "stream",
      streamKey: key,
      entries,
    };

    this.data["default"][key] = item;
    this.executeListeners(key, item);
  }

  addStreamListener(
    key: string,
    time: number,
    listener: (data: StreamDBItem) => void
  ) {
    if (!this.streamListeners[key]) {
      this.streamListeners[key] = [];
    }

    this.streamListeners[key].push([time, listener]);

    if (time === 0) return;

    setTimeout(() => {
      this.streamListeners[key] = this.streamListeners[key].filter(
        (l) => l[0] !== time
      );
    }, time);
  }

  executeListeners(streamKey: string, data: StreamDBItem) {
    const listeners = this.streamListeners[streamKey];

    if (!listeners) return;

    listeners.forEach((l) => {
      l[1](data);
    });
  }

  getStreamListener(key: string) {
    return this.streamListeners[key];
  }

  deleteStreamListener(key: string, listener: (data: StreamDBItem) => void) {
    this.streamListeners[key] = this.streamListeners[key].filter(
      (l) => l[1] !== listener
    );
  }

  deleteStreamListeners(key: string) {
    delete this.streamListeners[key];
  }

  getStream(key: string) {
    return this.data["default"][key] as StreamDBItem | undefined;
  }

  keys(regexString: string, collection: string = "default") {
    const keys = Object.keys(this.data[collection]);

    if (regexString === "" || regexString === "*") {
      return keys;
    }

    const regex = new RegExp(regexString);
    return keys.filter((key) => regex.test(key));
  }
}
