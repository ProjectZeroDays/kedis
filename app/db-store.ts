import { loadRDB } from "./utils/rdp-loader";
import * as net from "net";
import * as crypto from "crypto";
import Parser from "./utils/parser";
import TCP from "./utils/tcp";

export default class DBStore {
  data: Record<string, DBItem> = {};
  dir: string;
  dbfilename: string;
  id: string = `${crypto.randomUUID()}`;
  offset: number = 0;
  role: "master" | "slave";
  master?: { host: string; port: number };
  port: number;

  constructor(
    role: "master" | "slave",
    port: number,
    dir: string,
    dbfilename: string,
    master: string
  ) {
    this.role = role;
    this.dir = dir;
    this.dbfilename = dbfilename;
    this.port = port;

    this.data = loadRDB({ dir, dbfilename });

    if (role === "slave" && master) {
      const [host, port] = master.split(" ");
      this.master = { host, port: parseInt(port) };
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
    ];

    socket.on("data", (data: Buffer) => {
      step += 1;
      if (step <= 2) {
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
