import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["app/main.ts"],
  format: ["cjs"], // Use CommonJS for better compatibility with pkg
  target: ["node16"], // Target only Node.js for pkg compatibility
  dts: true, // Generate .d.ts files if needed
  splitting: false, // Disable code splitting for a single output file
  sourcemap: false, // Disable sourcemaps as they aren't needed for pkg
  clean: true, // Clean output directory before build
  outDir: "dist", // Ensure output goes to a single directory
});