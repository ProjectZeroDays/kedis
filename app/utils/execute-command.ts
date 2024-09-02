import DBStore from "../db-store";
import { KServer } from "../k-server";
import Auth from "./auth";
import { commands } from "./commands";
import Parser from "./parser";
import http from "http";

const execute = async (
  kserver: KServer,
  data: Buffer,
  store: DBStore,
  auth: Auth,
  headers: http.IncomingHttpHeaders
): Promise<boolean> => {
  const parsed = Parser.parse(data);
  if (!parsed) return false;

  const allow = await auth.applyAuth(parsed.command, headers);
  if (!allow) {
    kserver.queueWrite(kserver, Parser.errorResponse("Unauthorized"));
    return true;
  }

  if (kserver.queue.locked && !["EXEC", "DISCARD"].includes(parsed.command)) {
    kserver.queueCommand(kserver, data);
    return true;
  }

  const { command, params } = parsed;

  const func = commands[command];
  if (!func) return false;

  await func(kserver, params, store);
  return true;
};

export default execute;
