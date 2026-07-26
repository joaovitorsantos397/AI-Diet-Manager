# AI Diet Manager

An AI-assisted nutrition application designed to provide personalized dietary guidance through a clean, scalable and user-centered experience.

This project is currently being developed as a **Minimum Viable Product (MVP)**, built as a personal technical portfolio project.

---

# Project Goals

The project has two primary objectives:

- Build a functional AI-powered nutrition application.
- Demonstrate software engineering, product thinking and architectural decision-making throughout the development process.

Rather than focusing solely on implementation, the project emphasizes maintainability, documentation and long-term scalability.

---

# Features (Current MVP)

Current implementation includes:

- React + TypeScript architecture
- Language selection
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

Development

- Node.js
- npm
- Git
- GitHub
- VS Code

Future

- Gemini API
- Database
- Authentication
- Apple Health Integration

---

# Project Structure

```text
AI-Diet-Manager/

├── docs/
├── public/
├── src/
├── tests/
├── README.md
└── package.json
```

---

# Documentation

Detailed documentation is available in the `docs/` directory.

| File | Description |
|------|-------------|
| 00_PROJECT_CONTEXT.md | General project overview |
| 01_PRODUCT_VISION.md | Product vision |
| 02_ARCHITECTURE.md | Technical architecture |
| 03_DECISION_LOG.md | Engineering decisions |
| 04_ROADMAP.md | Project roadmap |
| 05_PROJECT_FAQ.md | Project FAQ and retrospective |
| 06_DESIGN_SYSTEM.md | Visual and interaction design language |
| 99_AI_CONTEXT.md | Context for future AI assistants |

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

```bash
npm install
```

Create a `.env` file (see `.env.example`) with your own Gemini API key
(free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)):

```bash
GEMINI_API_KEY=your-key-here
```

Start the backend (holds the API key, proxies chat requests):

```bash
npm run server
```

In a second terminal, start the frontend:

```bash
npm run dev
```

Both need to be running for the chat to work — the frontend alone
will load, but AI replies require the backend.

Build for production:

```bash
npm run build
```

---

# Future Roadmap

Planned features include:

- User registration
- AI nutrition coach
- Meal planning
- Dashboard
- Food recognition
- Apple Health integration
- Personalized recommendations

---

# License

All rights reserved. This repository is public for portfolio and
evaluation purposes only — see [LICENSE](./LICENSE) for details. No
permission is granted to reuse, redistribute, or sell this code.

---

# Author

Developed as part of a personal software engineering and product development journey, with the goal of creating a scalable AI-powered nutrition application.