import { useState } from "react";
import { saveEvidence } from "../../mock/evidence-store.js";
import { useBackend } from "../../mock/backend.jsx";
import { Button } from "../ui/Button.jsx";
export function EvidenceUploader({ files = [], onChange, onView }) {
  const { db, now } = useBackend();
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <div className="space-y-2">
      <label className="block rounded-control border border-dashed border-brand-300 bg-brand-25 p-3 text-body-sm">
        Chọn minh chứng PDF/JPG/PNG · tối đa {db.config.files.maxMb} MB/tệp
        <input
          aria-label="Tải minh chứng"
          type="file"
          accept={db.config.files.allowedMime.join(",")}
          multiple
          disabled={busy}
          className="mt-2 block w-full text-body-sm"
          onChange={async (e) => {
            const chosen = [...e.target.files];
            e.target.value = "";
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
        />
      </label>
      {busy && <p role="status">Đang lưu minh chứng…</p>}
      {error && (
        <p role="alert" className="text-body-sm text-danger-fg">
          {error}
        </p>
      )}
      {files.map((f, i) => (
        <div
          key={f.fileKey ?? `${f.name}-${i}`}
          className="flex flex-wrap items-center gap-2 text-body-sm"
        >
          <span className="min-w-0 break-all">
            {f.name} · {(f.size / 1048576).toFixed(2)} MB
          </span>
          <Button size="sm" variant="link" onClick={() => onView?.(f)}>
            Xem
          </Button>
          <Button
            size="sm"
            variant="tertiary"
            onClick={() => onChange(files.filter((_, j) => i !== j))}
          >
            Xóa
          </Button>
        </div>
      ))}
    </div>
  );
}
