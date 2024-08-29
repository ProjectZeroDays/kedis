import * as net from "net";
import Parser from "./parser";
import DBStore from "../db-store";

type CommandFunc = (
  c: net.Socket,
  params: [number, string][],
  store: DBStore,
  raw: Buffer
) => void;

const EMPTY_RDB = Buffer.from(
  "524544495330303131fa0972656469732d76657205372e322e30fa0a72656469732d62697473c040fa056374696d65c26d08bc65fa08757365642d6d656dc2b0c41000fa08616f662d62617365c000fff06e3bfec0ff5aa2",
  "hex"
);

export const availableCommands: Command[] = [
  "PING",
  "ECHO",
  "SET",
  "GET",
  "DEL",
  "CONFIG",
  "KEYS",
  "INFO",
  "REPLCONF",
  "PSYNC",
];

class Commands {
  static PING(c: net.Socket) {
    c.write("+PONG\r\n");
  }

  static ECHO(c: net.Socket, params: [number, string][]) {
    const value = Parser.stringResponse(params[0][1]);
    c.write(value);
  }

  static SET(
    c: net.Socket,
    args: [number, string][],
    store: DBStore,
    raw: Buffer
  ) {
    const [key, value] = [args[0][1], args[1][1]];
    let px: number | undefined = undefined;

    if (args[2] && args[2][1] == "--PX--") {
      px = args[2][0];
    }

    store.set(raw, key, value, px);
    if (store.role === "master") {
      const [_a, _b, _c, ...params] = Parser.getArgs(raw);
      const msg = Parser.listResponse([
        "SET",
        ...params.filter((p) => p.startsWith("$") === false),
      ]);
      console.log("MSG", msg);

      store.pushToReplicas(msg);
      c.write(Parser.okResponse());
    }
  }

  static GET(c: net.Socket, args: [number, string][], store: DBStore) {
    const key = args[0][1];
    const value = store.get(key);

    if (!value) {
      c.write(Parser.nilResponse());
      return;
    }

    c.write(Parser.dynamicResponse(value.value));
  }

  static GET_CONFIG(c: net.Socket, args: [number, string][], store: DBStore) {
    const res: string[] = [];

    for (const a of args) {
      if (Parser.matchInsensetive(a[1], "dir")) {
        res.push("dir");
        res.push(store.dir);
        continue;
      }

      if (Parser.matchInsensetive(a[1], "dbfilename")) {
        res.push("dbfilename");
        res.push(store.dbfilename);
      }
    }

    c.write(Parser.listResponse(res));
  }

  static DEL(
    c: net.Socket,
    args: [number, string][],
    store: DBStore,
    raw: Buffer
  ) {
    const key = args[0][1];
    store.delete(raw, key);
    if (store.role === "master") c.write(Parser.okResponse());
  }

  static CONFIG(c: net.Socket, args: [number, string][], store: DBStore) {
    const cmdType = args[0][1];

    if (Parser.matchInsensetive(cmdType, "get")) {
      Commands.GET_CONFIG(c, args.slice(1), store);
    }
  }

  static KEYS(c: net.Socket, args: [number, string][], store: DBStore) {
    const regex = args[0][1];
    const keys = store.keys(regex);

    c.write(Parser.listResponse(keys));
  }

  static INFO(c: net.Socket, _args: [number, string][], store: DBStore) {
    const res: string[] = [];

    res.push(`role:${store.role}`);
    res.push(`master_replid:${store.id}`);
    res.push(`master_repl_offset:${store.offset}`);

    c.write(Parser.stringResponse(res.join("\n")));
  }

  static REPLCONF(c: net.Socket) {
    c.write(Parser.okResponse());
  }

  static PSYNC(c: net.Socket, args: [number, string][], store: DBStore) {
    const [replid, offset] = [args[0][1], args[1][1]];
    c.write(Parser.simpleResponse(`FULLRESYNC ${store.id} ${store.offset}`));
    c.write(
      Buffer.concat([
        Buffer.from(`$${EMPTY_RDB.length}\r\n`, "utf8"),
        EMPTY_RDB,
      ])
    );

    store.addReplica(c);
  }
}

export const commands: Record<Command, CommandFunc> = {
  PING: Commands.PING,
  ECHO: Commands.ECHO,
  SET: Commands.SET,
  GET: Commands.GET,
  DEL: Commands.DEL,
  CONFIG: Commands.CONFIG,
  KEYS: Commands.KEYS,
  INFO: Commands.INFO,
  REPLCONF: Commands.REPLCONF,
  PSYNC: Commands.PSYNC,
};
