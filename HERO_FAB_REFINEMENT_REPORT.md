# Hero Floating Action Buttons Refinement Report

**Date:** July 4, 2026  
**Scope:** Circular floating buttons on the landing Hero only  
**Hero layout / composition:** Unchanged

---

## Summary

The FABs rendered black because the SVG used `fill="var(--button-primary)"`, which is **not** a design-token variable (tokens define `--primary-button`). Circles and custom icon paths were replaced with shared HTML buttons that use brand tokens, Lucide icons, and consistent hover/active/focus states.

`npm run lint` and `npm run build` both pass.

---

## Root Cause

| Before | Issue |
|--------|--------|
| `fill="var(--button-primary)"` | Invalid token → browser fallback (black) |
| Inline SVG icon paths | Pin/arrow paths, not Figma arrow + shield |
| Invisible hit-target buttons | No visible brand styling or interaction states |

---

## Files Modified

| File | Change |
|------|--------|
| `src/components/landing/HeroSection.tsx` | Token-based FABs; Lucide icons; shared styles |

---

## Visual Refinements

### Background & color
- **Background:** `bg-button-primary` → `var(--primary-button)`
- **Icon:** `text-on-emphasis` → `var(--text-on-color)` (white)
- **No border** (matches Figma solid circles)
- **Elevation:** `shadow-lg shadow-button-primary/35`

### Interaction
| State | Style |
|-------|--------|
| Hover | `bg-accent-soft`, stronger purple shadow |
| Active | Slight press (`translate-y-px`), `bg-button-primary-active` |
| Focus | Existing `focusRingClasses` (primary ring) |

### Icons
- Left: `ArrowUpRight` (size 20, stroke 2.25)
- Right: `Shield` (size 20, stroke 2.25)
- Centered with flex; `shrink-0` for alignment

### Consistency
Both buttons share `heroFabClass`:
- Diameter: `70 / 1440` of hero width (`aspect-square`)
- Perfect circle (`rounded-full`)
- Same shadow, transition, hover/active/focus

---

## Design Tokens Used

- `--primary-button` / `button-primary`
- `--accent-soft` / `accent-soft`
- `--primary-button-active` / `button-primary-active`
- `--text-on-color` / `on-emphasis`
- `--primary-text` (active icon/text)

No new colors or hardcoded hex values.

---

## Functionality

- Positions unchanged (left card / right card anchors)
- Aria labels unchanged
- No business logic or backend changes
