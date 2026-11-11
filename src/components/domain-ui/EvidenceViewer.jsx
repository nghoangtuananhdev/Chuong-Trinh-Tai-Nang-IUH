import { useEffect, useRef, useState } from "react";
import { readEvidence } from "../../mock/evidence-store.js";
import { Download, FileSearch } from "lucide-react";
import { Callout } from "../ui/Display.jsx";
import { EmptyState } from "../ui/EmptyState.jsx";
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
  if (!file)
    return (
      <EmptyState
        compact
        icon={FileSearch}
        title="Chọn minh chứng để xem."
        description={null}
      />
    );
  if (file.sample)
    return (
      <div className="p-4">
        <canvas
          ref={canvas}
          aria-label={`Minh chứng mẫu: ${file.name}`}
          className="w-full rounded-control border border-ink-200 text-brand-900"
        />
      </div>
    );
  if (error)
    return (
      <div className="p-4">
        <Callout tone="danger">{error}</Callout>
      </div>
    );
  return url ? (
    <div className="p-4">
      <a
        href={url}
        download={file.name}
        className="text-link inline-flex items-center gap-1.5"
      >
        <Download size={14} aria-hidden="true" />
        Tải xuống {file.name}
      </a>
      {file.mime === "application/pdf" ? (
        <iframe
          title={file.name}
          src={url}
          className="mt-3 h-[70vh] w-full rounded-control border border-ink-200"
        />
      ) : (
        <img
          src={url}
          alt={`Minh chứng ${file.name}`}
          className="mt-3 max-w-full rounded-control border border-ink-200"
        />
      )}
    </div>
  ) : (
    <p role="status" className="p-4 text-body-sm text-ink-600">
      Đang tải minh chứng…
    </p>
  );
}
