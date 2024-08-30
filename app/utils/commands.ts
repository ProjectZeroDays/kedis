import Parser from "./parser";
import DBStore from "../db-store";
import getBytes from "./get-bytes";
import streamTime, { streamBiggestId, compareStreamTime } from "./stream-time";
import { KServer } from "../k-server";

type CommandFunc = (
  c: KServer,
  params: [number, string][],
  store: DBStore,
  raw: Buffer
) => void;

const EMPTY_RDB = Buffer.from(
  "524544495330303131fa0972656469732d76657205372e322e30fa0a72656469732d62697473c040fa056374696d65c26d08bc65fa08757365642d6d656dc2b0c41000fa08616f662d62617365c000fff06e3bfec0ff5aa2",
  "hex"
);

// sleep function:
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const availableCommands: Command[] = [
  "PING",
  "ECHO",
  "SET",
  "GET",
  "DEL",
  "CONFIG",
  "KEYS",
  "INFO",
  "REPLCONF",
  "PSYNC",
  "WAIT",
  "TYPE",
  "XADD",
  "XRANGE",
  "XREAD",
  "INCR",
  "MULTI",
  "EXEC",
];

class Commands {
  static PING(c: KServer, _params: [number, string][], store: DBStore) {
    if (store.role === "master") {
      c.queueWrite(c, Parser.simpleResponse("PONG"));
    }
  }

  static ECHO(c: KServer, params: [number, string][]) {
    const value = Parser.stringResponse(params[0][1]);
    c.queueWrite(c, value);
  }

  static SET(
    c: KServer,
    args: [number, string][],
    store: DBStore,
    raw: Buffer
  ) {
    const [key, value] = [args[0][1], args[1][1]];
    let px: number | undefined = undefined;

    if (args[2] && args[2][1] == "--PX--") {
      px = args[2][0];
    }

    store.set(key, value, px);
    if (store.role === "master") {
      const replicasCommand = ["SET", key, value];
      if (px) {
        replicasCommand.push("px", px.toString());
      }

      store.pushToReplicas(Parser.listResponse(replicasCommand));
      c.queueWrite(c, Parser.okResponse());
    }
  }

  static GET(c: KServer, args: [number, string][], store: DBStore) {
    const key = args[0][1];
    const value = store.get(key);

    if (!value) {
      c.queueWrite(c, Parser.nilResponse());
      return;
    }

    if (value.itemType === "stream") {
      c.queueWrite(c, 
        Parser.listResponse(
          Object.keys(value.value).map((k) => `${value.value[k].value}`)
        )
      );
      return;
    }

    c.queueWrite(c, Parser.dynamicResponse(value.value));
  }

  static GET_CONFIG(c: KServer, args: [number, string][], store: DBStore) {
    const res: string[] = [];

    for (const a of args) {
      if (Parser.matchInsensetive(a[1], "dir")) {
        res.push("dir");
        res.push(store.dir);
        continue;
      }

      if (Parser.matchInsensetive(a[1], "dbfilename")) {
        res.push("dbfilename");
        res.push(store.dbfilename);
      }
    }

    c.queueWrite(c, Parser.listResponse(res));
  }

  static DEL(
    c: KServer,
    args: [number, string][],
    store: DBStore,
    raw: Buffer
  ) {
    const key = args[0][1];
    store.delete(raw, key);
    if (store.role === "master") {
      store.pushToReplicas(Parser.listResponse(["DEL", key]));
      c.queueWrite(c, Parser.okResponse());
    }
  }

  static CONFIG(c: KServer, args: [number, string][], store: DBStore) {
    const cmdType = args[0][1];

    if (Parser.matchInsensetive(cmdType, "get")) {
      Commands.GET_CONFIG(c, args.slice(1), store);
    }
  }

  static KEYS(c: KServer, args: [number, string][], store: DBStore) {
    const regex = args[0][1];
    const keys = store.keys(regex);

    c.queueWrite(c, Parser.listResponse(keys));
  }

  static INFO(c: KServer, _args: [number, string][], store: DBStore) {
    const res: string[] = [];

    res.push(`role:${store.role}`);
    res.push(`master_replid:${store.id}`);
    res.push(`master_repl_offset:${store.offset}`);

    c.queueWrite(c, Parser.stringResponse(res.join("\n")));
  }

  static REPLCONF(c: KServer, args: [number, string][], store: DBStore) {
    const cmdType = args[0][1];

    if (cmdType === "GETACK") {
      c.queueWrite(c, Parser.listResponse(["REPLCONF", "ACK", `${store.offset}`]));

      if (args.length < 3) {
        store.offset += getBytes("*\r\n");
      }

      return;
    }

    if (cmdType === "ACK") return;

    if (store.role === "master") {
      c.queueWrite(c, Parser.okResponse());
    }
  }

  static PSYNC(c: KServer, args: [number, string][], store: DBStore) {
    const [replid, offset] = [args[0][1], args[1][1]];
    c.queueWrite(c, Parser.simpleResponse(`FULLRESYNC ${store.id} ${store.offset}`));
    c.queueWrite(c, 
      Buffer.concat([
        Buffer.from(`$${EMPTY_RDB.length}\r\n`, "utf8"),
        EMPTY_RDB,
      ])
    );

    store.addReplica(c);
  }

  static WAIT(c: KServer, args: [number, string][], store: DBStore) {
    const [repls, timeout] = [args[0][0], args[1][0]];

    // get the minimum number between store.replicas.length and repls
    let neededRepls = Math.min(store.replicas.length, repls);

    if (neededRepls === 0) {
      return c.queueWrite(c, Parser.numberResponse(store.replicas.length));
    }

    if (neededRepls > store.replicas.length) {
      neededRepls = store.replicas.length;
    }

    let timeoutHandler: NodeJS.Timeout;
    let passed: boolean = false;
    const acks = [];
    const listener = (data: Buffer) => {
      const parsed = Parser.parse(data);
      if (!parsed) return;

      const { command, params } = parsed;

      if (
        Parser.matchInsensetive(command, "REPLCONF") &&
        Parser.matchInsensetive(params[0][1], "ACK")
      ) {
        acks.push(1);
      }

      if (acks.length >= neededRepls) {
        clearTimeout(timeoutHandler);
        if (passed) return;
        passed = true;
        store.replicas.forEach((r) => r[1].off("data", listener));
        c.queueWrite(c, Parser.numberResponse(acks.length));
      }
    };

    store.replicas.forEach((r) => {
      r[1].on("data", listener);
      r[1].write(Parser.listResponse(["REPLCONF", "GETACK", "*"]));
    });

    timeoutHandler = setTimeout(() => {
      if (passed) return;

      passed = true;
      store.replicas.forEach((r) => r[1].off("data", listener));
      c.queueWrite(c, 
        Parser.numberResponse(
          acks.length === 0 ? store.replicas.length : acks.length
        )
      );
    }, timeout);
  }

  static TYPE(c: KServer, args: [number, string][], store: DBStore) {
    const key = args[0][1];
    const value = store.get(key);

    if (!value) {
      c.queueWrite(c, Parser.stringResponse("none"));
      return;
    }

    c.queueWrite(c, Parser.stringResponse(value.type));
  }

  static XADD(c: KServer, args: [number, string][], store: DBStore) {
    const streamKey = args[0][1];
    const entries: Record<string, BaseDBItem> = {};
    const exist = store.get(streamKey) as StreamDBItem | undefined;
    const id = streamTime(args[1][1], exist);

    let latestEntryId: string = "0-0";
    const tooSmallMsg = "ERR The ID specified in XADD must be greater than 0-0";
    const errMsg =
      "ERR The ID specified in XADD is equal or smaller than the target stream top item";

    for (let i = 1; i < args.length; i += 3) {
      const key = args[i + 1][1];
      const value = args[i + 2][1];

      const item: BaseDBItem = {
        value,
        type: "string",
        itemType: "base",
        id,
      };

      const time = id;
      const itemTime = time.split("-").map((i) => parseInt(i));
      const totalTime = itemTime.reduce((a, b) => a + b, 0);

      if (totalTime < 1) {
        return c.queueWrite(c, Parser.errorResponse(tooSmallMsg));
      }

      if (!compareStreamTime(latestEntryId, time)) {
        return c.queueWrite(c, Parser.errorResponse(errMsg));
      }

      if (exist) {
        // check if the most recent item in the exist time is equal or bigger than this
        const biggestID = streamBiggestId(exist);

        if (biggestID === time) {
          return c.queueWrite(c, Parser.errorResponse(errMsg));
        }

        if (!compareStreamTime(biggestID, time)) {
          return c.queueWrite(c, Parser.errorResponse(errMsg));
        }
      }

      latestEntryId = time;
      entries[key] = item;
      c.queueWrite(c, Parser.stringResponse(time));
    }

    store.setStream(streamKey, entries, "stream");
  }

  static XRANGE(c: KServer, args: [number, string][], store: DBStore) {
    const key = args[0][1];
    const start = args[1][1];
    const end = args[2][1];

    const stream = store.get(key) as StreamDBItem | undefined;

    if (!stream) {
      return c.queueWrite(c, Parser.listResponse([]));
    }

    const ids = stream.entries.map((e) => e[0]);
    const startId = start === "-" ? 0 : ids.indexOf(start);
    const endId = end === "+" ? ids.length - 1 : ids.indexOf(end);

    if (startId === -1 || endId === -1) {
      return c.queueWrite(c, Parser.listResponse([]));
    }

    if (startId > endId) {
      return c.queueWrite(c, Parser.listResponse([]));
    }

    const data = stream.entries.slice(startId, endId + 1);
    stream.entries = data;

    c.queueWrite(c, Parser.streamItemResponse(stream));
  }

  static async XREAD(c: KServer, args: [number, string][], store: DBStore) {
    console.log(args);
    const reads: StreamDBItem[] = [];
    let block: number = -1;
    let closed: boolean = false;

    c.addListener("close", () => (closed = true));

    if (args[0][1] === "--BLOCK--") {
      block = args[0][0];
      args.shift();
    }

    async function readOne(
      streamKey: string,
      id: string,
    ) {

      if (block > -1) {
        let didread: boolean = false;

        const listener = (data: StreamDBItem) => {
          didread = true;
          if (block > 0) {
            reads.push(data);
            return;
          }

          c.queueWrite(c, Parser.streamXResponse(data));
        };

        store.addStreamListener(streamKey, block, listener);
        c.addListener("close", () => {
          store.deleteStreamListener(streamKey, listener);
        });

        if (closed || block === 0) return;

        setTimeout(() => {
          if (closed) return;

          if (!didread) {
            c.queueWrite(c, Parser.nilResponse());
          }
        }, block);

        await sleep(block);

        if (!didread) {
          c.queueWrite(c, Parser.nilResponse());
        }

        return;
      }

      const stream = store.get(streamKey) as StreamDBItem | undefined;
      if (!stream) return;

      const ids = stream.entries.map((e) => e[0]);
      const startId = ids.indexOf(id);

      if (startId !== -1) {
        const data = stream.entries.slice(startId);
        stream.entries = data;
      }

      return reads.push(stream);
    }

    if (args.length === 2) {
      const streamKey = args[0][1];
      const id = args[1][1];

      await readOne(streamKey, id);
      if (reads.length > 0 && !closed)
        c.queueWrite(c, Parser.streamXResponse(reads[0]));
      return;
    }

    if (args.length < 2) return;

    const nStrams = Math.round(args.length / 2);
    const keys = args.slice(0, nStrams);
    const ids = args.slice(nStrams);

    const streams = keys.map((k) => k[1]);
    const streamIds = ids.map((i) => i[1]);

    for (let i = 0; i < streams.length; i++) {
      await readOne(streams[i], streamIds[i]);
    }

    if (reads.length < 1 || closed) return;

    const res = Parser.streamMultiXResponse(streams, reads);
    c.queueWrite(c, res);
  }

  static INCR(c: KServer, args: [number, string][], store: DBStore) {
    const key = args[0][1];
    const value = store.increment(key);

    if (value === null) {
      return c.queueWrite(c, Parser.errorResponse("ERR value is not an integer or out of range"));
    }

    c.queueWrite(c, Parser.numberResponse(value));
  }

  static MULTI(c: KServer, args: [number, string][], store: DBStore) {
    c.queue.lock();
    c.write(Parser.okResponse());
  }

  static EXEC(c: KServer, args: [number, string][], store: DBStore) {
    if (!c.queue.locked) {
      return c.write(Parser.errorResponse("ERR EXEC without MULTI"));
    }

    c.executeQueued(c);
  }

  static DISCARD(c: KServer, args: [number, string][], store: DBStore) {
    if (!c.queue.locked) {
      return c.write(Parser.errorResponse("ERR DISCARD without MULTI"));
    }

    c.queue.discard();
    c.write(Parser.okResponse());
  }
}

export const commands: Record<Command, CommandFunc> = {
  PING: Commands.PING,
  ECHO: Commands.ECHO,
  SET: Commands.SET,
  GET: Commands.GET,
  DEL: Commands.DEL,
  CONFIG: Commands.CONFIG,
  KEYS: Commands.KEYS,
  INFO: Commands.INFO,
  REPLCONF: Commands.REPLCONF,
  PSYNC: Commands.PSYNC,
  WAIT: Commands.WAIT,
  TYPE: Commands.TYPE,
  XADD: Commands.XADD,
  XRANGE: Commands.XRANGE,
  XREAD: Commands.XREAD,
  INCR: Commands.INCR,
  MULTI: Commands.MULTI,
  EXEC: Commands.EXEC,
  DISCARD: Commands.DISCARD,
};
