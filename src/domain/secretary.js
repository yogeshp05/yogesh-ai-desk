/**
 * Dependency-free Secretary decision engine.
 * This is the deterministic foundation for a future AI provider.
 */

const dateWords = ["today","tomorrow","monday","tuesday","wednesday","thursday","friday","saturday","sunday","this week","next week"];

export function analyzeMessage(message, context = {}) {
  const text = String(message || "").trim();
  const lower = text.toLowerCase();
  const operations = [];
  const questions = [];
  const signals = [];

  if (!text) return { summary:"", operations:[], questions:["What would you like me to capture?"], signals:[] };

  const client = (context.clients || []).find(c => lower.includes(String(c.name || c).toLowerCase()));
  const due = dateWords.find(d => lower.includes(d));

  const taskIntent = /\b(need to|needs|todo|to-do|check|review|prepare|finish|send|create|update|ask|follow up)\b/i.test(text);
  const commitmentIntent = /\b(promised|promise|committed|i will|i'll|told .* i'll)\b/i.test(text);
  const waitingIntent = /\b(waiting for|waiting on|awaiting|follow up)\b/i.test(text);
  const responsibilityIntent = /\b(responsible for|new responsibility|now handling|new workstream)\b/i.test(text);

  if (responsibilityIntent) {
    const match = text.match(/(?:responsible for|new responsibility|now handling|new workstream)\s+(?:is\s+)?(.+?)(?:[.!?]|$)/i);
    const name = (match?.[1] || "New Responsibility").trim();
    const existing = (context.workspaces || []).find(w => String(w.name).toLowerCase() === name.toLowerCase());
    if (existing) {
      signals.push("existing_workspace");
    } else {
      operations.push({
        type:"recommend_workspace",
        entity:"workspace",
        payload:{name, reason:"Detected potentially recurring responsibility", approvalRequired:true}
      });
    }
  }

  if (taskIntent) {
    operations.push({
      type:"upsert_task",
      entity:"task",
      payload:{
        title:text.slice(0,160),
        clientId:client?.id || null,
        dueText:due || null,
        priority:/\b(critical|urgent|asap|high priority)\b/i.test(text) ? "high" : "medium",
        status:"inbox"
      }
    });
  }

  if (commitmentIntent) {
    operations.push({
      type:"create_commitment",
      entity:"commitment",
      payload:{sourceText:text,dueText:due || null}
    });
  }

  if (waitingIntent) {
    operations.push({
      type:"create_waiting_for",
      entity:"waiting_for",
      payload:{sourceText:text,followUpText:due || "next review"}
    });
  }

  if (!operations.length) signals.push("context_only");

  if (taskIntent && commitmentIntent) signals.push("multi_entity_input");
  if (due) signals.push("deadline_detected");
  if (client) signals.push("client_detected");

  return {
    summary: operations.length
      ? "Structured work detected from Secretary message."
      : "Context captured without inventing an action.",
    operations,
    questions,
    signals
  };
}

export function requiresApproval(operation) {
  return Boolean(operation?.payload?.approvalRequired) ||
    ["send_external_message","launch_campaign","material_budget_change","delete_data","major_tracking_change"].includes(operation?.type);
}
