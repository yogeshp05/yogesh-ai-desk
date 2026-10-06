import { getStore } from "@netlify/blobs";
import { analyzeMessage, requiresApproval } from "../../src/domain/secretary.js";
import { calculateWorkload } from "../../src/domain/workload.js";
import { createEntity } from "../../src/domain/schema.js";

const STATE_KEY = "state.json";
const blobStore = () => getStore({ name: "yogesh-ai-desk-state", consistency: "strong" });

class NetlifyStore {
  constructor(state, store) { this.state=state||{entities:[],audit:[],approvals:[]}; this.store=store; this.writePromise=Promise.resolve(); }
  all(type){return this.state.entities.filter(e=>!type||e.type===type)}
  find(id){return this.state.entities.find(e=>e.id===id)}
  insert(type,fields){const entity=createEntity(type,fields);this.state.entities.push(entity);this.persist();return entity}
  upsert(entity){const i=this.state.entities.findIndex(e=>e.id===entity.id);entity.updatedAt=new Date().toISOString();if(i<0)this.state.entities.push(entity);else this.state.entities[i]=entity;this.persist();return entity}
  audit(event){this.state.audit.push({id:crypto.randomUUID(),createdAt:new Date().toISOString(),...event});this.persist()}
  approval(operation,reason){const item={id:crypto.randomUUID(),status:"pending",createdAt:new Date().toISOString(),operation,reason};this.state.approvals.push(item);this.persist();return item}
  approvals(status){return this.state.approvals.filter(a=>!status||a.status===status)}
  setApproval(id,status){const a=this.state.approvals.find(x=>x.id===id);if(!a)throw new Error("Approval not found");a.status=status;a.updatedAt=new Date().toISOString();this.persist();return a}
  persist(){const snapshot=JSON.parse(JSON.stringify(this.state));this.writePromise=this.writePromise.then(()=>this.store.setJSON(STATE_KEY,snapshot));return this.writePromise}
  async flush(){await this.writePromise}
}
function seed(store){
  if(store.all().length)return;
  [["FMA","FMA"],["OrthoAtlanta","OrthoAtlanta"],["Internal","Internal"]].forEach(([name,title])=>store.insert("client",{name,title}));
  const clientId=name=>store.all("client").find(c=>c.name===name)?.id||null;
  [{name:"FMA Google Ads",clientId:clientId("FMA"),health:"needs_attention",description:"Audit, reporting and CPA improvement."},{name:"OrthoAtlanta Transition",clientId:clientId("OrthoAtlanta"),health:"at_risk",description:"Location restructure and tracking alignment."},{name:"AI Marketing Daily",clientId:clientId("Internal"),health:"on_track",description:"Daily AI and ad-tech research newspaper."}].forEach(p=>store.insert("project",p));
  [["Prepare FMA September Google Ads report","FMA","high","Friday","planned"],["Review OrthoAtlanta conversion tracking","OrthoAtlanta","high","Today","in_progress"],["Finalize AI Marketing Daily update","Internal","medium","Today","planned"],["Review team SEM training requests","Internal","medium","Tomorrow","planned"]].forEach(([title,client,priority,dueText,status])=>store.insert("task",{title,clientId:clientId(client),priority,dueText,status}));
  [{title:"FMA account review",startAt:"Tomorrow • 4:00 PM",clientId:clientId("FMA"),status:"scheduled"},{title:"SEM + Graphics + Paid sync",startAt:"Monday • 3:30 PM",clientId:clientId("Internal"),status:"scheduled"}].forEach(m=>store.insert("meeting",m));
  [{title:"DexCare connector update",person:"Cecilia",followUpText:"This week",status:"open"},{title:"Conversion tracking verification",person:"Sushant",followUpText:"Tomorrow",status:"open"}].forEach(x=>store.insert("waiting_for",x));
  [{title:"Send FMA first report draft",person:"Hamish",dueText:"Thursday",status:"open"},{title:"Follow up on DexCare connector",person:"Cecilia",dueText:"This week",status:"open"}].forEach(x=>store.insert("commitment",x));
  [{name:"SEM & Performance Marketing",description:"Paid media, SEM, tracking, audits and client strategy."},{name:"Project Management & Delivery",description:"Cross-functional delivery, approvals, budgets and reporting."},{name:"AI R&D / Innovation",description:"AI, automation, agents, APIs, MCP and internal tools."}].forEach(x=>store.insert("workspace",x));
}
class SecretaryService{
 constructor(store){this.store=store}
 analyze(message){const context={clients:this.store.all("client"),workspaces:this.store.all("workspace"),projects:this.store.all("project"),tasks:this.store.all("task")};const result=analyzeMessage(message,{...context,entities:this.store.all()});result.operations=result.operations.map(op=>({...op,approvalRequired:requiresApproval(op)}));return result}
 execute(operations,actor="user"){const results=[];for(const op of operations||[]){if(["task_match","workspace_match"].includes(op.type)){results.push({status:"skipped_duplicate_or_match",result:op.payload});continue}if(requiresApproval(op)){results.push({status:"approval_required",approval:this.store.approval(op,"High-impact or structural action requires explicit approval.")});continue}results.push({status:"executed",result:this.apply(op)})}this.store.audit({actor,action:"secretary.execute",operations,results});return{results,workload:calculateWorkload(this.store.state)}}
 apply(op){const p=op.payload||{};if(op.type==="upsert_task"){const existing=p.id?this.store.find(p.id):null;if(existing)return this.store.upsert({...existing,...p,type:"task"});return this.store.insert("task",{title:p.title,clientId:p.clientId,dueText:p.dueText,priority:p.priority||"medium",status:p.status||"inbox"})}if(op.type==="create_commitment")return this.store.insert("commitment",{title:p.sourceText||p.title,dueText:p.dueText,status:"open"});if(op.type==="create_waiting_for")return this.store.insert("waiting_for",{title:p.sourceText||p.title,followUpText:p.followUpText,status:"open"});throw new Error("Unsupported operation: "+op.type)}
 approve(id,actor="user"){const approval=this.store.approvals().find(a=>a.id===id);if(!approval)throw new Error("Approval not found");if(approval.status!=="pending")throw new Error("Approval is already resolved");const result=this.apply(approval.operation);this.store.setApproval(id,"approved");this.store.audit({actor,action:"approval.approved",approvalId:id,operation:approval.operation,result});return{approval:this.store.approvals().find(a=>a.id===id),result,workload:calculateWorkload(this.store.state)}}
 reject(id,actor="user"){const approval=this.store.approvals().find(a=>a.id===id);if(!approval)throw new Error("Approval not found");this.store.setApproval(id,"rejected");this.store.audit({actor,action:"approval.rejected",approvalId:id});return{approval:this.store.approvals().find(a=>a.id===id)}}
 dashboard(){return{entities:this.store.state.entities,approvals:this.store.approvals("pending"),audit:this.store.state.audit.slice(-50).reverse(),workload:calculateWorkload(this.store.state)}}
}
const json=(data,status=200)=>Response.json(data,{status});
const readBody=async req=>{try{return await req.json()}catch{return{}}};
export default async req=>{const store=blobStore();const state=await store.get(STATE_KEY,{type:"json"})||{entities:[],audit:[],approvals:[]};const persistent=new NetlifyStore(state,store);seed(persistent);const secretary=new SecretaryService(persistent);const url=new URL(req.url);try{if(req.method==="POST"&&url.pathname==="/api/secretary/analyze")return json(secretary.analyze((await readBody(req)).message));if(req.method==="POST"&&url.pathname==="/api/secretary/execute"){const input=await readBody(req);const result=secretary.execute(input.operations||[],input.actor||"user");await persistent.flush();return json(result)}if(req.method==="GET"&&url.pathname==="/api/dashboard"){await persistent.flush();return json(secretary.dashboard())}if(req.method==="POST"&&url.pathname==="/api/approvals/approve"){const input=await readBody(req);const result=secretary.approve(input.id,input.actor||"user");await persistent.flush();return json(result)}if(req.method==="POST"&&url.pathname==="/api/approvals/reject"){const input=await readBody(req);const result=secretary.reject(input.id,input.actor||"user");await persistent.flush();return json(result)}if(req.method==="GET"&&url.pathname==="/api/health")return json({ok:true,service:"yogesh-ai-desk",version:"0.4.0",runtime:"netlify-functions",persistence:"netlify-blobs"});return json({error:"Not found"},404)}catch(error){console.error(error);return json({error:error.message||"Internal server error"},500)}};
export const config={path:["/api/*"]};