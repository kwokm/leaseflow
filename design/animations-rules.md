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
* Grey secondary headers float as one block (`40px` / `700ms` power3). They do **not** split.
* Landing cards (steps, fees, apply module) use Pattern B spatial expansion as a whole — no inner text motion.

### Pattern A2: Masked word reveal (black headlines)
**Where to use:** The hero H1 and black section titles on `/` (“The desk that finishes the file.”, “Four steps…”, “Applicants pay the fee.”). Grey secondaries do **not** use this.
**Behavior:** Words start `yPercent: 100` behind a per-word mask and rise into view (600ms power3, stagger 80ms, `i % 8`).

Resting layout after split **must match unsplit text**. Mask/word wrappers are paint-only — they must not change width, wrapping, or baseline.

* **End state is identity:** `transform: none` (or `translate3d(0,0,0)`), `opacity: 1`. No leftover `translateY`, no leftover negative mask margin that shifts the box.
* **No whitespace nodes** between word spans (compact JSX, or `font-size: 0` on the line + restore on words).
* **Line masks:** keep `overflow: hidden` for the rise. Any `margin-bottom: -0.15em` (or similar) must be cancelled in the resting layout (matching padding so net 0, then drop both when settled). Descenders must still show during the tween.
* **Centered headings:** line wrappers must not become full-width blocks that left-align inner words. Lines shrink-wrap and inherit `text-align: center`.
* **DOM:** outer word span stays in normal inline flow (`display: inline`, `vertical-align: baseline`). An inner span is the only node that tweens `translateY`.
* **Reduced motion:** render unsplit text (no split DOM) so layout is exact.
* Overlap: following block starts at 40% through the word stagger; CTA overlaps description by `0.4s`
* Trigger: in view at ~top 80% (`rootMargin: 0px 0px -20% 0px`). Reversible: toggle `.is-visible`, don’t add-once.

```css
.split-word { display: inline; vertical-align: baseline; }
.split-mask {
  display: inline-block;
  overflow: hidden;
  vertical-align: baseline;
  padding-bottom: 0.2em;
  margin-bottom: -0.2em; /* cancels — net 0 on the line box */
}
.split-rise {
  display: inline-block;
  vertical-align: baseline;
  transform: translateY(100%);
  opacity: 0;
  transition: transform 600ms var(--ease-power3), opacity 600ms var(--ease-power3);
  transition-delay: calc(var(--w, 0) * 80ms);
}
.is-visible .split-rise { transform: none; opacity: 1; }
.is-visible .split-mask { overflow: visible; padding-bottom: 0; margin-bottom: 0; }
```

### Pattern B: The "App-Modal" Spatial Expansion
**Where to use:** Opening deep interactive modes (e.g. Open the desk, opening a packet from a row). Also the landing step cards, fee cards, and apply module — **one spatial expansion on the entire card element**. Inner text does not animate (no per-label, per-price, or per-body tween). Stagger **between cards** `150ms` (`i % 8`), not inside. Do not put spatial/split classes on children. The spatial wrapper must sit **outside** any `overflow: hidden` chrome so the expand is not clipped into a sequential inner reveal.
**Behavior:**
* **Background (Origin Page):** Scales down slightly `scale(0.96)`, darkens slightly, rounded corners `16px`. Timing `800ms cubic-bezier(0.32, 0.72, 0, 1)`.
* **Foreground (New Modal/View):** From `opacity: 0`, `scale(0.9) translateY(20px)` to `opacity: 1`, `scale(1) translateY(0)`.

### Pattern C: Continuous Subtle Floating
**Where to use:** Hero product graphic (the applications card).
**Behavior:** Very slow sine-wave `translateY(±10px)`, duration `4s`-`6s` infinite alternate, `ease-in-out`.

## 4. Accessibility
Always respect `prefers-reduced-motion: reduce` in both CSS and JS. If true, disable spatial scaling, slide-ups, and split-text; show the end-state (or a fast fade `0.1s`). No animation is acceptable.
