import defaultConfig from "../../kdb-config";
import http from "http";
import logger from "./logger";
import { AuthFunc } from "../types/config";

class Auth {
  auth: Map<string, AuthFunc[]> = new Map();

  constructor() {
    const authConfig = defaultConfig.auth;
    if (!authConfig) return;

    for (const ac of authConfig) {
      ac[0].forEach((a) => {
        this.addAuth(a, ac[1]);
      });
    }
  }

  addAuth(command: Command | RealtimeCommand, func: AuthFunc) {
    command = command.toUpperCase() as Command | RealtimeCommand;
    logger.info(`adding auth for ${command}`);

    if (!this.auth.has(command)) {
      this.auth.set(command, []);
    }

    this.auth.get(command)?.push(func);
  }

  async applyAuth(
    command: Command | RealtimeCommand,
    headers: http.IncomingHttpHeaders
  ): Promise<boolean> {
    const auth = this.auth.get(command.toUpperCase());

    if (!auth || auth.length < 1) return true;

    for (const aFunc of auth) {
      const res = await aFunc(headers);
      if (!res) return false;
    }

    return true;
  }
}

export default Auth;
