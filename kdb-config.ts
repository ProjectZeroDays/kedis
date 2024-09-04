import { Config } from "./app/types/config";
import logger from "./app/utils/logger";

const config: Config = {
  port: 8080,
  realtimeport: 9090,
  dbfilename: "data.kdb",
  dir: "/tmp/",
  saveperiod: 900000,
  auth: [
    [
      ["KCSET"],
      (headers) => true
    ]
  ],
  vector: {
    delete: async (collection, key) => {
      logger.error(`vector not available for delete: ${collection}:${key}`);
      return true;
    },
    set: async (args) => {
      logger.error(`vector not available for set: ${args.collection}:${args.key}: ${args.text}`)
      return true;
    },
    query: async (collection, key, n) => {
      logger.error(`vector not available for query: ${collection}:${key}: ${n}`);
      return [];
    }
  }
};

export default config;
