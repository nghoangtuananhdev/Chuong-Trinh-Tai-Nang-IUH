import { ChevronLeft, ChevronRight } from "lucide-react";

function getPageNumbers(page, totalPages) {
  const pages = [];
  if (totalPages <= 6) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  }
  pages.push(1);
  if (page > 3) pages.push("...");
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  for (let i = start; i <= end; i++) {
    if (!pages.includes(i)) pages.push(i);
  }
  if (page < totalPages - 2) pages.push("...");
  if (!pages.includes(totalPages)) pages.push(totalPages);
  return pages;
}

export function Pagination({ page, totalPages, onChange, total, pageSize = 10 }) {
  if (!total) return null;

  const single = totalPages <= 1;
  const startIdx = (page - 1) * pageSize + 1;
  const endIdx = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-200 bg-ink-25 px-5 py-3 text-body-sm text-ink-600">
      <p role="status">
        Hiển thị <span className="font-semibold tabular-nums text-ink-900">{single ? `1–${total}` : `${startIdx}–${endIdx}`}</span> trong{" "}
        <span className="font-semibold tabular-nums text-ink-900">{total}</span> bản ghi{" "}
        <span aria-hidden="true" className="mx-1 text-ink-300">·</span> Trang{" "}
        <span className="font-semibold tabular-nums text-ink-900">{single ? 1 : page}</span>/{single ? 1 : totalPages}
      </p>

      {!single && (
        <nav className="flex items-center gap-1" aria-label="Phân trang danh sách">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => onChange(page - 1)}
            aria-label="Trang trước"
            className="inline-flex h-8 items-center gap-1 rounded-control px-2.5 text-body-sm font-medium text-ink-700 transition-colors hover:bg-ink-100 disabled:cursor-not-allowed disabled:text-ink-400 disabled:hover:bg-transparent"
          >
            <ChevronLeft size={14} aria-hidden="true" />
            <span>Trước</span>
          </button>

          <div className="hidden items-center gap-0.5 sm:flex">
            {getPageNumbers(page, totalPages).map((num, idx) =>
              num === "..." ? (
                <span key={`ellipsis-${idx}`} className="px-1.5 text-ink-400 select-none">
                  …
                </span>
              ) : (
                <button
                  key={num}
                  type="button"
                  aria-current={num === page ? "page" : undefined}
                  onClick={() => onChange(num)}
                  className={`flex size-8 items-center justify-center rounded-control text-body-sm font-semibold tabular-nums transition-colors ${
                    num === page ? "bg-brand-600 text-white" : "text-ink-700 hover:bg-ink-100"
                  }`}
                >
                  {num}
                </button>
              )
            )}
          </div>

          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => onChange(page + 1)}
            aria-label="Trang sau"
            className="inline-flex h-8 items-center gap-1 rounded-control px-2.5 text-body-sm font-medium text-ink-700 transition-colors hover:bg-ink-100 disabled:cursor-not-allowed disabled:text-ink-400 disabled:hover:bg-transparent"
          >
            <span>Sau</span>
            <ChevronRight size={14} aria-hidden="true" />
          </button>
        </nav>
      )}
    </div>
  );
}
