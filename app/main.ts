import * as net from "net";
import { commands } from "./utils/commands";
import Parser from "./utils/parser";
import DBStore from "./db-store";
import readConfig from "./utils/read-config";
import { KServer } from "./k-server";
import Queue from "./queue";

const config = readConfig();

const store = new DBStore(
  config.replicaof ? "slave" : "master",
  config.port,
  config.dir,
  config.dbfilename,
  config.replicaof,
  config.replicaof ? config.replicaof.split(" ")[0] : undefined
);

const queues: [KServer, Queue][] = [];

const execute = async (kserver: KServer, data: Buffer, jump: boolean = false) => {
  if (kserver.queue.locked && !jump) {
    kserver.queueCommand(kserver, data);
    return;
  }

  const parsed = Parser.parse(data);
  // console.log("parsed", parsed);
  if (!parsed) return;

  const { command, params } = parsed;

  const func = commands[command];
  if (!func) return;

  await func(kserver, params, store, data);
};

const server: net.Server = net.createServer((connection: net.Socket) => {
  const kserver = connection as any as KServer;

  const queue = new Queue(kserver);
  queues.push([kserver, queue]);

  kserver.queue = queue;

  kserver.queueWrite = (c: KServer, data: string | Uint8Array) => {
    if (!c.queue.locked) {
      c.write(data);
      return;
    }

    c.queue.addResult(data);
  };

  kserver.queueCommand = (c: KServer, data: Buffer) => {
    c.queue.add(data);
  };

  kserver.executeQueued = async (c) => {
    for (const command of c.queue.queue) {
      await execute(kserver, command, true);
    }

    const results = c.queue.getResults();
    console.log("results", results);

    c.write(Parser.listResponse(results, false));
    c.queue.flush();
  };

  connection.on("data", (data: Buffer) => {
    execute(kserver, data);
  });
});

server.listen(config.port, "127.0.0.1");
