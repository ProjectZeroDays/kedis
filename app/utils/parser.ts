export default class Parser {
  static getArgs(data: Buffer) {
    const args = data.toString().split(`\r\n`);
    return args;
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

  static parse(data: Buffer) {
    const args = this.getArgs(data);
    const slicedParams: [number, string][] = [];
    let tempLength = 0;
    let lastUnique: false | string = false;

    const [numOfArgs, commandLength, command, ...params] = args;

    for (const p of params) {
      if (p.startsWith("$") && !lastUnique) {
        tempLength = parseInt(p.substring(1));
        continue;
      }

      if (!lastUnique && slicedParams.length < 2) {
        slicedParams.push([tempLength, p]);
        tempLength = 0;
        lastUnique = false;
        continue;
      }

      if (p.toLowerCase() === "px") {
        lastUnique = p;
        continue;
      }

      if ((lastUnique || "").toLowerCase() === "px" && !isNaN(parseInt(p.substring(1)))) {
        slicedParams.push([parseInt(p), "--PX--"]);
        lastUnique = false;
        continue;
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
