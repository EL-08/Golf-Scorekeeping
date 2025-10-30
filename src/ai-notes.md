# AI Notes

## Tools used
- ChatGPT (GPT-5 Thinking) for design + code generation
- Manual reasoning for UX choices and edge cases

## Key prompts (summarized)
- *Build a mobile-friendly web app in HTML that keeps golf scores (1–4 players), 9/18 holes, undo/reset, persistence, numeric keypad, and keep-awake support.*
- Follow-up internals: pick `localStorage`, implement undo stack, show running totals, use Wake Lock API with fallbacks, and mobile-first CSS.

## Suggestions accepted / edited
- **Accepted:** `inputmode="numeric"` and `pattern` on number inputs → ensures mobile numeric keypad.
- **Accepted:** Undo via a simple stack of `{playerIndex, holeIndex, prev, next}`.
- **Accepted:** Sticky header/footers and a totals pill bar for always-visible running totals.
- **Edited:** Kept the code framework-less and in a single-page app to reduce complexity.
- **Edited:** Wake Lock is opt-in button + auto-request on round start, with visibility re-acquire.

## Reflection on accuracy & pitfalls
- Wake Lock API is not universally available and may fail due to battery/OS policies. The app surface-cues availability and handles failures gracefully.
- `localStorage` persistence is simple but tied to a single device/browser profile. Export/sharing not in MVP.
- Numeric inputs can still allow non-integers on desktop; we clamp to `>=0` integers in JS.
- Undo stack only records score edits (not setup changes). This keeps the stack simple and predictable.
- Verified totals recompute after each edit and are mirrored in both the footer row and the top pills.

## Verification steps
- Started 9- and 18-hole rounds with 1–4 players, entered sample scores, validated totals update live.
- Tested Undo/Clear/Reset behavior in several sequences.
- Reloaded page to ensure state persistence.
- Toggled Wake Lock and verified status feedback in the UI; tested visibility change re-acquisition where supported.
