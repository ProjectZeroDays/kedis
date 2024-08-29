import * as net from "net";
import Parser from "redis-parser";

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this block to pass the first stage
const server: net.Server = net.createServer((connection: net.Socket) => {
  // Handle connection

  // we need to handle multiple ping requests (just send pong back):
  connection.on("data", (data: Buffer) => {
    // use the Parser to do it (using the redis-parser):
    const parser = new Parser({
      returnReply(reply) {
        connection.write(reply);
      },
      returnError(error) {
        connection.write(error.message);
      },
    });
  });
});

server.listen(6379, "127.0.0.1");
