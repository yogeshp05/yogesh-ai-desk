# Secretary API Contract

This contract is the boundary between the UI and the future backend.

## POST /api/secretary/analyze

Request:
```json
{
  "message": "FMA needs the September report by Friday.",
  "context": {
    "clients": [],
    "projects": [],
    "workspaces": []
  }
}
```

Response:
```json
{
  "summary": "Structured work detected from Secretary message.",
  "operations": [
    {
      "type": "upsert_task",
      "entity": "task",
      "payload": {
        "title": "FMA needs the September report by Friday.",
        "clientId": null,
        "dueText": "friday",
        "priority": "medium",
        "status": "inbox"
      }
    }
  ],
  "questions": [],
  "signals": ["deadline_detected"]
}
```

## POST /api/secretary/execute

Takes approved operations and writes them through the application service.

Important: analyze and execute are deliberately separate. This allows approvals, audit logging and verification.

## GET /api/dashboard

Returns a read model optimized for My Day. It should not require the frontend to assemble business logic.

## GET /api/projects/:id

Returns project context, health, open work, meetings, decisions, risks, dependencies and recent activity.

## POST /api/meetings/:id/prepare

Returns meeting context:
- previous summary
- open actions
- commitments
- waiting-for items
- current project status
- questions
- suggested agenda

## POST /api/briefings/morning

Returns workload score, today's priorities, meetings, commitments, waiting-for, approvals, risks and recommendations.

## Event model

The backend should emit domain events such as:
- task.created
- task.completed
- commitment.created
- waiting_for.created
- project.health_changed
- workspace.recommended
- approval.created
- ai.action_executed

Events support automation without coupling every module to every other module.
