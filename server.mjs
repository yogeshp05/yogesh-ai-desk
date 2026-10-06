import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeMessage } from "./src/domain/secretary.js";
import { JsonStore } from "./src/infrastructure/store.js";
import { SecretaryService } from "./src/application/secretary-service.js";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 8787);
const store = new JsonStore(path.join(root, "data", "state.json"));
const secretary = new SecretaryService(store);

function bootstrap() {
  if (store.all().length) return;
  const clients = [["FMA","FMA"],["OrthoAtlanta","OrthoAtlanta"],["Internal","Internal"]];
  clients.forEach(([name,title]) => store.insert("client", {name,title}));
  const clientId = name => store.all("client").find(c => c.name === name)?.id || null;
  [
    {name:"FMA Google Ads",clientId:clientId("FMA"),health:"needs_attention",description:"Audit, reporting and CPA improvement."},
    {name:"OrthoAtlanta Transition",clientId:clientId("OrthoAtlanta"),health:"at_risk",description:"Location restructure and tracking alignment."},
    {name:"AI Marketing Daily",clientId:clientId("Internal"),health:"on_track",description:"Daily AI and ad-tech research newspaper."}
  ].forEach(p => store.insert("project",p));
  [
    ["Prepare FMA September Google Ads report","FMA","high","Friday","planned"],
    ["Review OrthoAtlanta conversion tracking","OrthoAtlanta","high","Today","in_progress"],
    ["Finalize AI Marketing Daily update","Internal","medium","Today","planned"],
    ["Review team SEM training requests","Internal","medium","Tomorrow","planned"]
  ].forEach(([title,client,priority,dueText,status]) => store.insert("task",{title,clientId:clientId(client),priority,dueText,status}));
  [
    {title:"FMA account review",startAt:"Tomorrow • 4:00 PM",clientId:clientId("FMA"),status:"scheduled"},
    {title:"SEM + Graphics + Paid sync",startAt:"Monday • 3:30 PM",clientId:clientId("Internal"),status:"scheduled"}
  ].forEach(m => store.insert("meeting",m));
  [{title:"DexCare connector update",person:"Cecilia",followUpText:"This week",status:"open"},{title:"Conversion tracking verification",person:"Sushant",followUpText:"Tomorrow",status:"open"}].forEach(x => store.insert("waiting_for",x));
  [{title:"Send FMA first report draft",person:"Hamish",dueText:"Thursday",status:"open"},{title:"Follow up on DexCare connector",person:"Cecilia",dueText:"This week",status:"open"}].forEach(x => store.insert("commitment",x));
  [{name:"SEM & Performance Marketing",description:"Paid media, SEM, tracking, audits and client strategy."},{name:"Project Management & Delivery",description:"Cross-functional delivery, approvals, budgets and reporting."},{name:"AI R&D / Innovation",description:"AI, automation, agents, APIs, MCP and internal tools."}].forEach(x => store.insert("workspace",x));
}
bootstrap();
const mime = {".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8"};

function send(res,status,data,type="application/json"){res.writeHead(status,{"Content-Type":type});res.end(type.startsWith("application/json")?JSON.stringify(data):data)}
function body(req){return new Promise((resolve,reject)=>{let b="";req.on("data",c=>b+=c);req.on("end",()=>{try{resolve(b?JSON.parse(b):{})}catch(e){reject(e)}})})}
async function route(req,res){
  const url=new URL(req.url,"http://localhost");
  if(req.method==="POST" && url.pathname==="/api/secretary/analyze"){
    try{return send(res,200,secretary.analyze((await body(req)).message))}
    catch(e){return send(res,400,{error:e.message})}
  }
  if(req.method==="POST" && url.pathname==="/api/secretary/execute"){
    try{const input=await body(req);return send(res,200,secretary.execute(input.operations||[],input.actor||"user"))}
    catch(e){return send(res,400,{error:e.message})}
  }
  if(req.method==="GET" && url.pathname==="/api/dashboard") return send(res,200,secretary.dashboard());
  if(req.method==="POST" && url.pathname==="/api/approvals/approve"){
    try{const input=await body(req);return send(res,200,secretary.approve(input.id,input.actor||"user"))}
    catch(e){return send(res,400,{error:e.message})}
  }
  if(req.method==="POST" && url.pathname==="/api/approvals/reject"){
    try{const input=await body(req);return send(res,200,secretary.reject(input.id,input.actor||"user"))}
    catch(e){return send(res,400,{error:e.message})}
  }

  if(req.method==="GET" && url.pathname==="/api/health") return send(res,200,{ok:true,service:"yogesh-ai-desk",version:"0.3.0"});
  const requested=url.pathname==="/" ? "/index.html" : url.pathname;
  const file=path.normalize(path.join(root,requested));
  if(!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return send(res,404,{error:"Not found"});
  const ext=path.extname(file); send(res,200,fs.readFileSync(file),mime[ext]||"application/octet-stream");
}
http.createServer((req,res)=>route(req,res).catch(e=>send(res,500,{error:"Internal server error",detail:e.message}))).listen(port,()=>console.log("YOGESH AI DESK running on http://localhost:"+port));
