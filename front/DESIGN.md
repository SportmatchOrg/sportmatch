# SportMatch - Design System

**What the product is:** a dark, photography-led, mobile-first sports-discovery app (Spanish, rioplatense voice). Not a dashboard. Chrome floats over full-bleed imagery; one primary action per screen; electric blue is rationed.

**Canonical implementation:** `prototype/sportmatch/`. Tokens live in
`prototype/sportmatch/design-system/tokens/`, application code in
`prototype/sportmatch/app/`, and source media in
`prototype/sportmatch/media/`.

## 1. Color tokens

Source: `prototype/sportmatch/design-system/tokens/colors.css`. Dark-only; there is **no light theme** in the implementation.

### Canvas & surfaces


| Token                                  | Value                   | Usage                                                                |
| -------------------------------------- | ----------------------- | -------------------------------------------------------------------- |
| `--bg-base`                            | `#000000`               | App canvas — always true black                                       |
| `--bg-raised`                          | `#0b0b0e`               | Sheets/modals over a dimmed canvas                                   |
| `--bg-sunken`                          | `#060608`               | Map shell, media wells, card fallback behind photos                  |
| `--scrim`                              | `rgba(0,0,0,.55)`       | Dim behind sheets/modals                                             |
| `--glass-thin`                         | `rgba(255,255,255,.03)` | Barely-there fills                                                   |
| `--glass`                              | `rgba(255,255,255,.05)` | **Default surface** — rows, inputs, tiles                            |
| `--glass-strong`                       | `rgba(255,255,255,.10)` | Raised/selected glass, chips, icon buttons, icon discs               |
| `--glass-solid`                        | `rgba(22,22,26,.60)`    | Sheets, bottom nav, toasts, map pins (legibility beats translucency) |
| `--glass-border` / `--border-hairline` | `rgba(255,255,255,.15)` | The 1px inset hairline on every glass surface                        |
| `--glass-border-strong`                | `rgba(255,255,255,.26)` | Emphasis/selected edge                                               |
| `--glass-highlight`                    | `rgba(255,255,255,.40)` | Top-edge sheen (`--inset-top-sheen`)                                 |




### Ink (text/icons)

`--ink-100 / 80 / 64 / 46 / 32 / 16` = white at 100/80/64/46/32/16%.
Semantic aliases: `--text-primary` (100), `--text-secondary` (64), `--text-tertiary` (46), `--text-disabled` (32).
**Never use grey hex values for text** — use ink opacities.

### Accent & semantic


| Token                                         | Value                             | Usage                                                                                                          |
| --------------------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `--accent`                                    | `#4ea8ff`                         | Primary CTA fill, active nav dot, focus ring, links/inline text actions, active picker pill, overline emphasis |
| `--accent-bright`                             | `#7cc0ff`                         | Accent hover                                                                                                   |
| `--accent-deep`                               | `#2c84e0`                         | Reserved (rare)                                                                                                |
| `--accent-ink`                                | `#001226`                         | Text/icon **on** an accent fill                                                                                |
| `--accent-tint`                               | `rgba(78,168,255,.16)`            | Info toast icon disc, subtle accent wells                                                                      |
| `--accent-glow`                               | `rgba(78,168,255,.45)`            | Feeds `--shadow-glow`                                                                                          |
| `--success`                                   | `#66d575`                         | Joined state, "spots open" badge                                                                               |
| `--warning`                                   | `#ffcb57`                         | Rating star, streak                                                                                            |
| `--danger`                                    | `#ff5a5f`                         | Destructive text/buttons, invalid field ring, danger toast                                                     |
| `--swipe-yes` / `--swipe-no` / `--swipe-info` | `#66d575` / `#ff5a6a` / `#4ea8ff` | Swipe deck affordances only                                                                                    |


Tints (`--success-tint`, `--danger-tint`, `--accent-tint`) are used for badge fills and toast icon discs, always paired with the full-strength color as the foreground.

**Rationing rule observed everywhere:** one accent element per view (the CTA), plus small state signals. Everything else is white-on-black + glass.

---



## 2. Typography

Source: `tokens/typography.css`, `tokens/fonts.css` (Google Fonts).

- **Display / numbers:** `Inter Tight` (`--font-display`, `--font-numeric`) — headings, buttons, card titles, stats.
- **Text / UI:** `Inter` (`--font-text`) — body, labels, metadata, chips, badges, inputs.
- Body default comes from `base.css`: `font: var(--text-body)` + `letter-spacing: var(--tracking-normal)`.


| Role             | Composite token                                             | Size / weight / leading    | Use for                                                              |
| ---------------- | ----------------------------------------------------------- | -------------------------- | -------------------------------------------------------------------- |
| Hero             | `--text-hero`                                               | 56 / 800 / 1.04, `-0.03em` | Marketing-scale hero lines (desktop auth uses 54)                    |
| Display          | `--text-display`                                            | 44 / 700 / 1.04            | Wizard questions, auth titles (overridden to 36 mobile / 34 desktop) |
| Title            | `--text-title`                                              | 28 / 700 / 1.16            | Screen titles (panel headers)                                        |
| Headline         | `--text-headline`                                           | 22 / 600 / 1.16            | Sheet titles, empty-state titles, card headlines                     |
| Body             | `--text-body`                                               | 17 / 400 / 1.45            | Paragraphs, input text                                               |
| Callout          | `--text-callout`                                            | 15 / 500 / 1.45            | Supporting copy, empty-state text                                    |
| Caption          | `--text-caption`                                            | 13 / 500 / 1.16            | Metadata, field labels, hints, errors                                |
| Micro / overline | 11px, weight 700, `--tracking-overline` (0.14em), UPPERCASE | —                          | Section overlines ("RECOMENDADO PARA VOS"), step hints, field labels |
| Stat             | `--text-stat`                                               | 44 / 800 / 1               | Profile/stat numbers (24–26 in compact stat cards)                   |


**Numbers are a type role.** Any count, time, rating or day number: `--font-numeric`, weight 700–800, `font-variant-numeric: tabular-nums` (or class `.sm-tabular`).

Casing: sentence case for all human copy. UPPERCASE only for the 11px overline/label role.

---



## 3. Spacing & sizing

Source: `tokens/spacing.css`. **4px base grid**, scale `--space-1…10` = 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.


| Purpose              | Value                                                                                   | Where                                                     |
| -------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Mobile screen gutter | **20px** (`--screen-gutter`)                                                            | every mobile screen; panels use 20–24px                   |
| Mobile canvas        | 390×844 (`--screen-width`)                                                              | device stage                                              |
| Safe insets          | `--safe-top: 59px`, `--safe-bottom: 34px`                                               | status bar / home indicator                               |
| Panel header padding | `64px 20px 14px`                                                                        | Edit-profile / settings panels                            |
| Bottom nav           | height 64 (`--nav-height`), pill inset `left/right:16`, `bottom:18`, padding `7px 16px` | `SportMatchApp.jsx`                                       |
| Desktop top bar      | height **76**, padding `0 32px`, gap 32                                                 | `desktop-screens.js`                                      |
| Desktop page padding | `26–28px 32px 32px`                                                                     | all desktop screens                                       |
| Desktop rails        | map results 428, detail sidebar 380, settings/profile nav 320, create step-rail 300     | fixed-width `aside`                                       |
| Content max width    | `--content-max: 1080px`; body copy capped 720                                           | reading measure                                           |
| Card padding         | 14 / 20 / 28 (`GlassCard` `padding` sm/md/lg); rows `16–18px 18–20px`                   | glass surfaces                                            |
| Vertical stack gaps  | 8 / 10 / 12 / 14 / 16 / 22 / 28                                                         | flex `gap` — always `gap`, never margins between siblings |


Control heights (memorize these — they are the real system):


| Control                     | Height                                        |
| --------------------------- | --------------------------------------------- |
| Button sm / md / lg         | 40 / **52** / 60 (auth + desktop CTAs pin 54) |
| IconButton sm / md / lg     | 36 / **44** / 60                              |
| Input default / search / lg | **56** / 48 / 64                              |
| FilterChip, MapPin          | 38                                            |
| Badge md / lg               | 28 / 34                                       |
| Segmented option            | 36 (track padding 4)                          |
| Nav item / center create    | 50 / 58                                       |
| Desktop nav item            | 42                                            |


---



## 4. Layout system



### Mobile (the primary design target)

Every screen is an absolutely-positioned layer inside the 390×844 device; chrome floats **over** scrolling content.

```
.sm-screen-root (390×844, black)
├── screen layer (position:absolute; inset:0; own scroll)
│   ├── header row  → title + IconButton(s), or floating glass search + chips
│   └── content     → cards / rows, 20px gutters, scrolls under chrome
├── overlay layers  → MatchDetail / CreateMatch (full-screen, above nav)
├── BottomNav pill  → hidden while an overlay is open
├── Toast rail      → top:64, centered, slides down
├── StatusBar       → always last (topmost)
└── HomeIndicator
```

Rules derived from the code:

- Full-screen overlays (detail, create, edit profile) **replace** the nav rather than coexist: `!overlay && <BottomNav/>`.
- Side panels slide in with `transform: translateX(100%) → 0` and stay mounted.
- Sticky footer CTAs sit over a black fade; content never ends flush with the CTA.
- Photo heroes are `flex: none` fixed heights (330 login / 225 register / 330 desktop detail) with a protection gradient and copy pinned bottom-left or bottom-center.



### Desktop (1440×900, `desktop-screens.js`)

```
Frame (inset:0, black, column)
├── TopBar 76px  → wordmark · nav pills · spacer · primary CTA · avatar
└── body (flex:1, overflow hidden)
    ├── main column (flex:1)      padding 26–32px
    └── aside rail (fixed width)  hairline via inset box-shadow
```

Grids used: detail facts `repeat(4,1fr)` gap 14; sport picker `repeat(3,1fr)` gap 14 (mobile: `1fr 1fr` gap 12); my-matches `1fr 1fr` gap 26; profile history `repeat(4,1fr)` gap 16.

---



## 5. Responsive behavior

The implementation ships **two hand-built layouts**, not one fluid one. There is exactly one CSS breakpoint and one canvas swap:


| Breakpoint         | Source               | Behavior                                                                                                                                                                 |
| ------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `< 760px`          | `SportMatch.dc.html` | `.sm-device` is full-bleed `100dvh` — the app *is* the viewport                                                                                                          |
| `≥ 760px`          | same                 | `.sm-device` becomes a framed 390×844 phone (radius 54, bezel via layered box-shadows) centered on a radial dark backdrop, 32px stage padding                            |
| Desktop app layout | `desktop-screens.js` | Separate 1440×900 composition: floating pill nav → top bar; single-column feed → column + fixed rail; swipe deck gains ghost cards ±300px; wizard gains a left step rail |


Consequences for new work: **design mobile at 390 first**, then, if the screen must exist on desktop, add a sibling composition in `desktop-screens.js` using the same tokens and primitives. Do not attempt to make one tree fluidly span both — nothing in the codebase does.

---



## 6. Component inventory

All from `_ds_bundle.js` unless noted. Mount via `window.SportMatchDesignSystem_7eff40`.

### Button — `components/core/Button.jsx`

Pill CTA, `--font-display` 700, gap 10, radius pill.


| Variant     | Fill             | Text           | Extras                                                        |
| ----------- | ---------------- | -------------- | ------------------------------------------------------------- |
| `primary`   | `--accent`       | `--accent-ink` | `--shadow-glow`; hover `--accent-bright`                      |
| `secondary` | `--glass-strong` | white          | hairline + top sheen + blur 24; hover `rgba(255,255,255,.20)` |
| `ghost`     | transparent      | white          | hover `--glass`                                               |
| `success`   | `--success`      | `#05210a`      | joined confirmation                                           |
| `danger`    | `--danger`       | white          | destructive confirm                                           |


Sizes `sm/md/lg` = 40/52/60px, font 15/17/19, pad 16/22/28. `fullWidth` for sticky CTAs. States: `:active` → `scale(.96)`; `[disabled]` → opacity .4 + `pointer-events:none`. Icons via `iconLeft`/`iconRight` (18/20/22px).
Use: one `primary` per screen. Everything secondary stays glass.

### IconButton — circular floating control

44px default (36 sm, 60 lg), radius pill. Variants: `glass` (default, hairline+sheen+`--shadow-float`), `solid` (accent + glow), `plain` (transparent, hover glass). Always pass `aria-label`. Use for back/close/share/save/recenter over photography.

### GlassCard — the surface primitive

`--glass` fill + `--ring-glass` + `--inset-top-sheen` + `--shadow-card` + `backdrop-filter: blur(24) saturate(1.4)`. Variants `thin/glass/strong/solid`; radius `sm/md/lg/xl` → 12/20/28/36; padding `none/sm/md/lg` → 0/14/20/28. `interactive` adds hover→`--glass-strong` and `:active scale(.985)`.
Hand-rolled equivalents in screens use `background: var(--glass); box-shadow: var(--ring-glass)` + `--radius-md` — that is the canonical "row/tile" recipe.

### Input — `components/forms/Input.jsx`

56px tall (48 search pill, 64 lg), `--radius-sm` (search = pill), `--glass` fill, hairline, blur 24, leading 20px icon in `--ink-46`, text 17/500 white, placeholder `--ink-32`. Focus: `inset 0 0 0 1.5px var(--accent)` + fill → `--glass-strong`. Optional `label` (13/600, `--ink-64`, 4px left pad).
**Auth/profile fields (**`AuthField` **in** `overrides.js`**) are a pill-shaped variant:** 56px, `border-radius: 999px`, glyph left, invalid → `0 0 0 1px var(--danger)`, error text 13px `--danger` with 18px left pad, password fields get an eye/eye-off toggle that turns `--accent` when shown. Reuse `AuthField`/`EditField` for any account form; use DS `Input` for search and wizard fields.

### FilterChip

38px pill, `--glass-strong`, hairline, blur 24, 14/600. Selected (`aria-pressed="true"`) → **solid white fill, black text, no shadow**. `:active scale(.95)`. Optional 16px icon and dimmed count.

### Badge

28px pill (34 lg), 13/600. Tones: `glass` (default, blur 12), `solid` (black 55%), `accent` (accent fill + accent-ink), `success` / `danger` (16% tint fill + colored text + 35% colored inset ring), `ink` (white fill, black text). Optional 7px `dot`. Rule from `MatchCard`: `spots <= 2 → danger`, else `success`.

### SegmentedControl

Glass-strong track, radius pill, padding 4, sliding white thumb with `--shadow-float`; options 36px, 14/600, inactive `--ink-64`, selected `#000`. Two or three short options only.

### Avatar / AvatarStack

Circular, `--glass-strong` fill, hairline, initials fallback (display 700, font-size = 0.4×). Sizes xs 24 / sm 32 / md 44 / lg 64 / xl 96. `ring="accent"|"success"` = `0 0 0 2px var(--bg-base), 0 0 0 4px <color>`. Stack overlaps `-12px`, each with a 2px black ring, `+N` chip for overflow.

### Rating

Filled star in `--warning` + tabular display-weight score, optional `(count)` in `--ink-46`. `inline` for metadata, `block` for the profile hero.

### MatchCard — `components/cards/MatchCard.jsx`

The discovery workhorse: `<button>` wrapper, radius **28** (`--radius-lg`), photo `aspect-ratio 4/5` (`wide` → 16/11), `object-fit: cover`, bottom-up protection veil (`rgba(0,0,0,.82) → transparent 62%`), chips top-left + save heart top-right (14px inset), info panel bottom padding `18/18/20` with overline (11–12px uppercase 0.14em, white 70%) → title (26/700 display, 1.08) → meta row (14/500, white 82%, gap 14) → footer. `:active scale(.985)`.

### SwipeCard, MapPin, BottomNav, BottomSheet, Toast, EmptyState, Skeleton

- **MapPin**: 38px glass-solid capsule + 11px tail, 14/700; selected pops to accent fill. In practice the map draws pins as HTML strings (`pinHtml`) because `filter` and `backdrop-filter` cannot coexist — reuse `pinHtml`, not a new marker.
- **BottomNav**: floating `glass-solid` pill, blur 40, 50px items in `--ink-46`, active white + 5px accent dot with glow, raised 58px accent Create button, `:active scale(.9)`.
- **BottomSheet**: `max-height 88%`, radius `44 44 0 0`, glass-solid + blur 40, grip 40×5 `--ink-32`, title 22/700, scrim fades in, sheet slides `translateY(100%)→0` at 420ms spring. `role="dialog" aria-modal`.
- **Toast**: single-line glass-solid pill, blur 40, 15/600, 28px tinted icon disc per tone (`success: check`, `info: zap`, `danger: x`), `role="status"`. App shell shows it top:64 centered for **2800ms**, entering with a 420ms spring translate.
- **EmptyState**: centered, 84px glass icon disc (34px icon, `--ink-64`), 22/700 title, 15/500 `--ink-46` text capped 280px, at most one action.
- **Skeleton / MatchCardSkeleton**: `--glass` block with a 1.4s shimmer sweep (`rgba(255,255,255,.10)`), disabled under `prefers-reduced-motion`. Card skeleton mirrors the 4/5 card with three text bars.



### Screen-level recurring patterns (not in the bundle, but repeated ≥3×)


| Pattern                      | Recipe                                                                                                                                                                                                                                                                   | Source                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| Settings/nav row             | glass + `--ring-glass`, `--radius-md`, `16–18px 18–20px`, 38–42px `--glass-strong` icon square (`--radius-sm`) tinted `--accent`, label 16/600, sub 13 `--ink-46`, trailing `chevron-right` in `--ink-46`; destructive rows drop the chevron and turn the icon+label red | `overrides.js SettingsRow`, `desktop-screens.js row()`         |
| Fact / stat tile             | glass tile, icon + big tabular number + caption label                                                                                                                                                                                                                    | `MetaTile`, `StatCard`, `StatWide`, `fact()`                   |
| Overline + section           | 11px uppercase 0.14em label above a 20–26px display title                                                                                                                                                                                                                | `Overline`/`Title`                                             |
| Horizontal number picker     | scrollable row of 62px glass pills (sub-label + 22px tabular number); selected → accent fill + `--shadow-glow`; vertical padding reserves room for the glow                                                                                                              | `overrides.js pickerRow/pillBtn`, desktop `strip()`            |
| Two-step destructive confirm | text-only red action reveals an inline glass confirm block with "keep" (glass) + "confirm" (red) 40px pills                                                                                                                                                              | `overrides.js Matches`                                         |
| Wizard                       | 5 steps (`Deporte · Lugar · Horario · Jugadores · Revisión`), accent overline "Paso N · X", 36px question, one control cluster, sticky primary CTA (`arrow-right`, last step `check`/`zap`)                                                                              | `overrides.js CreateMatch`, `desktop-screens.js CreateDesktop` |


---



## 7. Radii, borders, shadows


| Token           | Value | Applied to                                        |
| --------------- | ----- | ------------------------------------------------- |
| `--radius-xs`   | 8     | tags                                              |
| `--radius-sm`   | 12    | inputs, icon squares, small tiles                 |
| `--radius-md`   | 20    | rows, tiles, glass cards (default)                |
| `--radius-lg`   | 28    | media cards, large panels                         |
| `--radius-xl`   | 36    | hero panels, auth sheet                           |
| `--radius-2xl`  | 44    | bottom sheets                                     |
| `--radius-pill` | 999   | buttons, chips, badges, nav, avatars, auth fields |


**Borders are inset, not outset.** The standard edge is `--ring-glass` = `inset 0 0 0 1px var(--glass-border)`; selected/emphasis raises to `--glass-border-strong`; floating glass adds `--inset-top-sheen` (`inset 0 1px 0 rgba(255,255,255,.40)`). Dividers are `height:1px; background: var(--glass-border)` or `inset 0/-1px 0 var(--glass-border)` box-shadows on bars and rails. No `border:` declarations for surfaces anywhere.

Shadow levels: `--shadow-float` (0 6px 20px /.45 — floating controls, nav, toast), `--shadow-card` (0 18px 50px /.50 — cards), `--shadow-sheet` (0 -12px 60px /.60 — sheets), `--shadow-glow` (accent glow — primary CTA, active picker pill, create button, camera FAB). Blur levels: 12 (chips/badges), 24 (cards, nav items, inputs), 40 (sheets, nav, toasts).

---



## 8. Iconography

- Set: curated **Lucide** line paths shipped as `Icon` (`components/icon/Icon.jsx`). 24px grid, **stroke 2, round caps/joins**, `currentColor`, `fill:none`.
- Sizes in use: 14 (badge), 16 (chip), 17–19 (rows, toast), 20 (input), 18/20/22 (button by size), 22 (icon button), 34 (empty-state disc).
- `star`, `heart`, `flame` may render `filled` for ratings / saves / streaks; everything else stays stroked.
- Icon color is inherited: `--ink-46` at rest in rows/nav, `--accent` inside glass icon squares, white when active.
- Missing glyphs are added as verbatim Lucide / **Lucide Lab** paths through the same 24/2/round wrapper (`lucideGlyph` in `overrides.js`, `glyph` in `desktop-screens.js`) — sport marks (football, basketball, tennis, padel, running), mail, lock, user, eye/eye-off, map-pin, plus/minus, locate crosshair. Extend those maps rather than inventing a style.
- Icon-only controls exist in the bottom nav, card save heart, and map controls; each carries an `aria-label`.
- No emoji as iconography. A single `⚡` appears only inside success copy.
- Brand: wordmark is **SportMatch** in display 800, `-0.035em`, with "Match" in `--accent` (rendered as markup, not an image). Mark: `assets/brand/logo-mark.svg`.

---



## 9. Imagery

- Real outdoor sports photography only (`prototype/sportmatch/media/photos/`, catalog `window.SM_IMG`: `football-sunset`, streetball, clay tennis, aerial court, etc.). People mid-play; a deliberate mix of moody B&W street sport and warm saturated court color. No illustrations, no studio stock, no decorative gradients as background.
- Always full-bleed with `object-fit: cover`, always under a **protection gradient** before text sits on it. Two recurring recipes:
  - bottom-up card veil: `linear-gradient(to top, rgba(0,0,0,.82) 0%, rgba(0,0,0,.45) 32%, transparent 62%)`
  - hero tint: `linear-gradient(to bottom, rgba(5,6,10,.45), rgba(5,6,10,.62) 55%, rgba(5,6,10,.92))`
  - desktop split hero: horizontal `rgba(0,0,0,.10) → #000` at 100%
- Aspect ratios: discovery card 4/5, wide card 16/11, desktop row thumb 132px square-ish, desktop detail hero 330px tall. Image radius = its container's (`--radius-lg` for cards, 50% for avatars).
- Avatars: circular, `object-fit: cover`, accent ring for the current user (`0 0 0 2–3px var(--bg-base), 0 0 0 4–6px var(--accent)`).
- Placeholder = `--bg-sunken` behind the image, or a `Skeleton` while loading.

---



## 10. Interaction patterns

- **Whole cards are buttons.** `MatchCard` is a `<button>`; tapping opens detail, the heart saves without navigating.
- **Press feedback is physical:** `scale(0.96)` for buttons/controls (`--press-scale`), `0.95` chips, `0.985` cards and interactive glass, `0.9` nav items. Hover lightens glass (`.10 → .20/.22`) or brightens the accent — hover is a bonus, touch is the baseline.
- **Selection flips, it doesn't outline:** chips → solid white; picker pills and sport tiles → accent fill + glow; nav → white icon + accent dot; map pin → accent fill; desktop nav → glass-strong pill + accent dot.
- **Validation is on submit, then live.** Auth: `tried` flag set on submit; invalid fields get a `--danger` ring plus a 13px danger message under the field. Edit profile validates continuously and disables Save (`canSave`) instead of blocking on submit. Password rule: ≥8 chars; confirm must match; changing password requires current + new + repeat together.
- **Destructive actions are two-step and quiet.** A red *text* action (no pill) reveals an inline confirm with a glass "keep" and a red "confirm"; the affected card then disappears and a `danger` toast states what happened.
- **Confirmation = toast, 2800ms**, one line, sport-native: `Estás dentro. Nos vemos en la cancha ⚡`, `Partido publicado · <título> <día> <hora>`, `Lugar liberado · <título>`, `Perfil actualizado`.
- **Optimistic state:** joins, cancellations and profile edits mutate local state immediately (`joined`, `edits`, `killed`), then flash the toast. Session persists to `localStorage` under `sm.account`.
- **Loading:** skeletons that mirror the real layout (never spinners); the map renders a `#0a0d12` placeholder until Leaflet is ready.
- **Empty states:** glass icon disc + short headline + one line + at most one action (`SwipeDeck` end-of-deck, `Matches` with no matches).

---



## 11. Motion


| Token           | Value                          | Used for                                                             |
| --------------- | ------------------------------ | -------------------------------------------------------------------- |
| `--dur-fast`    | 140ms                          | press/scale, color of nav items                                      |
| `--dur-base`    | 240ms                          | background/box-shadow/color transitions, segmented thumb, card scale |
| `--dur-slow`    | 420ms                          | sheet in/out, toast entrance                                         |
| `--ease-spring` | `cubic-bezier(.34,1.56,.64,1)` | taps, sheets, segmented thumb, nav, toast, swipe fly-out             |
| `--ease-out`    | `cubic-bezier(.16,1,.3,1)`     | reveals, auth hero height (360ms), settled decel                     |
| `--ease-in-out` | `cubic-bezier(.65,0,.35,1)`    | skeleton shimmer                                                     |


Other measured values: side panels `transform 360ms cubic-bezier(.32,.72,0,1)`; skeleton shimmer 1.4s infinite (off under `prefers-reduced-motion`); swipe deck drags with pointer events and flies out past a distance threshold. Only `transform`, `opacity`, `background`, `box-shadow` and `color` are animated — no layout-animating properties.

---



## 12. Accessibility — conventions and gaps

Present in the code:

- Every icon-only control has `aria-label` (in Spanish, matching the UI language).
- `FilterChip` → `aria-pressed`; `SegmentedControl` → `aria-selected`; `BottomNav` active item → `aria-current="page"`; `BottomSheet` → `role="dialog" aria-modal="true"` + `aria-hidden` on the closed root; `Toast` → `role="status"`.
- Inputs use a `<label class="sm-field">` wrapper when labelled; `AuthField` passes `aria-label` from the placeholder; password toggle announces show/hide.
- Touch targets: 44px icon buttons, 50px nav items, 56px fields, 52–60px CTAs, 38px chips (the smallest interactive height — acceptable for pills in a row, not for isolated targets).
- Disabled = opacity .4 + `pointer-events:none`.
- `prefers-reduced-motion` respected for the shimmer.

Known gaps — **do not reproduce, fix in new work**:

- Only `Input` has a visible focus style (`:focus-within` accent ring). Buttons, chips, cards and nav items rely on the browser default. New interactive elements should add `:focus-visible { box-shadow: inset 0 0 0 2px var(--focus-ring) }` (or an outset accent ring on solid fills).
- `--ink-32`/`--ink-46` text on glass is below WCAG AA for small sizes; keep it for decorative metadata only, never for essential instructions.
- Cards are `<button>`s containing nested buttons (save heart) — keep nested actions to one, and label it.
- The 38px chip and 34px camera FAB are under 44px; enlarge equivalents in new UI.

---



## 13. Content & copy conventions

- **Language: Spanish (rioplatense / voseo).** "Ingresá", "Sumate", "Buscá una cancha", "Creá tu cuenta", "Dejalo vacío para mantener la actual". Second person singular, imperative, warm.
- Sentence case everywhere except 11px overlines (`RECOMENDADO PARA VOS`, `PASO 2 · LUGAR`).
- Buttons are verbs, 1–3 words: `Iniciar sesión`, `Crear cuenta`, `Continuar`, `Publicar partido`, `Sumarme`, `Atrás`.
- Titles are questions in flows: `¿A qué vas a jugar?`, `¿Dónde se juega?`, `¿A qué hora arranca?`, `¿Cuántos jugadores?`, `¿Listo para publicar?`.
- Placeholders describe the action, not the field: `Buscá una cancha o dirección`, `Mínimo 8 caracteres`, `Repetila`.
- Validation messages are short imperatives: `Ingresá un email válido`, `Mínimo 8 caracteres`, `Las contraseñas no coinciden`, `El nombre no puede estar vacío`.
- Time/date: 24-hour `HH:MM` zero-padded; relative day labels `Hoy` / `Mañana` then `Vie 12`; abbreviations `Dom Lun Mar Mié Jue Vie Sáb`.
- Numbers: tabular; distances `2.3 km`; ratings one decimal `4.9` with `(128)`; counts as `4/12`; separators use `·`.
- Terminology: *partido* (not "evento"), *cancha*, *picado*, *jugadores*, *nivel* (Casual/…), *Descubrir*, *Mapa*, *Partidos*, *Perfil*. Sports: Fútbol, Básquet, Tenis, Pádel, Running.
- Emoji: only `⚡`, only in success copy, never in lists or as icons.

---



## 14. Design principles (derived)

1. **Photography carries the energy; UI stays monochrome.** White ink + glass on black, with photos supplying all the color.
2. **Ration the accent.** One `--accent` element per view (usually the CTA) plus small state signals; never accent-tint whole surfaces.
3. **Separate surfaces with translucency and an inset hairline, not outset borders or heavy shadows.** Shadows exist to make things *float*, not to draw edges.
4. **Anything over photography or the map is glass; anything that must be read is** `glass-solid` **+ blur 40.**
5. **Every surface is soft.** Pills for controls, 20/28px for content, 36/44px for sheets. Nothing sharp, nothing 4px.
6. **One question, one primary action per screen.** Flows are wizard steps, not long forms.
7. **Numbers are typography.** Big, tabular, display-weight — a rating or a count is a hero element.
8. **State changes by fill, not by outline.** Selected flips to white or accent; unselected stays glass.
9. **Feedback is physical and immediate:** press shrinks, spring easing, optimistic state, then a one-line toast.
10. **Copy is second-person Spanish and short.** If a label needs a sentence, the screen is doing too much.

---



## 15. Do / Don't

**Do**

- Use `var(--*)` tokens for every color, radius, shadow, blur, duration and easing.
- Compose from `SportMatchDesignSystem_7eff40` primitives (`Button`, `IconButton`, `Input`, `Badge`, `FilterChip`, `GlassCard`, `Avatar`, `BottomSheet`, `Toast`, `EmptyState`, `Skeleton`).
- Build the row/tile recipe as `background: var(--glass); box-shadow: var(--ring-glass); border-radius: var(--radius-md)`.
- Use flex/grid with `gap` from the 4px scale.
- Put a protection gradient under any text over a photo.
- Give icon-only controls a Spanish `aria-label`.
- Reuse `AuthField` / `EditField` for account forms and `pinHtml` for map markers.
- Write copy in voseo Spanish, sentence case, ≤5 words for headlines.

**Don't**

- Introduce a new hex color, a new radius, or a shadow that isn't a token.
- Use grey text hexes — use `--ink-*` / `--text-*`.
- Add `border: 1px solid` to a surface (use `--ring-glass`).
- Ship a second button, input or card style for one screen.
- Put two accent-filled elements on one screen, or an accent background behind body copy.
- Animate layout properties, or add motion longer than 420ms.
- Use emoji as icons, or add illustrations/decorative gradients.
- Show a spinner where a skeleton of the real layout fits.
- Leave a destructive action one tap away from completion.
- Avoid the use of margins, instead use paddings.

---



## 16. Building new UI — checklist

1. **Pick the canvas.** Mobile 390×844 first, inside `.sm-screen-root`, absolutely positioned layer. Desktop only if required, as a new function in `desktop-screens.js` with `Frame` + `TopBar` + rail.
2. **Reuse primitives before writing markup.** Layouts: `GlassCard`, `BottomSheet`. Actions: `Button`, `IconButton`. Inputs: `Input` (search/wizard) or `AuthField`/`EditField` (account). Metadata: `Badge`, `Rating`, `Avatar`/`AvatarStack`, `FilterChip`. Feedback: `Toast`, `EmptyState`, `Skeleton`.
3. **Structure the screen:** header row (title + icon buttons, or floating search + chip row) → scrolling content at 20px gutters → sticky primary CTA over a fade. Leave the bottom nav visible unless it's a full-screen overlay.
4. **Token every value.** Spacing from `--space-`*, type from the composite roles, radius/shadow/blur/motion from `effects.css`.
5. **Wire the states:** default, hover (lighten glass / brighten accent), `:active` scale, `:focus-visible` accent ring (add it — the library omits it), disabled opacity .4, selected = filled, loading = skeleton, error = `--danger` ring + 13px message, empty = `EmptyState`.
6. **Confirm with a toast** (2800ms, one line, ≤1 `⚡`) and mutate state optimistically. Any destructive path needs the two-step inline confirm.
7. **Copy pass:** voseo Spanish, sentence case, verbs on buttons, question titles in flows, 24h times, tabular numbers, `·` separators.
8. **Never hardcode:** colors, radii, shadows, blur, durations, easing, font families, the accent, gutters, control heights, photo URLs (use `window.SM_IMG`), sport labels/icons (use `window.SM_DATA.SPORTS`).
9. **Add a new component only when** the pattern appears on 3+ screens *and* has props/state (that's how `SettingsRow`, `StatCard`, `MetaTile`, `AuthField` earned their place). Otherwise inline it with the recipes above. A genuinely reusable component belongs in the design system package, not in a screen file.
