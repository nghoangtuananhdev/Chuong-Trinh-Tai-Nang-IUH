import { test } from "node:test";
import assert from "node:assert/strict";
import { parseRoute, buildHref } from "./router.js";
test("Hash route giữ deep link, params và returnTo, không crash percent lỗi", () => {
  const r = parseRoute("#/app/reviews/HS-1?round=DXT-1");
  assert.deepEqual(r.segments, ["app", "reviews", "HS-1"]);
  assert.equal(r.query.round, "DXT-1");
  assert.equal(
    parseRoute("#/dang-nhap?returnTo=%2Fapp%2Fapply%2FR1").query.returnTo,
    "/app/apply/R1",
  );
  assert.doesNotThrow(() => parseRoute("#/app/rounds/%E0%A4%A"));
  assert.equal(buildHref("/app/dashboard"), "#/app/dashboard");
});
