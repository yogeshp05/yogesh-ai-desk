# YOGESH AI DESK

AI Secretary & Professional Work Operating System.

## Current build: v0.3.0

The app now has a real provider-free backend state layer instead of treating the browser UI as the source of truth.

### Working capabilities

- My Day dashboard
- Workload intensity engine
- Natural-language Secretary Chat
- Deterministic intent and entity analysis
- Backend execution of safe Secretary operations
- Persistent JSON state
- Dashboard read model
- Approval records for high-impact actions
- Audit trail for Secretary execution
- Tasks, projects, meetings, waiting-for, commitments and workspaces
- Adaptive workspace recommendations
- Browser UI synchronized with backend state

## Run locally

Requires Node.js 20+.

```bash
npm start
```

Open `http://localhost:8787`.

Development mode:

```bash
npm run dev
```

State is stored locally in `data/state.json` and is intentionally gitignored. The JSON store is an MVP persistence layer; it can later be replaced by PostgreSQL or another production database without changing the domain contracts.

## API

- `GET /api/health`
- `GET /api/dashboard`
- `POST /api/secretary/analyze`
- `POST /api/secretary/execute`

The Secretary flow is:

`message → analyze → approval policy → execute → audit → workload → dashboard`

## Architecture

- `src/domain/schema.js` — canonical entities and relationships
- `src/domain/secretary.js` — deterministic Secretary analysis
- `src/domain/workload.js` — workload scoring
- `src/application/secretary-service.js` — orchestration and execution
- `src/infrastructure/store.js` — persistence and audit/approval storage
- `server.mjs` — HTTP API and static server
- `app.js` — responsive browser interface

The architecture is deliberately provider-independent. An AI provider can later improve extraction and reasoning while the application keeps deterministic validation, approval controls, persistence and auditability around it.

## Next major milestones

1. Entity matching and duplicate detection
2. Approval Queue UI
3. Real project/client/workspace state seeding and migration
4. Meeting preparation engine
5. End-of-day and morning briefing APIs
6. Authentication and production database
7. AI provider abstraction
8. Calendar/email/project-management integrations
9. Specialized agents and proactive automation
