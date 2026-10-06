const KEY='yad-mvp-v1';
const seed={tasks:[
{id:1,t:'Prepare FMA September Google Ads report',c:'FMA',p:'High',d:'Friday',s:'Planned'},
{id:2,t:'Review OrthoAtlanta conversion tracking',c:'OrthoAtlanta',p:'High',d:'Today',s:'In Progress'},
{id:3,t:'Finalize AI Marketing Daily update',c:'Internal',p:'Medium',d:'Today',s:'Planned'},
{id:4,t:'Review team SEM training requests',c:'Internal',p:'Medium',d:'Tomorrow',s:'Planned'}],
projects:[
{name:'FMA Google Ads',c:'FMA',h:'Needs Attention',x:'Audit, reporting and CPA improvement.'},
{name:'OrthoAtlanta Transition',c:'OrthoAtlanta',h:'At Risk',x:'Location restructure and tracking alignment.'},
{name:'AI Marketing Daily',c:'Internal',h:'On Track',x:'Daily AI and ad-tech research newspaper.'}],
meetings:[{t:'FMA account review',time:'Tomorrow • 4:00 PM',c:'FMA'},{t:'SEM + Graphics + Paid sync',time:'Monday • 3:30 PM',c:'Internal'}],
waiting:[{t:'DexCare connector update',p:'Cecilia',f:'This week'},{t:'Conversion tracking verification',p:'Sushant',f:'Tomorrow'}],
commitments:[{t:'Send FMA first report draft',p:'Hamish',d:'Thursday'},{t:'Follow up on DexCare connector',p:'Cecilia',d:'This week'}],
workspaces:[{n:'SEM & Performance Marketing',x:'Responsibility',d:'Paid media, SEM, tracking, audits and client strategy.'},{n:'Project Management & Delivery',x:'Responsibility',d:'Cross-functional delivery, approvals, budgets and reporting.'},{n:'AI R&D / Innovation',x:'Responsibility',d:'AI, automation, agents, APIs, MCP and internal tools.'}],
chat:[{r:'ai',m:'Secretary online. Tell me anything about your work in natural language. I will turn it into structured work, update existing items where possible, and flag decisions that need you.'}]};
let st=JSON.parse(localStorage.getItem(KEY)||'null')||seed;\nst.workload=st.workload||null;
const save=()=>localStorage.setItem(KEY,JSON.stringify(st));
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const toast=s=>{let e=document.getElementById('toast');e.textContent=s;e.className='show';setTimeout(()=>e.className='',1800)};
function taskRow(x){return '<div class="row"><div><button class="check '+(x.s==='Completed'?'done':'')+'" data-id="'+x.id+'"></button><b>'+esc(x.t)+'</b><div class="muted">'+esc(x.c)+' • Due '+esc(x.d)+'</div></div><span class="tag '+(x.p==='High'?'high':'orange')+'">'+esc(x.p)+'</span></div>'}
function render(v){
 document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.v===v));
 const titles={day:'Good morning, Yogesh.',secretary:'Secretary Chat',tasks:'Tasks',projects:'Projects',meetings:'Meetings',waiting:'Waiting For',commitments:'Commitments',workspaces:'Dynamic Workspaces',approvals:'Approval Queue'};
 document.getElementById('title').textContent=titles[v];
 const a=document.getElementById('app');
 if(v==='secretary')return secretary(a);
 if(v==='tasks')return tasks(a);
 if(v==='projects')return projects(a);
 if(v==='meetings')return simple(a,'Meetings',st.meetings.map(x=>'<div class="row"><div><b>'+esc(x.t)+'</b><div class="muted">'+esc(x.time)+' • '+esc(x.c)+'</div></div><button class="primary" onclick="toast(\'Meeting prep engine is next\')">Prepare</button></div>').join(''));
 if(v==='waiting')return simple(a,'Waiting For',st.waiting.map(x=>'<div class="row"><div><b>'+esc(x.t)+'</b><div class="muted">Waiting on '+esc(x.p)+' • Follow up '+esc(x.f)+'</div></div></div>').join(''));
 if(v==='commitments')return simple(a,'Commitments',st.commitments.map(x=>'<div class="row"><div><b>'+esc(x.t)+'</b><div class="muted">To '+esc(x.p)+' • Due '+esc(x.d)+'</div></div><span class="tag high">Open</span></div>').join(''));
 if(v==='workspaces')return workspaces(a);\n if(v==='approvals')return approvals(a);
 return day(a);
}
function day(a){
 let open=st.tasks.filter(x=>x.s!=='Completed'), score=Math.min(100,open.length*7+st.commitments.length*7+st.waiting.length*4+st.meetings.length*4+st.projects.filter(x=>x.h==='At Risk').length*10);
 let label=score>=80?'Red':score>=60?'Orange':score>=40?'Yellow':'Green';
 a.innerHTML='<div class="grid four"><div class="card intensity"><div class="score">'+score+'</div><div><div class="label">WORKLOAD INTENSITY</div><h2>'+label+'</h2><div class="muted">Active work, deadlines, meetings and follow-ups.</div></div></div><div class="card"><div class="label">OPEN TASKS</div><div class="big">'+open.length+'</div><div class="muted">prioritized by Secretary</div></div><div class="card"><div class="label">WAITING FOR</div><div class="big">'+st.waiting.length+'</div><div class="muted">items needing follow-up</div></div><div class="card"><div class="label">COMMITMENTS</div><div class="big">'+st.commitments.length+'</div><div class="muted">promises still open</div></div></div><div class="section"><h2>AI Executive Briefing</h2><span class="tag">LIVE</span></div><div class="card"><p>Your workload is <b>'+label.toLowerCase()+'</b> at <b>'+score+'/100</b>. Protect high-priority items first and avoid unnecessary context switching. Assess new requests before treating them as emergencies.</p><div class="notice"><b>Secretary recommendation:</b> finish FMA reporting and tracking work before adding low-priority internal tasks.</div></div><div class="section"><h2>Today's Priorities</h2><button class="primary" id="openchat">+ Add via Secretary</button></div><div class="grid two">'+open.slice(0,4).map(taskRow).join('')+'</div><div class="section"><h2>Upcoming Meetings</h2></div><div class="card">'+st.meetings.map(x=>'<div class="row"><div><b>'+esc(x.t)+'</b><div class="muted">'+esc(x.time)+' • '+esc(x.c)+'</div></div></div>').join('')+'</div>';
 bindChecks();document.getElementById('openchat').onclick=()=>render('secretary');
}
function simple(a,title,body){a.innerHTML='<div class="section"><h2>'+title+'</h2></div><div class="card">'+(body||'<div class="empty">Nothing here.</div>')+'</div>'}
function tasks(a){simple(a,'All Tasks',st.tasks.map(taskRow).join(''));bindChecks()}
function projects(a){a.innerHTML='<div class="section"><h2>Projects</h2><button class="primary" onclick="render(\'secretary\')">+ Add via Secretary</button></div><div class="grid two">'+st.projects.map(x=>'<div class="card"><b>'+esc(x.name)+'</b><div class="muted">'+esc(x.c)+' • <span class="tag '+(x.h==='At Risk'?'high':'green')+'">'+esc(x.h)+'</span></div><p class="muted">'+esc(x.x)+'</p></div>').join('')+'</div>'}
function workspaces(a){a.innerHTML='<div class="section"><h2>Dynamic Workspaces</h2></div><div class="notice"><b>Adaptive architecture:</b> recurring responsibilities that do not fit the current structure should be proposed as new workspaces. The Secretary must never silently redesign your system.</div><div class="grid two" style="margin-top:14px">'+st.workspaces.map(x=>'<div class="card"><b>◇ '+esc(x.n)+'</b><div class="muted">'+esc(x.x)+'</div><p class="muted">'+esc(x.d)+'</p></div>').join('')+'</div>'}
function approvals(a){
 fetch('/api/dashboard').then(r=>r.json()).then(d=>{
   const items=d.approvals||[];
   a.innerHTML='<div class="section"><h2>Approval Queue</h2></div><div class="card">'+(items.length?items.map(x=>'<div class="row"><div><b>'+esc(x.operation?.type||'Action')+'</b><div class="muted">'+esc(x.reason||'Approval required')+'</div><div class="muted">'+esc(JSON.stringify(x.operation?.payload||{}))+'</div></div><div><button class="primary" data-approve="'+x.id+'">Approve</button> <button data-reject="'+x.id+'">Reject</button></div></div>').join(''):'<div class="empty">No pending approvals.</div>')+'</div>';
   document.querySelectorAll('[data-approve]').forEach(b=>b.onclick=()=>resolveApproval(b.dataset.approve,'approve'));
   document.querySelectorAll('[data-reject]').forEach(b=>b.onclick=()=>resolveApproval(b.dataset.reject,'reject'));
 });
}
async function resolveApproval(id,action){
 const r=await fetch('/api/approvals/'+action,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id})});
 if(!r.ok){toast('Could not resolve approval');return}
 await syncFromApi(); render('approvals'); toast(action==='approve'?'Approved':'Rejected');
}

function secretary(a){
 a.innerHTML='<div class="card chatbox"><div class="log" id="log">'+st.chat.map(x=>'<div class="bubble '+(x.r==='user'?'user':'ai')+'">'+esc(x.m).replace(/\n/g,'<br>')+'</div>').join('')+'</div><form class="compose" id="form"><textarea id="input" placeholder="Tell your Secretary anything…"></textarea><button class="primary">Send</button></form></div>';
 let log=document.getElementById('log');log.scrollTop=log.scrollHeight;document.getElementById('form').onsubmit=e=>{e.preventDefault();chat(document.getElementById('input').value)}
}
async function chat(raw){
 let q=raw.trim();if(!q)return;
 st.chat.push({r:'user',m:q});render('secretary');
 try{
   const response=await fetch('/api/secretary/analyze',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({message:q})});
   if(!response.ok)throw new Error('API unavailable');
   const result=await response.json();
   let reply=result.summary||'I processed the message.';
   const operations=result.operations||[];
   if(operations.length){
     const ex=await fetch('/api/secretary/execute',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({operations})});
     if(!ex.ok)throw new Error('Execution failed');
     const data=await ex.json();
     const executed=data.results.filter(x=>x.status==='executed').length;
     const pending=data.results.filter(x=>x.status==='approval_required').length;
     const matched=data.results.filter(x=>x.status==='skipped_duplicate_or_match').length;
     if(executed) reply+='\\n\\nExecuted '+executed+' action(s).';
     if(matched) reply+='\\n\\nMatched '+matched+' existing item(s); no duplicate was created.';
     if(pending) reply+='\\n\\n'+pending+' action(s) were added to your Approval Queue.';
     await syncFromApi();
   }
   if((result.questions||[]).length)reply+='\\n\\nQuestion: '+result.questions.join(' ');
   st.chat.push({r:'ai',m:reply});save();render('secretary');toast(approvals.length?'Approval required':'Secretary updated');
 }catch(e){
   st.chat.push({r:'ai',m:'I could not reach the Secretary backend. Your message was not executed. Please check that the local server is running.'});save();render('secretary');toast('Backend unavailable');
 }
}
async function syncFromApi(){
 try{
   const r=await fetch('/api/dashboard'); if(!r.ok)return;
   const d=await r.json();
   const map={task:'tasks',project:'projects',meeting:'meetings',waiting_for:'waiting',commitment:'commitments',workspace:'workspaces'};
   const clients=Object.fromEntries((d.entities||[]).filter(e=>e.type==='client').map(e=>[e.id,e.name||e.title]));\n   st.workload=d.workload||null;
   for(const [type,key] of Object.entries(map)){
     const rows=(d.entities||[]).filter(e=>e.type===type);
     if(type==='task')st.tasks=rows.map(e=>({id:e.id,t:e.title,c:clients[e.clientId]||'Unassigned',p:(e.priority||'medium')[0].toUpperCase()+(e.priority||'medium').slice(1),d:e.dueText||'Unscheduled',s:(e.status||'inbox')[0].toUpperCase()+(e.status||'inbox').slice(1)}));
     if(type==='project')st.projects=rows.map(e=>({name:e.name||e.title,c:clients[e.clientId]||'',h:(e.health||'on_track').replaceAll('_',' ').replace(/\\b\\w/g,m=>m.toUpperCase()),x:e.description||'',x:e.description||''}));
     if(type==='meeting')st.meetings=rows.map(e=>({t:e.title,time:e.startAt||'',c:clients[e.clientId]||''}));
     if(type==='waiting_for')st.waiting=rows.map(e=>({t:e.title,p:e.person||'Unassigned',f:e.followUpText||'Next review'}));
     if(type==='commitment')st.commitments=rows.map(e=>({t:e.title,p:e.person||'Unassigned',d:e.dueText||'Unscheduled'}));
     if(type==='workspace')st.workspaces=rows.map(e=>({n:e.name,x:'Dynamic Workspace',d:e.description||''}));
   }
   save();
 }catch{}
}
function bindChecks(){document.querySelectorAll('[data-id]').forEach(b=>b.onclick=async()=>{let x=st.tasks.find(t=>t.id==b.dataset.id);if(!x)return;const next=x.s==='Completed'?'planned':'completed';try{const r=await fetch('/api/secretary/execute',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({operations:[{type:'upsert_task',entity:'task',payload:{id:x.id,status:next}}]})});if(!r.ok)throw new Error();await syncFromApi();render('tasks');toast(next==='completed'?'Task completed':'Task reopened')}catch{toast('Could not update task')}})}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>render(b.dataset.v));
document.getElementById('chat').onclick=()=>render('secretary');
syncFromApi().then(()=>render('day')).catch(()=>render('day'));