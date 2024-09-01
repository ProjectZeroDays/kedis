const xorKey = Buffer.from("kdb");

const arr = Array(1000000).fill("testtesttesttest");

console.time("Array");
const a = Array.from(arr);
console.timeEnd("Array");

console.time("Array.join");
const content = arr.join(",");
console.timeEnd("Array.join");

console.time("JSON.stringify");
JSON.stringify(arr);
console.timeEnd("JSON.stringify");

console.time("Buffer-with xor");
const buffer = Buffer.from(content, "utf8").map((byte, index) => {
  return byte ^ xorKey[index % xorKey.length];
});
console.timeEnd("Buffer-with xor");

console.time("Buffer-no xor");
const buffer2 = Buffer.from(content, "utf8");
console.timeEnd("Buffer-no xor");