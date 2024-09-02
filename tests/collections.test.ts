import { describe, expect, it } from "vitest";
import Parser from "../app/utils/parser";
import Benchmark from "benchmark";
import http from "node:http";

const sendRequest = async (body: string) => {
  const res = await fetch("http://127.0.0.1:8080", {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      authorization: "Token"
    },
    body,
  });

  const txt = await res.text();
  return txt;
};

describe("Server-Client", () => {
  it("communicating with the server", async () => {
    const suite = new Benchmark.Suite();

    // const hello = await sendRequest("Hello!");
    // expect(hello.substring(0, 1)).toBe("-");

    const ping = await sendRequest(Parser.listResponse(["PING"]));
    expect(ping).toBe("+PONG\r\n");

    const kcset = await sendRequest(
      Parser.listResponse([
        "KCSET",
        "students",
        Parser.toKDBJson({
          schema: [
            { key: "name", type: "string", required: true },
            { key: "age", type: "number", required: true },
            { key: "grade", type: "string", required: true },
          ],
        }),
      ])
    );

    expect(kcset).toBe(Parser.okResponse());

    const invalid = await sendRequest(
      Parser.listResponse([
        "KCSET",
        "some",
        Parser.toKDBJson({
          hello: ""
        }),
      ])
    );

    expect(invalid.substring(0, 1)).toBe("-");
  });
});
