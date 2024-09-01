import { describe, expect, it } from "vitest";
import Parser from "../app/utils/parser";

describe("Validator", () => {
  it("generate and read command string", async () => {
    const key = "foo";
    const value = "bar";
    const collection = "default";

    const stringCommand = Parser.commandString(key, value, collection);
    const readCommand = Parser.readCommandString(stringCommand);

    if (!readCommand) {
      throw new Error("Invalid command string");
    }

    expect(readCommand.key).toBe(key);
    expect(readCommand.value).toBe(value);
    expect(readCommand.collection).toBe(collection);
  });
});
