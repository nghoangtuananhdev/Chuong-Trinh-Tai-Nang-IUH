/** Khung nội dung chuẩn: nền trắng + viền, không bóng. Không lồng Panel trong Panel. */
export function Panel({
  title,
  titleAs: Tag = "h2",
  description,
  actions,
  footer,
  padded = true,
  className = "",
  children,
  ...rest
}) {
  return (
    <section className={`surface ${className}`} {...rest}>
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 px-5 pt-4 pb-3 max-sm:px-4">
          <div className="min-w-0">
            {title && <Tag className="text-title-3 text-ink-900">{title}</Tag>}
            {description && <p className="mt-0.5 text-body-sm text-ink-600">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={padded ? (title || actions ? "px-5 pb-5 max-sm:px-4 max-sm:pb-4" : "p-5 max-sm:p-4") : ""}>{children}</div>
      {footer && <footer className="border-t border-ink-200 px-5 py-3 max-sm:px-4">{footer}</footer>}
    </section>
  );
}
