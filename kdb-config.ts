const config: Config = {
  port: 8080,
  realtimeport: 9090,
  dbfilename: "test3.kdb",
  dir: "/home/user/kedis/data",
  saveperiod: 10000,
  collections: [
    {
      id: "people",
      schema: [
        { key: "first-name", type: "string", required: true },
        { key: "last-name", type: "string", required: true },
        { key: "age", type: "number", required: true, min: 18, max: 100 },
        { key: "email", type: "string", required: false },
      ],
      index: ["first-name", "last-name"],
    },
  ],
};

export default config;
