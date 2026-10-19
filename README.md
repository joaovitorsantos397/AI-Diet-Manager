# AI Diet Manager

An AI-assisted nutrition application designed to provide personalized dietary guidance through a clean, scalable and user-centered experience.

This project is currently being developed as a **Minimum Viable Product (MVP)**, built as a personal technical portfolio project.

---

# Overview

A conversational AI nutrition coach, not just a calorie tracker. Five coach personalities, meal logging by text, photo or audio (Gemini vision and transcription), and progress tracking (calories, protein, weight, adherence streaks). User data is stored locally in the browser. A small Node/Express server keeps the Gemini API key out of the frontend and proxies the chat requests.

---

# Project Goals

The project has two primary objectives:

- Build a functional AI-powered nutrition application.
- Demonstrate software engineering, product thinking and architectural decision-making throughout the development process.

Rather than focusing solely on implementation, the project emphasizes maintainability, documentation and long-term scalability.

---

# Features (Current MVP)

Current implementation includes:

- Conversational AI nutrition coach with five coach personalities
- Meal logging by text, photo or audio (Gemini vision and transcription)
- Progress tracking (calories, protein, weight, adherence streaks)
- Totals computed by the app and passed to the model as context, to avoid hallucinated or double-counted numbers
- Meal corrections (undo the last meal, undo a specific earlier item, or clear the day) via typed Gemini function calls, not free-text parsing
- React + TypeScript architecture
- Language selection
- Automated test suite (Vitest) for the calorie/macro math and meal-correction logic
- Dockerized backend with a CI pipeline (lint, build, test on every push/PR)
- Modular project structure
- Technical documentation
- Product documentation
- Decision log
- Roadmap

Additional features will be implemented incrementally.

---

# Technology Stack

Frontend

- React
- TypeScript
- Vite

Backend

- Node.js
- Express
- Gemini API

Testing & Infrastructure

- Vitest
- Docker / Docker Compose
- GitHub Actions (CI)

Development

- Node.js
- npm
- Git
- GitHub
- VS Code

Future

- Database
- Authentication
- Apple Health Integration

---

# Project Structure

```
AI-Diet-Manager/

├── docs/
├── legacy/
├── public/
├── server/
├── src/
├── README.md
└── package.json
```

---

# Documentation

Detailed documentation is available in the `docs/` directory.

| File                    | Description                            |
| ----------------------- | -------------------------------------- |
| 00\_PROJECT\_CONTEXT.md | General project overview               |
| 01\_PRODUCT\_VISION.md  | Product vision                         |
| 02\_ARCHITECTURE.md     | Technical architecture                 |
| 03\_DECISION\_LOG.md    | Engineering decisions                  |
| 04\_ROADMAP.md          | Project roadmap                        |
| 05\_PROJECT\_FAQ.md     | Project FAQ and retrospective          |
| 06\_DESIGN\_SYSTEM.md   | Visual and interaction design language |

99\_AI\_CONTEXT.md is planned but not written yet — see 04\_ROADMAP.md.

---

# Development Philosophy

This project follows several engineering principles:

- Incremental development
- Clean architecture
- Separation of concerns
- Reusable components
- Product-first thinking
- Continuous documentation

Every significant engineering decision is documented to preserve the reasoning behind the implementation.

---

# Running the Project

Install dependencies:

```
npm install
```

Create a `.env` file (see `.env.example`) with your own Gemini API key
(free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)):

```
GEMINI_API_KEY=your-key-here
```

Start the backend (holds the API key, proxies chat requests):

```
npm run server
```

In a second terminal, start the frontend:

```
npm run dev
```

Both need to be running for the chat to work. The frontend alone
will load, but AI replies require the backend.

Build for production:

```
npm run build
```

Run the test suite:

```
npm test
```

## Running the backend with Docker

As an alternative to `npm run server`, the backend can run in a
container (frontend still runs separately with `npm run dev`):

```
GEMINI_API_KEY=your-key-here docker compose up --build
```

This exposes the API on `http://localhost:3001`, with `GET /health`
for a quick liveness check.

---

# Known Issues

- **Audio transcription is currently broken.** The chat endpoint's
  response shape changed (`{ text, functionCalls}` instead of a plain
  `{ reply }`) when it was migrated to Gemini function calling, and
  `transcriptionService.ts` was never updated to match — it always
  reads `undefined` and the user sees a generic "couldn't transcribe"
  message. Logging via text or photo is unaffected. See
  `docs/03_DECISION_LOG.md` (2026-10-19) for details; left unfixed for
  now to prioritize test/Docker/CI coverage.

---

# Future Roadmap

Planned features include:

- User registration
- Meal planning
- Dashboard
- Food recognition
- Apple Health integration
- Personalized recommendations

---

# License

All rights reserved. This repository is public for portfolio and
evaluation purposes only; see [LICENSE](https://github.com/joaovitorsantos397/AI-Diet-Manager/blob/main/LICENSE) for details. No
permission is granted to reuse, redistribute, or sell this code.

---

# Author

Developed as part of a personal software engineering and product development journey, with the goal of creating a scalable AI-powered nutrition application.
