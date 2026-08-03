import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, "index.html"),
        admin: resolve(import.meta.dirname, "quan-tri-vien.html"),
        training: resolve(import.meta.dirname, "dai-dien-phong-dao-tao.html"),
        dean: resolve(import.meta.dirname, "ban-lanh-dao-khoa.html"),
        head: resolve(import.meta.dirname, "chu-nhiem-nganh.html"),
        lecturer: resolve(import.meta.dirname, "giang-vien-phu-trach.html"),
        student: resolve(import.meta.dirname, "sinh-vien.html")
      }
    }
  }
});
