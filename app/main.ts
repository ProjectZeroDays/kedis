import DBStore from "./db-store";
import readConfig from "./utils/read-config";
import execute from "./utils/execute-command";
import buildKServer from "./utils/build-kserver";
import http from "node:http";
import Parser from "./utils/parser";
import logger from "./utils/logger";
import Benchmark from "benchmark";
import { KServer } from "./k-server";
import KDB from "./utils/kdb";
import path from "path";

const config = readConfig();

logger.info("kdb-path: " + path.join(config.dir, config.dbfilename));
logger.info("kedis-port: " + config.port);

const kdb = new KDB(
  path.join(config.dir, config.dbfilename),
  config.saveperiod
);

const store = new DBStore({
  role: config.replicaof ? "slave" : "master",
  port: config.port,
  dir: config.dir,
  dbfilename: config.dbfilename,
  master: config.replicaof,
  masterId: config.replicaof ? config.replicaof.split(" ")[0] : undefined,
  colllections: config.collections,
  kdb,
});

const runBenchmark = async (kserver: KServer, body: Buffer) => {
  const suite = new Benchmark.Suite();

  logger.info("running benchmark");
  const parsed = Parser.parse(body)!;
  store.set("foo", "bar");
  store.set("num", "1");

  // for (let i = 0; i < 100000; i++) {
  //   const now = Date.now() + Math.random() * Math.random();
  //   store.set(`foo-${now}`, `bar-${now}`);
  // }

  // logger.info("added 100K new points");

  suite.add("SET", () => {
    const now = Date.now();
    store.set(`foo-${now}`, "bar");
  });

  suite.add("GET", () => {
    store.get("foo");
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

const totalItems = 1000000;
const batchSize = 10000;

function processBatch(startIndex: number) {
  for (
    let i = startIndex;
    i < Math.min(startIndex + batchSize, totalItems);
    i++
  ) {
    const now = Date.now() + Math.random() * Math.random();
    store.set(`foo-${now}`, Parser.toKDBJson({ bar: `bar-${now}` }));
  }

  if (startIndex + batchSize < totalItems) {
    setImmediate(() => processBatch(startIndex + batchSize));
  } else {
    console.log("Processing complete");
  }
}

const runReadBenchmark = async (kserver: KServer, body: Buffer) => {
  const suite = new Benchmark.Suite();
  logger.info("running benchmark");
  let i = 0;

  suite.add("GET", () => {
    store.get(`foo${i}`);
    i++;
  });

  suite
    .on("cycle", (event: any) => {
      console.log(String(event.target));
    })
    .on("complete", function (this: any) {
      logger.info("keys: " + store.keys("*").length);
      logger.info("benchmark finished");
    });

  await suite.run({ async: true });
};

const httpserver = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let body = Buffer.alloc(0);

  req.on("data", (chunk) => {
    body = Buffer.concat([body, chunk]);
  });

  req.on("end", async () => {
    try {
      const kserver = buildKServer(res, store);
      const e = await execute(kserver, body, store);

      if (!e) {
        res.statusCode = 400;
        res.end(Parser.errorResponse("Invalid request"));
        return;
      }

      // processBatch(0);
      // await runBenchmark(kserver, body);

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
      `connection with ${req.socket.remoteAddress} closed due to error`
    );
  });
});

// const server: net.Server = net.createServer((connection: net.Socket) => {
//   const kserver = buildKServer(connection, store);

//   connection.on("data", (data: Buffer) => {
//     execute(kserver, data, store);
//   });
// });

// server.listen(config.port, "127.0.0.1");
httpserver.listen(config.port);
