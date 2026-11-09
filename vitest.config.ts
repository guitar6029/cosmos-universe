import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [vue()],
  test: {
    coverage: {
      all: true,
      exclude: [
        "app/assets/**",
        "app/constants/**",
        "app/data/**",
        "app/types/**",
        "server/dev-handlers/**",
        "server/types/**",
        "**/*.d.ts",
        ".nuxt/**",
        ".output/**",
        "coverage/**",
        "node_modules/**",
        "test/**",
      ],
      include: ["app/**/*.{ts,vue}", "server/**/*.ts"],
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
    include: ["test/**/*.test.ts"],
    setupFiles: ["./test/setup.ts"],
  },
});
