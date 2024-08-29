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
        config[key.replace('--', '')] = value;
    }

    return validateConfig(config);
}

function validateConfig(args: Record<string, string>) {
    let dir = args['dir'];
    let dbfilename = args['dbfilename'];

    if (!dir || !dbfilename) {
        // log that they're not defined and define a default one
        dir = '/tmp';
        dbfilename = 'db.rdb';
        console.log(`dir or dbfilename not defined, falling back to default values: ${dir}, ${dbfilename}`)
    }

    return { dir, dbfilename };
}