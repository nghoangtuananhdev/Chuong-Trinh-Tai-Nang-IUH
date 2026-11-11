import { useState } from "react";
import { Loader2 } from "lucide-react";
import { saveEvidence } from "../../mock/evidence-store.js";
import { useBackend } from "../../mock/backend.jsx";
import { FileDropzone, FileItem } from "../ui/FileDropzone.jsx";
export function EvidenceUploader({ files = [], onChange, onView }) {
  const { db, now } = useBackend();
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <div className="space-y-2">
      <FileDropzone
        compact
        lead={null}
        multiple
        accept={db.config.files.allowedMime.join(",")}
        disabled={busy}
        buttonLabel="Tải minh chứng"
        onFiles={async (chosen) => {
          setBusy(true);
          setError("");
          try {
            const refs = [];
            for (const file of chosen)
              refs.push(await saveEvidence(file, db.config.files, now));
            onChange([...files, ...refs]);
          } catch (err) {
            setError(err.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        Chọn minh chứng PDF/JPG/PNG · tối đa {db.config.files.maxMb} MB/tệp
      </FileDropzone>
      {busy && (
        <p role="status" className="flex items-center gap-1.5 text-body-sm text-ink-600">
          <Loader2 size={14} aria-hidden="true" className="animate-spin" />
          Đang lưu minh chứng…
        </p>
      )}
      {error && (
        <p role="alert" className="text-body-sm text-danger-fg">
          {error}
        </p>
      )}
      {files.map((f, i) => (
        <FileItem
          key={f.fileKey ?? `${f.name}-${i}`}
          name={f.name}
          size={`${(f.size / 1048576).toFixed(2)} MB`}
          viewLabel="Xem"
          removeLabel="Xóa"
          onView={() => onView?.(f)}
          onRemove={() => onChange(files.filter((_, j) => i !== j))}
        />
      ))}
    </div>
  );
}
