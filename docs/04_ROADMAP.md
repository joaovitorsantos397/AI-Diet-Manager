# AI Diet Manager

## Roadmap

This roadmap tracks the project's progress by release version. Each
version represents a shippable increment of the product, not just an
internal engineering milestone.

---

# Version 0.0 — Foundation

Groundwork completed before the versioned feature work begins.

- [x] Create React project using Vite
- [x] Configure TypeScript
- [x] Configure Git repository
- [x] Organize documentation
- [x] Define initial architecture
- [x] Language Selection
- [x] Initial Welcome Screen
- [x] Theme System (dark-first)
- [x] Splash Screen
- [x] Responsive Layout — fixed a real flexbox overflow bug in the
      chat header (name/progress text could push past the evolution
      button on narrow screens), framed the chat and evolution screens
      to a comfortable centered column (720px) on wide/desktop
      viewports instead of stretching edge to edge, and added a
      sub-420px breakpoint that tightens padding/icon sizes on small
      phones

---

# Version 0.1 — Calorie Calculation

- [x] Onboarding: Name
- [x] Onboarding: Goal selection (Weight loss / Maintenance / Muscle gain)
- [x] Onboarding: Physical data — Sex
- [x] Onboarding: Physical data — Age
- [x] Onboarding: Physical data — Height
- [x] Onboarding: Physical data — Weight
- [x] Onboarding: Physical data — Body fat percentage (optional)
- [x] Onboarding: Physical data — Basal metabolic rate (optional,
      overrides the formula estimate when provided)
- [x] Onboarding: Activity level
- [x] Onboarding: Training routine (fixed / flexible, with days/times
      captured when fixed)
- [x] Onboarding: Hormone use (optional, independent question)
- [x] Onboarding: Coach selection screen
- [x] Daily calorie calculation

---

# Version 0.2 — Macronutrients

- [x] Macronutrient calculation (protein, carbohydrates, fat, fiber)
- [x] Water intake recommendation

---

# Version 0.3 — Meal Logging

- [x] Text-based meal logging
- [x] Photo-based meal logging
- [x] Audio-based meal logging

---

# Version 0.4 — Nutritional AI

- [x] AI meal analysis (calories, protein, carbohydrates, fat —
      photo/audio now reach the model; structured data extracted and
      tracked against the daily target)
- [x] Three-level feedback system (green / yellow / red)
- [x] Conversational AI (free-form questions within chat)

---

# Version 0.5 — Personalities

- [x] 5 coach personalities (Supportive, Balanced, Direct, Old School, Mana)
- [x] Personality-specific responses per feedback level
- [x] Chat bubble conversation interface

---

# Version 1.0 — Complete Coach

- [x] Evolution tracking — calories and protein (last 7 days),
      weight/body fat (last 8 measurements, logged when the user
      reports a pharmacy/scale weigh-in), and an adherence streak
      counter (consecutive days both calories and protein landed
      "green")
- [x] Full health context awareness — the system prompt now includes a
      "Health history context" block computed by the app itself
      (today's totals so far, the adherence streak, latest logged
      weight and its trend vs. the onboarding baseline vs. what's
      expected for the goal) instead of relying on the model to
      reconstruct any of that from the raw conversation
- [x] Accessibility improvements — real accessible names on every
      onboarding field and the chat composer (was placeholder-only),
      the chat log now announces new messages via `role="log"` +
      `aria-live`, decorative emoji icons are `aria-hidden`, and
      keyboard focus is visible again on inputs (a custom outline
      had suppressed it)
- [x] Performance optimization — meal photos are downscaled/
      re-encoded client-side (max 1600px, JPEG) before upload instead
      of sending phone-camera originals at full resolution
- [x] Final UI refinement — audited hover/disabled states across the
      app: the composer's icon buttons and send button had no
      `:disabled` styling at all (invisible feedback while sending or
      reviewing a recorded audio), and the "disabled" opacity value
      was inconsistent (0.4 vs 0.5) between components; both fixed

---

# Future Ideas (post-1.0)

- [ ] Video-based meal logging
- [ ] Barcode scanner
- [ ] Shopping list generation
- [ ] Apple Health integration
- [ ] Wearable integration
- [ ] Additional coach personalities
- [ ] Family accounts
- [ ] Cloud synchronization
- [ ] Offline mode
- [ ] Proactive meal-time check-ins (AI asks near the expected meal
      time whether the user has eaten or plans to, as a reminder/
      motivation nudge) — deliberately deferred for now
- [ ] User accounts / login with persisted progress — deliberately
      deferred for now, current prototype has no backend or auth
- [ ] Real-time clock awareness for the AI (resolving "a few hours
      ago" against the actual current time)

---

# Documentation

- [x] Project Context
- [x] Product Vision
- [x] Architecture
- [x] Decision Log
- [x] Design System
- [x] Project FAQ
- [ ] AI Context

---

# Current Status

Versions 0.1, 0.2, 0.3 and 0.4 are complete. Version 0.5 is complete
too: personas were already implemented, and the feedback system gives
each coach a judgment call (green/yellow/red) per logged meal, shown
as a colored dot on the message — verified with a real request (a
weak meal correctly triggered "red" in the Old School persona's own
voice). Audio logging is now confirmed end to end: a real in-browser
recording (webm/opus) was sent and correctly logged as a medium
banana, so the format is accepted by Gemini without needing a
client-side conversion step.

Also fixed since then: nutrition counter was double-counting meals
reported piecemeal across messages (model was re-summing already-
logged items when recapping in prose); a nutrition label photo alone
was being logged as if the whole package was eaten, instead of
treated as reference data pending a stated quantity; the artificial
600ms typing delay between split messages now only applies to the
4-part kickoff greeting, not later replies; and the model can now ask
for a second photo angle on an ambiguous plate instead of guessing.
Audio logging also gained a confirm step: recordings are transcribed
and shown back to the user (with a re-record option) before anything
is sent as a real meal log.

Evolution tracking is now fully built out: calories/protein (7-day
bars), weight/body fat (last 8 weigh-ins, logged from a stated
pharmacy/scale reading), and an adherence streak counter — all
computed deterministically in code from the logged entries, not left
to the model to re-sum.

Full health context awareness is done too: every system prompt call
now injects a computed "Health history context" block (today's
totals, the streak, and the weight trend vs. onboarding and vs. what's
expected for the stated goal), so the coach reasons from the app's
own ground truth instead of reconstructing numbers from the chat
transcript.

Accessibility and performance are done: onboarding fields and the chat
composer have real accessible names instead of placeholder-only, the
chat log announces new messages to screen readers, decorative emoji
are hidden from them, keyboard focus is visible again on text inputs,
and meal photos are downscaled/re-encoded client-side before upload
instead of sending full-resolution phone-camera originals.

Responsive Layout is done too (closing the last open item from Version
0.0): a real flexbox overflow bug in the chat header is fixed, the
chat and evolution screens are framed to a centered column on wide
viewports instead of stretching edge to edge, and small phones get a
tightened sub-420px breakpoint.

The final UI polish pass is done: audited hover/disabled states across
the app and fixed two real gaps — the composer's icon buttons and send
button had no `:disabled` styling (no visual feedback while sending or
reviewing a recorded audio), and the "disabled" opacity value was
inconsistent between components (0.4 vs 0.5), now standardized.

Version 1.0 is complete.

Current focus:

➡️ Nothing committed yet — all of this work (everything past the
initial theme-system commit) is still uncommitted locally. Next
concrete step is deciding what to pick from Future Ideas (post-1.0),
or committing/shipping what exists so far.
