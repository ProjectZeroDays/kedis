import { KServer } from "./k-server";

export default class Queue {
  connection: KServer;
  locked: boolean = false;
  queue: Buffer[] = [];
  results: (string | Uint8Array)[] = [];

  constructor(connection: KServer) {
    this.connection = connection;
  }

  lock() {
    this.locked = true;
  }

  unlock() {
    this.locked = false;
  }

  add(data: Buffer) {
    this.queue.push(data);
  }

  flush() {
    this.queue = [];
    this.results = [];
    this.locked = false;
  }

  discard() {
    this.queue = [];
    this.results = [];
    this.locked = false;
  }

  addResult(data: string | Uint8Array) {
    this.results.push(data);
  }

  getResults() {
    return this.results;
  }
}
