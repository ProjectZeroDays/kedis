import * as net from "net";

type CommandFunc = (c: net.Socket, args: string[]) => void;

class Commands {
  static PING(c: net.Socket, args: string[]) {
    c.write("+PONG\r\n");
  }

  static ECHO(c: net.Socket, args: string[]) {
    const txt = args[4];
    c.write(`$${txt.length}\r\n${txt}\r\n`);
  }
}

export const commands: Record<Command, CommandFunc> = {
  PING: Commands.PING,
  ECHO: Commands.ECHO,
};
