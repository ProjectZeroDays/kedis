export default function streamTime(id: string, item: StreamDBItem | undefined) {
  if (!id.includes("*")) return id;

  if (id === "*") return autoStreamId(item);

  let [a, b] = id.split("-");

  if (a === "*") {
    const [c, d] = streamBiggestIdByA(item).split("-");
    a = String(parseInt(c) + 1);
  }

  if (b === "*") {
    const [c, d] = streamBiggestIdByB(item, parseInt(a)).split("-");

    if (`${c}-${d}` === "0-0") {
      b = d;
    } else {
      b = String(parseInt(d) + 1);
    }
  }

  const newId = `${a}-${b}`;
  if (newId === "0-0") return "0-1";

  return newId;
}

export function autoStreamId(item: StreamDBItem | undefined) {
    // get current Unix time as string: (The time part of the ID should be the current unix time in milliseconds, not seconds.)
    const now = Date.now().toString();

    const biggestId = streamBiggestIdByB(item, parseInt(now));
    const [a, b] = biggestId.split("-");

    if (biggestId === "0-0") {
        return `${now}-0`;
    }

    const newId = `${now}-${String(parseInt(b) + 1)}`;
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

export function streamBiggestIdByB(item: StreamDBItem | undefined, a: number) {
  if (!item) return "0-0";

  let existValues = Object.keys(item.value).map((i) => item.value[i]);
  // filter values based on the a.id.split("-")[0] is equal to a:
  existValues = existValues.filter((v) => v.id.split("-")[0] === a.toString());

  if (existValues.length === 0) return "0-0";

  const biggest = existValues.reduce((a, b) => {
    const aTime = parseInt(a.id.split("-")[1]);
    const bTime = parseInt(b.id.split("-")[1]);
    const aTotal = aTime;
    const bTotal = bTime;
    return aTotal > bTotal ? a : b;
  });

  return biggest.id;
}
