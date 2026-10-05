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
let st=JSON.parse(localStorage.getItem(KEY)||'null')||seed;
const save=()=>localStorage.setItem(KEY,JSON.stringify(st));
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const toast=s=>{let e=document.getElementById('toast');e.textContent=s;e.className='show';setTimeout(()=>e.className='',1800)};
function taskRow(x){return '<div class="row"><div><button class="check '+(x.s==='Completed'?'done':'')+'" data-id="'+x.id+'"></button><b>'+esc(x.t)+'</b><div class="muted">'+esc(x.c)+' • Due '+esc(x.d)+'</div></div><span class="tag '+(x.p==='High'?'high':'orange')+'">'+esc(x.p)+'</span></div>'}
function render(v){
 document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.v===v));
 const titles={day:'Good morning, Yogesh.',secretary:'Secretary Chat',tasks:'Tasks',projects:'Projects',meetings:'Meetings',waiting:'Waiting For',commitments:'Commitments',workspaces:'Dynamic Workspaces'};
 document.getElementById('title').textContent=titles[v];
 const a=document.getElementById('app');
 if(v==='secretary')return secretary(a);
 if(v==='tasks')return tasks(a);
 if(v==='projects')return projects(a);
 if(v==='meetings')return simple(a,'Meetings',st.meetings.map(x=>'<div class="row"><div><b>'+esc(x.t)+'</b><div class="muted">'+esc(x.time)+' • '+esc(x.c)+'</div></div><button class="primary" onclick="toast(\'Meeting prep engine is next\')">Prepare</button></div>').join(''));
 if(v==='waiting')return simple(a,'Waiting For',st.waiting.map(x=>'<div class="row"><div><b>'+esc(x.t)+'</b><div class="muted">Waiting on '+esc(x.p)+' • Follow up '+esc(x.f)+'</div></div></div>').join(''));
 if(v==='commitments')return simple(a,'Commitments',st.commitments.map(x=>'<div class="row"><div><b>'+esc(x.t)+'</b><div class="muted">To '+esc(x.p)+' • Due '+esc(x.d)+'</div></div><span class="tag high">Open</span></div>').join(''));
 if(v==='workspaces')return workspaces(a);
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
function secretary(a){
 a.innerHTML='<div class="card chatbox"><div class="log" id="log">'+st.chat.map(x=>'<div class="bubble '+(x.r==='user'?'user':'ai')+'">'+esc(x.m).replace(/\n/g,'<br>')+'</div>').join('')+'</div><form class="compose" id="form"><textarea id="input" placeholder="Tell your Secretary anything…"></textarea><button class="primary">Send</button></form></div>';
 let log=document.getElementById('log');log.scrollTop=log.scrollHeight;document.getElementById('form').onsubmit=e=>{e.preventDefault();chat(document.getElementById('input').value)}
}
function chat(raw){
 let q=raw.trim();if(!q)return;st.chat.push({r:'user',m:q});let low=q.toLowerCase(),actions=[],reply='';
 let client=['FMA','OrthoAtlanta','Internal','AI Marketing Daily','Falls at Blue Ridge'].find(x=>low.includes(x.toLowerCase()));
 let dm=q.match(/\b(today|tomorrow|friday|thursday|monday|this week|next week)\b/i);
 if(/responsible for|new responsibility|now handling|new workstream/i.test(low)){
  let m=q.match(/(?:responsible for|new responsibility|now handling|new workstream)\s+(?:is\s+)?(.+?)(?:\.|$)/i),name=(m&&m[1]?m[1]:'New Responsibility').trim();
  if(!st.workspaces.some(x=>x.n.toLowerCase()===name.toLowerCase()))reply='I noticed a potentially new recurring responsibility: “'+name+'”. I have not created it silently. I recommend a new dynamic workspace so related projects, tasks, research and knowledge can live together. Approve it from Workspaces before creation.';
  else reply='That responsibility already has a workspace. I will keep new work linked there.';
 }else{
  if(/need to|needs|todo|check|review|prepare|finish|send|create|update|follow up|ask /i.test(low)){
   st.tasks.unshift({id:Date.now(),t:q.slice(0,120),c:client||'Unassigned',p:/urgent|asap|high priority/i.test(low)?'High':'Medium',d:dm?dm[1]:'Unscheduled',s:'Inbox'});actions.push('Task created')}
  if(/promised|commit|i will|i'll/i.test(low)){st.commitments.unshift({t:q.slice(0,100),p:'Unassigned',d:dm?dm[1]:'Unscheduled'});actions.push('Commitment captured')}
  if(/waiting on|awaiting|waiting for|follow up/i.test(low)){st.waiting.unshift({t:q.slice(0,100),p:'Unassigned',f:dm?dm[1]:'Next review'});actions.push('Waiting-for item created')}
  reply=actions.length?'Understood. I processed this as structured work:\n• '+actions.join('\n• ')+'\n\nI will surface it on the relevant dashboard.':'I captured the context, but I do not see a clear action, commitment, waiting-for item, or new responsibility yet. I will not invent a task.';
 }
 st.chat.push({r:'ai',m:reply});save();render('secretary');toast(actions.join(' • ')||'Context captured')
}
function bindChecks(){document.querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>{let x=st.tasks.find(t=>t.id==b.dataset.id);if(x){x.s=x.s==='Completed'?'Planned':'Completed';save();render('tasks');toast(x.s==='Completed'?'Task completed':'Task reopened')}})}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>render(b.dataset.v));
document.getElementById('chat').onclick=()=>render('secretary');
render('day');