import * as net from "net";

export default class TCP {
    socket: net.Socket;
    private port: number;
    private host: string;

    constructor (port: number, host: string) {
        this.port = port;
        this.host = host;
        this.socket = new net.Socket();
    }

    send(msg: string) {
        this.socket.connect(this.port, this.host);
        this.socket.write(msg);
        this.socket.end();
    }

    close() {
        this.socket.end();
    }
}