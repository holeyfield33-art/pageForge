import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  // Relative asset paths, so the build runs from any folder or subpath
  // (e.g. https://user.github.io/pageforge/).
  base: "./",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "client", "src") },
  },
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    // three.js alone is ~540 kB minified; it is already split into a lazy chunk.
    chunkSizeWarningLimit: 600,
  },
});
