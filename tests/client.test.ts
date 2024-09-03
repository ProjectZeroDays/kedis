import { describe, expect, it } from "vitest";
import Parser from "../app/utils/parser";

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
  });
});
