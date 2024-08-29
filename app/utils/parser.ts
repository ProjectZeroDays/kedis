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

  static errorResponse(txt: string) {
    return `-${txt}\r\n`;
  }

  static okResponse() {
    return "+OK\r\n";
  }

  static nilResponse() {
    return "$-1\r\n";
  }

  static matchInsensetive(str: string, target: string) {
    return str.toLowerCase() === target.toLowerCase()
  }

  static parse(data: Buffer) {
    const args = this.getArgs(data);
    const slicedParams: [number, string][] = [];
    let tempLength = 0;
    let lastUnique: false | string = false;

    const [numOfArgs, commandLength, cmd, ...params] = args;
    const command = cmd as Command;

    if (["GET", "SET", "ECHO", "PING"].includes(command)) {
      for (const p of params) {
        if (p.startsWith("$") && lastUnique) continue;

        if (p.startsWith("$") && !lastUnique) {
          tempLength = this.readNumber(p);
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

        if ((lastUnique || "").toLowerCase() === "px" && !isNaN(this.readNumber(p))) {
          slicedParams.push([this.readNumber(p), "--PX--"]);
          lastUnique = false;
          continue;
        }
      }
    }

    if (command === "CONFIG") {
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
