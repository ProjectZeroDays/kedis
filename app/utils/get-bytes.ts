export default function getBytes(txt: string): number {
    // return the number of bytes in a string
    return Buffer.from(txt).length;
}