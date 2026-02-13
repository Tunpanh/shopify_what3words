import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["./tests/setup-env.ts"],
    include: ["app/**/*.test.ts", "extensions/**/*.test.ts", "extensions/**/*.test.tsx"],
    exclude: ["node_modules", "build", "dist", "coverage"],
    globals: true
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "app")
    }
  }
});

