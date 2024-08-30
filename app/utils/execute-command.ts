import DBStore from "../db-store";
import { KServer } from "../k-server";
import { commands } from "./commands";
import Parser from "./parser";

const execute = async (
  kserver: KServer,
  data: Buffer,
  store: DBStore,
  jump: boolean = false
) => {
  const parsed = Parser.parse(data);
  if (!parsed) return;

  if (kserver.queue.locked && !jump && !["EXEC", "DISCARD"].includes(parsed.command)) {
    kserver.queueCommand(kserver, data);
    return;
  }

  const { command, params } = parsed;

  const func = commands[command];
  if (!func) return;

  await func(kserver, params, store, data);
};

export default execute;
