# Animation Guidelines & Rules

Based on the reference UI/UX, the following animation patterns must be implemented to achieve the clean, modern, and app-like feel of the site. All agents working on frontend components should adhere to these rules.

Version A lock stays: lilac wash, screenshot PacketWindow chrome, Pattern C hero float, Pattern B spatial page/packet opens. The sections below refine landing reveals (especially large gray secondary headers) without replacing those patterns.

## 0. Hard constraints
1. Animate `opacity` and `transform` only (plus two deliberate `width` exceptions for typewriter/progress). No `top`, `left`, `height`, `margin`, or `box-shadow` transitions. If a shadow must fade, drive `--shadow-opacity` on a `::before`.
2. Two durations for UI, one for content. Hover/state **150–200ms**. Content entrances **500–800ms**. Nothing in between unless scroll-scrubbed.
3. Ease out, always. `ease-in-out` only for loops (Pattern C). No `ease-in`.
4. Reveals are reversible. Scroll back up and the entrance plays backward — toggle `.is-visible`, do not add-once.

## 1. Core Principles
* **Subtlety over flashiness:** Animations should feel natural and guide the eye, never distracting or delaying the user.
* **Scroll-driven discovery:** Content should reveal itself smoothly as it enters the viewport.
* **Native "App-like" interactions:** Complex interactions (like opening main tools/modals) should use spatial transitions (scaling and layering) similar to iOS/macOS native apps.

## 2. Global Easing & Timing
Avoid standard linear or ease-in-out timings (except Pattern C loops). Use custom cubic-beziers for a snappy but smooth deceleration.

* **Landing / content reveal easing:** `cubic-bezier(0.22, 1, 0.36, 1)` (`--ease-power3`)
* **Identity numbers:** blocks **60px / 700ms / 150ms**; words **100% / 600ms / 80ms**; both use power3
* **Standard Reveal Easing (legacy Pattern A alias):** `cubic-bezier(0.16, 1, 0.3, 1)` — new landing reveals use power3
* **Standard Duration (Scroll Reveals):** `600ms`–`800ms` (blocks `700ms`, words `600ms`)
* **Interaction Duration (Hover/Click):** `150ms`–`200ms`, ease-out
* **Pattern B spatial:** keep `800ms cubic-bezier(0.32, 0.72, 0, 1)`

### Tokens (`:root`)
```css
--dur-instant: 150ms;
--dur-fast:    200ms;
--dur-exit:    300ms;
--dur-medium:  350ms;
--dur-panel:   450ms;
--dur-enter:   500ms;
--dur-slow:    700ms;
--ease-default: cubic-bezier(0.4,  0,    0.2, 1);
--ease-out:     cubic-bezier(0,    0,    0.2, 1);
--ease-soft:    cubic-bezier(0.25, 0.1,  0.25, 1);
--ease-power3:  cubic-bezier(0.22, 1,    0.36, 1);
--ease-power2:  cubic-bezier(0.25, 0.46, 0.45, 0.94);
--shift-sm: 10px;
--shift-md: 15px;
--shift-lg: 40px;
--shift-xl: 60px;
--stagger-tight: 80ms;
--stagger-loose: 150ms;
```

### Displacement (small — never throw content)

| Element | Offset |
| --- | --- |
| Headline words | `yPercent: 100` (one full line-height, masked) |
| Description / secondary header | `y: 40px` (block) or masked words |
| CTA button | `y: 15px` |
| Staggered grid items | `y: 60px` |
| CSS fade-in-y | `y: 10px` |

Displacement scales with element size. Big blocks ~60px; inline 10–15px. Never more than one viewport-tenth.

### Stagger
* Headline / split words: **0.08s**
* Grid/list items: **0.15s**
* Cap stagger index (`i % 8`)

## 3. Key Animation Patterns

### Pattern A: Scroll-Triggered Fade & Slide Up (Global Default)
**Where to use:** Section headers, text blocks, feature cards, and images as they enter the viewport.
**Behavior:**
* **Initial State:** `opacity: 0`, `transform: translateY(60px)` for cards/blocks; `40px` for black titles; `10px` for small labels.
* **Final State:** `opacity: 1`, `transform: translateY(0)`.
* **Timing:** `700ms` power3. Grid stagger `150ms`, index capped at 8.
* **Reversible:** toggle `.is-visible` (IO `rootMargin: 0px 0px -20% 0px`). Grids may fire later.
* **FOUC:** start hidden in CSS before paint. A delay class must also set `opacity: 0`.
* Large muted secondary headers use Pattern A2 (split-text) instead of a single block slide.

### Pattern A2: Masked word reveal (landing secondary headers)
**Where to use:** The large gray (`.tone`) secondary headers on `/` — and any headline that should emerge from the line above.
**Behavior:** Each line `overflow: hidden`; words start `yPercent: 100` behind the mask and rise into view.

```css
.line-mask { overflow: hidden; margin-bottom: -0.15em; }
.line-mask > span, [data-word] {
  display: inline-block;
  transform: translateY(100%);
  opacity: 0;
  text-shadow: 0 0 1em transparent;
  transition: transform 600ms var(--ease-power3), opacity 600ms var(--ease-power3);
  transition-delay: calc(var(--w, 0) * 80ms);
}
.is-visible .line-mask > span, .is-visible [data-word] { transform: none; opacity: 1; }
```

* `margin-bottom: -0.15em` on masks so descenders (g, y, p) aren’t clipped
* `text-shadow: 0 0 1em transparent` for compositing
* Overlap: following block starts at 40% through the word stagger; CTA overlaps description by `0.4s`
* Trigger: in view at ~top 80% (`rootMargin: 0px 0px -20% 0px`)
* Reversible: toggle `.is-visible`, don’t add-once
* Reduced motion: skip the split and show the end-state (CSS and JS)

### Pattern B: The "App-Modal" Spatial Expansion
**Where to use:** Opening deep interactive modes (e.g. Open the desk, opening a packet from a row).
**Behavior:**
* **Background (Origin Page):** Scales down slightly `scale(0.96)`, darkens slightly, rounded corners `16px`. Timing `800ms cubic-bezier(0.32, 0.72, 0, 1)`.
* **Foreground (New Modal/View):** From `opacity: 0`, `scale(0.9) translateY(20px)` to `opacity: 1`, `scale(1) translateY(0)`.

### Pattern C: Continuous Subtle Floating
**Where to use:** Hero product graphic (the applications card).
**Behavior:** Very slow sine-wave `translateY(±10px)`, duration `4s`-`6s` infinite alternate, `ease-in-out`.

## 4. Accessibility
Always respect `prefers-reduced-motion: reduce` in both CSS and JS. If true, disable spatial scaling, slide-ups, and split-text; show the end-state (or a fast fade `0.1s`). No animation is acceptable.
