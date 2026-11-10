import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, dirname, relative } from "node:path";
const src = fileURLToPath(new URL("../", import.meta.url));
function sources(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? sources(resolve(dir, e.name))
      : e.name.endsWith(".js") && !e.name.endsWith(".test.js")
        ? [resolve(dir, e.name)]
        : [],
  );
}
test("Luật import §4.1: domain thuần; service chỉ domain và kernel; đầy đủ đuôi .js", () => {
  for (const folder of ["domain", "mock/services"])
    for (const file of sources(resolve(src, folder))) {
      const text = readFileSync(file, "utf8"),
        label = relative(src, file);
      for (const [, specifier] of text.matchAll(
        /(?:from\s+|import\s*)['"]([^'"]+)['"]/g,
      )) {
        assert.ok(specifier.endsWith(".js"), `${label}: ${specifier}`);
        const target = relative(
          src,
          resolve(dirname(file), specifier),
        ).replaceAll("\\", "/");
        assert.ok(
          target.startsWith("domain/") ||
            (folder === "mock/services" &&
              target === "mock/services/_kernel.js"),
          `${label}: ${target}`,
        );
      }
      assert.ok(
        !/\b(window|document|localStorage|indexedDB|fetch|XMLHttpRequest)\b|Date\.now\(\)|new Date\(\)/.test(
          text,
        ),
        label,
      );
    }
});
test("Feature mới chỉ gọi backend, không import trực tiếp service để mutate", () => {
  for (const file of [
    "features/demo/DemoPanel.jsx",
    "features/public/PublicHome.jsx",
  ]) {
    const text = readFileSync(resolve(src, file), "utf8");
    assert.ok(!/from\s+['"][^'"]*mock\/services\//.test(text), file);
    assert.ok(!/#[0-9a-fA-F]{3,6}\b|text-\[[0-9.]+px\]/.test(text), file);
  }
});
