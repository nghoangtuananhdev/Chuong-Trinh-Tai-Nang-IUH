import { useEffect, useRef, useState } from "react";
import { readEvidence } from "../../mock/evidence-store.js";
import { Callout } from "../ui/Display.jsx";
export function EvidenceViewer({ file }) {
  const [url, setUrl] = useState(null),
    [error, setError] = useState("");
  const canvas = useRef(null);
  useEffect(() => {
    let active = true,
      objectUrl;
    setUrl(null);
    setError("");
    if (!file) return;
    if (file.sample) {
      const node = canvas.current;
      if (node) {
        node.width = 760;
        node.height = 980;
        const c = node.getContext("2d");
        c.fillStyle = "white";
        c.fillRect(0, 0, 760, 980);
        c.fillStyle = getComputedStyle(node).color;
        c.font = "bold 24px sans-serif";
        c.fillText("MINH CHỨNG MẪU", 50, 80);
        c.font = "18px sans-serif";
        c.fillText("DỮ LIỆU DEMO – KHÔNG CÓ GIÁ TRỊ THỰC", 50, 120);
        c.fillText(file.name, 50, 180);
        for (let i = 0; i < 12; i++)
          c.fillRect(50, 240 + i * 40, 600 - (i % 3) * 90, 2);
      }
      return;
    }
    readEvidence(file.fileKey)
      .then((blob) => {
        if (!blob) throw new Error("Không tìm thấy tệp trên trình duyệt này.");
        objectUrl = URL.createObjectURL(blob);
        if (active) setUrl(objectUrl);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file]);
  if (!file) return <p className="p-4 text-ink-600">Chọn minh chứng để xem.</p>;
  if (file.sample)
    return (
      <canvas
        ref={canvas}
        aria-label={`Minh chứng mẫu: ${file.name}`}
        className="w-full border border-ink-200 text-brand-900"
      />
    );
  if (error) return <Callout tone="danger">{error}</Callout>;
  return url ? (
    <div>
      <a href={url} download={file.name} className="text-brand-600 underline">
        Tải xuống {file.name}
      </a>
      {file.mime === "application/pdf" ? (
        <iframe
          title={file.name}
          src={url}
          className="mt-3 h-[70vh] w-full border-0"
        />
      ) : (
        <img
          src={url}
          alt={`Minh chứng ${file.name}`}
          className="mt-3 max-w-full"
        />
      )}
    </div>
  ) : (
    <p role="status">Đang tải minh chứng…</p>
  );
}
