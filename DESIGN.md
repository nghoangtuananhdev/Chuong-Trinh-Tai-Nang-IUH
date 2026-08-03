# IUH Talent Design System

## Direction

The public experience uses Airtable-like editorial restraint: white canvas, large low-weight display type, generous whitespace, near-black primary actions, and occasional full-surface color cards. The authenticated application uses Linear-like precision: dense information, compact controls, dark navigation, subtle surface steps, hairline borders, and restrained accent color.

The result must still feel unmistakably IUH. IUH blue is reserved for identity, focus, active navigation, links, and selected states. It is not used as a decorative wash.

## Tokens

- Primary and interactive blue: `#153898`
- Ink: `#172033`
- Navy navigation: `#101c31`
- Canvas: `#ffffff`
- Application background: `#f6f7f9`
- Hairline: `#dfe4ea`
- Signature forest: `#153d35`
- Signature coral: `#b7482e`
- Signature cream: `#f5eddf`
- Signature mint: `#dceee8`
- Signature yellow: `#f5dda0`

## Typography

- Family: Inter with native system fallbacks.
- Marketing display: 500-550 weight, tight tracking, 1.02-1.1 line height.
- Application headings: 600 weight, compact negative tracking.
- Body: 400 weight with 1.5-1.68 line height.
- Interface labels: 500-650 weight at 11-14px.
- Prefer size and contrast over excessive bold weight.

## Geometry and spacing

- Base spacing unit: 4px. Primary increments: 8, 12, 16, 24, 32, 48, 96.
- Inputs and buttons: 8-10px radius and at least 42px high.
- Product cards and panels: 10-14px radius.
- Pills are reserved for status indicators only.
- Public sections use 96px vertical rhythm; dashboards use compact 12-24px rhythm.

## Components

- Primary button: near-black background, white label, 10px radius.
- Secondary button: white background, ink label, hairline outline.
- Public signature card: full forest/navy surface, white text, 14px radius, 48px padding.
- Dashboard panel: white surface, 1px hairline, 10px radius, no default shadow.
- Active sidebar item: lifted navy surface with a 3px IUH-blue left indicator.
- Data table: uppercase 11px headers, 12.5px body, 10-12px cell padding.
- Status badge: compact 5px radius with semantic tinted background.

## Guardrails

- Do not add atmospheric gradients, glass cards, oversized shadows, or pill buttons.
- Do not make every surface blue; blue must remain a scarce interaction signal.
- Do not use heavy display weights. Keep marketing headlines confident through scale.
- Keep tables readable and horizontally scrollable on smaller screens.
- Preserve minimum 44px touch targets for mobile form controls and primary actions.
