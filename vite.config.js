import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = typeof import.meta.dirname !== "undefined"
  ? import.meta.dirname
  : dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  server: {
    host: "127.0.0.1",
    port: 5173
  },
  build: {
    rollupOptions: {
      input: {
        home: resolve(rootDir, "index.html"),
        admin: resolve(rootDir, "quan-tri-vien.html"),
        training: resolve(rootDir, "dai-dien-phong-dao-tao.html"),
        dean: resolve(rootDir, "ban-lanh-dao-khoa.html"),
        head: resolve(rootDir, "chu-nhiem-nganh.html"),
        lecturer: resolve(rootDir, "giang-vien-phu-trach.html"),
        student: resolve(rootDir, "sinh-vien.html")
      }
    }
  }
});
