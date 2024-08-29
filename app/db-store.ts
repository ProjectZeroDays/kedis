import { loadRDB } from "./utils/rdp-loader";

export default class DBStore {
  data: Record<string, DBItem> = {};
  dir: string;
  dbfilename: string;
  id: string = `${crypto.randomUUID()}`;
  offset: number = 0;
  role: "master" | "slave";

  constructor(role: "master" | "slave", dir: string, dbfilename: string) {
    this.role = role;
    this.dir = dir;
    this.dbfilename = dbfilename;

    this.data = loadRDB({ dir, dbfilename });
  }

  set(key: string, value: string, px?: number) {
    const expiration: Date | undefined = px
      ? new Date(Date.now() + px)
      : undefined;
    const typedValue = !isNaN(parseInt(value)) ? Number(value) : value;
    const type = typeof typedValue === "string" ? "string" : "number";

    this.data[key] = { value: typedValue, px: expiration, type };
  }

  get(key: string) {
    console.log(this.data);
    const data = this.data[key];
    const now = new Date();

    if (!data) return null;

    if ((data.px ?? now) < now) {
      delete this.data[key];
      return null;
    }

    return data;
  }

  delete(key: string) {
    delete this.data[key];
  }

  keys(regexString: string) {
    const keys = Object.keys(this.data);

    if (regexString === "" || regexString === "*") {
      return keys;
    }

    const regex = new RegExp(regexString);
    return keys.filter((key) => regex.test(key));
  }
}
