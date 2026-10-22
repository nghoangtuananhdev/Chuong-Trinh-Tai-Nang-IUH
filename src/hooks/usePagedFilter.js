import { useEffect, useMemo, useState } from "react";

/**
 * Tìm kiếm + một bộ lọc + phân trang (tối đa `pageSize` dòng/trang).
 * `match(item, keyword, filter)` trả về true nếu item được giữ lại; keyword đã trim + lowercase.
 */
export function usePagedFilter(items, { match, pageSize = 10 } = {}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return items.filter((item) => (match ? match(item, keyword, filter) : true));
  }, [items, query, filter, match]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [query, filter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const reset = () => {
    setQuery("");
    setFilter("");
  };

  return { query, setQuery, filter, setFilter, page, setPage, totalPages, rows, filtered, total: filtered.length, pageSize, reset };
}
