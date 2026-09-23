import {escapeHtml as e} from '../domain.js';
import {icon} from './icons.js';

export const link = (page, label, cls = 'button') => `<a class="${cls}" href="#${page}">${label}</a>`;
export const chip = text => `<span class="chip">${e(text)}</span>`;
export const empty = (title, body) => `<div class="empty"><span class="empty-icon">${icon('sparkle')}</span><h3>${title}</h3><p>${body}</p></div>`;
export const head = (label, title, description, action = '') => `<div class="page-heading"><div><span class="eyebrow">${label}</span><h1>${title}</h1><p>${description}</p></div>${action}</div>`;
export const brand = () => `<a class="brand" href="#inicio" aria-label="MeuCampus, início"><b>m<span>↗</span></b><span>meucampus<small>SEU FUTURO, MAIS PERTO</small></span></a>`;

export const navigation = [
  ['painel', 'home', 'Meu caminho'],
  ['perfil', 'user', 'Meu perfil'],
  ['universidades', 'school', 'Universidades'],
  ['lista', 'bookmark', 'Minha lista'],
  ['essays', 'pen', 'Essays'],
  ['sat', 'chart', 'Estudar SAT'],
  ['candidaturas', 'check', 'Candidaturas'],
  ['assistentes', 'sparkle', 'Assistentes'],
  ['documentos', 'folder', 'Documentos'],
];

export function shell(s, content, isPublic) {
  const current = navigation.find(([id]) => id === s.page)?.[2] || 'Seu espaço';
  const links = navigation.map(([id, glyph, label], index) => `${index === 4 ? '<div class="nav-label">SUA PREPARAÇÃO</div>' : ''}<a href="#${id}" aria-label="${label}" ${s.page === id ? 'aria-current="page"' : ''} class="${s.page === id ? 'active' : ''}">${icon(glyph)}<span>${label}</span>${id === 'lista' ? `<small>${s.list.length}/12</small>` : ''}</a>`).join('');
  return `<a class="skip-link" href="#main-content">Pular para o conteúdo</a><div class="${isPublic ? 'public-shell' : 'app-shell'} ${s.menuOpen ? 'menu-open' : ''}">
    ${isPublic ? `<header class="public-header">${brand()}<div class="header-links">${link('universidades', 'Explorar universidades', 'text-link')}${link(s.user || s.demo ? 'painel' : 'entrar', s.user || s.demo ? 'Meu painel' : 'Entrar', 'button primary')}</div></header>` : `
    <button class="menu-scrim" data-menu-close aria-label="Fechar menu" tabindex="-1"></button>
    <aside class="sidebar" id="main-navigation" aria-label="Menu principal"><div class="sidebar-brand">${brand()}<button class="icon-button mobile-only" data-menu-close aria-label="Fechar menu">${icon('close')}</button></div>
    <div class="workspace-label">MINHA JORNADA</div><nav>${links}</nav>
    <div class="sidebar-note">${icon('globe')}<p>Um passo de cada vez.<br><strong>Um mundo de possibilidades.</strong></p></div>
    <div class="sidebar-bottom"><div class="mini-avatar">${e((s.profile?.full_name || 'Você')[0])}</div><div><strong>${e(s.profile?.full_name || 'Seu perfil')}</strong><small>${s.demo ? 'Conta de demonstração' : 'Seu espaço privado'}</small></div><button class="icon-button" data-action="logout" aria-label="Sair">${icon('exit')}</button></div></aside>`}
    <main id="main-content" tabindex="-1" data-page="${e(s.page)}">
      ${isPublic ? '' : `<div class="topbar"><div><button class="icon-button mobile-only" data-menu-toggle aria-label="Abrir menu" aria-expanded="${Boolean(s.menuOpen)}" aria-controls="main-navigation">${icon('menu')}</button><span class="breadcrumb">Sua jornada <span>/</span> <b>${current}</b></span></div><a class="topbar-profile" href="#perfil" aria-label="Abrir meu perfil">${icon('user')}<span>${e(s.profile?.full_name?.split(' ')[0] || 'Meu perfil')}</span></a></div>`}
      ${s.demo ? `<div class="demo-banner">${icon('info')}<span>Você está na demonstração. As instituições são fictícias e seus dados ficam neste navegador.</span></div>` : ''}
      ${s.error ? `<div class="error-banner" role="alert">${e(s.error)} <button class="text-link" data-action="retry">Tentar novamente</button></div>` : ''}
      <div class="page-content">${content}</div>
    </main>
    ${isPublic ? '' : `<nav class="mobile-navigation" aria-label="Navegação rápida">${navigation.filter(([id]) => ['painel', 'universidades', 'lista'].includes(id)).map(([id,glyph,label]) => `<a href="#${id}" ${s.page === id ? 'aria-current="page"' : ''}>${icon(glyph)}<span>${id === 'painel' ? 'Meu caminho' : label}</span></a>`).join('')}<button data-menu-toggle aria-label="Mais opções" aria-expanded="${Boolean(s.menuOpen)}">${icon('menu')}<span>Mais</span></button></nav>`}
  </div>`;
}
