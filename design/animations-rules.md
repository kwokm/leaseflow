# Animation Guidelines & Rules

Based on the reference UI/UX, the following animation patterns must be implemented to achieve the clean, modern, and app-like feel of the site. All agents working on frontend components should adhere to these rules.

## 1. Core Principles
* **Subtlety over flashiness:** Animations should feel natural and guide the eye, never distracting or delaying the user.
* **Scroll-driven discovery:** Content should reveal itself smoothly as it enters the viewport.
* **Native "App-like" interactions:** Complex interactions (like opening main tools/modals) should use spatial transitions (scaling and layering) similar to iOS/macOS native apps.

## 2. Global Easing & Timing
Avoid standard linear or ease-in-out timings. Use custom cubic-beziers for a snappy but smooth deceleration.

* **Standard Reveal Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` (Decelerating/Ease-out)
* **Standard Duration (Scroll Reveals):** `600ms` - `800ms`
* **Interaction Duration (Hover/Click):** `200ms` - `300ms`

## 3. Key Animation Patterns

### Pattern A: Scroll-Triggered Fade & Slide Up (Global Default)
**Where to use:** Section headers, text blocks, feature cards, and images as they enter the viewport.
**Behavior:**
* **Initial State:** `opacity: 0`, `transform: translateY(30px)` (or `40px`).
* **Final State:** `opacity: 1`, `transform: translateY(0)`.
* **Staggering:** When revealing a grid or list of items, stagger the reveal delay by `100ms` - `150ms` per item.

### Pattern B: The "App-Modal" Spatial Expansion
**Where to use:** Opening deep interactive modes (e.g. Open the desk, opening a packet from a row).
**Behavior:**
* **Background (Origin Page):** Scales down slightly `scale(0.96)`, darkens slightly, rounded corners `16px`. Timing `800ms cubic-bezier(0.32, 0.72, 0, 1)`.
* **Foreground (New Modal/View):** From `opacity: 0`, `scale(0.9) translateY(20px)` to `opacity: 1`, `scale(1) translateY(0)`.

### Pattern C: Continuous Subtle Floating
**Where to use:** Hero product graphic (the applications card).
**Behavior:** Very slow sine-wave `translateY(±10px)`, duration `4s`-`6s` infinite alternate, `ease-in-out`.

## 4. Accessibility
Always respect `prefers-reduced-motion: reduce`. If true, disable spatial scaling and slide-ups; use a fast fade (`0.1s`) or no animation.
