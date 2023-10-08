import { fileURLToPath, URL } from "node:url";
import { resolve } from "path";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import ViteYaml from "@modyfi/vite-plugin-yaml";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), ViteYaml()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@root": resolve(__dirname, "./"),
    },
  },
  base: "/",
});
