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
    console.log(args);

    const [key, value] = [args[0][1], args[1][1]];
    let px: number | undefined = undefined;

    if (args[2] && args[2][1] == "--PX--") {
      px = args[2][0];
    }

    store.set(key, value, px);
    console.log(store);

    c.write(Parser.okResponse());
  }

  static GET(c: net.Socket, args: [number, string][], store: DBStore) {
    const key = args[0][1];
    const value = store.get(key);

    if (!value) {
      c.write(Parser.nilResponse());
      return;
    }

    c.write(Parser.stringResponse(value.value));
  }

  static GET_CONFIG(c: net.Socket, args: [number, string][], store: DBStore) {
    const res: string[] = [];

    for (const a of args) {
      if (Parser.matchInsensetive(a[1], Parser.stringResponse("dir"))) {
        res.push("dir");
        res.push(Parser.stringResponse(store.dir));
        continue;
      }

      if (Parser.matchInsensetive(a[1], Parser.stringResponse("dbfilename"))) {
        res.push("dbfilename");
        res.push(Parser.stringResponse(store.dbfilename));
      }
    }

    console.log(res);

    c.write(`*${res.length}\r\n${res.join("")}`);
  }

  static CONFIG(c: net.Socket, args: [number, string][], store: DBStore) {
    const cmdType = args[0][1];

    if (Parser.matchInsensetive(cmdType, "get")) {
      Commands.GET_CONFIG(c, args.slice(1), store);
    }
  }
}

export const commands: Record<Command, CommandFunc> = {
  PING: Commands.PING,
  ECHO: Commands.ECHO,
  SET: Commands.SET,
  GET: Commands.GET,
  CONFIG: Commands.CONFIG,
};
