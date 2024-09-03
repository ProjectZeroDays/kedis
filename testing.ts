const xorKey = Buffer.from("kdb");

const arr = Array(150000000).fill("testtesttesttest");

function fastMap(data: any[], func: (a: any) => any) {
  const len = data.length;

  for (let i = 0; i < len; i++) {
    func(data[i]);
  }
}

async function fastMap2(data: any[], func: (a: any) => any) {
  
}

async function main() {
  const func = (a: any) => {
    return true;
  };

  console.time("map");
  arr.map(func);
  console.timeEnd("map");

  console.time("fast-map");
  fastMap(arr, func);
  console.timeEnd("fast-map");

  // console.time("fast-map2");
  // await fastMap2(arr, func);
  // console.timeEnd("fast-map2");
}

main();
