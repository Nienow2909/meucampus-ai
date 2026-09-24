import {escapeHtml as e} from '../domain.js';
import {head, link, chip, empty} from '../ui/components.js';
import {icon} from '../ui/icons.js';
import {filterCatalog} from '../catalog.js';

export function catalogView(s) {
  const student = s.user || s.demo;
  return `${head('SEUS DESTINOS COMEÇAM AQUI','Encontre seu próximo lugar.','Explore áreas, conheça cada instituição e construa sua lista.',student?link('lista',`${icon('bookmark')} Minha lista · ${s.list.length}/12`,'button secondary'):link('entrar','Criar minha lista ↗','button primary'))}
    <section class="catalog-toolbar" aria-label="Busca e filtros"><div class="search-field">${icon('search')}<label class="sr-only" for="search">Buscar universidade ou curso</label><input id="search" type="search" value="${e(s.search)}" placeholder="Universidade, sigla ou área de interesse" autocomplete="off"></div>
    <div class="catalog-filters"><label>País<select id="country" aria-label="País"><option value="">Todos os países</option>${[...new Set(s.universities.map(u=>u.country))].sort().map(c=>`<option ${s.country===c?'selected':''}>${e(c)}</option>`).join('')}</select></label>
    <label>Tipo de instituição<select id="institution-group" aria-label="Tipo de instituição"><option value="">Todos os tipos</option>${[...new Set(s.universities.map(u=>u.institutional_group).filter(Boolean))].sort().map(c=>`<option ${s.group===c?'selected':''}>${e(c)}</option>`).join('')}</select></label>
    <label>Ordenar por<select id="catalog-sort" aria-label="Ordenar por"><option value="catalog" ${s.sort==='catalog'?'selected':''}>Ordem do catálogo</option><option value="name" ${s.sort==='name'?'selected':''}>Nome: A–Z</option><option value="country" ${s.sort==='country'?'selected':''}>País</option></select></label></div></section>
    <div id="catalog-results">${catalogResults(s)}</div>`;
}

export function catalogResults(s) {
  if(s.loading) return `<div class="loading-state" role="status"><span class="spinner"></span>Preparando seu catálogo…</div><div class="university-grid" aria-hidden="true">${Array.from({length:6},()=>'<div class="skeleton-card"></div>').join('')}</div>`;
  if(s.error&&!s.universities.length)return empty('Catálogo temporariamente indisponível.','Use Tentar novamente acima para carregar as instituições.');
  const items=filterCatalog(s.universities,s);
  const total=Math.max(1,Math.ceil(items.length/24));s.catalogPage=Math.max(0,Math.min(s.catalogPage,total-1));
  const hasFilter=Boolean(s.search||s.country||s.group);
  return `<div class="catalog-results-heading"><p role="status" aria-live="polite"><b>${items.length}</b> universidades ${s.demo?'fictícias':`de ${s.universities.length} no catálogo`} <span>· página ${s.catalogPage+1} de ${total}</span></p>${hasFilter?'<button class="text-link" data-clear-filters>Limpar filtros ×</button>':''}</div>
    ${!s.demo?`<div class="catalog-disclaimer">${icon('info')}<span>As metas do guia são orientações. Confirme requisitos, prazos e bolsas na fonte oficial.</span></div>`:''}
    ${items.length?`<div class="university-grid">${items.slice(s.catalogPage*24,(s.catalogPage+1)*24).map((u,i)=>{
      const selected=s.list.find(x=>x.university_id===u.id);
      const initials=u.name.split(' ').filter(x=>!['of','the','at','and'].includes(x.toLowerCase())).slice(0,3).map(x=>x[0]).join('');
      return `<article class="university-card"><div class="university-art art-${i%4}"><span class="university-monogram">${e(initials)}</span><div>${icon('globe')}<small>${e(u.country)}</small></div>${selected?`<span class="saved-marker" aria-label="Já está na sua lista">${icon('bookmark')}</span>`:''}</div><div class="university-body"><span class="institution-type">${e(s.demo?'Instituição fictícia':u.institutional_group||'Graduação internacional')}</span><h3>${e(u.name)}</h3><p>${e(u.city||u.country)}</p><div class="course-tags">${u.courses.slice(0,3).map(chip).join('')}${u.courses.length>3?chip('+'+(u.courses.length-3)):''}</div><button class="card-action" data-detail="${e(u.id)}" aria-label="Explorar e escolher ${e(u.name)}"><span>${selected?'Ver minha escolha':'Explorar e escolher'}</span>${icon('arrow')}</button></div></article>`;
    }).join('')}</div><div class="pagination"><button class="button secondary" data-catalog-page="${s.catalogPage-1}" ${s.catalogPage===0?'disabled':''}>← Anterior</button><span>Página <b>${s.catalogPage+1}</b> de ${total}</span><button class="button secondary" data-catalog-page="${s.catalogPage+1}" ${s.catalogPage+1===total?'disabled':''}>Próxima →</button></div>`:empty('Nenhum resultado por aqui.','Experimente outro nome, uma sigla ou uma área. Você também pode limpar os filtros.')}`;
}
