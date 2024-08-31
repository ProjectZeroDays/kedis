import * as net from "net";
import DBStore from "./db-store";
import readConfig from "./utils/read-config";
import execute from "./utils/execute-command";
import buildKServer from "./utils/build-kserver";

const config = readConfig();

const store = new DBStore({
  role: config.replicaof ? "slave" : "master",
  port: config.port,
  dir: config.dir,
  dbfilename: config.dbfilename,
  master: config.replicaof,
  masterId: config.replicaof ? config.replicaof.split(" ")[0] : undefined,
});

const server: net.Server = net.createServer((connection: net.Socket) => {
  const kserver = buildKServer(connection, store);

  connection.on("data", (data: Buffer) => {
    execute(kserver, data, store);
  });
});

server.listen(config.port, "127.0.0.1");
