import net from "net";
import Queue from "./queue";

export interface KServer extends net.Socket {
  queueWrite: (c: KServer, data: string | Uint8Array) => void;
  queueCommand: (c: KServer, command: Buffer) => void;
  executeQueued: (c: KServer) => void;
  pushQueued: (c: KServer) => void;
  queue: Queue;
}
