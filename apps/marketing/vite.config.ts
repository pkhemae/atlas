import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  server: {
    port: 3000,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tailwindcss(),
    tanstackStart(),
    // nitro's dev worker is incompatible with Start's dev server (nitro v3 beta),
    // so only use it to produce the standalone .output server at build time
    ...(command === "build" ? [nitro()] : []),
    // react's vite plugin must come after start's vite plugin
    viteReact(),
  ],
}));
