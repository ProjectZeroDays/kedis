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
        return this.data[key];
    }

    delete(key: string) {
        delete this.data[key];
    }

}