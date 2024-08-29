export default class DBStore {
    data: Record<string, DBItem> = {};
    dir: string;
    dbfilename: string;

    constructor(dir: string, dbfilename: string) {
        this.dir = dir;
        this.dbfilename = dbfilename;
    }

    set(key: string, value: string, px?: number) {
        this.data[key] = { value, px, at: Date.now() };
    }

    get(key: string) {
        const data = this.data[key];

        if (!data) return null;

        if (typeof data.px === "number" && Date.now() - data.at > data.px) {
            delete this.data[key];
            return null;
        }

        return data;
    }

    delete(key: string) {
        delete this.data[key];
    }

}