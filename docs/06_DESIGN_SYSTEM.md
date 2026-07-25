# AI Diet Manager

## Design System

This document defines the app's visual and interaction language — the
"how it looks and feels" layer that sits on top of the product
decisions in `01_PRODUCT_VISION.md`.

---

# Visual Direction

- Apple-inspired, minimalist, dark-first, clean, with subtle
  animations (see `AGENTS.md`).
- All colors, radii, shadows and fonts are defined as CSS custom
  properties in `src/styles/theme.css` — the single source of truth
  for tokens. Never hardcode colors in component styles.
- The dark palette is the default (`:root`); light is a
  `prefers-color-scheme: light` override.

---

# Conversational UI

AI/coach responses and meal-logging interactions use a **chat bubble**
layout (WhatsApp/iMessage-style), not the card layout used by the
onboarding screens.

### Reason

Onboarding is a sequence of deliberate steps — cards fit that. Talking
with a coach is a continuous, back-and-forth relationship — bubbles
fit that better and match the "coach as a person" framing of the
product.

### Composer

The chat input bar follows the same model as WhatsApp/ChatGPT/Gemini:
a single bar at the bottom with a text field, plus options to attach a
photo/file or send audio, alongside sending plain text. This is the
one interface for every meal-logging channel defined in
`01_PRODUCT_VISION.md` (text, photo, audio) — the user doesn't pick a
different screen per input type.

---

# Coach Representation (MVP)

Each of the 5 coaches is represented by an **emoji + name** — no
custom illustration for the MVP:

- 😊 Supportive
- 😐 Balanced
- 🔥 Direct
- 🏋️ Old School
- 💅 Mana

Custom illustrations (especially for Old School and Mana, which carry
the strongest personality) are a candidate for post-MVP polish, not a
blocker for shipping the coach-selection screen.

---

# Functional Emoji Usage

Emoji are used as functional signals, not just decoration:

- 🟢🟡🔴 — the three feedback levels (see `01_PRODUCT_VISION.md`);
- coach emoji — identity marker for each personality (see above).

---

# Open for Future Definition

- Whether coach illustrations replace emoji post-MVP.
- Any additional visual treatment per coach beyond the shared
  chat-bubble layout (e.g. a bubble accent color per coach) — not
  decided yet; today all coaches share the same visual style,
  differing only in text content.
