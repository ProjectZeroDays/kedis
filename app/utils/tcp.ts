import * as net from "net";

export default class TCP {
    private port: number;
    private host: string;

    constructor (port: number, host: string) {
        this.port = port;
        this.host = host;
    }

    send(msg: string) {
        const socket = new net.Socket();
        socket.connect(this.port, this.host);
        socket.write(msg);
        socket.end();
    }

}