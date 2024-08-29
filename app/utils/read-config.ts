export default function readConfig() {
    const args = require('minimist')(process.argv.slice(2));
    let dir = args['dir'];
    let dbfilename = args['dbfilename'];

    if (!dir || !dbfilename) {
        // log that they're not defined and define a default one
        dir = '/temp/data';
        dbfilename = 'db.rdb';
        console.log(`dir or dbfilename not defined, falling back to default values: ${dir}, ${dbfilename}`)
    }

    return { dir, dbfilename };
}