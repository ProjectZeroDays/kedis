type Command = "PING" | "ECHO" | "SET" | "GET" | "CONFIG" | "KEYS" | "INFO";

interface DBItem {
    value: string | number;
    px?: Date;
    type: "string" | "number";
}