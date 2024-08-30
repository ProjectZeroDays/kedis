import { loadRDB } from "./utils/rdp-loader";
import net from "net";
import crypto from "crypto";
import Parser from "./utils/parser";
import path from "path";
import fs from "fs";
import { commands } from "./utils/commands";
import getBytes from "./utils/get-bytes";

export default class DBStore {
  data: Record<string, DBItem> = {};
  dir: string;
  dbfilename: string;
  id: string = crypto.randomBytes(16).toString("hex");
  offset: number = 0;
  role: "master" | "slave";
  master?: { id: string; host: string; port: number };
  port: number;
  path: string;
  replicas: [string, net.Socket][] = [];
  commands: Buffer[] = [];
  locked: boolean = false;
  replicationOffset: number = 0;
  streamsBlocksTiming: Record<string, number> = {};
  streamListeners: Record<string, [number, ((data: StreamDBItem) => void)][]> = {};

  constructor(
    role: "master" | "slave",
    port: number,
    dir: string,
    dbfilename: string,
    master: string,
    masterId?: string
  ) {
    this.role = role;
    this.dir = dir;
    this.dbfilename = dbfilename;
    this.port = port;

    const filePath = path.join(dir, dbfilename);
    this.path = filePath;

    if (role === "master") {
      this.data = loadRDB(filePath);
    }

    if (role === "slave" && master && masterId) {
      const [host, port] = master.split(" ");
      this.master = { host, port: parseInt(port), id: masterId };
    }

    if (this.role === "slave") this.connectMaster();
  }

  private connectMaster() {
    const master = this.master!;
    const socket = new net.Socket();
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
        this.data = loadRDB(file);
        fs.unlinkSync(file);
        loadedFile = true;
      }

      const parsed = Parser.parseBatch(data);

      for (const c of parsed) {
        if (!c) continue;

        const { command, params, txt } = c!;

        const func = commands[command];
        if (func) {
          func(socket, params, this, data);
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
    console.warn("Replicas:", this.replicas.length);
    this.replicas.forEach((r) => r[1].write(txt));
  }

  set(
    key: string,
    value: string,
    px: number | undefined = undefined,
    type: BaseDBItem["type"] = "string",
    id?: string
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

    this.data[key] = item;
  }

  setStream(
    key: string,
    value: Record<string, BaseDBItem>,
    type: StreamDBItem["type"] = "stream"
  ) {
    const existItem = this.data[key] as StreamDBItem | undefined;
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

      this.data[key] = existItem;
      this.streamsBlocksTiming[key] = Date.now();
      this.executeListeners(key, {...existItem, entries: entries});

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

    this.data[key] = item;
    this.streamsBlocksTiming[key] = Date.now();
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

  deleteStreamListener(key: string) {
    delete this.streamListeners[key];
  }

  getStream(key: string) {
    return this.data[key] as StreamDBItem | undefined;
  }

  get(key: string) {
    const data = this.data[key];
    const now = new Date();

    if (!data) return null;

    if ((data.px ?? now) < now) {
      delete this.data[key];
      return null;
    }

    return data;
  }

  delete(raw: Buffer, key: string) {
    delete this.data[key];
    // this.pushToReplicas(raw);
  }

  keys(regexString: string) {
    const keys = Object.keys(this.data);

    if (regexString === "" || regexString === "*") {
      return keys;
    }

    const regex = new RegExp(regexString);
    return keys.filter((key) => regex.test(key));
  }
}
