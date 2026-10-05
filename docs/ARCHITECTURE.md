# YOGESH AI DESK — Architecture

## North star

Secretary Chat is the primary input surface. The dashboard is a projection of structured work state.

```
Natural language
      ↓
Secretary Orchestrator
      ↓
Context retrieval → Entity matching → Intent/entity extraction
      ↓
Plan → Policy/approval check → Execute → Verify → Audit
      ↓
Tasks / Projects / Meetings / Commitments / Waiting / Workspaces / Knowledge
      ↓
My Day + Briefings + Alerts + Recommendations
```

## Core layers

### 1. Experience
Responsive web application with:
- My Day
- Secretary Chat
- Tasks
- Projects
- Meetings
- Waiting For
- Commitments
- Dynamic Workspaces

### 2. Application
The application layer owns use cases rather than UI-specific logic:
- ingest secretary message
- create/update task
- capture commitment
- capture delegation
- register waiting-for
- detect project
- detect recurring responsibility
- prepare meeting
- calculate workload
- generate morning/evening briefing

### 3. Domain
The domain is entity-driven and extensible. New work types should be represented as entities and relationships instead of hard-coded dashboard sections.

### 4. Intelligence
Specialized agents will eventually sit behind one orchestration contract:
- Secretary Agent
- Planning Agent
- Meeting Agent
- Communication Agent
- PM Agent
- SEM Agent
- QA Agent
- Reporting Agent
- Research Agent
- Memory Agent
- Workspace Architect Agent
- Automation Agent

### 5. Infrastructure
Planned:
- relational database
- authentication / authorization
- AI provider abstraction
- OAuth integrations
- webhook ingestion
- scheduled jobs
- semantic search
- notifications
- audit/event store

## Entity model

Primary entities:
User, Responsibility, Workspace, Client, Contact, Project, Task, Meeting, CalendarEvent, Commitment, FollowUp, Delegation, WaitingFor, Approval, Decision, Risk, Blocker, Communication, Report, SOP, TrainingItem, KnowledgeItem, ResearchItem, Automation, Integration, Notification, AIAction, AIRecommendation, AuditEvent.

Relationships are first-class. Example:

`Client → Project → Task → Meeting → Commitment → WaitingFor`

## Secretary processing contract

Input:
```json
{
  "message": "FMA needs the September report by Friday. I promised Hamish a draft Thursday.",
  "source": "secretary_chat",
  "timestamp": "ISO-8601"
}
```

Output:
```json
{
  "summary": "FMA September report with Thursday draft commitment",
  "operations": [
    {"type":"upsert_task","entity":"task"},
    {"type":"create_commitment","entity":"commitment"}
  ],
  "questions": [],
  "approval_required": false
}
```

The UI should not need to understand how the AI reached the decision.

## Approval policy

Approval is required before high-impact external actions such as:
- sending important external communication
- publishing or launching campaigns
- material budget changes
- destructive data operations
- major tracking changes
- changing ownership
- closing important projects

Every AI write must produce an audit event with:
- actor
- timestamp
- action
- target entity
- before
- after
- reason
- source message

## Adaptive workspace policy

A one-off task does not create a workspace.

The Workspace Architect should recommend a new workspace when a new area is:
- recurring
- strategically important
- associated with multiple projects/tasks
- expected to generate knowledge or reporting
- cross-functional
- expected to persist

The user approves the structural change.

## Current implementation boundary

The repository currently runs as a dependency-free static MVP. This is intentional. The next infrastructure step can add a real API and database without rewriting the Secretary experience.
