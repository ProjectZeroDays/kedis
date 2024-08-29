export default class Parser {
  static getArgs(data: Buffer) {
    const args = data.toString().split(`\r\n`);
    return args;
  }

  static stringResponse(txt: string) {
    return `$${txt.length}\r\n${txt}\r\n`;
  }

  static parse(data: Buffer) {
    const args = this.getArgs(data);

    const [numOfArgs, commandLength, command, ...params] = args;

    return {
      numOfArgs,
      commandLength,
      command: command as Command,
      params: params,
    };
  }
}
