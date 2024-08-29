type Command = "PING" | "ECHO" | "SET" | "GET" | "CONFIG";

interface DBItem {
    value: string;
    px?: number;
    at: number;
}