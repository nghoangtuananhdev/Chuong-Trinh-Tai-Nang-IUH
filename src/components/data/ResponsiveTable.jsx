const hideClasses = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell"
};

const alignClasses = { left: "text-left", center: "text-center", right: "text-right" };

/**
 * Bảng đầy đủ từ 640px; dưới đó chuyển thành danh sách thẻ.
 * columns: [{ key, header, cell(row), align, hideBelow: "sm"|"md"|"lg", width, className }]
 * mobileCard(row): nội dung thẻ (không gồm khung). getRowProps(row): thuộc tính thêm cho <tr>/<li> (data-attention, data-selected...).
 */
export function ResponsiveTable({
  columns,
  rows,
  rowKey,
  caption,
  mobileCard,
  empty,
  onRowClick,
  getRowProps
}) {
  if (rows.length === 0) {
    return <div>{empty}</div>;
  }

  const activate = (row) => (e) => {
    if (!onRowClick) return;
    if (e.target.closest("button, a, input, select, textarea, label")) return;
    onRowClick(row);
  };

  return (
    <>
      <div className="scrollbar-thin hidden overflow-x-auto sm:block">
        <table className="ui-table">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  style={col.width ? { width: col.width } : undefined}
                  className={`${alignClasses[col.align] || ""} ${col.hideBelow ? hideClasses[col.hideBelow] : ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={activate(row)}
                className={onRowClick ? "cursor-pointer" : undefined}
                {...(getRowProps ? getRowProps(row) : {})}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`${alignClasses[col.align] || ""} ${col.hideBelow ? hideClasses[col.hideBelow] : ""} ${col.className || ""}`}
                  >
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mobileCard && (
        <ul role="list" className="divide-y divide-ink-200 sm:hidden">
          {rows.map((row) => (
            <li
              key={rowKey(row)}
              onClick={activate(row)}
              className={`px-4 py-4 data-[attention=true]:shadow-[inset_3px_0_0_var(--color-warning-solid)] ${onRowClick ? "cursor-pointer active:bg-brand-25" : ""}`}
              {...(getRowProps ? getRowProps(row) : {})}
            >
              {mobileCard(row)}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
