type Command = "PING" | "ECHO" | "SET" | "GET" | "CONFIG" | "KEYS";

interface DBItem {
    value: string | number;
    px?: Date;
    type: "string" | "number";
}