import fs from "fs";
import { availableCommands, commands } from "./commands";

export default class Parser {
  static getArgs(data: Buffer) {
    const args = data.toString().split(`\r\n`);
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

    // log the base64 value of contents:
    console.log(Buffer.from(contents).toString("base64"));

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

  static errorResponse(txt: string) {
    return `-${txt}\r\n`;
  }

  static listResponse(list: string[]) {
    const values = list.map((l) => Parser.dynamicResponse(l));

    return `*${list.length}\r\n${values.join("")}`;
  }

  static okResponse() {
    return "+OK\r\n";
  }

  static nilResponse() {
    return "$-1\r\n";
  }

  static matchInsensetive(str: string, target: string) {
    return str.toLowerCase() === target.toLowerCase();
  }

  static parseBatch(data: Buffer) {
    const txt = data.toString();
    const commands = txt.split(/\*/);
    return commands
      .filter((c) => c.length > 0)
      .map((c) => Parser.parse(Buffer.from(c)))
      .filter((c) => c !== undefined);
  }

  static readRdbFile(data: Buffer) {
    const txt = data.toString();
    if (!txt.startsWith("*")) return undefined;

    const parts = txt.substring(1).split(/\*/);
    // add the star to the start of the first part:
    parts[0] = "*" + parts[0];

    const wanted = parts.filter(
      (p) => p.startsWith("*") && p.includes("redis-ver")
    );

    if (wanted.length > 0) return wanted[0];
  }

  static parse(data: Buffer) {
    const args = Parser.getArgs(data);
    const slicedParams: [number, string][] = [];
    let tempLength = 0;
    let lastUnique: false | string = false;

    const [numOfArgs, commandLength, cmd, ...params] = args;
    let command = cmd as Command;

    if (availableCommands.indexOf(command) === -1 && !commands[command])
      return undefined;

    command = command.toUpperCase() as Command;

    if (["GET", "SET", "ECHO", "PING"].includes(command)) {
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
          continue;
        }
      }
    }

    if (["CONFIG", "KEYS", "INFO", "PSYNC", "DEL"].includes(command)) {
      for (const p of params) {
        if (p.startsWith("$")) continue;

        slicedParams.push([0, p]);
      }
    }

    return {
      numOfArgs,
      commandLength,
      command: command as Command,
      params: slicedParams,
    };
  }
}
