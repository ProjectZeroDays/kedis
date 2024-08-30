// a is the key to be compared to, so its the latest item entry
export default function compareStreamTime(a: string, b: string) {

    const aTime = a.split("-").map(i => parseInt(i));
    const bTime = b.split("-").map(i => parseInt(i));

    if (aTime[0] >= bTime[0] && aTime[1] >= bTime[1]) return false;

    return true;
}