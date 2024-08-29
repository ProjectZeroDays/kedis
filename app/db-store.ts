import { loadRDB } from "./utils/rdp-loader";

export default class DBStore {
    data: Record<string, DBItem> = {};
    dir: string;
    dbfilename: string;

    constructor(dir: string, dbfilename: string) {
        this.dir = dir;
        this.dbfilename = dbfilename;

        this.data = loadRDB({ dir, dbfilename });
        console.log(this.data);
    }

    set(key: string, value: string, px?: number) {
        const expiration: Date | undefined = px ? new Date(Date.now() + px) : undefined;
        const typedValue = !isNaN(parseInt(value)) ? Number(value) : value;
        const type = typeof typedValue === "string" ? "string" : "number";

        this.data[key] = { value: typedValue, px: expiration, type };
    }

    get(key: string) {
        const data = this.data[key];

        if (!data) return null;

        if (data.px && data.px < new Date()) {
            delete this.data[key];
            return null;
        }

        return data;
    }

    delete(key: string) {
        delete this.data[key];
    }

    keys(regexString: string) {
        const regex = new RegExp(regexString);
        const keys = Object.keys(this.data);

        if (regexString === "" || regexString === "*") {
            return keys;
        }

        return keys.filter((key) => regex.test(key))
    }
}