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
    let lastPx: string = "";

    const [numOfArgs, commandLength, command, ...params] = args;

    for (const p of params) {
      if (p.startsWith("$")) {
        tempLength = parseInt(p);
        continue;
      }

      if (tempLength !== 0) {
        slicedParams.push([tempLength, p]);
        tempLength = 0;
        continue;
      }

      if (lastPx.toLowerCase() === "px" && !isNaN(parseInt(p))) {
        slicedParams.push([parseInt(p), "--PX--"]);
        continue;
      }

      if (!isNaN(parseInt(p))) {
        lastPx = p;
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
