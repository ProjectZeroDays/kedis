import * as net from "net";
import { commands } from "./utils/commands";
import Parser from "./utils/parser";
import DBStore from "./db-store";
import readConfig from "./utils/read-config";

const config = readConfig();

const store = new DBStore(
  config.replicaof ? "slave" : "master",
  config.port,
  config.dir,
  config.dbfilename,
  config.replicaof,
  config.replicaof ? config.replicaof.split(" ")[0] : undefined
);

const server: net.Server = net.createServer((connection: net.Socket) => {
  connection.on("data", (data: Buffer) => {
    console.log("NEW REQUEST");

    const parsed = Parser.parse(data);
    if (!parsed) return;

    const { command, params } = parsed;

    const func = commands[command];
    if (!func) return;

    func(connection, params, store, data);
    // store.offset += getBytes(data);
  });
});

server.listen(config.port, "127.0.0.1");
