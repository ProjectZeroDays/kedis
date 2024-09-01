import { describe, expect, it } from "vitest";
import Validator from "../app/utils/validator";
import Parser from "../app/utils/parser";
import Benchmark from "benchmark";
import http from "node:http";

const sendRequest = async (body: string) => {
  const res = await fetch("http://127.0.0.1:8080", {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
    },
    body,
  });

  const txt = await res.text();
  return txt;
};

function sendHttpRequest(body: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "127.0.0.1",
      port: 8080,
      path: "/",
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const req = http.request(options, (res) => {
      res.on("data", () => {}); // You can handle response data here if needed
      res.on("end", () => resolve());
    });

    req.on("error", (e) => reject(e));

    req.write(body);
    req.end();
  });
}

describe("Server-Client", () => {
  it("communicating with the server", async () => {
    const suite = new Benchmark.Suite();

    // const hello = await sendRequest("Hello!");
    // expect(hello.substring(0, 1)).toBe("-");

    const ping = await sendRequest(Parser.listResponse(["PING"]));
    expect(ping).toBe("+PONG\r\n");

    const set = await sendRequest(Parser.listResponse(["SET", "foo", "bar"]));
    await sendRequest(Parser.listResponse(["SET", "foo2", "bar2"]));
    await sendRequest(Parser.listResponse(["SET", "foo3", "bar3"]));
    await sendRequest(Parser.listResponse(["SET", "foo4", "bar4"]));
    await sendRequest(Parser.listResponse(["SET", "foo5", "bar5"]));

    expect(set).toBe(Parser.okResponse());

    const get = await sendRequest(Parser.listResponse(["GET", "foo4"]));
    expect(get).toBe(Parser.stringResponse("bar4"));
    return;

    const body = Parser.listResponse(["ping"]);
    const getBody = Parser.listResponse(["get", "foo"]);

    return;
    await new Promise<void>((resolve) => {
      suite.add("get", async () => {
        await sendHttpRequest(getBody);
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
