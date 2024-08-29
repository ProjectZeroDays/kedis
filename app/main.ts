import * as net from "net";
import { commands } from "./utils/commands";

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this block to pass the first stage
const server: net.Server = net.createServer((connection: net.Socket) => {
  // Handle connection

  connection.on("data", (data: Buffer) => {
    const args = Parser.getArgs(data);
    const cmd = Parser.getCmd(args);
    const command = commands[cmd];
    command(connection, args);
  });
});

server.listen(6379, "127.0.0.1");
