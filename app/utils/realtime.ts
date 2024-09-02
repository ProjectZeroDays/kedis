// import { ServerWebSocket } from "bun";
import Parser from "./parser";
import logger from "./logger";
import WebSocket from "ws";

type ServerWebSocket<T> = WebSocket;

export default class RealtimePool {
  listeners: Map<string, ServerWebSocket<any>[]> = new Map();
  connections: Map<ServerWebSocket<any>, string[]> = new Map();

  constructor() {}

  add(ws: ServerWebSocket<any>) {
    this.connections.set(ws, []);
  }

  remove(ws: ServerWebSocket<any>) {
    const subscribed = this.connections.get(ws);

    if (!subscribed) {
      return;
    }

    for (const sub of subscribed) {
      const parsed = Parser.readCommandKey(sub);
      if (!parsed) continue;

      this.unsubscribe(ws, parsed.collection, parsed.key);
    }

    this.connections.delete(ws);
  }

  subscribe(ws: ServerWebSocket<any>, collection: string, key: string) {
    const commandKey = Parser.commandKey(key, collection);
    if (!this.listeners.has(commandKey)) {
      this.listeners.set(commandKey, []);
    }

    if (!this.listeners.get(commandKey)!.includes(ws)) {
      this.listeners.get(commandKey)!.push(ws);
    }

    const con = this.connections.get(ws)!;
    con.push(commandKey);

    this.connections.set(ws, con);
  }

  unsubscribe(ws: ServerWebSocket<any>, collection: string, key: string) {
    const commandKey = Parser.commandKey(key, collection);
    if (!this.listeners.has(commandKey)) {
      logger.error(`no listeners for ${commandKey} to unsubscribe`);
      return;
    }

    const listeners = this.listeners.get(commandKey)!;
    const index = listeners.indexOf(ws);
    if (index !== -1) {
      listeners.splice(index, 1);
    }

    const connections = this.connections.get(ws)!;
    const index2 = connections.indexOf(commandKey);
    if (index2 !== -1) {
      connections.splice(index2, 1);
    }

    this.connections.set(ws, connections);
  }

  push(collection: string, key: string, type: "SET" | "DEL", value: string) {
    const commandKey = Parser.commandKey(key, collection);
    if (!this.listeners.has(commandKey)) {
      return;
    }

    const listeners = this.listeners.get(commandKey)!;
    for (const listener of listeners) {
      listener.send(Parser.eventResponse(type, value));
    }
  }
}
