# AI Diet Manager

An AI-assisted nutrition application designed to provide personalized dietary guidance through a clean, scalable and user-centered experience.

This project is currently being developed as a **Minimum Viable Product (MVP)**, built as a personal technical portfolio project.

---

# Overview

A conversational AI nutrition coach, not just a calorie tracker. Five coach personalities, meal logging by text, and progress tracking. The model triggers typed function calls (log or remove a meal) instead of writing numbers as free text. User data is stored locally in the browser. A small Node/Express server keeps the Gemini API key out of the frontend and proxies the chat requests. A SQL-backed REST API for meals (SQLite) also exists on the server, but the interface does not use it yet.

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
- Meal logging by text
- Progress tracking (calories, protein, weight, adherence streaks)
- Totals computed by the app and passed to the model as context, to avoid hallucinated or double-counted numbers
- Meal corrections (undo the last meal, undo a specific earlier item, or clear the day) via typed Gemini function calls, not free-text parsing
- React + TypeScript architecture
- Language selection
- Automated test suite (Vitest) for the calorie/macro math and meal-correction logic
- Dockerfile and docker-compose for the backend (image build not yet validated)
- CI pipeline (lint, build, test on every push/PR)
- SQL-backed REST API for meal logging (SQLite via `node:sqlite`), not yet wired into the UI; see `docs/DATABASE.md`
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
- SQLite (`node:sqlite`)

Development

- Node.js
- npm
- Git
- GitHub
- VS Code

Future

- UI integration with the SQL API
- Authentication
- Apple Health Integration

---

# Project Structure

```
AI-Diet-Manager/

├── .github/workflows/
├── docs/
├── legacy/
├── public/
├── scripts/
├── server/
├── src/
├── Dockerfile
├── docker-compose.yml
├── README.md
└── package.json
```

---

# Documentation

Detailed documentation is available in the `docs/` directory.

| File                    | Description                                 |
| ----------------------- | ------------------------------------------- |
| 00\_PROJECT\_CONTEXT.md | General project overview                    |
| 01\_PRODUCT\_VISION.md  | Product vision                              |
| 02\_ARCHITECTURE.md     | Technical architecture                      |
| 03\_DECISION\_LOG.md    | Engineering decisions                       |
| 04\_ROADMAP.md          | Project roadmap                             |
| 05\_PROJECT\_FAQ.md     | Project FAQ and retrospective               |
| 06\_DESIGN\_SYSTEM.md   | Visual and interaction design language      |
| DATABASE.md             | SQL schema, query explanations, limitations |

99\_AI\_CONTEXT.md is planned but not written yet; see 04\_ROADMAP.md.

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
container (frontend still runs separately with `npm run dev`). The
image build has not been validated yet:

```
GEMINI_API_KEY=your-key-here docker compose up --build
```

This exposes the API on `http://localhost:3001`, with `GET /health`
for a quick liveness check.

---

# API

A small SQL-backed REST API for meal logging lives alongside the chat
proxy (see `docs/DATABASE.md` for the schema and query details). It
has no UI consumer yet: the app itself still uses localStorage, and
this API is tested and usable on its own. `profile_id` comes from the
`X-Profile-Id` header (defaults to `default`).

```
# Log a meal (one group with its items)
curl -X POST http://localhost:3001/api/meals \
  -H "Content-Type: application/json" \
  -H "X-Profile-Id: joao" \
  -d '{
    "eatenAt": "2026-10-19T12:00:00Z",
    "description": "Lunch",
    "items": [
      { "name": "Rice", "kcal": 200, "proteinG": 4, "carbsG": 45, "fatG": 0 },
      { "name": "Chicken", "kcal": 250, "proteinG": 40, "carbsG": 0, "fatG": 8 }
    ]
  }'

# List meals for a day
curl "http://localhost:3001/api/meals?date=2026-10-19" -H "X-Profile-Id: joao"

# Totals for a day, or for a date range (one row per day)
curl "http://localhost:3001/api/totals?date=2026-10-19" -H "X-Profile-Id: joao"
curl "http://localhost:3001/api/totals?from=2026-10-13&to=2026-10-19" -H "X-Profile-Id: joao"

# Undo the last logged meal (whole group, not one item)
curl -X DELETE http://localhost:3001/api/meals/last -H "X-Profile-Id: joao"

# Clear everything logged on a day
curl -X DELETE "http://localhost:3001/api/meals?date=2026-10-19" -H "X-Profile-Id: joao"
```

## Database demo

`scripts/demo-db.mjs` logs a breakfast (2 items) and a lunch (3 items),
lists and totals the day, shows totals by date range, removes the last
meal and confirms that the lunch's 3 items disappear with it
(`ON DELETE CASCADE`), then totals again to show the difference. The
server still requires `GEMINI_API_KEY` in `.env` to start, even though
this demo does not use AI.

**Windows (PowerShell)**, in one terminal:

```powershell
$env:DB_PATH = ".\data\demo.db"; npm run server
```

In another terminal:

```powershell
npm run demo:db
```

To run it again from scratch:

```powershell
Remove-Item .\data\demo.db
```

**Linux/macOS**, in one terminal:

```bash
DB_PATH=./data/demo.db npm run server
```

In another terminal:

```bash
npm run demo:db
```

To run it again from scratch:

```bash
rm ./data/demo.db
```

Expected result (run and checked on 2026-10-19): breakfast and lunch
logged (820 kcal / 58 g protein for the day); totals by range with a
single row, `2026-10-19`; after removing the last meal, the day's list
shows only the breakfast (the lunch and its 3 items are gone together);
and the totals drop to exactly what the breakfast was worth
(240 kcal / 6 g protein).

---

# Known Issues

- **Audio transcription is currently broken.** The chat endpoint's
  response shape changed (`{ text, functionCalls }` instead of a plain
  `{ reply }`) when it was migrated to Gemini function calling, and
  `transcriptionService.ts` was never updated to match; it always
  reads `undefined` and the user sees a generic "couldn't transcribe"
  message. Text logging is unaffected. See
  `docs/03_DECISION_LOG.md` (2026-10-19) for details; left unfixed for
  now to prioritize test/Docker/CI coverage.
- **The SQL API is not wired into the UI.** The interface still reads
  and writes localStorage; the API is tested and usable on its own
  (see the API section).
- **The Docker image build has not been validated.** The Dockerfile and
  docker-compose file exist, but the image has not been built end to end.

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
