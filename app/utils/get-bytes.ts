export default function getBytes(txt: string): number {
    // return the number of bytes in a string
    return new Blob([txt]).size;
}