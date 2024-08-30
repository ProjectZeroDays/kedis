import * as net from "net";
import Parser from "./parser";
import DBStore from "../db-store";
import getBytes from "./get-bytes";
import streamTime, { streamBiggestId, compareStreamTime } from "./stream-time";

type CommandFunc = (
  c: net.Socket,
  params: [number, string][],
  store: DBStore,
  raw: Buffer
) => void;

let waiting: boolean = false;
const EMPTY_RDB = Buffer.from(
  "524544495330303131fa0972656469732d76657205372e322e30fa0a72656469732d62697473c040fa056374696d65c26d08bc65fa08757365642d6d656dc2b0c41000fa08616f662d62617365c000fff06e3bfec0ff5aa2",
  "hex"
);

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
];

class Commands {
  static PING(c: net.Socket, _params: [number, string][], store: DBStore) {
    if (store.role === "master") {
      c.write(Parser.simpleResponse("PONG"));
    }
  }

  static ECHO(c: net.Socket, params: [number, string][]) {
    const value = Parser.stringResponse(params[0][1]);
    c.write(value);
  }

  static SET(
    c: net.Socket,
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
      c.write(Parser.okResponse());
    }
  }

  static GET(c: net.Socket, args: [number, string][], store: DBStore) {
    const key = args[0][1];
    const value = store.get(key);

    if (!value) {
      c.write(Parser.nilResponse());
      return;
    }

    if (value.itemType === "stream") {
      c.write(
        Parser.listResponse(
          Object.keys(value.value).map((k) => `${value.value[k].value}`)
        )
      );
      return;
    }

    c.write(Parser.dynamicResponse(value.value));
  }

  static GET_CONFIG(c: net.Socket, args: [number, string][], store: DBStore) {
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

    c.write(Parser.listResponse(res));
  }

  static DEL(
    c: net.Socket,
    args: [number, string][],
    store: DBStore,
    raw: Buffer
  ) {
    const key = args[0][1];
    store.delete(raw, key);
    if (store.role === "master") {
      store.pushToReplicas(Parser.listResponse(["DEL", key]));
      c.write(Parser.okResponse());
    }
  }

  static CONFIG(c: net.Socket, args: [number, string][], store: DBStore) {
    const cmdType = args[0][1];

    if (Parser.matchInsensetive(cmdType, "get")) {
      Commands.GET_CONFIG(c, args.slice(1), store);
    }
  }

  static KEYS(c: net.Socket, args: [number, string][], store: DBStore) {
    const regex = args[0][1];
    const keys = store.keys(regex);

    c.write(Parser.listResponse(keys));
  }

  static INFO(c: net.Socket, _args: [number, string][], store: DBStore) {
    const res: string[] = [];

    res.push(`role:${store.role}`);
    res.push(`master_replid:${store.id}`);
    res.push(`master_repl_offset:${store.offset}`);

    c.write(Parser.stringResponse(res.join("\n")));
  }

  static REPLCONF(c: net.Socket, args: [number, string][], store: DBStore) {
    const cmdType = args[0][1];

    if (cmdType === "GETACK") {
      c.write(Parser.listResponse(["REPLCONF", "ACK", `${store.offset}`]));

      if (args.length < 3) {
        store.offset += getBytes("*\r\n");
      }

      return;
    }

    if (cmdType === "ACK") return;

    if (store.role === "master") {
      c.write(Parser.okResponse());
    }
  }

  static PSYNC(c: net.Socket, args: [number, string][], store: DBStore) {
    const [replid, offset] = [args[0][1], args[1][1]];
    c.write(Parser.simpleResponse(`FULLRESYNC ${store.id} ${store.offset}`));
    c.write(
      Buffer.concat([
        Buffer.from(`$${EMPTY_RDB.length}\r\n`, "utf8"),
        EMPTY_RDB,
      ])
    );

    store.addReplica(c);
  }

  static WAIT(c: net.Socket, args: [number, string][], store: DBStore) {
    const [repls, timeout] = [args[0][0], args[1][0]];

    // get the minimum number between store.replicas.length and repls
    let neededRepls = Math.min(store.replicas.length, repls);

    if (neededRepls === 0) {
      return c.write(Parser.numberResponse(store.replicas.length));
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
        c.write(Parser.numberResponse(acks.length));
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
      c.write(
        Parser.numberResponse(
          acks.length === 0 ? store.replicas.length : acks.length
        )
      );
    }, timeout);
  }

  static TYPE(c: net.Socket, args: [number, string][], store: DBStore) {
    const key = args[0][1];
    const value = store.get(key);

    if (!value) {
      c.write(Parser.stringResponse("none"));
      return;
    }

    c.write(Parser.stringResponse(value.type));
  }

  static XADD(c: net.Socket, args: [number, string][], store: DBStore) {
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
        return c.write(Parser.errorResponse(tooSmallMsg));
      }

      if (!compareStreamTime(latestEntryId, time)) {
        return c.write(Parser.errorResponse(errMsg));
      }

      if (exist) {
        // check if the most recent item in the exist time is equal or bigger than this
        const biggestID = streamBiggestId(exist);

        if (biggestID === time) {
          return c.write(Parser.errorResponse(errMsg));
        }

        if (!compareStreamTime(biggestID, time)) {
          return c.write(Parser.errorResponse(errMsg));
        }
      }

      latestEntryId = time;
      entries[key] = item;
      c.write(Parser.stringResponse(time));
    }

    store.setStream(streamKey, entries, "stream");
  }

  static XRANGE(c: net.Socket, args: [number, string][], store: DBStore) {
    const key = args[0][1];
    const start = args[1][1];
    const end = args[2][1];

    const stream = store.get(key) as StreamDBItem | undefined;

    if (!stream) {
      return c.write(Parser.listResponse([]));
    }

    const ids = stream.entries.map((e) => e[0]);
    const startId = start === "-" ? 0 : ids.indexOf(start);
    const endId = end === "+" ? ids.length - 1 : ids.indexOf(end);

    if (startId === -1 || endId === -1) {
      return c.write(Parser.listResponse([]));
    }

    if (startId > endId) {
      return c.write(Parser.listResponse([]));
    }

    const data = stream.entries.slice(startId, endId + 1);
    stream.entries = data;

    c.write(Parser.streamItemResponse(stream));
  }

  static XREAD(c: net.Socket, args: [number, string][], store: DBStore) {
    console.log(args);
    const reads: string[] = [];

    function readOne(streamKey: string, id: string) {
      const stream = store.get(streamKey) as StreamDBItem | undefined;
      console.log("Called one with:", streamKey, id);

      if (!stream) {
        console.log("Stream not found");
        return;
      }

      const ids = stream.entries.map((e) => e[0]);
      const startId = ids.indexOf(id);

      console.log("Read stream:", stream.entries);
      return reads.push(Parser.streamXResponse(stream));
    }

    if (args.length === 2) {
      const streamKey = args[0][1];
      const id = args[1][1];

      readOne(streamKey, id);
      return c.write(reads[0]);
    }

    if (args.length < 2) return;

    const nStrams = Math.round(args.length/2);
    const keys = args.slice(0, nStrams);
    const ids = args.slice(nStrams);

    const streams = keys.map((k) => k[1]);
    const streamIds = ids.map((i) => i[1]);

    for (let i = 0; i < streams.length; i++) {
      readOne(streams[i], streamIds[i]);
    }

    console.log("read length:", reads.length);
    c.write(`*${reads.length}\r\n${reads.join("")}`);
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
};
