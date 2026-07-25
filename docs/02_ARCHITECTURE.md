# AI Diet Manager

## Architecture

### Overview

The project follows a modular architecture designed to keep the application simple during the MVP stage while allowing future scalability.

The architecture prioritizes:

- readability;
- maintainability;
- component reuse;
- separation of responsibilities.

---

# Current Stack

Frontend

- React
- TypeScript
- Vite

Development

- VS Code
- npm
- Git
- GitHub

---

# Current Application Flow

```text
Browser

↓

index.html

↓

main.tsx

↓

App.tsx

↓

React Components

↓

Services

↓

Future APIs / Database
```

The application currently starts from `main.tsx`, which mounts the root React component (`App.tsx`).

As the project grows, `App.tsx` will become responsible only for application composition, while business logic will be distributed into reusable components and services.

---

# Planned Folder Structure

```text
src/

├── assets/
├── components/
├── screens/
├── services/
├── styles/
├── types/
├── utils/
│
├── App.tsx
├── main.tsx
└── index.css
```

---

# Responsibilities

## assets/

Images, icons and static resources.

---

## components/

Reusable UI components.

Examples:

- Button
- Card
- LanguageSelector
- NavigationBar
- CoachAvatar

---

## screens/

Application pages.

Examples:

- Welcome
- Language Selection
- User Registration
- Dashboard
- Coach Chat
- Settings

---

## services/

Business logic.

Future examples:

- AI Service
- Authentication
- Nutrition calculations
- API communication

---

## styles/

Global styling.

Contains:

- theme
- colors
- typography
- spacing

---

## types/

Shared TypeScript interfaces.

---

## utils/

Utility functions.

Examples:

- date formatting
- unit conversions
- helper functions

---

# Design Principles

The project follows these architectural principles:

- Single Responsibility
- Reusable Components
- Separation of Concerns
- Scalability
- Readability over cleverness

---

# Current Status

Current implementation is intentionally simple.

As new features are added, responsibilities will gradually move from App.tsx into dedicated components.

This incremental evolution avoids premature complexity while keeping the architecture prepared for future growth.