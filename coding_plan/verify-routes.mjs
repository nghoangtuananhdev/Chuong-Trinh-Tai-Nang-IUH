import { createServer } from "vite";
import { renderToPipeableStream } from "react-dom/server";
import { PassThrough } from "node:stream";
async function renderToString(element) {
  return new Promise((resolve, reject) => {
    const output = new PassThrough();
    let html = "";
    output.on("data", (chunk) => {
      html += chunk.toString();
    });
    output.on("end", () => resolve(html));
    output.on("error", reject);
    const stream = renderToPipeableStream(element, {
      onAllReady() {
        stream.pipe(output);
      },
      onError: reject,
    });
  });
}
import { createElement } from "react";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { buildSeedDb } from "../src/mock/seed/index.js";
const server = await createServer({
  root: fileURLToPath(new URL("../", import.meta.url)),
  server: { middlewareMode: true },
  appType: "custom",
});
let count = 0;
try {
  const { default: App } = await server.ssrLoadModule("/src/App.jsx");
  const { MENUS } = await server.ssrLoadModule("/src/app/menus.js");
  const db = buildSeedDb();
  for (const username of [
    "quantri",
    "GV900",
    "GV004",
    "GV005",
    "GV001",
    "21094501",
    "26010011",
    "GV009",
  ]) {
    const user = db.users.find((u) => u.username === username);
    for (const role of db.userRoles.filter((r) => r.userId === user.id)) {
      const paths = [
        ...new Set([
          ...(MENUS[role.role] ?? []).map((m) => `/app/${m[0]}`),
          "/app/profile",
          "/app/doi-mat-khau",
          ...(role.role === "STUDENT"
            ? [
                "/app/my-applications/" +
                  db.applications.find((a) => a.studentUserId === user.id)?.id,
              ]
            : []),
          ...(role.role === "LECTURER"
            ? [
                "/app/reviews/" +
                  db.applications.find((a) => a.roundId === "DXT-2026-02").id,
                "/app/classes/cls_ktpm_20",
              ]
            : []),
          ...(role.role === "HEAD"
            ? ["/app/criteria/cs_2", "/app/approvals/DXT-2026-03"]
            : []),
        ]),
      ];
      for (const path of paths) {
        const html = await renderToString(
          createElement(App, {
            initialState: {
              db,
              session: { userId: user.id, activeRoleId: role.id },
            },
            initialHash: `#${path}`,
          }),
        );
        assert.ok(html.length > 1000, `${username} ${path}`);
        assert.ok(!html.includes("đang được nối theo từng giai đoạn"), path);
        count++;
      }
    }
  }
  for (const path of [
    "/",
    "/dang-nhap",
    "/dang-ky",
    "/quen-mat-khau",
    "/dat-lai-mat-khau?token=mock",
    "/tra-cuu",
    "/ket-qua/DXT-2025-01",
    "/dot/DXT-2026-01",
    "/khong-ton-tai",
  ]) {
    await renderToString(
      createElement(App, {
        initialState: { db, session: null },
        initialHash: `#${path}`,
      }),
    );
    count++;
  }
  console.log(
    `Render route smoke: ${count} trang/vai trò thành công. Không thay thế tương tác browser hoặc kiểm responsive.`,
  );
} finally {
  await server.close();
}
