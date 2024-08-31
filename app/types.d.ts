type Command =
  | "PING"
  | "ECHO"
  | "SET"
  | "GET"
  | "CONFIG"
  | "KEYS"
  | "INFO"
  | "REPLCONF"
  | "PSYNC"
  | "DEL"
  | "WAIT"
  | "TYPE"
  | "XADD"
  | "XRANGE"
  | "XREAD"
  | "INCR"
  | "MULTI"
  | "EXEC"
  | "DISCARD";

interface BaseDBItem {
  value: string | number;
  px?: Date;
  type: "string" | "number";
  itemType: "base";
  id: string;
}

interface StreamDBItem {
  value: Record<string, BaseDBItem>;
  px?: Date;
  type: "stream";
  itemType: "stream";
  streamKey: string;
  entries: [string, [string, string | number][]][];
}

type DBItem = BaseDBItem | StreamDBItem;

interface SchemaItem {
  key: string;
  type: "string" | "number";
}

interface Collection {
  key: string;
  schema: SchemaItem[];
}

interface Config {
  collections?: Collection[];
  port: number;
  dir: string;
  dbfilename: string;
  replicaof?: string;
}
