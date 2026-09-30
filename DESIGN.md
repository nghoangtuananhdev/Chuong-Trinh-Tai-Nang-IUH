# IUH admissions interface

## Direction

UI UX Pro Max's education administration dashboard minimal search recommends Minimalism & Swiss Style: functional grids, clear hierarchy, restrained effects and readable sans-serif typography. Apply these principles to this React portal. Its generic black/gold palette, monospace headings and hero/footer layout do not fit the user's requirements and are excluded.

Use IUH website blue (#153898), deep blue (#102c79), white surfaces, a pale blue-gray canvas (#f5f7fb) and readable secondary text (#53627a). Primary blue was verified in https://iuh.edu.vn/assets/css/app.css?v=51. The public IUH site also uses pale blue surfaces and sans-serif text; translate those cues onto the existing components. Use locally hosted Inter Variable with Segoe UI/Arial/system fallbacks and UTF-8 Vietnamese source. All 92 Vietnamese extended glyphs have been verified. Package its SIL Open Font License and use font-display: swap. No runtime third-party font requests are needed.

The user has explicitly delegated radius and animation decisions. Use 20px panels, 24px admission cards/dialogs, 12px controls, 14px metadata panels, and pill status badges. Keep nested radii proportional. Do not restore red decorative bars, the introductory banner, its application guide, or the public footer.

## Components

- Public page: admission list first, descriptive heading, actual result count, labeled search and status filter, contextual empty state.
- Admission cards: white rounded surface, pale blue code tag, navy title, inset metadata panel and one full-width blue application button. Use restrained layered shadows.
- Workspaces: deep blue sidebar, rounded blue active state, white header and pale content canvas. Preserve existing sidebar resize and collapse controls. Every page has one descriptive h1.
- Small screens: collapsible vertical navigation with expanded state; tables scroll within their own panels.
- Tables: 14px body, 12px headers, visible dividers, consistent spacing, result totals and current page.
- Forms: visible labels, strong control boundaries, 44px control height; use 16px input text on phones.
- Modals: contained keyboard focus, Escape dismissal, unique title/description IDs and focus restoration.
- Feedback: semantic status text and polite live notifications, visible focus and reduced-motion support.

## Verification

The production build and all seven role renders must pass. Check one h1 per page, intact Vietnamese strings, labeled navigation, consistent radius tokens, motion preferences and absence of removed public sections. Browser verification requires a connected browser; SSR checks do not establish visual layout or interactive behavior.

## Motion

Use one subtle entrance for the public card grid and one for workspace content (380ms, 8px). Menus enter in 180ms; dialogs enter in 260ms with a 10px translation and 0.98-to-1 scale. Controls use 180ms feedback, a restrained press scale and color changes. Card lift is only enabled for fine pointers with hover. Do not animate every table row or run looping decoration. Keep resizing immediate rather than animating layout width. Disable entrance animations, hover lifts and press transforms under prefers-reduced-motion.
