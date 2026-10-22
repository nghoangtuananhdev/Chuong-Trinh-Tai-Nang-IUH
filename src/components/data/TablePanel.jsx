import { isValidElement, useRef } from "react";
import { Pagination } from "../ui/Pagination.jsx";

/** Khung bảng. `pagination` là element hoặc { page, totalPages, onChange, total, pageSize }. */
export function TablePanel({ toolbar, children, pagination, className = "" }) {
  const ref = useRef(null);

  let paginationNode = null;
  if (pagination) {
    if (isValidElement(pagination)) {
      paginationNode = pagination;
    } else {
      paginationNode = (
        <Pagination
          {...pagination}
          onChange={(p) => {
            pagination.onChange(p);
            requestAnimationFrame(() => {
              const el = ref.current;
              if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: "smooth", block: "start" });
            });
          }}
        />
      );
    }
  }

  return (
    <div ref={ref} className={`ui-card scroll-mt-20 overflow-hidden ${className}`}>
      {toolbar}
      {children}
      {paginationNode}
    </div>
  );
}
