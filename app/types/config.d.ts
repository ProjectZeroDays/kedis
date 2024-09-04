import http from "http";

type AuthFunc = (
  headers: http.IncomingHttpHeaders
) => Promise<boolean> | boolean;

export interface Config {
  collectionsJsonFile?: string;
  port: number;
  realtimeport: number;
  dir: string;
  dbfilename: string;
  replicaof?: string;
  saveperiod?: number;
  vector?: {
    set: (args: {collection: string, key: string, text: string}) => Promise<boolean>;
    delete: (collection: string, key: string) => Promise<boolean>;
    query: (collection: string, text: string, results: number) => Promise<string[]>;
  };
  auth?: [Array<Command | RealtimeCommand>, AuthFunc][];
}
