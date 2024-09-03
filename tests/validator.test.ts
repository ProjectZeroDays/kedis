import { describe, expect, it } from "vitest";
import Validator from "../app/utils/validator";
import Parser from "../app/utils/parser";
import Benchmark from "benchmark";

describe("Validator", () => {
  it("validate data against a collection", async () => {
    const suite = new Benchmark.Suite();

    const collection: Collection = {
      id: "test",
      version: 0,
      schema: [
        { key: "name", type: "string", required: true },
        { key: "age", type: "number", required: false, min: 18, max: 99 },
        { key: "male", type: "boolean", required: true, default: true },
      ],
    };

    const validator = new Validator(collection);

    const data: [boolean, string][] = [
      [true, Parser.toKDBJson({ name: "Jane Doe", age: 20 })],
      [true, Parser.toKDBJson({ name: "Jane Doe", age: 18, male: false })],
      [false, Parser.toKDBJson({ name: "Jane Doe", age: "invalid" })],
      [false, Parser.toKDBJson({ name: "Jane Doe", age: 100 })],
      [false, Parser.toKDBJson({ name: "Jane Doe", age: 17 })],
    ];

    for (const d of data) {
      expect(validator.validate(d[1])).toBe(d[0]);
    }

    suite.add("Validator", () => {
      for (const d of data) {
        validator.validate(d[1]);
      }
    });

    await new Promise<void>((resolve) => {
      suite.add("Validator", () => {
        validator.validate(data[0][1]);
      });

      suite
        .on("cycle", (event: any) => {
          console.log(String(event.target));
        })
        .on("complete", function (this: any) {
          resolve();
        });

      suite.run({ async: true });
    });
  });
});
