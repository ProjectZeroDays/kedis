import { Config } from "../types/config";
import logger from "./logger";
import defaultConfig from "../../kdb-config";

export default class Vector {
  vector: Config["vector"];

  constructor() {
    this.vector = defaultConfig.vector;
  }

  async set(args: {
    collection: string;
    key: string;
    text: string;
  }): Promise<boolean> {
    if (!this.vector) {
      logger.error("vector not configured");
      return false;
    }

    const res = await this.vector.set(args);
    return res;
  }

  async query(collection: string, text: string, n: number = 5) {
    if (!this.vector) {
      logger.error("vector not configured");
      return [];
    }

    const res = await this.vector.query(collection, text, n);
    return res;
  }

  async delete(collection: string, key: string): Promise<boolean> {
    if (!this.vector) {
      logger.error("vector not configured");
      return false;
    }

    const res = await this.vector.delete(collection, key);
    return res;
  }
}
