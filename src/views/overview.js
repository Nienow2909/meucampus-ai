import {agents, groups, escapeHtml as e, profileProgress} from '../domain.js';
import {head, link} from '../ui/components.js';
import {icon} from '../ui/icons.js';

const featuredNodes = [
  {name:'Harvard University', slug:'harvard', country:'Estados Unidos', focus:'Direito & Negócios', signal:'Ivy League', angle:-90},
  {name:'Stanford University', slug:'stanford', country:'Estados Unidos', focus:'Tecnologia & Design', signal:'Vale do Silício', angle:-30},
  {name:'MIT', slug:'mit', country:'Estados Unidos', focus:'Engenharia & Ciências', signal:'Pesquisa aplicada', angle:30},
  {name:'Univ. of Toronto', slug:'toronto', country:'Canadá', focus:'Pesquisa & Medicina', signal:'Research U15', angle:90},
  {name:'Yale University', slug:'yale', country:'Estados Unidos', focus:'Artes & Humanidades', signal:'Ivy League', angle:150},
  {name:'Univ. of British Columbia', slug:'ubc', country:'Canadá', focus:'Sustentabilidade', signal:'Costa do Pacífico', angle:210},
];

function mindNode(u, i) {
  return `<div class="jv-node" style="--a:${u.angle}deg">
    <div class="jv-node-float">
      <span class="jv-connector" aria-hidden="true"></span>
      <a class="jv-balloon" href="#universidades" aria-label="Explorar universidades como ${e(u.name)}">
        <span class="jv-photo"><img src="/campus/${u.slug}.png" alt="Campus da ${e(u.name)}" loading="lazy" width="196" height="122"></span>
        <div class="jv-balloon-body">
          <span class="jv-node-index">N-0${i+1}</span>
          <h3>${e(u.name)}</h3>
          <span class="jv-country">${e(u.country)}</span>
          <div class="jv-scan"><div>
            <span class="jv-scan-line">FOCO <b>${e(u.focus)}</b></span>
            <span class="jv-scan-line">REDE <b>${e(u.signal)}</b></span>
            <span class="jv-scan-line">STATUS <b>NO CATÁLOGO</b></span>
          </div></div>
        </div>
      </a>
    </div>
  </div>`;
}

export function homeView(s) {
  return `<div class="jv">
  <div class="jv-grid" aria-hidden="true"></div>
  <div class="jv-vignette" aria-hidden="true"></div>

  <section class="jv-hero">
    <span class="jv-eyebrow"><span class="jv-dot"></span> SISTEMA MEUCAMPUS · ONLINE</span>
    <h1>Um mundo lá fora.<br><em>Um caminho seu.</em></h1>
    <p>Uma inteligência que conecta você às universidades que fazem sentido. Explore a rede, organize suas escolhas e transforme a vontade de estudar fora em próximos passos.</p>
    <div class="jv-actions">${link('universidades', `Explorar universidades ${icon('arrow')}`, 'button primary')}<button class="button secondary" data-action="demo">Explorar demonstração</button></div>
    <div class="jv-proof"><span>${icon('school')} 400 instituições mapeadas</span><span>${icon('globe')} Estados Unidos e Canadá</span></div>
  </section>

  <section class="jv-field" aria-label="Rede de universidades conectadas à inteligência MeuCampus">
    <div class="jv-core" aria-hidden="true">
      <span class="jv-ring r3"></span><span class="jv-ring r2"></span><span class="jv-ring r1"></span>
      <span class="jv-core-orb"></span>
      <span class="jv-core-label">MEU<br>CAMPUS</span>
    </div>
    ${featuredNodes.map(mindNode).join('')}
  </section>

  <section class="jv-features" aria-label="Suas ferramentas">${Object.entries(agents).map(([key,[name,description]],i)=>`<article><span class="jv-feature-icon">${icon(['school','pen','chart','check'][i])}</span><h3>${e(name)}</h3><p>${e(description)}</p></article>`).join('')}</section>

  <footer class="jv-footer"><span>MeuCampus AI · Sua jornada internacional.</span><span>Orientação com fontes. Sem promessa de aprovação.</span></footer>
  </div>`;
}

export function dashboardView(s, taskList) {
  const progress = profileProgress(s.profile);
  const done = s.tasks.filter(t=>t.done).length;
  const next = !s.profile ? ['perfil','Vamos começar por você.','Conte sua história, suas experiências e o que você procura em uma universidade.','Completar meu perfil'] : s.list.length < 12 ? ['universidades','Seu próximo destino está aqui.','Explore o catálogo e encontre as opções que combinam com o que você quer construir.','Explorar universidades'] : ['candidaturas','Suas escolhas viraram um plano.','Organize prazos e acompanhe as próximas ações para cada universidade da sua lista.','Organizar minha candidatura'];
  const pending = [...s.tasks].filter(t=>!t.done).sort((a,b)=>(a.due_on || '9999').localeCompare(b.due_on || '9999'));
  return `${head('SEU ESPAÇO PARA IR MAIS LONGE',`Olá, ${e(s.profile?.full_name?.split(' ')[0]||'viajante')} <span class="greeting-star">✦</span>`,'Cada pequeno passo abre uma nova possibilidade.',link('perfil',`${icon('user')} Atualizar meu perfil`,'button secondary'))}
    <div class="dashboard-grid"><section class="dashboard-hero"><span class="eyebrow">SEU PRÓXIMO PASSO</span><h2>${next[1]}</h2><p>${next[2]}</p>${link(next[0],`${next[3]} ${icon('arrow')}`,'button lime')}<span class="hero-orbit orbit-one" aria-hidden="true"></span><span class="hero-orbit orbit-two" aria-hidden="true"></span><span class="hero-star" aria-hidden="true">✦</span></section>
    <section class="panel profile-summary"><div class="section-title"><span class="eyebrow">SEU PONTO DE PARTIDA</span>${icon('user')}</div><div class="progress-ring" style="--progress:${progress}%" role="progressbar" aria-label="Perfil preenchido" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"><span><b>${progress}<small>%</small></b><small>do perfil preenchido</small></span></div><p>${progress===100?'Seu contexto está pronto. Atualize sempre que algo mudar.':'Quanto mais você conta, mais contexto tem para suas escolhas.'}</p>${link('perfil','Continuar meu perfil →','text-link')}</section></div>
    <div class="metric-grid"><article><div class="metric-heading"><span>MINHAS ESCOLHAS</span>${icon('bookmark')}</div><strong>${s.list.length}<small> / 12</small></strong><small>Seu mapa de universidades</small></article><article><div class="metric-heading"><span>MEU SAT ATUAL</span>${icon('chart')}</div><strong>${s.profile?.sat_actual??'—'}</strong><small>Meta: ${s.profile?.sat_target??'a definir'} · cenário futuro</small></article><article><div class="metric-heading"><span>AÇÕES CONCLUÍDAS</span>${icon('check')}</div><strong>${done}<small> / ${s.tasks.length}</small></strong><small>Progresso do plano, não chance de admissão</small></article></div>
    <section class="panel journey-progress"><div class="section-title"><div><h2>Sua lista está tomando forma</h2><p>Três grupos para organizar suas possibilidades.</p></div>${link('lista','Ver minha lista →','text-link')}</div><div class="journey-groups">${Object.entries(groups).map(([key,g],i)=>{const count=s.list.filter(x=>x.category===key).length;return `<a href="#lista" class="journey-group group-${key}"><span class="group-number">0${i+1}</span><div><b>${g.label}</b><small>${count} de ${g.limit} escolhidas</small><div class="slot-dots" aria-hidden="true">${Array.from({length:g.limit},(_,n)=>`<i class="${n<count?'filled':''}"></i>`).join('')}</div></div>${icon('arrow')}</a>`;}).join('')}</div></section>
    <div class="two-columns"><section class="panel"><div class="section-title"><h2>O que vem agora</h2>${link('candidaturas','Ver meu plano →','text-link')}</div>${taskList(pending.slice(0,4))}</section><section class="panel assistant-shortcuts"><span class="eyebrow">QUATRO ESPECIALIDADES</span><h2>Um apoio para cada etapa.</h2><p>Escolha o assunto que você quer trabalhar hoje.</p><div>${Object.entries(agents).map(([key,[title]],i)=>`<button data-agent="${key}"><span class="feature-icon feature-${i}">${icon(['school','pen','chart','check'][i])}</span><b>${title}</b>${icon('arrow')}</button>`).join('')}</div></section></div>`;
}
