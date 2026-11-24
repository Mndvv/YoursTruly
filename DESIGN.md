# YoursTruly — Design Identity

> This document is the brand identity source of truth for all UI work.
> Read it before applying any visual rule from antislop or similar filters.

---

## 1. Product Character

**YoursTruly** (LingoClip OSS) is a **music-driven language learning game**.

- Primary use: evenings on a phone, headphones in, trying to catch lyrics before the word flashes by.
- Users are learners who like music — not corporate software users.
- The experience is active and focused, not passive or decorative.
- The authoring studio (Sync Studio) is a creator tool — precise, task-oriented.

**Character in one phrase:** Focused energy. Like a vinyl record sleeve: visually purposeful, text-heavy, specific, slightly raw.

---

## 2. Theme Decision

**Dark mode is the deliberate default.** Reason: the core game is played with a YouTube video. A light UI next to a dark video creates jarring contrast that breaks immersion. Dark mode is not "tech aesthetic"; it is the correct choice for a media-adjacent UI used in dim environments.

**A light/dark toggle is offered** so daytime or studio users can choose.

The toggle is a real, working feature — not deferred. Both themes are fully verified.

---

## 3. Color Palette

**Rule:** 2 core colors + 1 accent. Neutrals (gray, black, white) do not count.

| Role | Dark Value | Light Value | Reason |
|---|---|---|---|
| **Core 1: Surface** | `gray-950` / `gray-900` | `gray-50` / `white` | Near-black ground plane; near-white in light |
| **Core 2: Brand** | `violet-600` (#7c3aed) | `violet-700` (#6d28d9) | Violet, not indigo. Music/lyric energy without being the default AI blue-purple. Distinct from the existing indigo. |
| **Accent: Amber** | `amber-400` (#fbbf24) | `amber-500` (#f59e0b) | Warm against violet. Earned: marks active game state, streak, and hints only. Not used on structural chrome. |

**Retired:** `indigo-*` as the primary brand color. Replaced by `violet-*` to break away from the AI default.

**Neutrals in dark mode:** `gray-950` (page), `gray-900` (card), `gray-800` (border), `gray-700` (subtle border), `gray-400` (muted text), `gray-200` (body text), `white` (emphasis text).

**Neutrals in light mode:** `gray-50` (page), `white` (card), `gray-200` (border), `gray-300` (subtle border), `gray-500` (muted text), `gray-800` (body text), `gray-950` (emphasis text).

---

## 4. Typography

**Choice:** [Geist](https://vercel.com/font) for all UI text (sans-serif). **Reason:** Geist is neutral-modern without being Inter (overused) or Geist Mono (too terminal). It is designed for screen readability and has a slightly tighter texture that suits a compact mobile-first game interface. It is loaded from Google Fonts or the Nuxt font module with a reason, not because it was the default.

**Display headings (catalog h1, studio h1):** `font-semibold` or `font-bold` only. No `font-extrabold` or `tracking-tight` on every heading — save those for one focal point per screen.

**Monospace use:** reserved for timestamps, scores, play counts, offset values, and code tokens — all data that is inherently positional or numeric. Font: `font-mono` (system mono stack). Never used as a "look technical" aesthetic.

---

## 5. Icon Library

**Choice: [Phosphor Icons](https://phosphoricons.com/)** via [`@phosphor-icons/vue`](https://github.com/phosphor-icons/vue).

**Reason:** Phosphor has a full dual-weight system (Regular and Bold in the same set), expressive glyphs tuned for product UIs, and a distinctive slightly-rounded-but-not-uniform-thin look that is nothing like Lucide. It has specific icons for music (MusicNote, Microphone, Headphones, Metronome), gameplay (GameController, Trophy, Lightning), and studio (FilmSlate, Sliders, Timer) that are genuinely relevant.

**Usage policy:**
- Every icon must be chosen for relevance to its content. Reason documented inline as a comment.
- Icon weight: `Bold` for primary actions, `Regular` for secondary and decorative.
- Size: 16px (xs), 20px (sm default), 24px (lg actions).
- Icon-only buttons get `aria-label`. Icon + label is preferred for primary actions.
- Replace all emoji currently used as icons with Phosphor icons.

---

## 6. Spacing & Border Radius

**Scale:** Tailwind default scale. Not every component uses the same spacing.

**Section rhythm (RHYTHM dial: 2 — Consistent with a few breaks):** Most screens use a compact 4-unit gap between controls. Sections are separated by 6–8 units. The game screen has tighter spacing because of the sticky video + lyric display above the fold.

**Border radius:**
- `rounded-lg` (8px): inputs, small buttons, tags — the base.
- `rounded-xl` (12px): cards, panel sections.
- `rounded-2xl` (16px): song card thumbnails, the main game container.
- `rounded-full`: only the logo mark, and toggle pills.
- **No pill buttons on primary CTAs.** The primary action button is `rounded-lg` or `rounded-xl` — intentional, not a default pill.

---

## 7. Shadow & Glow

**Shadow:** elevation only. Only the floating sticky video header in gameplay gets a `shadow-xl`. Cards get no shadow by default; they use border for separation. Active/selected cards may use `shadow-md`.

**Glow:** reserved for the active gap word in LyricDisplay (the "fill this word" indicator). One focal glow per screen maximum. Not on buttons, not on badges, not on icons.

---

## 8. Motion Dials

| Dial | Value | Reason |
|---|---|---|
| ENERGY | **2 (Balanced)** | The game is focused work. High energy would be distracting mid-song. |
| RHYTHM | **2 (Consistent with a few breaks)** | Catalog and lobby are uniform grid layouts. The game screen breaks the grid for the sticky video. |
| MOTION | **2 (Scroll-reveal, transitions)** | Hover states + subtle enter transitions. The active word highlight animates. No parallax or pin. |

**Non-essential motion respects `prefers-reduced-motion`.**

---

## 9. UI State Philosophy

Every screen that loads data has: a **loading skeleton** (not just spinner text), an **empty state** that explains why and offers the next action, and an **error state** that names the cause.

---

## 10. Light Mode

Light mode is the full inverse of dark, using the light values from the palette table. It is not an afterthought — every component is verified in both modes before shipping.

The toggle is stored in `localStorage` and respects `prefers-color-scheme` as the default on first visit.
