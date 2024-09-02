import defaultConfig from "../../kdb-config";
import fs from "fs";

export default function readConfig() {
  const args = process.argv.slice(2);
  const config = parseArgs(args);

  return config;
}

function parseArgs(args: string[]) {
  const config: Record<string, string> = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];
    config[key.replace("--", "")] = value;
  }

  return validateConfig(config);
}

function validateConfig(args: Record<string, string>) {
  let dir = args["dir"] || defaultConfig.dir;
  let dbfilename = args["dbfilename"] || defaultConfig.dbfilename;
  const port = parseInt(args["port"] || String(defaultConfig.port));
  const realtimeport = parseInt(
    args["realtimeport"] || String(defaultConfig.realtimeport)
  );
  const replicaof = args["replicaof"] || defaultConfig.replicaof;
  const saveperiod = parseInt(
    args["saveperiod"] || String(defaultConfig.saveperiod || "3600000")
  );
  const collections = getCollections();

  if (!dir || !dbfilename) {
    // log that they're not defined and define a default one
    dir = "/tmp";
    dbfilename = "db.kdb";
    console.log(
      `dir or dbfilename not defined, falling back to default values: ${dir}, ${dbfilename}`
    );
  }

  return {
    dir,
    dbfilename,
    port,
    replicaof,
    saveperiod,
    collections,
    realtimeport,
  };
}

function getCollections(): Collection[] {
  const collections = defaultConfig.collections || [];

  if (defaultConfig.collectionsJsonFile) {
    const json = fs.readFileSync(defaultConfig.collectionsJsonFile, "utf8");
    const jsonCollections = JSON.parse(json);
    collections.push(...jsonCollections);
  }

  return collections;
}
