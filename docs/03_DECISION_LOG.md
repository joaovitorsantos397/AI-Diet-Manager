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

# Future Decisions

This section should be continuously updated as the project evolves.

Examples:

- Theme selection.
- AI provider.
- Authentication strategy.
- Database selection.
- Mobile architecture.
- Deployment strategy.
- Apple Health integration.