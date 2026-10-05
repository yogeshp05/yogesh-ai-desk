/**
 * Canonical domain shape for YOGESH AI DESK.
 * This file is intentionally framework-independent.
 */

export const ENTITY_TYPES = [
  "user","responsibility","workspace","client","contact","project","task",
  "meeting","calendar_event","commitment","follow_up","delegation","waiting_for",
  "approval","decision","risk","blocker","communication","report","sop",
  "training_item","knowledge_item","research_item","automation","integration",
  "notification","ai_action","ai_recommendation","audit_event"
];

export const TASK_STATUS = [
  "inbox","planned","in_progress","waiting","blocked","review","completed","cancelled"
];

export const PROJECT_HEALTH = ["on_track","needs_attention","at_risk","blocked"];

export const PRIORITIES = ["low","medium","high","critical"];

export function createEntity(type, fields = {}) {
  if (!ENTITY_TYPES.includes(type)) throw new Error("Unsupported entity type: " + type);
  return {
    id: fields.id || crypto.randomUUID(),
    type,
    createdAt: fields.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...fields
  };
}

export const relationships = {
  client: ["project","task","meeting","communication","report"],
  project: ["task","meeting","decision","risk","blocker","report","knowledge_item"],
  task: ["subtask","meeting","communication","commitment","waiting_for"],
  meeting: ["task","decision","commitment","follow_up","communication"],
  responsibility: ["workspace","project","task","knowledge_item"],
  workspace: ["responsibility","project","task","knowledge_item","research_item"]
};
