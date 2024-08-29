import { loadRDB } from "./utils/rdp-loader";
import * as net from "net";
import * as crypto from "crypto";
import Parser from "./utils/parser";
import TCP from "./utils/tcp";
import path from "path";

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

  constructor(
    role: "master" | "slave",
    port: number,
    dir: string,
    dbfilename: string,
    master: string,
    masterId?: string,
  ) {
    this.role = role;
    this.dir = dir;
    this.dbfilename = dbfilename;
    this.port = port;

    const filePath = path.join(dir, dbfilename);
    this.path = filePath;
    this.data = loadRDB(filePath);

    if (role === "slave" && master && masterId) {
      const [host, port] = master.split(" ");
      this.master = { host, port: parseInt(port), id: masterId };
    }

    if (this.role === "slave") this.connectMaster();
  }

  connectMaster() {
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
      step += 1;
      if (step <= steps.length-1) {
        steps[step]();
        return;
      }
    });

    // start step
    steps[0]();
  }

  set(key: string, value: string, px?: number) {
    const expiration: Date | undefined = px
      ? new Date(Date.now() + px)
      : undefined;
    const typedValue = !isNaN(parseInt(value)) ? Number(value) : value;
    const type = typeof typedValue === "string" ? "string" : "number";

    this.data[key] = { value: typedValue, px: expiration, type };
  }

  get(key: string) {
    console.log(this.data);
    const data = this.data[key];
    const now = new Date();

    if (!data) return null;

    if ((data.px ?? now) < now) {
      delete this.data[key];
      return null;
    }

    return data;
  }

  delete(key: string) {
    delete this.data[key];
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
