import * as net from "net";
import { commands } from "./utils/commands";
import Parser from "./utils/parser";
import DBStore from "./db-store";
import readConfig from "./utils/read-config";

const config = readConfig();
const store = new DBStore(config.dir, config.dbfilename);

const server: net.Server = net.createServer((connection: net.Socket) => {
  connection.on("data", (data: Buffer) => {
    const { command, params } = Parser.parse(data);
    const func = commands[command];
    func(connection, params, store);
  });
});

server.listen(config.port, "127.0.0.1");
