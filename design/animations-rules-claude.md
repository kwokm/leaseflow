# Animation Rules

Reverse-engineered from steep.app (Next.js + Tailwind v4 + GSAP 3.14.2 with SplitText & ScrollTrigger), then generalized into portable rules.

Everything in Part 1–2 is measured from their shipped CSS/JS bundles. Part 3 onward is the reusable version.

## Part 0 — The five rules that actually matter

1. Animate opacity and transform only. Every motion is one of those two (plus two deliberate width exceptions for typewriter/progress). No top, left, height, margin, or box-shadow transitions.
2. Two durations for UI, one for content. Hover/state 150–200ms. Content entrances 500–800ms. Nothing in between, nothing longer unless scroll-scrubbed.
3. Ease out, always. Decelerating curves for anything entering. ease-in-out reserved for loops that return to start. No ease-in.
4. Stagger is the whole effect. Cards 150ms apart. Headline words 80ms.
5. Reveals are reversible. Scroll back up and the entrance plays backward.

## Tokens
durations: 150 / 200 (workhorse hover) / 300 exit / 350 / 450 panel / 500 enter / 700 slow stagger
easing: default cubic-bezier(0.4,0,0.2,1); ease-out cubic-bezier(0,0,0.2,1); power3.out cubic-bezier(0.22,1,0.36,1) for headlines and staggered lists; power2.out cubic-bezier(0.25,0.46,0.45,0.94) for CTAs
displacement: headline words yPercent 100 masked; description 40px; CTA 15px; grid items 60px; css fade-in-y 10px
stagger: words 0.08s; grid 0.15s

Headline: SplitText-style masked words, masks overflow hidden + marginBottom -0.15em, textShadow 0 0 1em transparent, words 0.6s stagger 0.08 power3.out; description overlaps at 40% of headline; CTA -=0.4s power2.out.

Scroll: start when element is meaningfully on screen (top 80% / rootMargin bottom -20%). Build timelines once paused; scroll only play/reverse.

Hover inventory: scale(1.10) max; press scale(0.90); arrow translateX(4px); button hover opacity 0.9; 10% change or less.

Shadows via --shadow-opacity on ::before, never box-shadow transition.

FOUC: start state in CSS or useLayoutEffect before paint.

Reduced motion in BOTH css and js. No Firefox UA sniffing.

Checklist: only transform/opacity; duration in token set; ease-out on arrive; stagger + cap; start state before paint; reverses; exit faster than enter; reduced-motion both layers.

Three numbers for the feel: 60px / 700ms / 150ms for blocks, 100% / 600ms / 80ms for words, cubic-bezier(0.22, 1, 0.36, 1) for both.
