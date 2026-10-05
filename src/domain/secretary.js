const dateWords = ["today","tomorrow","monday","tuesday","wednesday","thursday","friday","saturday","sunday","this week","next week"];

const normalize = value => String(value || "").toLowerCase().replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim();
const similarity = (a,b) => {
  const A = new Set(normalize(a).split(" ").filter(Boolean));
  const B = new Set(normalize(b).split(" ").filter(Boolean));
  if (!A.size || !B.size) return 0;
  const intersection = [...A].filter(x => B.has(x)).length;
  return intersection / new Set([...A,...B]).size;
};

export function findExistingEntity(entities, type, candidate, threshold = 0.72) {
  const target = normalize(candidate);
  if (!target) return null;
  return entities.filter(e => e.type === type).map(e => ({
    entity:e, score:Math.max(similarity(e.title || e.name, candidate), target === normalize(e.title || e.name) ? 1 : 0)
  })).sort((a,b)=>b.score-a.score).find(x => x.score >= threshold) || null;
}

export function analyzeMessage(message, context = {}) {
  const text = String(message || "").trim();
  const lower = text.toLowerCase();
  const operations = [];
  const questions = [];
  const signals = [];

  if (!text) return {summary:"",operations:[],questions:["What would you like me to capture?"],signals:[]};

  const entities = context.entities || [];
  const client = (context.clients || []).find(c => lower.includes(String(c.name || c).toLowerCase()));
  const due = dateWords.find(d => lower.includes(d));
  const taskIntent = /\b(need to|needs|todo|to-do|check|review|prepare|finish|send|create|update|ask|follow up)\b/i.test(text);
  const commitmentIntent = /\b(promised|promise|committed|i will|i'll|told .* i'll)\b/i.test(text);
  const waitingIntent = /\b(waiting for|waiting on|awaiting|follow up)\b/i.test(text);
  const responsibilityIntent = /\b(responsible for|new responsibility|now handling|new workstream)\b/i.test(text);

  if (responsibilityIntent) {
    const match = text.match(/(?:responsible for|new responsibility|now handling|new workstream)\s+(?:is\s+)?(.+?)(?:[.!?]|$)/i);
    const name = (match?.[1] || "New Responsibility").trim();
    const existing = findExistingEntity([...entities,...(context.workspaces||[])], "workspace", name);
    if (existing) {
      signals.push("existing_workspace_match");
      operations.push({type:"workspace_match",entity:"workspace",payload:{id:existing.entity.id,name:existing.entity.name,confidence:existing.score}});
    } else {
      operations.push({type:"recommend_workspace",entity:"workspace",payload:{name,reason:"Detected potentially recurring responsibility",approvalRequired:true}});
    }
  }

  if (taskIntent) {
    const candidate = text.slice(0,160);
    const existing = findExistingEntity(entities, "task", candidate, 0.78);
    if (existing) {
      signals.push("duplicate_task_candidate");
      operations.push({type:"task_match",entity:"task",payload:{id:existing.entity.id,title:existing.entity.title,confidence:existing.score,action:"update_or_skip"}});
    } else {
      operations.push({type:"upsert_task",entity:"task",payload:{title:candidate,clientId:client?.id||null,dueText:due||null,priority:/\b(critical|urgent|asap|high priority)\b/i.test(text)?"high":"medium",status:"inbox"}});
    }
  }

  if (commitmentIntent) operations.push({type:"create_commitment",entity:"commitment",payload:{sourceText:text,dueText:due||null}});
  if (waitingIntent) operations.push({type:"create_waiting_for",entity:"waiting_for",payload:{sourceText:text,followUpText:due||"next review"}});
  if (!operations.length) signals.push("context_only");
  if (taskIntent && commitmentIntent) signals.push("multi_entity_input");
  if (due) signals.push("deadline_detected");
  if (client) signals.push("client_detected");

  return {summary:operations.length?"Structured work detected from Secretary message.":"Context captured without inventing an action.",operations,questions,signals};
}

export function requiresApproval(operation) {
  return Boolean(operation?.payload?.approvalRequired) ||
    ["send_external_message","launch_campaign","material_budget_change","delete_data","major_tracking_change"].includes(operation?.type);
}
