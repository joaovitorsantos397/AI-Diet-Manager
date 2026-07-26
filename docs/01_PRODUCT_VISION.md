# AI Diet Manager

## Product Vision

### Mission

Help people build healthier eating habits through personalized guidance powered by Artificial Intelligence.

The application aims to simplify nutrition by transforming complex dietary information into practical, personalized daily recommendations.

---

# Problem

Many people struggle to maintain a healthy diet because:

- nutritional information is difficult to understand;
- generic diets rarely fit individual needs;
- calorie tracking is repetitive and discouraging;
- professional nutritional guidance is not always accessible.

Existing applications often focus on data entry rather than coaching and long-term habit formation.

---

# Proposed Solution

AI Diet Manager combines nutrition principles with Artificial Intelligence to provide an interactive coaching experience.

Instead of only counting calories, the application should guide users through daily decisions and help them maintain healthy habits.

The AI acts as a personalized nutrition assistant rather than a simple calculator.

---

# Target Audience

Primary audience:

- adults interested in improving nutrition;
- people seeking healthier lifestyles;
- users who prefer practical guidance instead of rigid diets.

Future audiences may include:

- athletes;
- people focused on weight loss;
- muscle gain programs;
- clinical nutrition support.

---

# Core Features (MVP)

The first version focuses on validating the product concept.

Initial features include:

- multilingual interface;
- user profile;
- AI nutrition coach;
- meal recommendations;
- clean and intuitive interface.

---

# Future Features

Potential future versions may include:

- food recognition using images;
- barcode scanner;
- personalized meal plans;
- shopping list generation;
- nutrition analytics;
- wearable integration;
- Apple Health integration.

---

# AI Coach Personalities

During onboarding, the user chooses one of 5 coach personalities. All
coaches share the same underlying goal — guiding the user toward their
nutrition goal — but express it through different emotional tones.

## Universal styles

Neutral language, no slang, differing only in tone:

- 😊 Supportive — "I'm on your side."
- 😐 Balanced — "I'll guide your progress."
- 🔥 Direct — "I'll tell you exactly what happened."

## Characters

Strong, fixed personalities with their own vocabulary:

- 🏋️ Old School — "Do you want gains or excuses?"
- 💅 Mana — "My love, let's stop making excuses."

Characters are more rigid than the universal styles — their tone and
vocabulary stay consistent rather than adapting — but they keep their
own distinct personality and slang.

## Golden Rule

Every coach must be recognizable without seeing its name or icon: if
the message header were removed, the user should still know who's
speaking, purely from tone and vocabulary.

Future versions may add more characters.

---

# Meal Logging

Users can log meals through:

- text (including a free description the AI estimates quantities
  from);
- photo (the AI estimates portion size/quantities from the image);
- audio;
- a nutrition label/table the user sends directly — the AI records
  the values as given rather than estimating them.

Video logging is a potential future addition.

Push/reminder notifications (the AI proactively asking whether a meal
happened) are explicitly out of scope for now — see
`04_ROADMAP.md`'s Future Ideas. This version is reactive: the AI
responds to what the user reports, it doesn't initiate check-ins.

---

# Estimation Precision

The AI encourages the user to share as much detail as possible about a
logged meal, and the user decides how much to give:

1. **exact quantities** — a user with a kitchen scale can report gram
   amounts per component; the AI uses these as-is;
2. **qualitative detail without exact quantities** — e.g. noting a
   burger had more oil than usual; the AI's estimate is adjusted by
   that detail;
3. **insufficient detail** — the AI falls back to an average-based
   estimate for that food.

The AI actively asks follow-up questions when the detail given isn't
enough for a confident estimate, but never blocks logging on missing
detail — an estimate is always produced.

---

# Meal Timing

The AI needs to know roughly when a meal happened, since timing
drives calorie/macro distribution and training-aware adaptation (see
Training-Aware Meal Adaptation). The user is encouraged to mention the
approximate time when logging a meal. If it's missing, the AI asks —
was it just now, a few minutes ago, or a few hours ago? — rather than
assuming a fixed time or blocking the log.

For this first prototype, the AI does not have real-time clock
awareness; it can only reason about relative timing the user states
("a few hours ago"), not resolve that against the actual current time.
Real-time awareness is future work (see `04_ROADMAP.md`).

---

# Diet Personalization

When the user first reaches the chat, the AI opens with 2-3 messages,
not a single wall of text: a greeting, an explanation that meals can
be logged as text, photo or audio, and an explicit ask for honesty
(see Ethical Guardrails). It then presents an initial diet proposal
aligned to the user's goal and asks for their reaction to it —
including whether any item doesn't fit their budget and needs a
substitute (see Pantry-Aware Substitution, which also covers running
out of an item).

Early in the conversation, the AI asks whether the user already has a
diet plan in place or wants the AI to build a recommendation based on
their onboarding goal. The goal itself has 4 tiers, mapped to 3
diet styles the AI states explicitly:

- weight loss → **cutting**;
- maintenance → **moderate**;
- lean muscle gain, or bulking → **bulking** (two intensities of the
  same style: lean gain uses a smaller calorie surplus and lower
  protein ceiling than bulking).

The user can ask to change their diet/goal at any point in the
conversation, not just during onboarding — the AI recalculates rather
than treating onboarding answers as fixed.

---

# Training-Aware Meal Adaptation

The AI asks about the user's training routine, including whether they
train on a given day and at what time. Meal recommendations adapt
around that:

- if a workout is coming up (e.g. in 3 hours), the AI adjusts that
  meal's protein/calorie composition accordingly;
- protein targets use a reference heuristic for hypertrophy (e.g.
  ~2.5g of protein per kg of body weight per day as a starting point),
  refined by the user's specific goal and context — not a fixed rule
  hardcoded into calculations;
- reported hormone/PED use raises the protein and calorie ceiling by a
  documented reference amount (not a number copied from an
  unverified source) — see Ethical Guardrails;
- reported hormone/PED use also triggers fat-quality guidance (cap on
  saturated fat, prioritize unsaturated sources), since hormone use is
  well-documented in endocrinology to affect lipid profile (HDL/LDL);
- training time is matched against meal times rather than treated as
  an independent schedule;
- calories and protein are distributed across the day based on the
  user's goal and general sports-nutrition literature, not a flat
  even split;
- meals close to bedtime are kept lighter, since heavy meals late at
  night can impair sleep quality;
- pre-workout meals lean toward readily available energy (e.g. honey,
  banana); post-workout meals lean toward higher protein.

---

# Hydration

Water intake recommendations are personalized, not uniform. The AI
pays closer attention to hydration for users where it matters more —
for example, those reporting very high protein or fiber intake, or
hormone/PED use — without ever recommending less water for any group.
This follows the same health-context-driven adaptation as meal timing
and training (see Training-Aware Meal Adaptation and Health Context).

Hydration adjustments are built from mechanisms the app can defend
(higher protein, fiber, and activity level all increase water needs —
the activity adjustment reflects sweat loss during exercise). Claims
that require clinical monitoring — like hematocrit changes from
hormone use — are handled by pointing the user to bloodwork and a
doctor (see Ethical Guardrails), not by asserting that a water target
manages that risk.

---

# Pantry-Aware Substitution

The AI adapts recommendations to what the user actually has available
that week, for two kinds of reasons:

- **stock** — an ingredient ran out (e.g. whey protein);
- **budget** — an item doesn't fit the user's finances right now.

Either way, the AI substitutes with an equivalent alternative (e.g.
boiled eggs for whey) instead of recommending something the user can't
actually get. The AI states this flexibility explicitly, so the user
knows they can ask for a substitution any time, for either reason.

This depends on the user keeping the AI informed about their pantry,
following the same honesty-dependent design as meal logging (see
Ethical Guardrails).

---

# Schedule Flexibility

Real routines don't follow a fixed schedule. The user can report
deviations — a delayed or early dinner, what time they went to sleep
(relevant to natural GH production overnight) — and the AI adapts
around them rather than enforcing rigid meal-time slots.

This flexibility is why the AI-driven approach matters: a static meal
plan can't react to a workout that moved, a meal pushed back, or a
night that ended early or late.

---

# AI Analysis & Feedback

For each logged meal, the AI analyzes:

- calories;
- protein;
- carbohydrates;
- fat;
- fiber.

It then responds in the voice of the selected coach.

Feedback uses a three-level system:

- 🟢 green;
- 🟡 yellow;
- 🔴 red.

Each coach reacts differently to the same level, according to its
personality.

---

# Health Context

The AI factors in the user's:

- goal;
- weight;
- training;
- history;
- hormone use (if provided) — specifically anabolic steroid/PED use
  for hypertrophy purposes, not hormone therapy in general.

...to adapt its recommendations accordingly. When hormone use is
reported, the AI can flag food-related risks relevant to that context
(e.g. foods that may affect cholesterol), subject to the ethical
guardrails below.

If the user knows their basal metabolic rate — e.g. measured on a
bioimpedance scale, which commonly reports it alongside body fat
percentage — that measured value is used instead of the formula
estimate, since it reflects actual body composition rather than
weight alone. It's optional; the formula estimate is the fallback.

---

# Ethical Guardrails

- The AI gives **informational** food/health alerts, never a medical
  diagnosis or treatment plan. Any hormone-related alert is paired
  with a reminder to consult a doctor — the app does not replace
  medical supervision.
- The app depends entirely on the user honestly self-reporting meals,
  pantry availability, and any deviation from the diet. The AI states
  this dependency explicitly to the user — that its accuracy and
  usefulness rely 100% on what's reported, including running out of
  an ingredient or straying from the plan — rather than assuming it
  silently. Feedback (praise or a firmer nudge) is built on that
  honesty, not on detecting or verifying it.
- No coach personality — however direct or "tough" its tone — may
  encourage hiding information from the AI or minimizing a reported
  health risk in order to stay in character. Persona consistency never
  overrides user safety.
- When a risk requires clinical monitoring to actually manage (e.g.
  hematocrit or cholesterol changes from hormone use), the AI points
  to bloodwork and a doctor rather than asserting that a lifestyle
  number (like a water target) resolves it. Confident-sounding claims
  about a specific mechanism (blood viscosity, blood pressure, etc.)
  are not made without that clinical grounding, even if a plausible
  reference number for a nutrition-based adjustment is stated
  alongside it.

---

# Evolution Tracking

The dashboard shows charts for:

- weight;
- body fat percentage (if the user provided a baseline — see Health
  Context; measurable later, e.g. via a pharmacy bioimpedance scan);
- calories;
- protein;
- adherence;
- consecutive days (streak).

---

# Reports

Beyond the charts in Evolution Tracking, the AI sends simple periodic
reports as regular chat messages — emoji and numbers, not another
chart: whether the goal was met, what fell short, and what could
improve. Delivered as a normal message, in the voice of the selected
coach, not a separate report screen.

---

# Conversational AI

Beyond structured logging, users can ask free-form questions within
the chat, for example:

- "Can I eat pizza today?"
- "I'm out of protein at home."
- "What should I have for dinner?"
- "How much protein do I have left today?"
- "Switch me to cutting" / "I want to try lean gain instead" — goal
  and diet style changes are handled the same way, at any time, not
  only during onboarding.

The AI responds naturally to ordinary human interaction (greetings,
small talk) rather than only accepting structured commands. It stays
focused on nutrition, though: conversations that drift into unrelated
topics for an extended period (roughly 5-10 minutes) are wound down
naturally rather than continued indefinitely — the app is a nutrition
coach, not a general-purpose chatbot.

---

# Design Principles

The application follows these principles:

- simplicity first;
- minimal cognitive load;
- accessibility;
- internationalization;
- scalability;
- consistent, recognizable coach personalities;
- AI used to enhance—not replace—the user experience.

---

# Success Criteria

The MVP will be considered successful if it demonstrates:

- a clear product vision;
- clean architecture;
- good user experience;
- maintainable codebase;
- potential for future expansion.