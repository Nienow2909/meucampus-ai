import {recoveryView} from './views/recovery.js';
import {shell,link} from './ui/components.js';
import {createViews} from './views/index.js';
import {agents,groups,escapeHtml as e,nextSlot,validateProfile,wordCount,readiness} from './domain.js';
import {supabase,catalog,loadStudent,unwrap,demoUniversities,demoLoad,demoSave} from './data.js';
import {questions} from './practice.js';
const blank=()=>({profile:null,list:[],tasks:[],essays:[],attempts:[],messages:[]});
const s={...blank(),user:null,demo:false,universities:[],page:'inicio',agent:'universities',search:'',country:'',group:'',catalogPage:0,essayId:null,question:0,feedback:null,docs:[],error:'',busy:false,menuOpen:false,sort:'catalog',loading:false};
s.recovery=new URLSearchParams(location.search).get('flow')==='recovery'||new URLSearchParams(location.hash.slice(1)).get('type')==='recovery';
s.authLoading=true;
const publicPages=['inicio','entrar','universidades','recuperar','nova-senha'];
const routeFromLocation=()=>s.recovery?'nova-senha':location.hash.slice(1)||'inicio';
const views=createViews(s);
const {home,login,dashboard,profile,universities,shortlist,applications,essays,sat,assistants,documents,guideDetails}=views;
const drafts=new Map();
let accountRevision=0;
function clearStudentContext(){
 accountRevision++;
 drafts.clear();
 Object.assign(s,blank(),{docs:[],essayId:null,question:0,feedback:null,pendingQuestion:'',busy:false});
}
const root=document.querySelector('#app');
const student=()=>Boolean(s.user||s.demo);
const persist=()=>{if(s.demo)demoSave(Object.fromEntries(Object.keys(blank()).map(k=>[k,s[k]])));};
function notify(m){const el=document.querySelector('#notice');el.textContent=m;el.hidden=false;clearTimeout(notify.timer);notify.timer=setTimeout(()=>el.hidden=true,7000);}
const fail=err=>{const send=document.querySelector('#chat-form button');if(send&&!s.busy){send.textContent='Enviar ↗';send.disabled=false;}notify(err.message||'Não foi possível concluir. Tente novamente.');};
function render(){
 if(!publicPages.includes(s.page)&&!student())s.page='entrar';
 const pub=['inicio','entrar','recuperar','nova-senha'].includes(s.page)||(!student()&&s.page==='universidades');
 const pages={recuperar:()=>recoveryView(s),'nova-senha':()=>recoveryView(s),inicio:home,entrar:login,painel:dashboard,perfil:profile,universidades:universities,lista:shortlist,essays:essays,sat:sat,candidaturas:applications,assistentes:assistants,documentos:documents};
 root.innerHTML=shell(s,(pages[s.page]||home)(),pub)+'<div id="notice" class="notice" role="status" hidden></div>';
 bind();
}
async function detail(id){
 const u=s.universities.find(x=>x.id===id);if(!u)return;
 document.querySelector('dialog')?.remove();
 const d=document.createElement('dialog');d.setAttribute('aria-label',u.name);
 d.innerHTML='<button class="close" aria-label="Fechar">×</button><div class="loading-state" role="status"><span class="spinner"></span>Carregando universidade.</div>';
 document.body.append(d);d.showModal();
 d.querySelector('.close').onclick=()=>d.close();d.addEventListener('close',()=>d.remove());
 if(!s.demo&&!u.details){try{const data=await unwrap(supabase.from('universities').select('summary,requirements,guidance,details,university_sources(*)').eq('id',id).single());Object.assign(u,data);}catch(err){if(d.isConnected){d.innerHTML='<button class="close" aria-label="Fechar">×</button><h2>Não foi possível abrir esta universidade.</h2><p>Tente novamente em instantes.</p><button class="button primary" data-retry>Tentar novamente</button>';d.querySelector('.close').onclick=()=>d.close();d.querySelector('[data-retry]').onclick=()=>detail(id).catch(fail);}return;}}
 if(!d.isConnected||!d.open)return;
 d.innerHTML=`<button class="close" aria-label="Fechar">×</button><span class="eyebrow">${e(u.country)} · ${e(u.cycle)}</span><h2>${e(u.name)}</h2><p>${e(u.summary||'Descrição não disponível.')}</p>${guideDetails(u)}<h3>Seu perfil e esta opção</h3><ul>${readiness(s.profile,u).map(x=>`<li>${e(x)}</li>`).join('')}</ul>${s.profile?.sat_target?`<details><summary>Simular com minha meta de SAT (${s.profile.sat_target})</summary><ul>${readiness(s.profile,u,s.profile.sat_target).map(x=>`<li>${e(x)}</li>`).join('')}</ul><p class="small">Simulação. Seu resultado atual permanece inalterado.</p></details>`:''}<h3>Fontes disponíveis</h3>${u.university_sources?.map(f=>`<p class="small">${e(f.title)} · ${e(f.cycle)} · ${f.status==='verified'?'Verificada':'Material fornecido'}<br>${e(f.excerpt)}<br>${f.url?`<a href="${e(f.url)}" target="_blank" rel="noopener noreferrer">Consultar fonte ↗</a>`:e(f.document_name)+(f.page?' · p. '+e(f.page)+(f.page_end?'–'+e(f.page_end):''):' · registro '+e(f.record_number))}</p>`).join('')||'<p class="small">Nenhuma fonte verificada disponível para esta análise.</p>'}${!student()?link('entrar','Entrar para salvar esta escolha','button primary'):s.list.some(x=>x.university_id===id)?'<p class="chip">Já está na sua lista</p>':`<form id="choice-form"><label>Adicionar em<select name="category">${Object.entries(groups).map(([key,g])=>`<option value="${key}">${g.label} · ${s.list.filter(x=>x.category===key).length}/${g.limit}</option>`).join('')}</select></label><button class="button primary">Adicionar à minha lista +</button><p id="choice-error" role="alert"></p></form>`}`;d.querySelector('.close').onclick=()=>d.close();d.addEventListener('close',()=>d.remove());d.querySelector('a[href="#entrar"]')?.addEventListener('click',()=>d.close());d.querySelector('form')?.addEventListener('submit',async ev=>{ev.preventDefault();const b=ev.target.querySelector('button');b.disabled=true;try{const category=new FormData(ev.target).get('category');const row={university_id:id,category,slot:nextSlot(s.list,category,id)};if(!s.demo)await unwrap(supabase.from('student_universities').insert({...row,user_id:s.user.id}));s.list.push(row);persist();d.close();render();notify('Escolha adicionada.');}catch(err){d.querySelector('#choice-error').textContent=err.message;}finally{b.disabled=false;}});}
async function saveEssay(){const form=document.querySelector('#essay-form');if(!form?.reportValidity())return false;const draft=s.essays.find(x=>x.id===s.essayId);const v=Object.fromEntries(new FormData(form));v.word_limit=Number(v.word_limit);v.university_id=v.university_id||null;v.version=draft.version+1;v.updated_at=new Date().toISOString();if(!s.demo){const rows=await unwrap(supabase.from('essays').update(v).eq('id',draft.id).eq('version',draft.version).select());if(!rows.length)throw new Error('Texto alterado em outra sessão. Copie seu rascunho antes de recarregar.');}Object.assign(draft,v);drafts.delete('essay:'+draft.id);persist();return true;}
async function refreshDocs(){if(s.user&&!s.demo)s.docs=await unwrap(supabase.storage.from('student-documents').list(s.user.id));}
function guarded(form,handler){form?.addEventListener('submit',async ev=>{ev.preventDefault();const buttons=[...form.querySelectorAll('button')];buttons.forEach(b=>b.disabled=true);try{await handler(ev);}catch(err){fail(err);}finally{buttons.forEach(b=>b.disabled=false);}});}
async function action(a){
 if(a==='demo'){clearStudentContext();sessionStorage.setItem('mc-demo','1');s.demo=true;s.loading=false;s.user=null;s.country='';s.search='';s.group='';s.catalogPage=0;Object.assign(s,blank(),demoLoad());s.error='';s.universities=demoUniversities;location.hash='painel';render();}
 if(a==='retry'){s.error='';await start();return;}
 if(a==='logout'){clearStudentContext();sessionStorage.removeItem('mc-demo');if(!s.demo)await supabase.auth.signOut();Object.assign(s,blank(),{user:null,demo:false,docs:[],universities:[]});location.hash='inicio';s.universities=await catalog();}
 if(a==='new-essay'){const draft={id:crypto.randomUUID(),title:'Meu novo essay',prompt:'',content:'',word_limit:650,version:1,university_id:null};if(!s.demo)await unwrap(supabase.from('essays').insert({...draft,user_id:s.user.id}));s.essays.unshift(draft);s.essayId=draft.id;persist();render();}
 if(a==='essay-feedback'&&await saveEssay()){const draft=s.essays.find(x=>x.id===s.essayId);if(draft.content.length>4500)throw new Error('Essay salvo. Para feedback, envie um trecho de até 4.500 caracteres ao mentor.');s.agent='essays';s.pendingQuestion='Revise clareza, estrutura e autenticidade. Não invente experiências. Enunciado: '+draft.prompt.slice(0,700)+'\nTexto: '+draft.content;location.hash='assistentes';}
 if(a==='next-question'){s.question=(s.question+1)%questions.length;s.feedback=null;render();}
}
function bind(){
 bindNavigation();
 bindDrafts();
 guarded(document.querySelector('#recovery-form'),async ev=>{
  const email=new FormData(ev.target).get('email');
  const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname+'?flow=recovery'});
  if(error)throw error;
  const result=document.querySelector('#recovery-result');result.hidden=false;result.textContent='Se este e-mail estiver cadastrado, você receberá um link. Confira também a pasta de spam.';
 });
 guarded(document.querySelector('#reset-form'),async ev=>{
  if(!s.user||s.demo)throw new Error('Solicite um novo link de recuperação.');
  const f=new FormData(ev.target);
  if(f.get('password')!==f.get('confirmation'))throw new Error('As senhas precisam ser iguais.');
  const {error}=await supabase.auth.updateUser({password:f.get('password')});if(error)throw error;
  ev.target.reset();
  s.recovery=false;history.replaceState(null,'',location.pathname+'#entrar');
  s.page='entrar';render();notify('Senha atualizada. Você pode entrar com a nova senha.');
 });
 document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>action(b.dataset.action).catch(fail));
 guarded(document.querySelector('#auth-form'),async ev=>{const revision=accountRevision;const f=new FormData(ev.target);const c={email:f.get('email'),password:f.get('password')};const {data,error}=await (ev.submitter?.value==='signup'?supabase.auth.signUp({...c,options:{emailRedirectTo:location.origin+location.pathname}}):supabase.auth.signInWithPassword(c));if(revision!==accountRevision)return;if(error)throw error;if(!data.session){notify('Confira seu e-mail para confirmar o cadastro.');return;}clearStudentContext();const activeRevision=accountRevision;sessionStorage.removeItem('mc-demo');s.user=data.user;s.demo=false;const studentData=await loadStudent(s.user.id);if(activeRevision!==accountRevision)return;Object.assign(s,studentData);const items=await catalog();if(activeRevision!==accountRevision)return;s.universities=items;location.hash=s.profile?'painel':'perfil';});
 guarded(document.querySelector('#profile-form'),async ev=>{const p=Object.fromEntries(new FormData(ev.target));for(const k of ['graduation_year','grade_average','grade_scale','sat_actual','sat_target','budget_annual','hours_week'])p[k]=p[k]===''?null:Number(p[k]);p.needs_aid=Boolean(p.needs_aid);p.ai_consent=Boolean(p.ai_consent);p.target_countries=p.target_countries.split(',').map(x=>x.trim()).filter(Boolean);p.updated_at=new Date().toISOString();validateProfile(p);if(!s.demo)await unwrap(supabase.from('student_profiles').upsert({...p,user_id:s.user.id}));s.profile=p;drafts.delete('profile');persist();location.hash='painel';});
 for(const [id,key,event] of [['search','search','input'],['country','country','change'],['institution-group','group','change'],['catalog-sort','sort','change']]){
  document.getElementById(id)?.addEventListener(event,ev=>{s[key]=ev.target.value;s.catalogPage=0;refreshCatalog();});
 }
 bindCatalog();
 document.querySelectorAll('[data-remove]').forEach(b=>b.onclick=async()=>{try{if(!s.demo)await unwrap(supabase.from('student_universities').delete().eq('user_id',s.user.id).eq('university_id',b.dataset.remove));s.list=s.list.filter(x=>x.university_id!==b.dataset.remove);persist();render();}catch(err){fail(err);}});
 guarded(document.querySelector('#task-form'),async ev=>{const v=Object.fromEntries(new FormData(ev.target));const t={...v,id:crypto.randomUUID(),due_on:v.due_on||null,university_id:v.university_id||null,done:false};if(!s.demo)await unwrap(supabase.from('tasks').insert({...t,user_id:s.user.id}));s.tasks.push(t);persist();render();notify('Ação adicionada.');});
 document.querySelectorAll('[data-task]').forEach(b=>b.onchange=async()=>{try{const t=s.tasks.find(x=>x.id===b.dataset.task);if(!s.demo)await unwrap(supabase.from('tasks').update({done:b.checked}).eq('id',t.id));t.done=b.checked;persist();render();}catch(err){b.checked=!b.checked;fail(err);}});
 document.querySelectorAll('[data-delete-task]').forEach(b=>b.onclick=async()=>{try{if(!s.demo)await unwrap(supabase.from('tasks').delete().eq('id',b.dataset.deleteTask));s.tasks=s.tasks.filter(t=>t.id!==b.dataset.deleteTask);persist();render();}catch(err){fail(err);}});
 document.querySelectorAll('[data-essay]').forEach(b=>b.onclick=()=>{s.essayId=b.dataset.essay;render();});
 guarded(document.querySelector('#essay-form'),async()=>{if(await saveEssay())notify('Rascunho salvo.');});
 document.querySelector('#essay-content')?.addEventListener('input',updateWordCount);
 document.querySelector('[name=word_limit]')?.addEventListener('input',updateWordCount);
 guarded(document.querySelector('#practice-form'),async ev=>{const q=questions[s.question],chosen=Number(new FormData(ev.target).get('answer'));const row={id:crypto.randomUUID(),question_id:q.id,chosen,correct:chosen===q.answer,skill:q.skill};if(!s.demo)await unwrap(supabase.from('sat_attempts').insert({...row,user_id:s.user.id}));s.attempts.push(row);s.feedback=row.correct;persist();render();});
 document.querySelectorAll('[data-agent]').forEach(b=>b.onclick=()=>{s.agent=b.dataset.agent;location.hash='assistentes';});
 document.querySelectorAll('[data-agent-tab]').forEach(b=>b.onclick=()=>{s.agent=b.dataset.agentTab;s.pendingQuestion='';render();});
 guarded(document.querySelector('#chat-form'),async ev=>{if(s.demo)throw new Error('Entre em uma conta conectada para conversar com a IA.');if(!s.profile?.ai_consent)throw new Error('Ative o compartilhamento com IA no seu perfil.');const question=new FormData(ev.target).get('question'),agent=s.agent,userId=s.user.id;s.busy=true;ev.target.querySelector('button').textContent='Preparando resposta…';try{const {data,error}=await supabase.functions.invoke('counselor',{body:{agent,question}});if(error){let message='Não foi possível consultar o assistente.';try{message=(await error.context.json()).error||message;}catch{}throw new Error(message);}if(data.error)throw new Error(data.error);if(s.user?.id!==userId||s.demo)return;s.messages.push({question,agent,...data});s.pendingQuestion='';}finally{s.busy=false;}render();});
 guarded(document.querySelector('#upload-form'),async ev=>{const f=new FormData(ev.target).get('file');if(!f?.size||f.size>10485760)throw new Error('Selecione um arquivo de até 10 MB.');if(!['application/pdf','image/png','image/jpeg'].includes(f.type))throw new Error('Use PDF, PNG ou JPEG.');const name=crypto.randomUUID()+'-'+f.name.replace(/[^a-zA-Z0-9._-]/g,'_');await unwrap(supabase.storage.from('student-documents').upload(s.user.id+'/'+name,f));await refreshDocs();render();notify('Arquivo salvo.');});
 document.querySelectorAll('[data-document]').forEach(b=>b.onclick=async()=>{try{const d=await unwrap(supabase.storage.from('student-documents').createSignedUrl(s.user.id+'/'+b.dataset.document,60));window.open(d.signedUrl,'_blank','noopener,noreferrer');}catch(err){fail(err);}});
 document.querySelectorAll('[data-delete-document]').forEach(b=>b.onclick=async()=>{if(!confirm('Excluir este arquivo?'))return;try{await unwrap(supabase.storage.from('student-documents').remove([s.user.id+'/'+b.dataset.deleteDocument]));await refreshDocs();render();}catch(err){fail(err);}});
}
addEventListener('hashchange',async()=>{s.menuOpen=false;document.body.classList.remove('menu-is-open');s.recovery=false;s.page=location.hash.slice(1)||'inicio';render();scrollTo(0,0);if(s.page==='documentos'){try{await refreshDocs();render();}catch(err){fail(err);}}});
supabase?.auth.onAuthStateChange((event,session)=>{
 if(event==='PASSWORD_RECOVERY'){
  clearStudentContext();
  s.recovery=true;s.authLoading=false;s.user=session?.user||null;s.demo=false;
  sessionStorage.removeItem('mc-demo');
  history.replaceState(null,'',location.pathname+'?flow=recovery#nova-senha');
  s.page='nova-senha';setTimeout(render,0);
 }
});
async function start(){
 if(!s.recovery&&sessionStorage.getItem('mc-demo')==='1'){s.demo=true;s.authLoading=false;Object.assign(s,blank(),demoLoad());s.universities=demoUniversities;s.page=location.hash.slice(1)||'painel';render();return;}
 let revision=accountRevision;
 s.loading=true;s.page=publicPages.includes(routeFromLocation())?routeFromLocation():'inicio';render();
 try{
  if(supabase){const {data,error}=await supabase.auth.getSession();if(error)throw error;if(s.demo||revision!==accountRevision&&!s.recovery)return;if(s.recovery)revision=accountRevision;s.user=data.session?.user||null;}
  s.authLoading=false;
  if(s.user&&!s.recovery){const studentData=await loadStudent(s.user.id);if(revision!==accountRevision)return;Object.assign(s,studentData);}
  if(s.demo)return;s.page=routeFromLocation();render();
  const items=await catalog();if(s.demo||revision!==accountRevision)return;s.universities=items;s.loading=false;if(s.page==='universidades'){refreshCatalogOptions();refreshCatalog();}
  if(s.page==='documentos'){await refreshDocs();render();}
 }catch(err){if(s.demo||revision!==accountRevision)return;s.authLoading=false;s.loading=false;s.error='Não foi possível carregar os dados: '+err.message;render();}
}

function updateWordCount(){const content=document.querySelector('#essay-content');if(!content)return;const n=wordCount(content.value),limit=document.querySelector('[name=word_limit]').value;document.querySelector('#word-count').textContent=n+' / '+limit+' palavras'+(n>Number(limit)?' · acima do limite':'');}
function bindDrafts(){
 const form=document.querySelector('#profile-form,#essay-form');if(!form)return;
 const key=form.id==='profile-form'?'profile':'essay:'+s.essayId;
 const saved=drafts.get(key);
 if(saved)for(const field of form.elements){if(field.name&&Object.hasOwn(saved,field.name)){if(field.type==='checkbox')field.checked=saved[field.name];else field.value=saved[field.name];}}
 updateWordCount();
 form.addEventListener('input',()=>{const values={};for(const field of form.elements)if(field.name)values[field.name]=field.type==='checkbox'?field.checked:field.value;drafts.set(key,values);});
}
function refreshCatalogOptions(){
 for(const [id,field,key,placeholder] of [['country','country','country','Todos os países'],['institution-group','institutional_group','group','Todos os tipos']]){
  const select=document.getElementById(id);if(!select)continue;
  const values=[...new Set(s.universities.map(u=>u[field]).filter(Boolean))].sort();
  select.replaceChildren(new Option(placeholder,''),...values.map(value=>new Option(value,value)));
  select.value=s[key];
 }
}
function refreshCatalog(){const target=document.querySelector('#catalog-results');if(target){target.innerHTML=views.catalogResults();bindCatalog();}}
function bindCatalog(){
 document.querySelectorAll('[data-detail]').forEach(b=>b.onclick=()=>detail(b.dataset.detail).catch(fail));
 document.querySelectorAll('[data-catalog-page]').forEach(b=>b.onclick=()=>{s.catalogPage=Number(b.dataset.catalogPage);refreshCatalog();document.querySelector('.catalog-toolbar')?.scrollIntoView({block:'start'});document.querySelector('#search')?.focus({preventScroll:true});});
 document.querySelector('[data-clear-filters]')?.addEventListener('click',()=>{s.search='';s.country='';s.group='';s.catalogPage=0;for(const id of ['search','country','institution-group'])document.getElementById(id).value='';refreshCatalog();document.querySelector('#search').focus();});
}
function setMenu(open){
 s.menuOpen=open;document.querySelector('.app-shell')?.classList.toggle('menu-open',open);document.body.classList.toggle('menu-is-open',open);
 document.querySelectorAll('[data-menu-toggle]').forEach(b=>b.setAttribute('aria-expanded',String(open)));
 if(open)document.querySelector('.sidebar [data-menu-close]')?.focus();else document.querySelector('.topbar [data-menu-toggle]')?.focus();
}
function bindNavigation(){
 document.querySelector('.skip-link')?.addEventListener('click',ev=>{ev.preventDefault();document.querySelector('main').focus();});
 document.querySelectorAll('[data-menu-toggle]').forEach(b=>b.onclick=()=>setMenu(!s.menuOpen));
 document.querySelectorAll('[data-menu-close]').forEach(b=>b.onclick=()=>setMenu(false));
 document.querySelectorAll('.sidebar nav a').forEach(a=>a.addEventListener('click',()=>{if(s.menuOpen)setMenu(false);}));
}
addEventListener('keydown',ev=>{
 if(!s.menuOpen)return;
 if(ev.key==='Escape'){setMenu(false);return;}
 if(ev.key==='Tab'){const items=[...document.querySelectorAll('.sidebar a,.sidebar button')].filter(el=>el.getClientRects().length);const first=items[0],last=items.at(-1);if(ev.shiftKey&&document.activeElement===first){ev.preventDefault();last.focus();}else if(!ev.shiftKey&&document.activeElement===last){ev.preventDefault();first.focus();}}
});
addEventListener('beforeunload',ev=>{if(drafts.size){ev.preventDefault();ev.returnValue='';}});

start();
