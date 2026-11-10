// Render smoke check only. This does not replace browser UAT or responsive/focus checks.
import assert from "node:assert/strict";
import { createServer } from "vite";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const server = await createServer({
  root,
  server: { middlewareMode: true },
  appType: "custom",
});
try {
  const { default: App } = await server.ssrLoadModule("/src/App.jsx");
  const html = renderToString(createElement(App));
  assert.ok(
    html.includes("DXT-2026-06"),
    "R6 upcoming phải có trên trang công khai",
  );
  assert.ok(!html.includes("DXT-2026-07"), "R7 draft không được công khai");
  assert.ok(html.includes("Bảng điều khiển demo"), "Có nút mở Demo");
  assert.ok(!html.includes("closed"), "Không có trạng thái ĐXT cũ");
  console.log(
    "Render smoke: ĐẠT (trang chủ seed v3; R6 công khai; R7 ẩn; nút Demo).",
  );
  console.log(
    "Chưa kiểm browser interaction, IndexedDB, responsive hoặc focus.",
  );
} finally {
  await server.close();
}
