export default function streamTime(id: string, item: StreamDBItem | undefined) {
  if (!id.includes("*")) return id;

  let [a, b] = id.split("-");

  const existId = streamBiggestId(item);
  console.log("id", id, [a, b]);
  console.log("existId", existId);

  if (a === "*") {
    const [c, d] = streamBiggestIdByA(item).split("-");
    a = String(parseInt(c) + 1);
  }

  if (b === "*") {
    const [c, d] = streamBiggestIdByB(item).split("-");
    console.log("biggestB", [c, d]);
    b = String(parseInt(d) + 1);
  }

  const newId = `${a}-${b}`;
  console.log("newId", newId);

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

export function streamBiggestIdByA(item?: StreamDBItem) {
  if (!item) return "0-0";

  const existValues = Object.keys(item.value).map((i) => item.value[i]);
  const biggest = existValues.reduce((a, b) => {
    const aTime = parseInt(a.id.split("-")[0]);
    const bTime = parseInt(b.id.split("-")[0]);
    const aTotal = aTime;
    const bTotal = bTime;
    return aTotal > bTotal ? a : b;
  });

  return biggest.id;
}

export function streamBiggestIdByB(item?: StreamDBItem) {
  if (!item) return "0-0";

  const existValues = Object.keys(item.value).map((i) => item.value[i]);
  const biggest = existValues.reduce((a, b) => {
    const aTime = parseInt(a.id.split("-")[1]);
    const bTime = parseInt(b.id.split("-")[1]);
    const aTotal = aTime;
    const bTotal = bTime;
    return aTotal > bTotal ? a : b;
  });

  return biggest.id;
}
