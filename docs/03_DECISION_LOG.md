# AI Diet Manager

## Decision Log

This document records important engineering and product decisions made throughout the development of the project.

The objective is to preserve the reasoning behind each decision, making future maintenance and collaboration easier.

---

# 2026-07-25

## Decision

Develop the MVP using React instead of SwiftUI.

### Reason

The original plan was to build the application using SwiftUI.

However, development is currently being done on Windows, making React a more practical choice for rapid prototyping and continuous development.

### Expected Benefits

- Faster MVP delivery.
- Easier local development.
- Cross-platform experience.
- Possibility of migrating to SwiftUI in the future if necessary.

---

# 2026-07-25

## Decision

Adopt English for source code and technical documentation.

### Reason

English is the standard language used in software development.

Using English improves maintainability, collaboration and future scalability.

### Expected Benefits

- Professional repository.
- Better GitHub presentation.
- Easier collaboration.
- Better compatibility with AI tools.

---

# 2026-07-25

## Decision

Allow users to choose their language before using the application.

### Reason

The application should not assume English as the default language.

Providing language selection improves accessibility and user experience.

### Expected Benefits

- Better internationalization.
- Better onboarding experience.
- User-centered design.

---

# 2026-07-25

## Decision

Build the application incrementally.

### Reason

Instead of implementing all planned features immediately, the project evolves through small, validated steps.

Each new feature should be functional before moving to the next.

### Expected Benefits

- Easier debugging.
- Faster feedback.
- Cleaner architecture.
- Lower development risk.

---

# 2026-07-25

## Decision

Prioritize understanding over memorization.

### Reason

The project is also intended as a technical portfolio piece.

Understanding why decisions are made is considered more valuable than simply knowing framework syntax.

### Expected Benefits

- Better technical communication.
- Stronger portfolio material.
- More sustainable learning.

---

# 2026-07-25

## Decision

Introduce a centralized, dark-first Theme System using CSS custom properties.

### Reason

`index.css` still contained unused leftover tokens and layout rules from the
Vite starter template, while `App.css` hardcoded light-only colors directly
onto `:root`. Together this silently prevented the app from ever rendering in
dark mode, contradicting the dark-first UI principle in AGENTS.md, and left
color/spacing decisions duplicated with no single source of truth.

A dedicated `src/styles/theme.css` now defines all design tokens (color,
radius, shadow, font) as CSS custom properties. `:root` holds the dark
palette by default; a `prefers-color-scheme: light` override provides the
light palette. `App.css` and `index.css` now consume these tokens instead of
hardcoded values.

No new dependency was introduced — plain CSS custom properties fit the
existing stack.

### Expected Benefits

- Dark-first UI principle is actually enforced, not just documented.
- Single source of truth for design tokens, ready for future screens.
- Removes dead code inherited from the Vite template.
- Easier to introduce a manual theme toggle later if needed.

---

# 2026-07-25

## Decision

Extract `WelcomeScreen` into `src/screens`, introduce a reusable `ScreenCard`
component, and move the shared `Language` type into `src/types`.

### Reason

`App.tsx` held the markup for both application views (language selection and
welcome) directly, with no separation between composition and presentation.
Both views also duplicated the same wrapper structure
(`main.app > section.*-card > p.eyebrow`), and the `Language` type was only
usable by files that reached into `App.tsx`.

`WelcomeScreen` now owns the welcome view's markup, `ScreenCard` owns the
shared card shell (used by both views), and `Language` lives in `src/types`
where any component can import it without depending on `App.tsx`.

The language-selection view intentionally still renders inline in `App.tsx`
(via `ScreenCard`) rather than becoming its own screen component. Extracting
it would make `App.tsx` purely compositional, but that's a distinct,
similarly small follow-up rather than something to fold into this change.

### Expected Benefits

- `App.tsx` no longer owns the welcome view's presentation, only its
  composition and state.
- Shared card structure lives in one place instead of two.
- `Language` is reusable without unnatural imports.
- No change to markup, styling or behavior — verified via build output and
  bundle content.

---

# 2026-07-25

## Decision

Add a `SplashScreen` shown before the language-selection screen.

### Reason

The roadmap's Phase 1 called for a Splash Screen, and the Theme System
implemented earlier the same day made it possible to build one without
introducing new colors. No logo asset exists in the project yet
(`hero.png`/`react.svg`/`vite.svg` are unused Vite-template leftovers), so
the splash uses a text wordmark rather than wiring up an unintegrated image.

`App.tsx` gained one `showSplash` state that gates rendering before the
existing language/welcome logic — no changes to that logic were needed.

### Expected Benefits

- Matches the Apple-inspired, minimalist, dark-first UI direction already
  established.
- Closes another Phase 1 roadmap item without adding new dependencies.
- Keeps `App.tsx`'s existing screens untouched — the splash is purely
  additive.

---

# 2026-07-25

## Decision

Reframe the roadmap around release versions (0.1 → 1.0) instead of
engineering phases, and add a dedicated `06_DESIGN_SYSTEM.md` document.

### Reason

The project has matured from "having an idea" to designing a coherent
product, with concrete scope (coach personalities, meal logging
channels, feedback levels) that maps naturally to shippable versions
rather than internal phase numbers. A separate "Product Bible" was
considered but rejected — it would duplicate content already owned by
`01_PRODUCT_VISION.md` and `04_ROADMAP.md`, creating two sources of
truth that drift apart over time. Work already completed was kept as
"Version 0.0 — Foundation" so no history was lost in the reframe.

### Expected Benefits

- Roadmap communicates scope in terms a reviewer or stakeholder
  recognizes (a version), not just internal task buckets.
- Documentation stays single-sourced: one file owns product vision,
  one owns roadmap, one now owns visual/interaction design.

---

# 2026-07-25

## Decision

Expand the product vision with AI coach personalities, meal logging
channels, the AI feedback system, health context and evolution
tracking.

### Reason

The earlier vision doc only sketched an abstract "AI nutrition coach."
A dedicated product-definition session (with the user, informed by a
parallel conversation with another AI) defined concrete scope: 5 coach
personalities split into 3 neutral "universal styles" and 2 fixed
"characters" with their own vocabulary, a 3-level feedback system
(green/yellow/red), meal logging via text/photo/audio, and
conversational free-form Q&A.

### Expected Benefits

- Implementation now has concrete scope instead of a vague direction.
- The "golden rule" (each coach recognizable without seeing its name)
  gives a testable bar for future coach content and prompts.

---

# 2026-07-25

## Decision

Adopt a chat-bubble UI for coach conversations, and emoji + name
(no illustration) for coach representation in the MVP.

### Reason

Onboarding is a sequence of deliberate steps, which the existing card
layout fits well. Talking with a coach is an ongoing, back-and-forth
relationship, which a chat-bubble layout (WhatsApp/iMessage-style)
represents more naturally. No custom illustration exists for any
coach yet, and commissioning art would block the coach-selection
screen; emoji + name ships without that dependency.

### Expected Benefits

- Conversational UI matches the "coach as a person" framing of the
  product instead of reusing a step-based layout that doesn't fit.
- Coach-selection screen can be built now; illustration becomes a
  clearly-scoped, non-blocking post-MVP item.

---

# 2026-07-25

## Decision

Scope the "hormone use" field specifically to anabolic steroid/PED use
for hypertrophy, and adopt explicit ethical guardrails around AI
health alerts and coach tone.

### Reason

"Hormonizado" is ambiguous in Portuguese — it can mean anabolic
steroid/PED use (bodybuilding context) or gender-affirming hormone
therapy, which have very different health implications and require
different handling. The scope was narrowed deliberately to the
former, matching the concrete use case discussed (cholesterol-related
food alerts for steroid users).

Because the app gives health-adjacent alerts and depends entirely on
honest self-reporting, two risks needed to be addressed before
building further: the AI could be mistaken for a medical authority,
and a coach's "tough" persona could reinforce risky behavior (e.g.
minimizing a reported risk) in the name of staying in character.

### Expected Benefits

- Onboarding question and AI alert logic have unambiguous scope.
- Clear boundary that AI alerts are informational, not diagnostic,
  reducing risk of real user harm.
- Coach personality specs now have an explicit safety constraint that
  overrides persona consistency, protecting a group of users in a
  context where body-image pressure is already common.

---

# 2026-07-25

## Decision

Expand product vision with diet-personalization preference,
training-aware meal adaptation, and schedule flexibility. Explicitly
defer push/reminder notifications to keep this version reactive.

### Reason

Defined how the AI coach behaves once a user starts chatting: it asks
whether the user already has a diet plan or wants a recommendation
based on their onboarding goal, adapts meal composition around the
day's training schedule (including timing relative to a workout using
a reference protein/kg heuristic), and adapts to real schedule
deviations (delayed meals, bedtime — relevant to overnight GH
production) instead of enforcing a fixed meal-time plan. Proactive
notifications were deferred on purpose to keep this version's scope
achievable — the AI reacts to what the user reports; it doesn't yet
push reminders.

### Expected Benefits

- Coach behavior is specified before any AI integration work starts,
  reducing the risk of rework once that begins.
- Scope stays reactive/chat-driven, matching what's actually feasible
  without notification infrastructure.
- The protein/kg heuristic is captured as a documented reference value
  rather than an assumption buried in future calculation code.

---

# 2026-07-25

## Decision

Integrate the Gemini API as the AI provider for the in-app nutrition
coach.

### Reason

The coach needs text, photo (portion estimation) and audio (voice
logging) understanding, plus function calling for actions like
logging a meal or recalculating macros. Gemini handles text, image and
audio natively in a single model, avoiding a separate speech-to-text
step that Claude or OpenAI would require for audio logging.

Cost was the deciding factor given this is a low-traffic MVP/portfolio
project: Gemini's API has a genuinely free tier (rate-limited, not
pay-per-token), while Claude and OpenAI's APIs are pay-per-token from
the first request with no ongoing free tier. This is unrelated to and
independent from the developer's personal Claude Code subscription
used to build the app — that's a separate account and billing
relationship entirely.

### Expected Benefits

- Zero expected cost at MVP/portfolio-demo traffic levels.
- One API covers all three input modalities (text, photo, audio)
  instead of stitching together a transcription service.
- A clear, defensible answer for "why this provider" grounded in
  actual technical fit and cost, not brand preference.

---

# 2026-07-25

## Decision

Calculate daily calorie needs with the Mifflin-St Jeor BMR formula,
standard activity multipliers, and a fixed calorie adjustment per
goal, implemented as a pure function in a new `services/` folder.

### Reason

This is the first real calculation in the project — closing out
Version 0.1. Mifflin-St Jeor is the formula current sports-nutrition
literature generally treats as more accurate than older alternatives
(e.g. Harris-Benedict) for the general population. The goal
adjustments (-500 kcal for weight loss, +300 kcal for muscle gain,
roughly matching 0.5kg/week of change) are common reference starting
points, not a prescription — consistent with the Ethical Guardrails
already documented (informational only, not medical advice).

This is also the first use of the `services/` folder defined in
`02_ARCHITECTURE.md`: the calculation is a pure function, decoupled
from any screen, and a new `UserProfile` type consolidates the
onboarding answers it needs. Version 0.2 (macronutrients) will reuse
both.

### Expected Benefits

- Calculation logic is testable and framework-independent.
- Clear separation between UI (screens) and business logic (services),
  matching the architecture doc's original intent instead of leaving
  everything in components.
- Adjustment values are documented and easy to tune later without
  hunting through UI code.

---

# 2026-07-25

## Decision

Calculate macronutrients (protein, fat, carbs, fiber) and a water
target from the goal-based protein reference and daily calorie
target, as a second pure function in `services/`.

### Reason

Protein follows the goal-based grams/kg reference already documented
in the product vision (2.5g/kg for hypertrophy, scaled down for
maintenance/loss). Fat is set as a percentage of total calories (25%,
a common baseline), and carbs fill the remaining calories — this
keeps the three macros consistent with the already-calculated daily
calorie target instead of being computed independently and
potentially not adding up. Fiber follows the widely-used ~14g per
1000 kcal guideline. Water follows a standard ~35ml/kg baseline, with
an extra allowance when protein intake is high — this is the first
code implementation of the Hydration principle already documented
(closer attention to hydration for high-protein users, never less
water for anyone).

The calorie/macro result screen was renamed from `CalorieResultScreen`
to `NutritionResultScreen` to reflect that it now shows the full
nutrition summary, not just calories.

### Expected Benefits

- Macros always sum to the calorie target by construction, rather
  than being independently guessed.
- Hydration guidance is now actual behavior, not just documented
  intent.
- Same `services/` pattern as the calorie calculator — consistent,
  testable, and ready for Version 0.4 (AI analysis) to reuse.

---

# 2026-07-25

## Decision

Split the `gain` goal into `lean_gain` and `aggressive_gain`, and make
`hormoneUse` an active input to the calorie and macro calculators
(protein +0.3g/kg, TDEE +5%, water +300ml when reported), instead of
data collected but unused.

### Reason

The user compared our output against another AI's analysis of the
same scenario (a hormone-using athlete in a bulk). That AI's core
critique was valid and consistent with what was already documented in
`01_PRODUCT_VISION.md` (hormone use should adapt recommendations, not
just trigger alerts) but had never actually been wired into the
calculators — `hormoneUse` was collected in onboarding and then
ignored. Separately, a single `gain` goal was too coarse: "lean gain"
and "aggressive bulking" call for different surpluses and protein
ceilings, matching the distinction the user asked for.

The other AI's specific numbers (e.g. protein up to 210g, water
4.5-5L, tied to claims about hematocrit and kidney strain) were
**not** copied in. Those are specific medical claims stated with more
certainty than this project's Ethical Guardrails allow — the app must
stay informational, not diagnostic. Instead, a documented, modest
reference adjustment was implemented (protein +0.3g/kg, TDEE +5%,
water +300ml). Sanity-checking a comparable scenario (75kg, bulking,
hormone use reported) landed the protein and carb output in a similar
range to the other AI's numbers organically, which is a reasonable
validation signal; the water output came out more conservative on
purpose, since it wasn't built from the same causal claim.

### Expected Benefits

- Hormone use now has real effect, matching documented product intent
  instead of being dead data.
- Goal granularity matches what users training with different
  intensities actually need.
- The app's numbers can differ from another AI's more assertive
  output without that being a bug — it's a deliberate, documented
  editorial boundary, traceable here if questioned later.

---

# 2026-07-25

## Decision

Add a fiber-linked water adjustment (+10ml per gram of fiber) to the
macro calculator, and replace the hormone-adjustment message with
guidance to monitor bloodwork/see a doctor — without adopting the
hematocrit/blood-pressure/water-target causal claim the user brought
from another AI's output.

### Reason

The other AI pushed back hard on our 3.4L figure, telling the user to
"ignore the app" and target 4.5-5L, justified by hormone use raising
hematocrit and thickening blood, which a water target was said to
counteract. Two different claims were bundled together here, and they
don't deserve the same treatment:

- **High fiber intake needs more water** — a standard, defensible
  nutrition-science relationship. This was missing from the
  calculator and has been added.
- **Water intake manages hematocrit/blood viscosity risk from hormone
  use** — a specific clinical claim asserted with more certainty than
  this project's Ethical Guardrails allow. Elevated hematocrit from
  certain compounds is real but is monitored and managed via
  bloodwork and a physician, sometimes requiring intervention hydration
  alone doesn't provide (e.g. therapeutic phlebotomy). Stating that a
  water number "protects the heart" from this risk would give false
  reassurance about something that needs actual clinical monitoring.

Adding the fiber mechanism moved the test scenario's water output from
3.4L to 3.9L organically — closer to the other AI's number, but for a
reason this project can defend, not because the other output asserted
it more forcefully. The hormone-adjustment message on the result
screen now explicitly points to bloodwork/a doctor instead of implying
hydration handles that risk.

### Expected Benefits

- The water number keeps moving in a defensible direction as new
  legitimate mechanisms are found, without importing claims this
  project isn't positioned to make responsibly.
- The app now says the medically correct thing for the hematocrit
  concern (monitor with bloodwork/a doctor) instead of a technically
  reassuring but clinically inadequate one (drink more water).
- Establishes a repeatable test for future "the other AI said X"
  comparisons: adopt the mechanism if it's defensible on its own
  terms, not because the other output was more confident or told the
  user to distrust this app.

---

# 2026-07-25

## Decision

Evaluated three "errors" the user's other-AI comparison raised
(citing SBC, ACSM, USDA/IOM, Endocrine Society, AHA), on their merits
rather than on the strength of the citations. Adopted one directly,
rejected one as factually wrong about this project's own code, and
resolved the third with a different, defensible mechanism instead of
the one claimed.

### Reason

- **Fiber "fixed at 50g"** — false. The fiber formula was already
  dynamic (14g/1000kcal, inside the critique's own suggested
  10-14g/1000kcal range); 50g was that formula's output at ~3577kcal,
  not a hardcoded value. The critique reacted to a displayed number
  without checking the formula behind it. No change made; this is
  recorded so the same non-error doesn't get re-litigated later.
- **Water needs 50ml/kg + 1-1.5L hormone bonus (4.5-5L), citing the
  ACSM Position Stand on Exercise and Fluid Replacement and an SBC
  plasma-viscosity guideline** — the ACSM document is about matching
  fluid intake to exercise-driven sweat loss, not a general resting
  daily water formula, and no SBC guideline is known to prescribe
  hydration as hematocrit management. The citations don't appear to
  support the specific claim attached to them. However, the ACSM
  document's actual subject (activity-driven fluid loss) exposed a
  real, independent gap: water scaled with weight but not with
  activity level. Added an activity-level water bonus
  (`ACTIVITY_WATER_BONUS_ML`) instead — correctly grounded in what
  that citation actually covers. Combined with the earlier fiber
  adjustment, the test scenario's water output reached 4.525L,
  inside the claimed 4.5-5L range, arrived at independently rather
  than by adopting the unsupported claim.
- **Fat quality / saturated fat cap, citing Endocrine Society and AHA
  guidelines** — legitimate and adopted. Hormone/steroid use affecting
  lipid profile (lower HDL, higher LDL) is well-established
  endocrinology, and the app only showed total fat with no quality
  guidance. Added `saturatedFatCapGrams` (AHA's ~7%-of-calories
  reference) and unsaturated-fat guidance to the result screen.

### Expected Benefits

- Demonstrates a repeatable method for evaluating "another AI said X"
  input: check whether the citation actually supports the claim and
  whether the claim is true about this project's own code, before
  changing anything — authority of the source is not a substitute for
  verification.
- The water number is now defensible at every step it's built from,
  even though it lands in the same range the more assertive (and
  partly unsupported) critique proposed.
- Hormone users get real, actionable fat-quality guidance instead of
  a generic fat gram count.

---

# 2026-07-25

## Decision

Add flexible meal-timing to the product spec: the AI asks for
approximate time when it's missing from a meal log, instead of
requiring an exact time or assuming one. Defer login/persisted
progress and real-time clock awareness.

### Reason

Meal timing feeds calorie/macro distribution and training-aware
adaptation, so the AI needs it, but requiring an exact time would add
friction most users won't tolerate for casual logging. A relative
fallback ("just now" / "a few minutes ago" / "a few hours ago")
matches how people actually think about when they ate. This is the
same fallback-ladder pattern already used for quantity (see
Estimation Precision) applied to time instead.

Login and persisted progress were raised but explicitly shelved — the
prototype has no backend or auth yet, and building either now would
be scope creep ahead of the AI integration this app still needs first.
Real-time clock awareness (resolving relative time against an actual
clock) needs the same AI integration and was deferred alongside it.

### Expected Benefits

- Meal-timing behavior is specified before AI integration work starts,
  same benefit as the earlier behavior specs.
- Explicitly deferred items are recorded so they aren't quietly
  forgotten or accidentally built out of order.

---

# 2026-07-26

## Decision

Add a minimal local Express backend (`server/`) that proxies chat
requests to the Gemini API, with the API key held server-side via
`.env`. The React app calls it through a Vite dev-server proxy
(`/api` → `http://localhost:3001`) rather than hardcoding the backend
URL or calling Gemini directly from the browser.

### Reason

An API key can never live in client-side code — it would be visible
to anyone inspecting the app. A thin backend was the smallest way to
close that gap without committing to a production hosting platform
(Vercel/Netlify/etc.) before that decision is actually needed —
deployment strategy stays a separate, later decision, as already
noted in Future Decisions.

The Vite proxy means the frontend only ever calls a relative `/api/...`
path, with no CORS setup and no hardcoded port baked into app code —
if the backend's port or host changes, only `vite.config.ts` needs to
change.

Model choice: `gemini-2.5-flash`, the model named throughout this
project's earlier planning, turned out to be blocked for new API keys
("no longer available to new users") despite still appearing in the
list endpoint. Used `gemini-flash-latest` instead — an alias Google
maintains to always point at their current recommended flash model —
specifically to avoid hitting this same deprecation issue again later.

### Expected Benefits

- API key never reaches the browser; verified by testing the full
  request path (browser → Vite proxy → Express → Gemini → response)
  end to end with a real key, not just reading the code.
- Using a "latest" model alias instead of a pinned version trades a
  small amount of reproducibility for not silently breaking again the
  next time Google deprecates a specific model snapshot.
- Backend and frontend concerns stay separated (`server/` vs `src/`),
  consistent with the project not wanting AI/API logic mixed into
  React components.

---

# 2026-07-26

## Decision

Give the chat real persona, user context, and conversation memory,
instead of a stateless pass-through to generic Gemini.

### Reason

The backend previously sent each message alone, with no system
instruction, no user data, and no prior turns — functionally
identical to using Gemini directly, which defeats the purpose of the
app. Three pieces were added together, since none of them alone would
make the chat feel like "the user's coach":

- **Persona** (`src/services/promptBuilder.ts`) — each of the 5
  coaches' character sheets (already defined in `01_PRODUCT_VISION.md`)
  became a system instruction, so the model actually role-plays the
  chosen personality instead of answering as itself.
- **User context** — daily calories/macros/diet style/hormone status/
  training routine (all already collected in onboarding) are injected
  into the system instruction, so the coach can reference the user's
  actual numbers instead of generic advice.
- **Conversation memory** — the frontend now sends the full text
  message history with each request; the backend stays stateless (no
  server-side session storage), matching HTTP's request/response model
  and avoiding the need for session IDs or a database this early.

The Ethical Guardrails (informational not diagnostic, honesty
dependency, no persona overriding safety) were folded directly into
the system instruction, not left as documentation the model never
sees.

Image and audio messages are not yet sent to the model — only text
history. Multimodal analysis is future work (still Version 0.4's "AI
meal analysis" item).

### Expected Benefits

- Verified end-to-end with real requests: a persona test (Old School)
  produced correctly in-character vocabulary, and a memory test (name
  + workout mentioned two turns earlier) was recalled correctly.
- Ethical guardrails are enforced at generation time, not just
  documented — the model is told the same rules on every request.
- Backend stays a thin, stateless proxy; no new infrastructure
  (sessions, database) needed to get real conversational behavior.

---

# 2026-07-26

## Decision

Add a development-only profile picker (`src/screens/ProfilePickerScreen.tsx`)
backed by `localStorage`, gated behind `import.meta.env.DEV` so it never
renders in a production build.

### Reason

The app currently has no persistence at all — a refresh loses the
entire onboarding and chat session, which was already a known,
deliberately-deferred gap (real login/auth). Testing different user
scenarios (natural athlete, hormone user, cutting vs. bulking, etc.)
meant redoing the full onboarding flow every time, which slows down
development. A `localStorage`-backed picker (name a profile, continue
it later, delete it) solves the development friction without building
real authentication — it's explicitly a dev tool, not a product
feature, so it's gated out of production rather than shipped as a
half-built login system.

Scope for this pass: onboarding data + selected coach are saved when
a new profile reaches the nutrition result screen. Chat transcripts
are not persisted yet — every profile still starts its conversation
fresh. That's a natural, separate follow-up if needed.

### Expected Benefits

- Removes the "redo onboarding every time" friction during
  development without pretending to be real user accounts.
- `import.meta.env.DEV` gating means there's no manual step to
  remember before shipping — a production build cannot reach this
  screen (verified: `devPickerResolved` initializes to `true` when
  `DEV` is `false`, so the picker branch never renders).
- Known limitation: the component's code still ships inside the
  production JS bundle (Vite didn't tree-shake the unused branch),
  even though it's unreachable at runtime. Acceptable bundle-size
  cost for now; not worth lazy-loading complexity at this stage.

---

# 2026-07-26

## Decision

Collect the user's name and, when training is on a fixed schedule,
a brief days/times description. Have the AI open the chat
proactively with a greeting instead of waiting for the first user
message.

### Reason

The coach referring to the user by name and knowing their actual
workout schedule was part of the original product intent but hadn't
been captured anywhere. Name also replaced the separate "profile
label" the dev-only profile picker was asking for — one input instead
of two, since the picker was clearly asking for the same kind of
information a moment later.

The chat previously stayed empty until the user typed first, which
doesn't match the documented Diet Personalization script (greeting,
honesty ask, meal proposal). Implemented as a hidden kickoff request:
on first mount, the frontend sends an internal instruction prompting
the model to open per that script, and only the model's reply is
shown — the instruction itself never appears as a fake "user" bubble.

### Expected Benefits

- Verified end-to-end: a kickoff request with a full profile produced
  a greeting by name, an explanation of logging channels, an honesty
  ask, a same-day meal plan, and weekly guidance — matching the
  documented script, not just resembling it.
- One onboarding question (name) now serves both the product (coach
  addressing the user) and the dev tool (profile label), instead of
  asking twice for overlapping information.
- Renamed `.number-form`/`.number-input` to `.field-form`/`.field-input`
  in `App.css` while adding the two new text screens, since those
  classes are no longer numeric-only (Name and the training schedule
  description are plain text).

---

# 2026-07-26

## Decision

Split the AI's kickoff reply into multiple chat bubbles instead of one
block, using a delimiter the model is instructed to emit, split
client-side in `sendToModel`.

### Reason

A single long AI reply doesn't read like a conversation — real chat
apps (and people) send several shorter messages instead of one wall
of text. The kickoff prompt now asks for exactly 4 parts (short
greeting, logging/honesty explanation, today's meal plan as a topic
list, weekly guidance + question) separated by a `|||` marker on its
own line; the frontend splits on that marker, trims each part, and
posts them as separate bubbles with a small delay between them. This
is implemented generically in `sendToModel`, not special-cased to the
kickoff, so any future reply that uses the same marker convention
splits the same way.

While testing this, found that `.chat-bubble` had no `white-space`
rule — browsers collapse newlines in plain HTML text by default, so
the requested "topics/list" formatting for the meal plan would have
silently collapsed into one run-on paragraph. Added
`white-space: pre-wrap` to fix it before calling this done.

### Expected Benefits

- Verified end-to-end: a real request produced exactly 4 correctly
  split parts, with the meal plan properly formatted as a bulleted
  list per meal.
- Caught and fixed a rendering bug (collapsed newlines) that would
  have quietly undermined the very formatting being requested, before
  reporting the feature as working.

---

# 2026-07-26

## Decision

Add water-pacing guidance, meal-plan iteration behavior, and a
default meal structure to the system instruction: the AI now tells
users to spread their daily water target across the day (~every 2
hours, not large sittings), regenerates the meal plan with specific
times once the user shares their schedule, defaults to ~5 meals
(especially for bulking) including a late supper, and makes the
post-workout meal noticeably protein-rich.

### Reason

Several real gaps: the first diet proposal never stated it was a
flexible draft, water guidance stopped at a daily liter target with
no pacing advice, and meal count/post-workout composition weren't
governed by any explicit rule — the first test happened to produce 5
meals with a protein-forward post-workout dinner, but that was the
model's own judgment, not something the app guaranteed. On water
pacing specifically: the kidneys can generally process roughly ~1
liter of water per hour under normal conditions, so drinking a
multi-liter target in a couple of sittings is a real (if usually
mild) risk, not just a comfort issue. All of this was written into
the system instruction as practical guidance (~every 2 hours for
water; ~5 meals including a "ceia" for bulking; protein-forward
post-workout), not rigid medical prescriptions — consistent with the
Ethical Guardrails.

### Expected Benefits

- Verified end-to-end with a two-turn conversation (kickoff, then a
  simulated reply with meal times and a training slot): the second
  response correctly assigned times to each meal, adapted
  pre/post-workout nutrition (more carbs post-training for glycogen
  replenishment), built a paced water schedule in ~500ml increments
  every ~2 hours, and closed by asking for confirmation — matching
  the requested behavior without any additional client-side logic,
  since it's entirely prompt-driven and the model already has
  conversation memory.

---

# 2026-07-26

## Decision

Implement the already-documented Estimation Precision fallback (exact
grams → visual/volumetric description → average estimate) as actual
chat behavior, not just a product-vision paragraph nobody enforces.

### Reason

The AI was giving meal recommendations in grams with no discussion of
how the user should report back without a kitchen scale. Added a rule
to the system instruction: weighing is ideal when possible, but
visual/volumetric descriptions (a full ladle, spoons, a cupped hand)
are accepted as valid input, compared against the recommended target,
and the user is told whether they landed close or far — without being
made to feel bad for not having a scale. The kickoff message now
mentions this upfront so the user knows from the start they don't
need a scale.

### Expected Benefits

- Verified end-to-end: given a lunch recommendation in grams and a
  reply using only visual measures ("uma concha cheia", "7 colheres
  de sopa", "do tamanho da palma da mão"), the AI compared each item
  individually against target, gave a reasonable gram conversion, and
  suggested compensating later in the day instead of just flagging a
  shortfall — matching both this request and the earlier
  no-shame-for-honesty guardrail.
- Closes a real gap between what `01_PRODUCT_VISION.md` already
  promised (Estimation Precision) and what the app actually did.

---

# 2026-07-26

## Decision

Have the AI ask about kitchen scale availability (all day vs.
only at home/certain times) and proactively write meals in
visual/volumetric measures instead of grams when the user won't have
scale access for that meal — e.g. lunch at a university cafeteria.

### Reason

The previous behavior only reacted after the fact: give grams, then
translate if the user reported back without a scale. That still left
the user holding a gram target they had no way to check in the
moment. Asking about scale availability upfront (added to the
kickoff's second message) lets the AI write meals the user can't
weigh directly in visual terms from the start, while meals at home
with scale access stay in grams — the recommendation matches the
user's actual situation for that meal, not a generic default.

### Expected Benefits

- Verified end-to-end: given "only have a scale at home in the
  evening, lunch is at the university restaurant," the regenerated
  plan kept breakfast and dinner in grams and converted only the
  lunch entry to visual measures (escumadeira, concha, palma da mão)
  — the split applied per meal, not to the whole day.

---

# 2026-07-26

## Decision

Send photo and audio messages to the model as inline base64 data
(not just display them locally), and have the AI emit a structured
`NUTRITION_DATA:{...}` line after any message that logs a meal,
parsed client-side and accumulated into a running daily total shown
in the chat header.

### Reason

This was the core gap in Version 0.4: the chat could talk about
nutrition, but the app had no actual record of what was eaten. Two
changes closed it:

- `chatService.ts` was refactored to build `contents` from the full
  message list (not `history` + a separate string), converting each
  `ChatMessage` into a Gemini `Part` — `text` for text messages,
  `inlineData` (base64 + MIME type) for image/audio. `ChatMessage`'s
  image/audio variants now carry that base64 data alongside the local
  object URL used for display.
- Rather than a second API call with a JSON response schema, the
  model appends one delimited line to its normal reply when (and only
  when) the user logged a specific meal. `nutritionExtractor.ts`
  pulls that line out via regex, parses it, strips it from what the
  user sees, and the entry is added to `dailyTotals` state. One
  request per message, no extra round-trip.

### Expected Benefits

- Verified end to end: a text meal log produced valid, parseable
  `NUTRITION_DATA` JSON; a real image sent as `inlineData` was
  correctly analyzed by Gemini (confirmed with a non-food test image,
  proving the plumbing rather than analysis quality); a WAV test tone
  sent as `inlineData` was correctly described, confirming the audio
  pathway works in principle.
- Known open risk, not yet resolved: `MediaRecorder`'s actual browser
  output format (commonly `audio/webm` with an Opus codec) was not
  tested against Gemini — only a synthetic WAV file was. The code now
  sends whatever MIME type the browser actually reports
  (`recorder.mimeType`) instead of a hardcoded guess, but whether
  Gemini accepts that specific format needs a real in-browser
  recording to confirm.
- Daily totals reset per chat session (no persistence yet), matching
  the project's existing, already-documented decision to defer real
  accounts/persistence.

### Follow-up fix (same day)

Real browser audio testing immediately hit a bug: Express's default
JSON body limit is 100kb, and a base64-encoded audio clip blows past
that easily (base64 adds ~33% on top of the raw bytes). The error
surfaced generically as "couldn't reply right now" — the real cause
was only visible in the backend log (`PayloadTooLargeError`), not in
the browser. Raised the limit to 25mb in `server/index.js`. Verified
by sending a 400KB payload directly: it now reaches Gemini (which
correctly rejects the dummy test data with its own error) instead of
being rejected by Express before that point.

This was not a Gemini/audio-format problem, which is what the earlier
`gemini-flash-latest`-adjacent testing might have suggested — worth
recording so it isn't re-investigated as a codec issue if it recurs
in a different form (e.g. a still-too-small limit for longer
recordings).

---

# 2026-07-26

## Decision

Switch the backend's model from `gemini-flash-latest` to
`gemini-flash-lite-latest`.

### Reason

`gemini-flash-latest` currently resolves to `gemini-3.6-flash`, whose
free tier only allows 20 requests **per day** — exhausted after normal
testing, and every subsequent chat message failed with a generic
"couldn't reply right now" in the UI while the backend log showed the
real cause: `429 RESOURCE_EXHAUSTED`. The "latest" alias was chosen
earlier specifically to dodge model deprecation (see the
`gemini-2.5-flash` incident), but it doesn't protect against landing
on a model with an unexpectedly tight free-tier quota. `flash-lite`
variants are Google's lower-cost/higher-quota tier, so switching to
`gemini-flash-lite-latest` keeps the same "alias, not a pinned
version" reasoning while (expected to) avoid this specific problem.

### Expected Benefits

- Verified with a single lightweight request after switching — got a
  clean reply with nothing in the error log, confirming the fix
  without burning more of the already-exhausted quota on the old
  model.
- If a "couldn't reply right now" message reappears, checking the
  backend log (not just the browser) for a `429`/quota message is now
  a known first step, not a re-investigation.

---

# 2026-07-26

## Decision

Add an optional "basal metabolic rate" onboarding question, and use
it in place of the Mifflin-St Jeor formula estimate whenever the user
provides one.

### Reason

Bioimpedance scales (pharmacy, gym, or home models) commonly report
an estimated BMR alongside body fat percentage — already an optional
onboarding field. That measured value factors in actual body
composition, not just total weight, making it more accurate than the
formula this app already uses. Same optional/skippable pattern as
body fat percentage, placed right after it since it's the same
category of "optional biometric data from a device."

### Expected Benefits

- Verified: with a measured BMR of 1900 kcal (vs. ~1749 kcal the
  formula would have produced for the same profile), the daily
  calorie target changed accordingly (2945 vs. 2711 kcal) — confirming
  the override takes effect rather than being silently ignored.
- The system prompt now tells the AI when a measured BMR is in use, so
  it can reference that directly instead of assuming a formula.

---

# 2026-07-26

## Decision

Implement the three-level feedback system (green/yellow/red) by
having the model self-report a `FEEDBACK_LEVEL` line alongside
`NUTRITION_DATA`, rather than computing it deterministically from
`dailyTotals` vs. targets in app code.

### Reason

A rule computed purely from accumulated totals vs. daily targets
can't judge pacing without knowing the time of day and what's been
logged so far — being at 30% of the calorie target reads very
differently at 9am than at 8pm. The model already has that context
(conversation history, meal times, training schedule) and is already
trusted to reason about pacing elsewhere (meal plan iteration, water
scheduling), so the same self-reported-label pattern used for
`NUTRITION_DATA` was extended here instead of building a separate,
context-blind heuristic.

`FeedbackLevel` was added as its own type (`types/feedback.ts`) rather
than defined inside `feedbackExtractor.ts`, to keep `types/` free of
a dependency on `services/` — `ChatMessage` (a type) needed the same
type that the service produces, and types shouldn't import from
services.

### Expected Benefits

- Verified with a real request: logging a single weak snack ("só uma
  coxinha") produced `FEEDBACK_LEVEL:red` together with a reply
  already delivering that reaction in the Old School persona's own
  voice — confirming the level and the tone stay consistent with each
  other, since they come from the same generation.
- Closes both remaining checklist items at once: Version 0.4's
  three-level feedback system, and Version 0.5's personality-specific
  responses per feedback level — they were really the same mechanism
  once personas already existed.

---

# 2026-07-26

## Decision

Replace the single `dailyTotals` accumulator with a dated
`nutritionLog: NutritionLogEntry[]` (each logged meal keeps its own
timestamp), and derive "today's totals" by filtering that log rather
than tracking a running sum.

### Reason

This was a known, explicitly-documented limitation from when
persistence was added: `dailyTotals` accumulated forever across the
whole persisted session instead of resetting per calendar day, and
because it was a single summed number, the per-meal detail needed for
weekly/monthly aggregation or charts was already gone by the time it
got stored. Keeping every entry with its own timestamp fixes both
problems at once: "today" becomes a filter (`getTotalsForDay`, in the
new `services/nutritionLog.ts`), and the full history stays available
for whatever aggregation Version 1.0's Evolution Tracking ends up
needing — nothing has to be re-collected later.

`isSameDay` moved out of `ChatScreen.tsx` into `utils/date.ts` — the
first file in the `utils/` folder the architecture doc already
described but that had never actually been used until now. Both the
date-divider logic and `getTotalsForDay` needed the same day-comparison
check, so duplicating it in two places wasn't justified.

### Expected Benefits

- Verified in isolation: a log with 2 entries from yesterday and 1
  from today correctly separates into yesterday's combined total
  (1100 kcal) vs. today's total (400 kcal) — confirming the header no
  longer conflates days.
- Chart/graph work (explicitly deferred, per the user's choice, to a
  separate increment) now has the actual data shape it needs already
  in place, instead of needing another storage migration first.

---

# 2026-07-26

## Decision

Add an Evolution screen (`src/screens/EvolutionScreen.tsx`) with two
small bar charts (calories, protein, last 7 days), following the
`dataviz` skill's procedure: form before color, status color
reserved for a small marker rather than the bar fill, a legend +
native tooltip + table-view toggle so nothing is color-only, and two
separate charts instead of one dual-axis chart.

### Reason

Calories and protein are different scales, so combining them on one
axis was rejected up front (the skill's #1 anti-pattern). Running the
palette validator on the app's existing status colors
(green/yellow/red, already used for chat feedback dots) showed a real
problem: filling whole bars with them would fail contrast in light
mode (yellow at 1.47:1). Moving status to a small 8px dot on top of a
neutrally-colored bar — exactly the "saturated fills are for small
marks and accents, never large blocks" rule — sidesteps that
entirely, and reuses a mark already established in the chat UI.

Per-day status is computed differently from the live chat feedback
level: a day that's still in progress (today) or has no logged
entries gets no status at all, rather than a misleading judgment —
you can't fairly grade an unfinished day, and an unlogged day isn't
necessarily a day the user ate nothing.

### Expected Benefits

- Verified the chart's data logic in isolation with a mixed week
  (a green day, a red day, two no-data days, and today in progress) —
  statuses came out as expected, including the two cases that must
  NOT get a color (no data, still in progress).
- Caught and fixed a real layout bug before shipping it: the initial
  fixed-height chart container excluded the day-label row (the exact
  "container height excludes the x-axis band" anti-pattern) — split
  into a fixed-height plot area and a separate auto-height label row.
- Could not visually screenshot the result (no headless browser
  available in this environment) — logic and build are verified, but
  visual geometry/collisions still need a real look in-browser, per
  the skill's own last step ("render it and look at it").

---

# 2026-07-26

## Decision

Add a retry button on failed replies, and a `CORRECTION:remove_last`
mechanism so the AI can undo the most recently logged nutrition entry
when the user says it was wrong or duplicated.

### Reason

Two distinct bugs, reported together but different in cause:

- **Retry:** a failed request (network/quota/etc.) showed a generic
  "couldn't reply right now" with no way to resend without retyping.
  Added a retry button on that specific message, backed by a ref
  holding the exact message list from the failed attempt.
- **Counter never shrinking:** confirmed this was never a "failed
  request" problem — a failed `sendChatMessage` call never reaches
  the nutrition-extraction code at all, so errors were never the
  cause. The real bug: the AI had no way to say "undo the last
  entry," so every time the user said "you already logged that" or
  "that was a mistake, fix it," the model's only available move was
  emitting *another* `NUTRITION_DATA` line — silently doubling (then
  tripling) the counter instead of correcting it. The user's own
  pasted transcript confirmed this exactly: the AI said "corrigido,
  contador limpo" while actually adding a second entry on top of the
  first.

### Expected Benefits

- Verified with the user's own reported scenario: told the model a
  meal was logged twice by mistake and asked for a fix. It correctly
  emitted `CORRECTION:remove_last` with no new `NUTRITION_DATA` (the
  right amount was already logged, only the duplicate needed
  removing) — confirming the pop-without-re-adding path works, not
  just the pop-and-replace path tested earlier in isolation.
- Test sessions from before this fix still carry inflated totals in
  their saved `nutritionLog` (dev profiles / local session) — those
  aren't retroactively repaired; only logging from this point on
  behaves correctly.

---

# 2026-07-27

## Decision

Integrate with the sibling Bandejão Tracker project so the coach can
ground meal estimates in Unicamp's actual bandejão (RU) menu, instead
of guessing generically when a user says they ate there.

### Reason

Many Unicamp students eat at the RU rather than cooking, and without
knowing what was actually on offer that day, the coach could only
guess at a bandejão meal's composition the same way it would for any
unphotographed food — far less accurate than it could be, given the
menu is public information. Rather than duplicating menu-tracking
logic inside this app, it reuses the separate Bandejao Tracker project
(which already publishes the daily cardápio) through a thin Vite dev
proxy (`/bandejao` → `http://localhost:3002`, mirroring the existing
`/api` → backend proxy pattern), keeping menu ownership in one place.

The chat asks whether the user is a bandejão user exactly once, early
in the conversation, via the same self-reported-marker pattern used
elsewhere (`BANDEJAO_USER:yes|no`, extracted by
`bandejaoUserExtractor.ts`); the answer is persisted on the profile/
session (`bandejaoUser`) so it's never asked twice. If the Bandejao
Tracker service is unreachable or returns an error,
`bandejaoService.ts` returns `null` and the coach simply proceeds
without RU context rather than breaking the conversation — this app
must keep working even when that sibling service isn't running.

### Expected Benefits

- Meal estimates for bandejão users are grounded in the actual dishes
  offered that day (including the vegan lunch/dinner alternatives)
  instead of a generic guess.
- No duplicated menu-tracking logic — the Bandejao Tracker project
  stays the single source of truth for the daily cardápio.
- Graceful degradation matches the existing pattern for optional
  external dependencies in this app (see the Gemini backend proxy
  decision) — an unavailable dependency degrades a feature, it doesn't
  break the app.

---

# 2026-07-27

## Decision

Make calorie/macro targets track the user's most recently *logged*
weight (and, when reported, a refreshed measured BMR) instead of the
value captured once at onboarding. Add a concrete, 14-day data-driven
trigger for the coach to proactively ask for a new weigh-in, and have
the app itself (not the model) post a message with the recalculated
numbers whenever a new weight is logged.

### Reason

A real gap surfaced while discussing the app's fit for hormone-using
bodybuilders in a bulk (a scenario where meaningful weight change over
weeks is the point, not an edge case): the app already logged
weigh-ins (`weightLog`, shown on the Evolution screen) and even
displayed the latest one in the system prompt's health-history
context, but the actual calorie/protein/carb/fat/water targets were
still computed from `profile.weight` — the value from onboarding,
frozen for the life of the profile. Someone who gained real weight
over a cycle would keep seeing targets sized for their old body,
silently, with no error and no obvious symptom short of noticing the
numbers hadn't moved.

A new `getEffectiveProfile` helper (`services/weightLog.ts`) resolves
the weight to use for calculation from the latest logged entry
(falling back to the onboarding value if none exists), and does the
same for measured BMR — looking back through the log for the most
recent entry that actually included one, since a plain weigh-in
doesn't always carry a fresh BMR reading, so a later plain scale
update can't silently erase a previously reported measured value.
Both `ChatScreen.tsx` (on-screen counters) and `promptBuilder.ts` (the
system prompt) now compute targets from this effective profile instead
of the raw one, so the displayed numbers and what the coach reasons
from never diverge. Because protein and water were already computed
per kg of body weight, this recalculation scales those too, not just
calories.

The existing "weigh-in cadence" guidance was a soft, undated nudge
("mention this lightly and occasionally") with no actual signal behind
it. The system prompt now computes `daysSinceLastWeighIn` (from the
last logged entry, or from the conversation's first message if none
was ever logged) and instructs the coach to proactively bring it up,
in its own words, once that reaches 14 days — suggesting a monthly
bioimpedance check specifically when that's the more relevant cadence,
per the product's existing weekly-weight/monthly-bioimpedance
distinction.

Finally, a recalculation should never happen silently. Whenever a
`WEIGHT_DATA` entry is captured, `ChatScreen.tsx` now appends its own
chat message stating the newly recalculated targets, computed by the
app's own calculator rather than left to the model's prose — the same
"ground truth is app-computed, not model arithmetic" principle already
used for `NUTRITION_DATA` and the health-history context block.

### Expected Benefits

- Targets never silently go stale as the user's weight (or measured
  BMR) changes over the course of a diet or bulk — the exact gap that
  prompted this change.
- The 14-day reminder is a concrete, testable trigger instead of a
  vague "ask occasionally" instruction with nothing behind it.
- The user is always told, in plain numbers, exactly when and why
  their targets changed, instead of the counters just quietly shifting
  underneath them.
- Verified with `tsc --noEmit` and `npm run lint`; a live end-to-end
  check (logging a new weight in the running app and confirming the
  on-screen counters and the new chat message agree) is still
  outstanding, per this project's existing convention of verifying
  behavior in the running app before calling a change fully done.

---

# Future Decisions

This section should be continuously updated as the project evolves.

Examples:

- Theme selection.
- Backend/proxy strategy to keep the Gemini API key off the client
  (required before any AI integration work starts).
- Authentication strategy.
- Database selection.
- Mobile architecture.
- Deployment strategy.
- Apple Health integration.