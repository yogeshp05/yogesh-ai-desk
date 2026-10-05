const weights = {
  priority: { low: 2, medium: 5, high: 10, critical: 16 },
  status: { inbox: 1, planned: 2, in_progress: 5, waiting: 2, blocked: 6, review: 4 }
};

export function calculateWorkload(state, now = new Date()) {
  const tasks = state.entities.filter(e => e.type === "task" && !["completed","cancelled"].includes(e.status));
  const commitments = state.entities.filter(e => e.type === "commitment" && e.status !== "completed");
  const waiting = state.entities.filter(e => e.type === "waiting_for" && e.status !== "completed");
  const meetings = state.entities.filter(e => e.type === "meeting" && e.status !== "completed");
  const risks = state.entities.filter(e => e.type === "risk" && e.status !== "resolved");
  let score = tasks.reduce((n,t) => n + (weights.priority[t.priority]||5) + (weights.status[t.status]||2), 0);
  score += commitments.length * 6 + waiting.length * 3 + meetings.length * 4 + risks.length * 8;
  const overdue = tasks.filter(t => t.dueAt && new Date(t.dueAt) < now).length;
  const dueSoon = tasks.filter(t => t.dueAt && new Date(t.dueAt) >= now && new Date(t.dueAt) < new Date(now.getTime()+86400000*2)).length;
  score += overdue * 10 + dueSoon * 5;
  score = Math.min(100, score);
  return { score, label: score >= 80 ? "Red" : score >= 60 ? "Orange" : score >= 40 ? "Yellow" : "Green",
    factors: { openTasks: tasks.length, commitments: commitments.length, waitingFor: waiting.length, meetings: meetings.length, risks: risks.length, overdue, dueSoon } };
}
