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
  let dir = args["dir"];
  let dbfilename = args["dbfilename"];
  let savedbfilename = String(args["savedbfilename"] || args["dbfilename"]);
  const port = parseInt(args["port"] || "6379");
  const replicaof = args["replicaof"];
  const saveperiod = parseInt(args["saveperiod"] || "120000");

  if (!dir || !dbfilename) {
    // log that they're not defined and define a default one
    dir = "/tmp";
    dbfilename = "db.kdb";
    console.log(
      `dir or dbfilename not defined, falling back to default values: ${dir}, ${dbfilename}`
    );
  }

  if (savedbfilename.endsWith(".rdb")) {
    console.error(
      "Koxy DB doesn't support writing to .rdb files, will read the data"
    );
    savedbfilename = savedbfilename.replace(".rdb", ".kdb");
    console.log(`using ${savedbfilename} as savedbfilename`);
  }

  return { dir, dbfilename, savedbfilename, port, replicaof, saveperiod };
}
