import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeMessage } from "./src/domain/secretary.js";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 8787);
const mime = {".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8"};

function send(res,status,data,type="application/json"){res.writeHead(status,{"Content-Type":type});res.end(type.startsWith("application/json")?JSON.stringify(data):data)}
function body(req){return new Promise((resolve,reject)=>{let b="";req.on("data",c=>b+=c);req.on("end",()=>{try{resolve(b?JSON.parse(b):{})}catch(e){reject(e)}})})}

const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,"http://localhost");
  if(req.method==="POST" && url.pathname==="/api/secretary/analyze"){
    try{const input=await body(req);return send(res,200,analyzeMessage(input.message,input.context||{}))}
    catch(e){return send(res,400,{error:"Invalid JSON request",detail:e.message})}
  }
  if(req.method==="GET" && url.pathname==="/api/health") return send(res,200,{ok:true,service:"yogesh-ai-desk",version:"0.2.0"});
  const requested=url.pathname==="/" ? "/index.html" : url.pathname;
  const file=path.normalize(path.join(root,requested));
  if(!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return send(res,404,{error:"Not found"});
  const ext=path.extname(file);
  send(res,200,fs.readFileSync(file),mime[ext]||"application/octet-stream");
});
server.listen(port,()=>console.log("YOGESH AI DESK running on http://localhost:"+port));
