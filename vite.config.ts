import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // IMPORTANT: base "./" ensures all asset paths are relative
  // so index.html works when opened directly from the filesystem
  base: "./",
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
});
