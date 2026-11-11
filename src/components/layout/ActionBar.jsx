/** Hàng nút cấp trang/khối: nút phụ trước, nút chính ngoài cùng bên phải; nguy hiểm đặt ở `start`. */
export function ActionBar({ children, sticky = false, start, className = "" }) {
  return (
    <div
      className={`${sticky ? "action-bar-sticky -mx-4 px-4 py-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8" : ""} flex flex-wrap items-center justify-between gap-3 ${className}`}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-2">{start}</div>
      <div className="flex flex-wrap items-center justify-end gap-2">{children}</div>
    </div>
  );
}
