import * as net from "net";
import Parser from "./parser";
import DBStore from "../db-store";

type CommandFunc = (
  c: net.Socket,
  params: [number, string][],
  store: DBStore
) => void;

class Commands {
  static PING(c: net.Socket) {
    c.write("+PONG\r\n");
  }

  static ECHO(c: net.Socket, params: [number, string][]) {
    const value = Parser.stringResponse(params[0][1]);
    c.write(value);
  }

  static SET(c: net.Socket, args: [number, string][], store: DBStore) {
    const [key, value] = [args[0][1], args[1][1]];
    let px: number | undefined = undefined;

    if (args[2] && args[2][1] == "--PX--") {
      px = args[2][0];
    }

    store.set(key, value, px);
    c.write(Parser.okResponse());
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

  static INFO(c: net.Socket, args: [number, string][], store: DBStore) {
    const res: string[] = [];

    res.push(`role:${store.role}`);
    res.push(`master_replid:${store.id}`);
    res.push(`master_repl_offset:${store.offset}`);

    c.write(Parser.stringResponse(res.join("\n")));
  }

  static REPLCONF(c: net.Socket, args: [number, string][], store: DBStore) {
    c.write(Parser.okResponse());
  }

  static PSYNC(c: net.Socket, args: [number, string][], store: DBStore) {
    const [replid, offset] = [args[0][1], args[1][1]];
    c.write(Parser.simpleResponse(`FULLRESYNC ${store.id}`));
  }
}

export const commands: Record<Command, CommandFunc> = {
  PING: Commands.PING,
  ECHO: Commands.ECHO,
  SET: Commands.SET,
  GET: Commands.GET,
  CONFIG: Commands.CONFIG,
  KEYS: Commands.KEYS,
  INFO: Commands.INFO,
  REPLCONF: Commands.REPLCONF,
  PSYNC: Commands.PSYNC,
};
