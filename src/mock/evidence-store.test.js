import { test } from "node:test";
import assert from "node:assert/strict";
import { validateEvidence } from "./evidence-store.js";
const config = {
  maxMb: 10,
  allowedMime: ["application/pdf", "image/png", "image/jpeg"],
};
for (const [type, bytes] of [
  ["application/pdf", [37, 80, 68, 70]],
  ["image/png", [137, 80, 78, 71, 13, 10, 26, 10]],
  ["image/jpeg", [255, 216, 255]],
]) {
  test(`Magic bytes ${type}`, async () =>
    assert.equal(
      await validateEvidence(
        new File([new Uint8Array(bytes)], "sample", { type }),
        config,
      ),
      true,
    ));
}
test("Chặn giả MIME, docx, tệp trống, >10 MB; cấu hình 2 MB chặn 3 MB", async () => {
  const pdf = new File(["%PDF-test"], "sample.pdf", {
    type: "application/pdf",
  });
  await assert.rejects(
    validateEvidence(
      new File(["not-pdf"], "fake.pdf", { type: "application/pdf" }),
      config,
    ),
    { code: "VALIDATION" },
  );
  await assert.rejects(
    validateEvidence(
      new File(["file"], "a.docx", {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      }),
      config,
    ),
    { code: "VALIDATION" },
  );
  await assert.rejects(
    validateEvidence(
      new File([], "empty.pdf", { type: "application/pdf" }),
      config,
    ),
    { code: "VALIDATION" },
  );
  await assert.rejects(
    validateEvidence(
      { ...pdf, size: 10 * 1024 * 1024 + 1, type: pdf.type },
      config,
    ),
    { code: "VALIDATION" },
  );
  await assert.rejects(
    validateEvidence(
      { size: 3 * 1024 * 1024, type: pdf.type },
      { ...config, maxMb: 2 },
    ),
    { code: "VALIDATION" },
  );
});
