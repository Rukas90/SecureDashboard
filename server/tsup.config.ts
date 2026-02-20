import { defineConfig } from "tsup"
import path from "path"

export default defineConfig({
  entry: [
    "src/main.ts",
    "src/feature/**/*.controller.ts",
    "src/feature/**/*.worker.ts",
    "src/feature/**/*.dispatch.ts",
  ],
  format: ["esm"],
  outDir: "dist",
  clean: true,
  bundle: true,
  splitting: true,
  sourcemap: true,
  esbuildOptions(options) {
    options.alias = {
      "@base": path.resolve("./src"),
      "@shared": path.resolve("./src/shared"),
      "@lib": path.resolve("./src/lib"),
      "@features": path.resolve("./src/feature"),
    }
  },
})
