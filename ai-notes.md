# AI Notes

## Tools used
- ChatGPT for design and code generation

## Key prompts
- *Build a mobile-friendly web app in HTML that keeps golf scores (1–4 players), 9/18 holes, undo/reset, persistence, numeric keypad, and keep-awake support.*

## Suggestions
- **Accepted:** Sticky header/footers and a totals pill bar for always-visible running totals.
- **Edited:** Kept the code framework-less and in a single-page app to reduce complexity.

## Reflection on accuracy & pitfalls
- `localStorage` persistence is simple but tied to a single device/browser profile. Export/sharing not in MVP.
- Numeric inputs can still allow non-integers on desktop; we clamp to `>=0` integers in JS.
- Verified totals recompute after each edit and are mirrored in both the footer row and the top pills.

## Verification steps
- Started 9- and 18-hole rounds with 1–4 players, entered sample scores, validated totals update live.
- Tested Undo/Clear/Reset behavior in several sequences.
- Reloaded page to ensure persistence.
