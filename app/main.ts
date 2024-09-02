import DBStore from "./db-store";
import readConfig from "./utils/read-config";
import execute from "./utils/execute-command";
import buildKServer from "./utils/build-kserver";
import http from "node:http";
import Parser from "./utils/parser";
import logger from "./utils/logger";
import Benchmark from "benchmark";
import KDB from "./utils/kdb";
import path from "path";
import Auth from "./utils/auth";
import { Server } from "ws";

const config = readConfig();

logger.info("kdb-path: " + path.join(config.dir, config.dbfilename));
logger.info("kedis-port: " + config.port);

const kdbPath = path.join(config.dir, config.dbfilename);
const kdb = new KDB(kdbPath, config.saveperiod);
const auth = new Auth();

let storeReady = false;

const store = new DBStore({
  role: config.replicaof ? "slave" : "master",
  port: config.port,
  dir: config.dir,
  dbfilename: config.dbfilename,
  master: config.replicaof,
  masterId: config.replicaof ? config.replicaof.split(" ")[0] : undefined,
  colllections: [],
  kdb,
});

const runBenchmark = async () => {
  const suite = new Benchmark.Suite();
  await store.isReady();

  logger.info("running benchmark");
  store.set("foo", "bar");
  store.set("num", "1");

  suite.add("SET", () => {
    const now = Date.now();
    store.set(`foo-${now}`, "bar");
  });

  suite.add("KSET", () => {
    store.set(
      "jhon",
      Parser.toKDBJson({ "first-name": "Jhon", "last-name": "Doe", age: 25 }),
      undefined,
      "string",
      undefined,
      "people"
    );
  });

  suite.add("GET", () => {
    store.get("foo");
  });

  suite.add("KGET", () => {
    store.get("jhon", "people");
  });

  suite.add("DEL", () => {
    store.delete("foo");
  });

  suite.add("EXISTS", () => {
    store.exists("foo");
  });

  suite.add("INCR", () => {
    store.increment("num");
  });

  suite.add("KEYS", () => {
    store.keys("*");
  });

  suite
    .on("cycle", (event: any) => {
      console.log(String(event.target));
    })
    .on("complete", function (this: any) {
      logger.info("keys: " + store.keys("*").length);
      logger.info("incremented num: " + store.get("num")!.value);
      logger.info("benchmark finished");
    });

  await suite.run({ async: true });
};

// const totalItems = 1000000;
// const batchSize = 10000;

// function processBatch(startIndex: number) {
//   for (
//     let i = startIndex;
//     i < Math.min(startIndex + batchSize, totalItems);
//     i++
//   ) {
//     const now = Date.now() + Math.random() * Math.random();
//     store.set(`foo-${now}`, Parser.toKDBJson({ bar: `bar-${now}` }));
//   }

//   if (startIndex + batchSize < totalItems) {
//     setImmediate(() => processBatch(startIndex + batchSize));
//   } else {
//     console.log("Processing complete");
//   }
// }

// Bun.serve({
//   port: config.realtimeport,
//   fetch(req, server) {
//     if (server.upgrade(req)) {
//       return;
//     }

//     return new Response("Upgrade failed", { status: 500 });
//   },

//   websocket: {
//     message(ws, msg) {
//       const content = typeof msg === "string" ? msg : msg.toString();
//       const json = JSON.parse(content);

//       if (json.type?.toLowerCase?.() === "subscribe") {
//         store.subscribe(ws, json.collection, json.key);
//         logger.info(`subscribed to ${json.collection}:${json.key}`);
//         ws.send(`${json.id}: ${Parser.okResponse()}`);
//         return;
//       }

//       if (json.type?.toLowerCase?.() === "unsubscribe") {
//         store.unsubscribe(ws, json.collection, json.key);
//         ws.send(`${json.id}: ${Parser.okResponse()}`);
//         return;
//       }

//       ws.send(`${json.id}: ${Parser.nilResponse()}`);
//     },
//     open(ws) {
//       store.realtime.add(ws);
//     },
//     close(ws) {
//       store.realtime.remove(ws);
//     },
//   },

//   error(err) {
//     return new Response(Parser.errorResponse(`error: ${err.message}`));
//   },
// });

const realtimeServer = new Server({ port: config.realtimeport });

realtimeServer.on("connection", (ws) => {
  store.realtime.add(ws);

  ws.on("close", () => {
    store.realtime.remove(ws);
  });

  ws.on("message", (msg) => {
    const content = typeof msg === "string" ? msg : msg.toString();
    const json = JSON.parse(content);

    if (json.type?.toLowerCase?.() === "subscribe") {
      store.subscribe(ws, json.collection, json.key);
      logger.info(`subscribed to ${json.collection}:${json.key}`);
      ws.send(`${json.id}: ${Parser.okResponse()}`);
      return;
    }

    if (json.type?.toLowerCase?.() === "unsubscribe") {
      store.unsubscribe(ws, json.collection, json.key);
      ws.send(`${json.id}: ${Parser.okResponse()}`);
      return;
    }

    ws.send(`${json.id}: ${Parser.nilResponse()}`);
  });
});

const httpserver = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const headers = req.headers;
  let body = Buffer.alloc(0);

  req.on("data", (chunk) => {
    body = Buffer.concat([body, chunk]);
  });

  req.on("end", async () => {
    try {
      if (!storeReady) {
        await store.isReady();
        storeReady = true;
      }

      const kserver = buildKServer(res, store);
      const e = await execute(kserver, body, store, auth, headers);

      if (!e) {
        res.statusCode = 400;
        res.end(Parser.errorResponse("Invalid request"));
        return;
      }

      res.end();
    } catch (err) {
      logger.error("error: " + err);
      res.statusCode = 500;
      res.end(Parser.errorResponse("Internal server error"));
    }
  });

  req.on("error", (err) => {
    logger.error("error: " + err.message);
    res.statusCode = 500;
    res.end(Parser.errorResponse(err.message));
    logger.info(
      `connection with ${req.socket.remoteAddress} closed due to error: ${err.message}`
    );
  });
});

httpserver.listen(config.port);

// Uncoment to run some benchmarks
// runBenchmark();

// ---- Uncomment this on to enable tcp-based server (make sure to comment the http server)
// const server: net.Server = net.createServer((connection: net.Socket) => {
//   const kserver = buildKServer(connection, store);

//   connection.on("data", (data: Buffer) => {
//     execute(kserver, data, store);
//   });
// });

// server.listen(config.port, "127.0.0.1");
