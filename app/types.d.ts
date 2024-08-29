type Command = "PING" | "ECHO" | "SET" | "GET";

interface DBItem {
    value: string;
    px?: number;
    at: number;
}

type DBStore = Record<string, DBItem | undefined>;