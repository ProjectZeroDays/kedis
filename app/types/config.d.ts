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
    set: (collection: string, key: string, text: string) => Promise<number[]>;
    get: (collection: string, key: string) => Promise<number[]>;
    delete: (collection: string, key: string) => Promise<void>;
    query: (collection: string, text: string) => Promise<string[]>;
    generateEmbedding: (text: string) => Promise<number[]>;
  };
  auth?: [Array<Command | RealtimeCommand>, AuthFunc][];
}
