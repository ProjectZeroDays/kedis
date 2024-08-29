import * as net from "net";
import Parser from "./parser";

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
    store[key] = value;

    console.log([key, value]);
    console.log(store);

    c.write("+OK\r\n");
  }

  static GET(c: net.Socket, args: [number, string][], store: DBStore) {
    const key = args[0][1];
    const value = store[key];

    if (!value) {
      c.write("$-1\r\n");
      return;
    }

    console.log(Parser.stringResponse(value));

    c.write(Parser.stringResponse(value));
  }
}

export const commands: Record<Command, CommandFunc> = {
  PING: Commands.PING,
  ECHO: Commands.ECHO,
  SET: Commands.SET,
  GET: Commands.GET,
};
