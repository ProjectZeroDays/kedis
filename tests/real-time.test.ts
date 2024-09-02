import sleep from "../app/utils/sleep";
import WebSocket from "ws";

class RealtimeClient {
  socket: WebSocket;

  constructor(url: string) {
    this.socket = new WebSocket(url);
    this.socket.onmessage = (event) => {
      console.log(event.data);
    };
  }

  async subscribe(collection: string, key: string) {
    while (this.socket.readyState !== WebSocket.OPEN) {
      await sleep(5);
    }
    this.socket.send(JSON.stringify({ type: "subscribe", collection, key }));
  }
}

async function main() {
  const client = new RealtimeClient("ws://localhost:9090");
  await client.subscribe("people", "jhon");
}

main();