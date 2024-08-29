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
        this.socket.write(msg);
    }

    close() {
        this.socket.end();
    }
}