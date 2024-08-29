import * as net from "net";
import { commands } from "./utils/commands";
import Parser from "./utils/parser";

var store: DBStore = {};

const server: net.Server = net.createServer((connection: net.Socket) => {
  connection.on("data", (data: Buffer) => {
    const { command, params } = Parser.parse(data);
    const func = commands[command];
    func(connection, params, store);
  });
});

server.listen(6379, "127.0.0.1");
