import { describe, expect, it } from "vitest";
import Parser from "../app/utils/parser";

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

describe("Server-Client", () => {
  it("communicating with the server", async () => {
    const now = Date.now();
    const ping = await sendRequest(Parser.listResponse(["PING"]));
    expect(ping).toBe("+PONG\r\n");

    const kcset = await sendRequest(
      Parser.listResponse([
        "KCSET",
        "people",
        Parser.toKDBJson({
          schema: [
            { key: "first-name", type: "string", required: true },
            { key: "last-name", type: "string", required: true },
            { key: "age", type: "number", required: true, min: 18, max: 100 },
          ]
        }),
      ])
    );

    console.log(kcset);

    // for (let i = 0; i < 500; i++) {
    //   const now = Date.now();
    //   await sendRequest(
    //     Parser.listResponse([
    //       "KSET",
    //       "people",
    //       "jhon",
    //       Parser.toKDBJson({
    //         "first-name": `John-${now}`,
    //         "last-name": "Doe",
    //         age: 31,
    //       }),
    //     ])
    //   );
    // }

    const kadd = await sendRequest(
      Parser.listResponse([
        "KSET",
        "people",
        "jhon",
        Parser.toKDBJson({
          "first-name": `John-${now}`,
          "last-name": "Doe",
          age: 31,
        }),
      ])
    );

    expect(kadd).toBe(Parser.okResponse());

    const get = await sendRequest(
      Parser.listResponse(["KGET", "people", "jhon"])
    );
  
    console.log(get);
    const getParsed = Parser.readKDBJson(get);
    expect(getParsed).toEqual({
      "first-name": `John-${now}`,
      "last-name": "Doe",
      age: 31,
    });

    const invalidKadd = await sendRequest(
      Parser.listResponse(["KSET", "people", "marry", Parser.toKDBJson({
        "first-name": "Marry",
        "last-name": "Ma",
        age: 101,
      })])
    );

    expect(invalidKadd.substring(0, 1)).toBe("-");
  });
});
