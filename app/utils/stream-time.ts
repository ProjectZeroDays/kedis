export default function streamTime(id: string, item: StreamDBItem | undefined) {
  if (!id.includes("*")) return id;

  let [a, b] = id.split("-");

  const existId = streamBiggestId(item);
  const [c, d] = existId.split("-");

  if (a === "*") {
    a = String(parseInt(c) + 1);
  }

  if (b === "*") {
    b = String(parseInt(d) + 1);
  }

  const newId = `${a}-${b}`;

  if (newId === "0-0") return "0-1";

  return newId;
}

// a is the key to be compared to, so its the latest item entry
export function compareStreamTime(a: string, b: string) {
  const aTime = a.split("-").map((i) => parseInt(i));
  const bTime = b.split("-").map((i) => parseInt(i));

  if (aTime[0] > bTime[0]) return false;
  if (aTime[0] === bTime[0] && aTime[1] >= bTime[1]) return false;

  return true;
}

export function streamBiggestId(item?: StreamDBItem) {
  if (!item) return "0-0";

  const existValues = Object.keys(item.value).map((i) => item.value[i]);
  const biggest = existValues.reduce((a, b) => {
    const aTime = a.id.split("-").map((i) => parseInt(i));
    const bTime = b.id.split("-").map((i) => parseInt(i));
    const aTotal = aTime.reduce((a, b) => a + b, 0);
    const bTotal = bTime.reduce((a, b) => a + b, 0);
    return aTotal > bTotal ? a : b;
  });

  return biggest.id;
}
