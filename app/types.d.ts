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
  | "WAIT";

interface DBItem {
  value: string | number;
  px?: Date;
  type: "string" | "number";
}
