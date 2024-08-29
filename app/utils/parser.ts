export default class Parser {

    static getArgs(data: Buffer) {
        const args = data.toString().split(`\r\n`);
        return args;
    }

    static getCmd(args: string[]) {
        return readCommand(args);
    }

    static string(args: string[]) {
        const txt = args[4];
        return `$${txt.length}\r\n${txt}\r\n`;
    }
}