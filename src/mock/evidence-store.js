import { DomainError } from "../domain/errors.js";
async function accessEvidenceStore(mode, operation) {
  const database = await new Promise((resolve, reject) => {
    const request = indexedDB.open("iuh-admissions-evidence-v3", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("files");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction("files", mode);
      const request = operation(transaction.objectStore("files"));
      transaction.oncomplete = () => resolve(request?.result);
      transaction.onabort = () => reject(transaction.error);
      transaction.onerror = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}
async function withEvidenceStore(mode, operation) {
  try {
    return await accessEvidenceStore(mode, operation);
  } catch {
    throw new DomainError(
      "VALIDATION",
      "Không thể truy cập kho minh chứng trên trình duyệt. Vui lòng kiểm tra dung lượng và quyền lưu trữ rồi thử lại.",
    );
  }
}
export async function validateEvidence(file, config) {
  if (!file || file.size <= 0)
    throw new DomainError(
      "VALIDATION",
      "Tệp trống. Vui lòng chọn lại minh chứng.",
    );
  if (!config.allowedMime.includes(file.type))
    throw new DomainError(
      "VALIDATION",
      "Chỉ chấp nhận minh chứng PDF, JPG hoặc PNG theo cấu hình hệ thống.",
    );
  if (file.size > config.maxMb * 1024 * 1024)
    throw new DomainError(
      "VALIDATION",
      `Tệp vượt quá ${config.maxMb} MB. Vui lòng chọn tệp nhỏ hơn.`,
    );
  const head = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const starts = (bytes) => bytes.every((v, i) => head[i] === v);
  const actual = starts([0x25, 0x50, 0x44, 0x46])
    ? "application/pdf"
    : starts([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
      ? "image/png"
      : starts([0xff, 0xd8, 0xff])
        ? "image/jpeg"
        : null;
  if (actual !== file.type)
    throw new DomainError(
      "VALIDATION",
      "Nội dung tệp không khớp định dạng khai báo. Vui lòng chọn PDF, JPG hoặc PNG hợp lệ.",
    );
  return true;
}
export async function saveEvidence(file, config, now) {
  await validateEvidence(file, config);
  const fileKey = crypto.randomUUID();
  await withEvidenceStore("readwrite", (store) => store.add(file, fileKey));
  return {
    fileKey,
    name: file.name,
    mime: file.type,
    size: file.size,
    uploadedAt: now,
  };
}
export const readEvidence = (fileKey) =>
  withEvidenceStore("readonly", (store) => store.get(fileKey));
export const deleteEvidence = (fileKey) =>
  withEvidenceStore("readwrite", (store) => store.delete(fileKey));
export const clearEvidence = () =>
  withEvidenceStore("readwrite", (store) => store.clear());
