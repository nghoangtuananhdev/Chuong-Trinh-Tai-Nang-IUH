import { useDemoStore } from "../../data/demo-store.jsx";

/** Tiêu đề trang: Honor Rule + eyebrow (vai trò) + H1 + mô tả + hành động cấp trang. */
export function PageHeader({ title, description, eyebrow, action = null, meta = null }) {
  const { currentRole } = useDemoStore();
  const label = eyebrow ?? currentRole?.label;

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:mb-8">
      <div className="min-w-0">
        <span className="honor-rule mb-3" aria-hidden="true" />
        {label && <p className="mb-1 text-overline uppercase text-ink-500">{label}</p>}
        <h1 data-page-heading tabIndex={-1} className="font-bold text-ink-900 outline-none max-sm:text-[1.5rem] max-sm:leading-8 max-sm:tracking-[-0.018em] sm:text-title-1">
          {title}
        </h1>
        {description && <p className="mt-2 max-w-[68ch] text-body-lg text-ink-600">{description}</p>}
        {meta && <div className="mt-3">{meta}</div>}
      </div>
      {action && <div className="shrink-0 max-sm:[&>*]:w-full">{action}</div>}
    </div>
  );
}
