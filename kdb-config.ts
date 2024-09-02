import { Config } from "./app/types/config";

const config: Config = {
  port: 8080,
  realtimeport: 9090,
  dbfilename: "test3.kdb",
  dir: "/home/user/kedis/data",
  saveperiod: 10000,
  auth: [
    [
      ["KCSET"],
      (headers) => {
        const token = headers.authorization;
        if (!token) return false;

        return true;
      }
    ]
  ]
};

export default config;
