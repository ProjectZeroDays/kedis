import { loadRDB } from "./utils/rdp-loader";
import net from "net";
import crypto from "crypto";
import Parser from "./utils/parser";
import path from "path";
import fs from "fs";
import { commands } from "./utils/commands";

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
      console.log("Message from master: ", data.toString());

      if (step === steps.length - 1) {
        const file = `/tmp/${Date.now()}.rdb`;
        const contents = Parser.readRdbFile(data);
        if (contents) {
          fs.writeFileSync(file, contents);
          this.data = loadRDB(file);
          fs.unlinkSync(file);
        }
      }

      step += 1;

      if (step >= steps.length) {
        const parsed = Parser.parseBatch(data);

        for (const c of parsed) {
          const { command, params } = c!;

          console.log(command);
          const func = commands[command];
          func(socket, params, this, data);
        }
      }

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
    this.commands.forEach((cmd) =>
      c.write(Parser.listResponse([cmd.toString()]))
    );

    c.on("close", () => {
      this.replicas = this.replicas.filter((r) => r[0] !== id);
    });
  }

  pushToReplicas(raw: Buffer) {
    const txt = raw.toString();
    console.warn("Replicas:", this.replicas.length);
    this.replicas.forEach((r) => r[1].write(Parser.listResponse([txt])));
    this.commands.push(raw);
  }

  updateReplica(c: net.Socket) {
    this.commands.forEach((cmd) => c.write(cmd));
  }

  set(
    raw: Buffer,
    key: string,
    value: string,
    px: number | undefined = undefined
  ) {
    const expiration: Date | undefined = px
      ? new Date(Date.now() + px)
      : undefined;
    const typedValue = !isNaN(parseInt(value)) ? Number(value) : value;
    const type = typeof typedValue === "string" ? "string" : "number";

    this.data[key] = { value: typedValue, px: expiration, type };
    this.pushToReplicas(raw);
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
    this.pushToReplicas(raw);
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
