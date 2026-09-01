Build a high-fidelity tenant application and screening flow for Leaseproof in this Next.js repo.
Visual source of truth is design/attio-inspired/. Port those tokens into the Next app. Do not keep a parallel look.

THEME TOKENS (must match):
- Inter (opsz 14-32). Body 16/22/500, letter-spacing -0.16px
- Text #1C1D1F, muted #6D7988, slate #4E5967
- Borders #E3E7EC / #C9D0D9
- Paper #FFF, mist #FAFAFB, fill #202124, dark #101010, blue #266DF0
- Buttons 36px tall, radius 10px, 14/500, no shadow
- Fill button: bg #202124, text #F3F4F6, border #4E5967
- Ghost button: bg #FFF, text #2D3238, border #C9D0D9
- Two-tone headlines. Sentence case. No RentSpree. No Attio trademarks.
Also restyle marketing landing app/page.tsx to this theme. Link Apply as renter and Start for free into /apply/[listingId].
APPLY FLOW: Route /apply/[listingId], default listing 742 Evergreen Terrace (prop-1). Multi-step wizard, progress, back/next, localStorage, mobile-first.
STEPS (9):
1. Start: Standard 39.99 or Premium 59.99. Credit report free via Experian demo.
2. You: name email phone DOB address. Mask sensitive fields.
3. Photo ID front and back, local object URLs, image and pdf.
4. Income plus two paystubs (image or pdf, local object URLs).
5. Bank: 1 to 3 statements (image or pdf, local object URLs).
6. MOCK Experian connect: Continue with Experian, demo authorization chrome labeled Experian (demo), pulling state, then score near 720 summary. Never call a live bureau. Never collect real login details.
7. Optional pets and occupants. Background is a mock public-records note.
8. Review, FCRA-style consent, mock card pay, credit line 0 dollars.
9. Confirmation plus renter receipt.
LANDLORD PACKET: after submit, packet and detail must show ID, paystubs, bank files, and an Experian block. Reuse mock-data.
CONSTRAINTS: prototype and mock only. Build must succeed. Reuse mock-data. Visible focus, reduced motion, 44px targets.
Stay on branch feature/attio-apply-flow. Do not push remote.
WHEN DONE: report routes, commit hash, how to run, files added.
