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
  | "DEL";

interface DBItem {
  value: string | number;
  px?: Date;
  type: "string" | "number";
}
