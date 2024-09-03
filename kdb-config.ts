import { Config } from "./app/types/config";

const config: Config = {
  port: 8080,
  realtimeport: 9090,
  dbfilename: "data.kdb",
  dir: "/tmp/",
  saveperiod: 10000,
  auth: [
    [
      ["KCSET"],
      (headers) => true
    ]
  ]
};

export default config;
