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
    let px: number | undefined = undefined;

    if (args[2] && args[2][1] == "--PX--") {
      px = args[2][0];
    }

    store[key] = {value, at: Date.now(), px};
    console.log(store);

    c.write(Parser.okResponse());
  }

  static GET(c: net.Socket, args: [number, string][], store: DBStore) {
    const key = args[0][1];
    const value = store[key];

    if (!value) {
      c.write(Parser.nilResponse());
      return;
    }

    if (typeof value.px === "number" && Date.now() - value.at > value.px) {
      c.write(Parser.nilResponse());
      store[key] = undefined;
      return;
    }

    c.write(Parser.stringResponse(value.value));
  }
}

export const commands: Record<Command, CommandFunc> = {
  PING: Commands.PING,
  ECHO: Commands.ECHO,
  SET: Commands.SET,
  GET: Commands.GET,
};
