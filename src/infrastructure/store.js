import fs from "node:fs";
import path from "node:path";
import { createEntity } from "../domain/schema.js";

export class JsonStore {
  constructor(file) {
    this.file = file;
    this.state = this.load();
  }
  load() {
    try { return JSON.parse(fs.readFileSync(this.file, "utf8")); }
    catch { return { entities: [], audit: [], approvals: [] }; }
  }
  persist() {
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    fs.writeFileSync(this.file, JSON.stringify(this.state, null, 2));
  }
  all(type) { return this.state.entities.filter(e => !type || e.type === type); }
  find(id) { return this.state.entities.find(e => e.id === id); }
  insert(type, fields) {
    const entity = createEntity(type, fields);
    this.state.entities.push(entity); this.persist(); return entity;
  }
  upsert(entity) {
    const i = this.state.entities.findIndex(e => e.id === entity.id);
    entity.updatedAt = new Date().toISOString();
    if (i < 0) this.state.entities.push(entity); else this.state.entities[i] = entity;
    this.persist(); return entity;
  }
  audit(event) {
    this.state.audit.push({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...event });
    this.persist();
  }
  approval(operation, reason) {
    const item = { id: crypto.randomUUID(), status: "pending", createdAt: new Date().toISOString(), operation, reason };
    this.state.approvals.push(item); this.persist(); return item;
  }
  approvals(status) { return this.state.approvals.filter(a => !status || a.status === status); }
  setApproval(id, status) {
    const a = this.state.approvals.find(x => x.id === id);
    if (!a) throw new Error("Approval not found");
    a.status = status; a.updatedAt = new Date().toISOString(); this.persist(); return a;
  }
}
