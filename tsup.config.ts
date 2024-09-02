import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["app/main.ts"],
  format: ["cjs", "esm"],
  target: ["node16", "deno1.43", "es2015", "esnext"],
  dts: true,
  splitting: false,
  sourcemap: false,
  clean: true,
});