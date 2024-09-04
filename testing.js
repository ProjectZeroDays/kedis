const arr = Array(50_000_000).fill("test");

function fastMap(data, func) {
  const len = data.length;

  for (let i = 0; i < len; i++) {
    func(data[i]);
  }
}

async function main() {
  let all = 0;

  const func = (a) => {
    all ++;
    return true;
  };

  console.time("map");
  arr.map(func);
  console.timeEnd("map");

  console.time("fast-map");
  fastMap(arr, func);
  console.timeEnd("fast-map");

  console.log(all);

  // console.time("fast-map2");
  // await fastMap2(arr, func);
  // console.timeEnd("fast-map2");
}

main();
