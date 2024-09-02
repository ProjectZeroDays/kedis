import fs from "fs";
import { availableCommands, commands } from "./commands";

function XRangeResponse(data: StreamDBItem["entries"]): string {
  let response = `*${data.length}\r\n`;

  data.forEach(([id, entry]) => {
    response += `*2\r\n$${id.length}\r\n${id}\r\n`;

    const entryArray: any[] = entry[0];
    response += `*${entryArray.length}\r\n`;

    for (const item of entryArray) {
      response += `$${item.length}\r\n${item}\r\n`;
    }
  });

  return response;
}

function xReadResponse(
  streamKey: string,
  data: StreamDBItem["entries"],
  n: number
): string {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return Parser.nilResponse();
  }

  const encodedEntries = data
    .map(([id, fields]) => {
      const fieldEntries = fields
        .map(([key, value]: [string, any]) => {
          return `$${key.length}\r\n${key}\r\n$${value.length}\r\n${value}\r\n`;
        })
        .join("");

      return `*2\r\n$${id.length}\r\n${id}\r\n*${
        fields.length * 2
      }\r\n${fieldEntries}`;
    })
    .join("");

  let res = `*2\r\n$${streamKey.length}\r\n${streamKey}\r\n*${data.length}\r\n${encodedEntries}`;

  if (n === 0) {
    res = `*1\r\n${res}`;
  }

  return res;
}

function xReadMultiResponse(
  streamKeys: string[],
  data: StreamDBItem["entries"][]
): string {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return Parser.nilResponse();
  }

  let response = `*${data.length}\r\n`;

  data.forEach((entries, index) => {
    response += xReadResponse(streamKeys[index], entries, streamKeys.length);
  });

  return response;
}

export default class Parser {
  static commandsParse: Record<Command, Function> = {
    GET: Parser.parseTypeA,
    SET: Parser.parseTypeA,
    ECHO: Parser.parseTypeA,
    TYPE: Parser.parseTypeA,
    PING: () => {},
    CONFIG: Parser.parseTypeB,
    KEYS: Parser.parseTypeB,
    INFO: Parser.parseTypeB,
    PSYNC: Parser.parseTypeB,
    DEL: Parser.parseTypeB,
    REPLCONF: Parser.parseTypeB,
    XRANGE: Parser.parseTypeB,
    INCR: Parser.parseTypeB,
    MULTI: Parser.parseTypeB,
    EXEC: Parser.parseTypeB,
    DISCARD: Parser.parseTypeB,
    WAIT: Parser.parseWAIT,
    XADD: Parser.parseXADD,
    XREAD: Parser.parseXREAD,
    KSET: Parser.parseTypeB,
    KGET: Parser.parseTypeB,
    KDEL: Parser.parseTypeB,
    KCSET: Parser.parseTypeB,
    KCDEL: Parser.parseTypeB,
  };

  static getArgs(data: string | Buffer) {
    const txt = typeof data === "string" ? data : data.toString();
    const args = txt.split(`\r\n`);
    return args;
  }

  static readNumber(value: string) {
    if (value.startsWith("$")) {
      return parseInt(value.substring(1));
    } else {
      return parseInt(value);
    }
  }

  static stringResponse(txt: string) {
    return `$${txt.length}\r\n${txt}\r\n`;
  }

  static simpleResponse(txt: string) {
    return `+${txt}\r\n`;
  }

  static fileResponse(path: string) {
    const contents = fs.readFileSync(path).toString();
    return `$${contents.length}\r\n${contents}`;
  }

  static numberResponse(num: number) {
    return `:${num}\r\n`;
  }

  static dynamicResponse(value: string | number) {
    // if (typeof value === "string") {
    return Parser.stringResponse(String(value));
    // }

    // return Parser.numberResponse(value);
  }

  static streamItemResponse(item: StreamDBItem) {
    const res = XRangeResponse(item.entries);
    return res;
  }

  static streamXResponse(item: StreamDBItem) {
    const res = xReadResponse(item.streamKey, item.entries, 0);
    return res;
  }

  static streamMultiXResponse(streamKeys: string[], items: StreamDBItem[]) {
    const res = xReadMultiResponse(
      streamKeys,
      items.map((i) => i.entries)
    );
    return res;
  }

  static errorResponse(txt: string) {
    return `-${txt}\r\n`;
  }

  static listResponse(list: any[], encodeString: boolean = true) {
    if (list.length < 1) {
      // return an empty list
      return "*0\r\n";
    }

    let res = `*${list.length}\r\n`;

    for (const item of list) {
      if (Array.isArray(item)) {
        res += Parser.listResponse(item);
      } else {
        res += !encodeString ? item : Parser.stringResponse(String(item));
      }
    }

    return res;
  }

  static okResponse() {
    return "+OK\r\n";
  }

  static nilResponse() {
    return "$-1\r\n";
  }

  static readBulkString(
    value: string /* something like $${txt.length}\r\n${txt}\r\n */
  ) {
    const args = Parser.getArgs(value);
    return args[1];
  }

  // KDB stuff

  static toKDBJson(data: unknown) {
    const txt = JSON.stringify(data);
    return Parser.stringResponse(`--KJ--${txt}`);
  }

  static readKDBJson(data: string) {
    if (data.startsWith("$")) {
      data = Parser.readBulkString(data);
    }

    if (!data.startsWith("--KJ--")) return undefined;

    try {
      const json = JSON.parse(data.slice("--KJ--".length));
      return json;
    } catch (e) {
      return undefined;
    }
  }

  static commandKey(key: string, collection: string) {
    return `KK:${key}--KC:${collection}`;
  }

  static readCommandKey(
    value: string
  ): { collection: string; key: string } | undefined {
    if (!value.startsWith("KK:")) return undefined;

    const parts = value.split("--KC:");
    const collection = parts[1];
    const key = parts[0].substring(3);

    return { collection, key };
  }

  static commandString(key: string, value: string, collection: string) {
    return `KK:${key}--KC:${collection}<-KC->${value}`;
  }

  static eventResponse(type: "SET" | "DEL", value: string) {
    return `KEVENT-${type}::${value}`;
  }

  static readCommandString(command: string):
    | undefined
    | {
        key: string;
        value: string;
        collection: string;
      } {
    if (!command.startsWith("KK:")) return undefined;

    const kcIndex = command.indexOf("<-KC->");
    if (kcIndex === -1) return undefined;

    const keyCollectionPart = command.substring(3, kcIndex); // Skip "KK:"
    const value = command.substring(kcIndex + 6); // Skip "<-KC->"

    const kcSeparatorIndex = keyCollectionPart.indexOf("--KC:");
    if (kcSeparatorIndex === -1) return undefined;

    const key = keyCollectionPart.substring(0, kcSeparatorIndex);
    const collection = keyCollectionPart.substring(kcSeparatorIndex + 5); // Skip "--KC:"

    return { key, value, collection };
  }

  // parsing stuff

  static matchInsensetive(str: string, target: string) {
    return str.toLowerCase() === target.toLowerCase();
  }

  static parseBatch(data: Buffer) {
    const txt = data.toString();
    const commands = txt.split(/\*/);
    return commands
      .filter((c) => c.length > 0)
      .map((c) => Parser.parse(Buffer.from("*" + c)))
      .filter((c) => c !== undefined);
  }

  static readRdbFile(data: Buffer) {
    const txt = data.toString();
    if (!txt.startsWith("*")) return undefined;

    const parts = txt.substring(1).split(/\*/);
    parts[0] = "*" + parts[0];

    const wanted = parts.filter(
      (p) => p.startsWith("*") && p.includes("redis-ver")
    );

    if (wanted.length > 0) return wanted[0];
  }

  static parseTypeA(params: string[], slicedParams: [number, string][]) {
    let tempLength = 0;
    let lastUnique: false | string = false;

    for (const p of params) {
      if (p.startsWith("$") && lastUnique) continue;

      if (p.startsWith("$") && !lastUnique) {
        tempLength = Parser.readNumber(p);
        lastUnique = false;
        continue;
      }

      if (!lastUnique && slicedParams.length < 2 && tempLength > 0) {
        slicedParams.push([tempLength, p]);
        tempLength = 0;
        lastUnique = false;
        continue;
      }

      if (p.toLowerCase() === "px") {
        lastUnique = p;
        continue;
      }

      if (
        (lastUnique || "").toLowerCase() === "px" &&
        !isNaN(Parser.readNumber(p))
      ) {
        slicedParams.push([Parser.readNumber(p), "--PX--"]);
        lastUnique = false;
      }
    }
  }

  static parseTypeB(params: string[], slicedParams: [number, string][]) {
    for (const p of params) {
      if (!p.startsWith("$")) {
        slicedParams.push([0, p]);
      }
    }
  }

  static parseWAIT(params: string[], slicedParams: [number, string][]) {
    slicedParams.push([parseInt(params[1]), "WAIT"], [parseInt(params[3]), ""]);
  }

  static parseXADD(params: string[], slicedParams: [number, string][]) {
    params.forEach((p, index) => {
      if (p.startsWith("$") || p.length < 1) return;

      if (index % 2 === 1) {
        slicedParams.push([0, p]);
      }
    });
  }

  static parseXREAD(params: string[], slicedParams: [number, string][]) {
    let latestIsBlock: boolean = false;
    params.forEach((p, index) => {
      if ((p.startsWith("$") && p !== "$") || p.length < 1 || p === "streams")
        return;

      if (latestIsBlock) {
        latestIsBlock = false;
        slicedParams.unshift([parseInt(p), "--BLOCK--"]);
        return;
      }

      if (p === "block" && !isNaN(parseInt(params[index + 2]))) {
        latestIsBlock = true;
        return;
      }

      latestIsBlock = false;
      slicedParams.push([0, p]);
    });
  }

  static parse(data: Buffer) {
    const txt = data.toString();
    const args = Parser.getArgs(txt);
    const slicedParams: [number, string][] = [];

    const [numOfArgs, commandLength, cmd, ...params] = args;
    let command = cmd as Command;

    if (!command) return undefined;
    command = command.toUpperCase() as Command;

    if (command === "PING") {
      return {
        numOfArgs,
        commandLength,
        command: command as Command,
        params: slicedParams,
        txt,
      };
    }

    if (availableCommands.indexOf(command) === -1 && !commands[command]) {
      return undefined;
    }

    const commandParser = Parser.commandsParse[command];
    if (commandParser) {
      commandParser(params, slicedParams);
    }

    return {
      numOfArgs,
      commandLength,
      command: command as Command,
      params: slicedParams,
      txt,
    };
  }
}
