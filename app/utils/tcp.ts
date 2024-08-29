import * as net from "net";

export default class TCP {
    private port: number;
    private host: string;

    constructor (port: number, host: string) {
        this.port = port;
        this.host = host;
    }

    async send(msg: string) {
        const socket = new net.Socket();
        await socket.connect(this.port, this.host);
        await socket.write(msg);
        await socket.end();
    }

}