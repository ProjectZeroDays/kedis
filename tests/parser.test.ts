import { describe, expect, it } from "vitest";
import Parser from "../app/utils/parser";
import Benchmark from "benchmark";

describe("Server-Client", () => {
  it("Parsing some values", async () => {
    const suite = new Benchmark.Suite();

    const ping = Parser.stringResponse("PING");
    expect(ping).toBe("$4\r\nPING\r\n");

    const pingReq = Buffer.from(Parser.listResponse(["ping"]));
    const getReq = Buffer.from(Parser.listResponse(["get", "foo"]));

    await new Promise<void>((resolve) => {
      suite.add("Parse pong", () => {
        Parser.stringResponse("PONG");
      });

      suite.add("Parse ping request", () => {
        Parser.parse(pingReq);
      });

      suite.add("Parse get request", () => {
        Parser.parse(getReq);
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
