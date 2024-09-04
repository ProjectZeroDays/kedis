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
  | "DISCARD"
  | "KSET"
  | "KGET"
  | "KDEL"
  | "KCSET"
  | "KCDEL"
  | "KSEARCH"
  | "KSIMILAR";

type RealtimeCommand = "SUBSCRIBE" | "UNSUBSCRIBE";

type KCommand = "KCADD" | "KCDEL" | "KDEL";

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

interface SchemaBaseItem {
  key: string;
  required: boolean;
  vector?: boolean;
}

interface SchemaStringItem extends SchemaBaseItem {
  type: "string";
  default?: string;
}

interface SchemaNumberItem extends SchemaBaseItem {
  type: "number";
  default?: number;
  min?: number;
  max?: number;
}

interface SchemaBooleanItem extends SchemaBaseItem {
  type: "boolean";
  default?: boolean | (0 | 1);
}

type SchemaItem = SchemaStringItem | SchemaNumberItem | SchemaBooleanItem;

interface Collection {
  id: string;
  schema: SchemaItem[];
  index?: boolean | string[];
  version: number;
}

interface RealtimeMsg {
  type: "subscribe" | "unsubscribe";
  collection: string;
  key: string;
  id: string;
}