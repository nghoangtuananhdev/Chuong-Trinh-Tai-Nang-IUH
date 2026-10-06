# IUH admissions interface

## Direction

The October 2026 refresh applies UI/UX Pro Max's Minimalism & Swiss Style recommendations to the existing admissions portal: clear typography, a functional grid, generous spacing and restrained motion. Generic palette/font recommendations are adapted to IUH, not substituted for the institutional identity.

Reference: https://iuh.edu.vn. Preserve the existing IUH Faculty of Information Technology SVG and locally hosted Inter Variable with Vietnamese support. Primary blue remains #153898, deep blue #102c79, with a #10285e sidebar, white surfaces and #f4f6fa canvas. A small #be2638 accent appears in the public section marker. Do not add decorative red bars, an introductory banner, application guide or public footer.

## Components

- Public page stays admission-list first. A compact navigation row links to admissions and the official IUH site; the existing portal title remains intact.
- Editorial heading: 32–46px, navy/blue emphasis, a decorative academic mark on desktop and restrained program labeling.
- Search and status filter remain explicitly labeled. Live result totals sit directly above the cards; empty states retain their reset action.
- Admission cards retain all codes, descriptions, dates, departments and application actions. Icon treatments, pill statuses, separated metadata and primary/outlined actions clarify their hierarchy without changing behavior.
- All six workspaces use the same deep-blue navigation, white active item, account control, contextual location text, data tables and forms. Sidebar collapse and resize remain available.
- Shared tokens: 18px panels, 10px controls, 22px dialogs; subtle shadows, 180ms control transitions and 320ms page entrances.
- Tables remain internally scrollable and paginated, with all original fields and actions. No changes to demo records, permissions or business rules.
- Mobile navigation expands vertically; phone inputs are 16px, icon buttons are 44px, and dialogs scroll within the viewport.
- Semantic headings, visible focus, dialog focus containment/restoration, Escape dismissal and reduced-motion CSS remain supported.

## Verification — 7 October 2026

- `pnpm build`: passed for all seven HTML entry points.
- Browser checked all 38 navigation destinations across six roles at 1440px: content present, exactly one h1 each, no page overflow.
- Public, administrator and student pages checked at 320, 375, 768, 1024 and 1440px: no document or main-container horizontal overflow. Tables scroll inside their panels.
- Visually reviewed public desktop/mobile, administrator desktop, student mobile and application modal mobile.
- Exercised admission search/empty/reset, status filtering, application modal, Escape dismissal, demo login to administrator, sidebar collapse/expand, major search/detail and mobile menu selection.
- Browser console inspection returned no warnings/errors during role-route checks.
- Reduced motion is covered by CSS; OS-level preference and a full screen-reader audit were not exercised.

This remains a frontend prototype. These checks verify presentation, navigation and selected existing interactions; they do not establish backend persistence, real authentication or production admissions processing.
