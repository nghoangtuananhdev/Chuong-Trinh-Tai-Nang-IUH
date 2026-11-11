import { useBackend } from "../../mock/backend.jsx";
import { ROLE_LABEL } from "../../domain/constants.js";

/** Tiêu đề trang: nhãn vai trò + H1 + mô tả + hành động cấp trang. */
export function PageHeader({ title, description, eyebrow, action = null, meta = null }) {
  const { activeRole } = useBackend();
  const label = eyebrow ?? ROLE_LABEL[activeRole?.role];

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:mb-8">
      <div className="min-w-0">
        {label && <p className="mb-1 text-body-sm text-ink-600">{label}</p>}
        <h1 data-page-heading tabIndex={-1} className="text-title-1 text-ink-900 outline-none">
          {title}
        </h1>
        {description && <p className="mt-2 max-w-[68ch] text-body-lg text-ink-600">{description}</p>}
        {meta && <div className="mt-3">{meta}</div>}
      </div>
      {action && <div className="shrink-0 max-sm:[&>*]:w-full">{action}</div>}
    </div>
  );
}
