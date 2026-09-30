# IUH admissions interface

## Direction

UI UX Pro Max's education administration dashboard minimal search recommends Minimalism & Swiss Style: functional grids, clear hierarchy, restrained effects and readable sans-serif typography. Apply these principles to this React portal. Its generic black/gold palette, monospace headings and hero/footer layout do not fit the user's requirements and are excluded.

Keep IUH blue (#003b71), deep blue (#002c55), white surfaces, a gray canvas (#f4f6f8) and readable secondary text (#526578). Use Segoe UI with Arial/system fallbacks and UTF-8 Vietnamese source. No external font requests are needed.

All corners are square. Do not add rounded utilities or border-radius. Do not restore red decorative bars, the introductory banner, its application guide, or the public footer.

## Components

- Public page: admission list first, descriptive heading, actual result count, labeled search and status filter, contextual empty state.
- Admission cards: white panels with a clear title, status, metadata and one blue application button.
- Workspaces: white sidebar, blue active navigation, white header and light gray content canvas. Every page has one descriptive h1.
- Small screens: collapsible vertical navigation with expanded state; tables scroll within their own panels.
- Tables: 14px body, 12px headers, visible dividers, consistent spacing, result totals and current page.
- Forms: visible labels, strong control boundaries, 44px control height; use 16px input text on phones.
- Modals: contained keyboard focus, Escape dismissal, unique title/description IDs and focus restoration.
- Feedback: semantic status text and polite live notifications, visible focus and reduced-motion support.

## Verification

The production build and all seven role renders must pass. Check one h1 per page, intact Vietnamese strings, labeled navigation, square corners and absence of removed public sections. Browser verification requires a connected browser; SSR checks do not establish visual layout or interactive behavior.
