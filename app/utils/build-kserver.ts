import * as net from "net";
import { KServer } from "../k-server";
import Queue from "../queue";
import execute from "./execute-command";
import Parser from "./parser";
import DBStore from "../db-store";
import http from "node:http";
import { IncomingMessage } from "http";
import Auth from "./auth";

export default function buildKServer(
  c: net.Socket | http.ServerResponse<IncomingMessage>,
  store: DBStore
) {
  const kserver = c as any as KServer;
  const queue = new Queue(kserver);

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
    c.write(Parser.simpleResponse("QUEUED"));
  };

  kserver.executeQueued = async (c) => {
    for (const command of c.queue.queue) {
      await execute(kserver, command, store, new Auth(), {});
    }

    const results = c.queue.getResults();
    console.log("results", results);

    c.write(Parser.listResponse(results, false));
    c.queue.flush();
  };

  return kserver;
}
