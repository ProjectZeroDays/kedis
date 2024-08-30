import * as net from "net";
import { commands } from "./utils/commands";
import Parser from "./utils/parser";
import DBStore from "./db-store";
import readConfig from "./utils/read-config";
import { KServer } from "./k-server";
import Queue from "./queue";
import execute from "./utils/execute-command";
import buildKServer from "./utils/build-kserver";

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
  const kserver = buildKServer(connection, store);

  connection.on("data", (data: Buffer) => {
    execute(kserver, data, store);
  });
});

server.listen(config.port, "127.0.0.1");
