import Parser from "./parser";

export default class Validator {
  collection: Collection;
  keySchemaMap: Map<string, any>;
  requiredKeys: Set<string>;

  constructor(collection: Collection) {
    this.collection = collection;
    this.keySchemaMap = new Map();
    this.requiredKeys = new Set();

    for (const schema of collection.schema) {
      this.keySchemaMap.set(schema.key, schema);
      if (schema.required) {
        this.requiredKeys.add(schema.key);
      }
    }
  }

  validate(value: string): boolean {
    const data = this.readData(value);
    if (!data) {
      console.error("Invalid data");
      return false;
    }

    const keys = Object.keys(data);

    for (const [key, schema] of this.keySchemaMap) {
      if (!keys.includes(key)) {
        if (schema.default !== undefined) {
          data[key] = schema.default;
        }
      }

      if (this.requiredKeys.has(key) && data[key] === undefined) {
        return false;
      }

      const item = data[key];
      if (item === undefined) continue;

      const itemType = typeof item;
      if (schema.type !== itemType) {
        return false;
      }

      switch (itemType) {
        case "string":
          if (!this.validateString(schema, item)) return false;
          break;
        case "number":
          if (!this.validateNumber(schema, item)) return false;
          break;
        case "boolean":
          if (!this.validateBoolean(schema, item)) return false;
          break;
      }
    }

    return true;
  }

  validateString(schema: any, value: any) {
    return schema.required
      ? value && typeof value === "string"
      : typeof value === "string";
  }

  validateNumber(schema: any, value: any) {
    if (schema.required && (value === undefined || value === null))
      return false;
    if (typeof value !== "number") return false;
    if (schema.min !== undefined && value < schema.min) return false;
    if (schema.max !== undefined && value > schema.max) return false;
    return true;
  }

  validateBoolean(schema: any, value: any) {
    return typeof value === "boolean";
  }

  readData(value: string): any | null {
    return Parser.readKDBJson(value) || null;
  }
}
