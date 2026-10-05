import { analyzeMessage, requiresApproval } from "../domain/secretary.js";
import { calculateWorkload } from "../domain/workload.js";

export class SecretaryService {
  constructor(store) { this.store = store; }
  analyze(message) {
    const context = {
      clients: this.store.all("client"),
      workspaces: this.store.all("workspace"),
      projects: this.store.all("project"),
      tasks: this.store.all("task")
    };
    const result = analyzeMessage(message, context);
    result.operations = result.operations.map(op => ({ ...op, approvalRequired: requiresApproval(op) }));
    return result;
  }
  execute(operations, actor = "user") {
    const results = [];
    for (const op of operations || []) {
      if (requiresApproval(op)) {
        const approval = this.store.approval(op, "High-impact or structural action requires explicit approval.");
        results.push({ status: "approval_required", approval });
        continue;
      }
      results.push({ status: "executed", result: this.apply(op) });
    }
    this.store.audit({ actor, action: "secretary.execute", operations, results });
    return { results, workload: calculateWorkload(this.store.state) };
  }
  apply(op) {
    const p = op.payload || {};
    if (op.type === "upsert_task") return this.store.insert("task", { title:p.title, clientId:p.clientId, dueText:p.dueText, priority:p.priority||"medium", status:"inbox" });
    if (op.type === "create_commitment") return this.store.insert("commitment", { title:p.sourceText||p.title, dueText:p.dueText, status:"open" });
    if (op.type === "create_waiting_for") return this.store.insert("waiting_for", { title:p.sourceText||p.title, followUpText:p.followUpText, status:"open" });
    throw new Error("Unsupported operation: " + op.type);
  }
  dashboard() {
    return { entities:this.store.state.entities, approvals:this.store.approvals("pending"), audit:this.store.state.audit.slice(-50).reverse(), workload:calculateWorkload(this.store.state) };
  }
}
