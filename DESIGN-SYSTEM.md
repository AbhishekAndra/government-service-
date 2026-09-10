# Citizen Services Portal — Design System

One visual language for every page. Two files carry it everywhere:

| File | Purpose |
|---|---|
| [`design-system.css`](design-system.css) | Source of truth — CSS custom properties (colors, type, spacing, radius, shadow) + shared component classes (`.btn`, `.card`, `.navbar`, footer, badges, forms). |
| [`tailwind-config.js`](tailwind-config.js) | Points Tailwind's utility classes (`bg-gov-blue`, `rounded-lg`, …) at the *same* values, so utilities and component classes never drift apart. |

Every page's `<head>` should load, **in this order**:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css">
<link rel="stylesheet" href="design-system.css">
<script src="https://cdn.tailwindcss.com"></script>
<script src="tailwind-config.js"></script>
```

...and before `</body>`:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js"></script>
<script>
  AOS.init({ duration: 500, once: true, offset: 60,
    disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches });
</script>
<script src="portal-common.js"></script>
```

See [`home.html`](home.html) for the fully worked template — copy its `<head>`, navbar, footer, and floating buttons onto every other page unchanged, then swap the `<main>` content.

---

## 1. Color palette

| Token | Hex | Tailwind class | Use for |
|---|---|---|---|
| `--gov-blue` | `#003B7A` | `bg-gov-blue` / `text-gov-blue` | Primary actions, links, active states |
| `--gov-blue-dark` | `#002A59` | `bg-gov-blue-dark` | Hover/pressed state of primary blue |
| `--gov-blue-light` | `#E8F0FA` | `bg-gov-blue-light` | Tinted backgrounds behind blue icons/badges |
| `--gov-navy` | `#001F3F` | `bg-gov-navy` | Header, footer, hero overlays — the darkest surface |
| `--gov-navy-soft` | `#0A2C52` | `bg-gov-navy-soft` | Cards placed *on* a navy background |
| `--gov-gold` | `#D4AF37` | `bg-gov-gold` / `text-gov-gold` | Accent only — active nav underline, badges, one CTA per screen |
| `--gov-gold-dark` | `#B8952C` | `bg-gov-gold-dark` | Hover state of gold elements |
| `--gov-gold-light` | `#FBF3DD` | `bg-gov-gold-light` | Tinted backgrounds behind gold icons/badges |
| `--gray-50` … `--gray-900` | `#F7F9FC` → `#0F172A` | `bg-gray-50` etc. | Page background (50), borders (200), secondary text (500), body text (800), headings (900) |
| `--success` / `--warning` / `--danger` / `--info` | `#16A34A` / `#D97706` / `#DC2626` / `#0284C7` | — | Status badges and inline messages only |

**Rules of thumb:** Gold is an *accent*, not a background — use it for one primary CTA, active-state indicators, and small badges, never for large fills. Navy is for structural chrome (header/footer/hero), not body sections. Body sections sit on `--gray-50`/white with blue as the interactive color.

No dark mode: these are the only palette definitions the site needs — do not add a `prefers-color-scheme: dark` block.

## 2. Typography

- **Headings** — Poppins, 600–800 weight (`var(--font-heading)` / Tailwind `font-heading`)
- **Body** — Inter, 400–600 weight (`var(--font-body)` / Tailwind `font-body`, and the default on `<body>`)

| Token | Size | Typical use |
|---|---|---|
| `--fs-xs` | 12px | Eyebrow labels, meta text, timestamps |
| `--fs-sm` | 14px | Secondary text, nav links, buttons |
| `--fs-base` | 16px | Body copy |
| `--fs-lg` | 18px | Lead paragraphs, card titles |
| `--fs-xl` | 20px | `h4`, small stat numbers |
| `--fs-2xl` | 24px | `h3`, sub-headings |
| `--fs-3xl` | 30px | `h2`, section headings |
| `--fs-4xl` | 36px | `h1` (mobile) |
| `--fs-5xl` | 48px | `h1` (tablet, ≥768px) |
| `--fs-6xl` | 60px | `h1` (desktop, ≥1024px) |

`h1`–`h6` are styled automatically — don't override their color/weight per page. Use `.eyebrow` for the small gold-accented label above a section heading, and `.lead` for intro paragraphs.

## 3. Spacing, radius & shadow

- **Spacing**: 4px base scale, `--space-1` (4px) through `--space-24` (96px). Prefer Tailwind's `p-`/`gap-`/`m-` utilities day-to-day; the CSS variables exist for custom component CSS.
- **Radius**: `--radius-sm` 8px (inputs, small chips) · `--radius-md` 12px (default — buttons, cards, inputs) · `--radius-lg` 16px (larger cards) · `--radius-xl` 18px (hero panels, feature blocks) · `--radius-full` (pills, avatars). Stay within 12–18px for anything card-shaped, per spec.
- **Shadow**: `--shadow-sm` (resting card) → `--shadow-md` (hover) → `--shadow-lg` (modals, floating panels). All are soft and navy-tinted, never pure black — this is what keeps the site feeling calm rather than heavy.

## 4. Buttons

```html
<button class="btn btn-primary">Apply now</button>
<button class="btn btn-gold">Primary CTA (sparingly)</button>
<button class="btn btn-navy">Secondary, dark</button>
<button class="btn btn-outline">Secondary, light surfaces</button>
<button class="btn btn-outline-white">On a navy/photo background</button>
<button class="btn btn-white">On a navy panel</button>
<a class="btn btn-primary btn-lg">Large</a>
<a class="btn btn-primary btn-sm">Small</a>
<button class="btn btn-ghost">Text-only link-button</button>
```

All variants keep a **44px+ min-height** touch target and the shared focus ring. Icons: `<i class="fa-solid fa-arrow-right"></i>` inside the button, before or after the label.

## 5. Cards

```html
<a href="services.html" class="card card-hover tile" data-aos="fade-up">
  <span class="card-icon"><i class="fa-solid fa-file-signature"></i></span>
  <div>
    <h3 class="card-title">Income certificate</h3>
    <p class="card-text">Apply or view an existing request.</p>
  </div>
</a>
```

- `.card` — base surface (white, border, radius-lg, soft shadow)
- `.card-hover` — adds the lift-on-hover interaction (use for anything clickable)
- `.card-icon` — the rounded icon badge; add `.navy` or `.gold` for the tinted variants, `.sm` for a smaller 40px badge
- `.card-on-navy` — for cards sitting on a navy panel (e.g. inside the schemes/support CTA)
- `.tile` — flex row layout (icon left, text right) for quick-link style cards

## 6. Navigation bar

Structure (see `home.html` for the full markup): a slim `.utility-bar` (accessibility toggle, language, staff login, search) sits above the main `.navbar`. Nav links use `.nav-link`, with `.active` on the current page — this draws the gold underline used across the whole site instead of a background swap, so keep it consistent rather than inventing a per-page active style.

## 7. Footer

`.site-footer` is navy, four columns (`Explore`, `More`, `Account & support`, brand blurb) collapsing to one column on mobile, plus a `.footer-bottom` bar for attributions and the "demonstration project" disclaimer — **keep that disclaimer line on every page**; this portal is a practice project, not a real government site.

## 8. Icons — Font Awesome

Replace ad-hoc inline SVGs with Font Awesome 6 (`fa-solid`, `fa-regular`, `fa-brands`) loaded from cdnjs. Keep icons inside a `.card-icon` badge or sized with Tailwind (`text-lg`, `w-5` on the wrapping span) rather than hard-coded pixel SVGs — this is what makes icon sizing consistent across pages that different people edit.

## 9. Animation — AOS.js

Use `data-aos="fade-up"` (default), `data-aos="fade-right"`/`"fade-left"` for side-by-side panels, and stagger related cards with `data-aos-delay="100"`, `"200"`, etc. Keep it subtle: one animation style per section, nothing that blocks reading. AOS is disabled automatically for users with `prefers-reduced-motion: reduce` (see the init snippet above) — never remove that guard.

## 10. Rolling this out to the rest of the site

`home.html` is the reference implementation. For every other page (`services.html`, `schemes.html`, `application-status.html`, `document-verification.html`, `jobs.html`, `tourism.html`, `representatives.html`, `meetings.html`, `about.html`, `help.html`, `staff-login.html`):

1. Copy `home.html`'s `<head>` block (fonts, Font Awesome, AOS, `design-system.css`, Tailwind + `tailwind-config.js`) verbatim.
2. Copy the `.utility-bar` + `.navbar` header and the `.site-footer` + floating a11y/chat buttons verbatim, only changing which `.nav-link` gets `.active`.
3. Rebuild that page's own content using `.card`, `.btn`, `.badge`, `.eyebrow` and Tailwind layout utilities instead of its old bespoke classes/colors.
4. Keep every element `id` that `portal-common.js` depends on (`a11yToggle`, `a11yPanel`, `data-fontsize` buttons, `headerSearch`, `serviceSearch`, `a11yFab`) so the shared behavior keeps working with zero JS changes.

This file (`DESIGN-SYSTEM.md`) is the reference for anyone doing that work — update it if a token changes, rather than letting a page redefine its own colors.
