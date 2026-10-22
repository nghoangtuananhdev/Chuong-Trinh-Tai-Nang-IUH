import { useEffect, useRef, useState } from "react";
import { Search, RotateCcw } from "lucide-react";
import { Button } from "../ui/Button.jsx";
import { FilterTabs } from "../ui/FilterTabs.jsx";

const normalize = (opt) => (typeof opt === "string" ? { value: opt, label: opt } : opt);

/**
 * Thanh công cụ bảng: tìm kiếm (debounce 150ms, phím tắt "/") + bộ lọc.
 * filterOptions: chuỗi hoặc { value, label, count }.
 * filterVariant: "select" (mặc định) hoặc "tabs" (segmented có đếm số).
 */
export function TableToolbar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Tìm kiếm...",
  filterValue = "",
  onFilterChange,
  filterLabel = "Bộ lọc",
  filterAllLabel = "Tất cả",
  filterAllCount,
  filterOptions = [],
  filterVariant = "select",
  action = null
}) {
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const lastSent = useRef(searchQuery);
  const [draft, setDraft] = useState(searchQuery);
  const [focused, setFocused] = useState(false);
  const hasFilterActive = Boolean(searchQuery || filterValue);
  const options = filterOptions.map(normalize);

  useEffect(() => {
    if (searchQuery !== lastSent.current) {
      lastSent.current = searchQuery;
      setDraft(searchQuery);
    }
  }, [searchQuery]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target;
      if (t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (document.querySelector('[role="dialog"], [role="alertdialog"]')) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const handleChange = (value) => {
    setDraft(value);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      lastSent.current = value;
      onSearchChange(value);
    }, 150);
  };

  const reset = () => {
    clearTimeout(timerRef.current);
    lastSent.current = "";
    setDraft("");
    onSearchChange("");
    onFilterChange?.("");
  };

  const showFilter = onFilterChange && options.length > 0;

  return (
    <div className="flex flex-col gap-3 border-b border-ink-200 bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative w-full sm:max-w-[420px] sm:flex-1 sm:basis-[320px]">
          <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            ref={inputRef}
            type="search"
            value={draft}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="ui-input h-10 pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden"
          />
          {!draft && !focused && (
            <kbd
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-xs border border-ink-200 bg-ink-25 px-1.5 font-mono text-caption text-ink-500 sm:block"
            >
              /
            </kbd>
          )}
        </div>

        {showFilter && filterVariant === "tabs" && (
          <FilterTabs
            label={filterLabel}
            value={filterValue}
            onChange={onFilterChange}
            options={[{ value: "", label: filterAllLabel, count: filterAllCount }, ...options]}
          />
        )}

        {showFilter && filterVariant !== "tabs" && (
          <div className="w-full sm:w-auto sm:min-w-[180px]">
            <select
              value={filterValue}
              onChange={(e) => onFilterChange(e.target.value)}
              aria-label={filterLabel}
              className="ui-input h-10 min-h-10"
            >
              <option value="">{filterAllLabel}</option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {hasFilterActive && (
          <Button variant="tertiary" size="sm" onClick={reset} icon={RotateCcw}>
            Đặt lại
          </Button>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
