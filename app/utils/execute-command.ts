import DBStore from "../db-store";
import { KServer } from "../k-server";
import { commands } from "./commands";
import logger from "./logger";
import Parser from "./parser";

const execute = async (
  kserver: KServer,
  data: Buffer,
  store: DBStore,
  jump: boolean = false
): Promise<boolean> => {
  const parsed = Parser.parse(data);
  if (!parsed) return false;

  // logger.info(`executing command: ${parsed.command} - ${parsed.params}`);

  if (
    kserver.queue.locked &&
    !jump &&
    !["EXEC", "DISCARD"].includes(parsed.command)
  ) {
    kserver.queueCommand(kserver, data);
    return true;
  }

  const { command, params } = parsed;

  const func = commands[command];
  if (!func) return false;

  await func(kserver, params, store, data);
  return true;
};

export default execute;
