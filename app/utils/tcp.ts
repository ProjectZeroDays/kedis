import * as net from "net";

export default class TCP {
    socket: net.Socket;
    private port: number;
    private host: string;

    constructor (port: number, host: string) {
        this.port = port;
        this.host = host;
        this.socket = new net.Socket();
        this.socket.connect(port, host);
    }

    send(msg: string) {
        const socket = new net.Socket();
        socket.connect(this.port, this.host);
        socket.write(msg);
        socket.end();
    }

    close() {
        this.socket.end();
    }
}