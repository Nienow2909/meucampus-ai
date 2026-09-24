import {link} from '../ui/components.js';
import {configured} from '../data.js';

export function recoveryView(s){
  const reset=s.page==='nova-senha';
  const ready=reset&&s.user&&!s.demo;
  return `<section class="auth-layout"><div><span class="eyebrow">ACESSO À SUA CONTA</span><h1>${reset?'Um novo acesso.<br>O mesmo caminho.':'Vamos recuperar<br>seu acesso.'}</h1><p>${reset?'Defina uma senha de pelo menos 8 caracteres.':'Enviaremos um link para o e-mail usado no seu cadastro.'}</p></div>
    ${reset&&!ready?`<section class="panel auth-card"><h2>${s.authLoading?'Verificando seu link…':'Solicite um novo link'}</h2><p>${s.authLoading?'Aguarde enquanto confirmamos seu acesso.':'Este link não abriu uma sessão válida. Ele pode ter expirado ou já ter sido usado.'}</p>${link('recuperar','Recuperar minha senha','button primary')}</section>`:
    `<form id="${reset?'reset':'recovery'}-form" class="panel auth-card"><h2>${reset?'Crie sua nova senha':'Esqueceu sua senha?'}</h2>
      ${reset?'<label>Nova senha<input name="password" type="password" autocomplete="new-password" minlength="8" required></label><label>Repita a nova senha<input name="confirmation" type="password" autocomplete="new-password" minlength="8" required></label>':'<label>E-mail da sua conta<input name="email" type="email" autocomplete="email" required></label>'}
      <button class="button primary" ${configured?'':'disabled'}>${reset?'Salvar nova senha':'Enviar link de recuperação'}</button>
      <p id="recovery-result" role="status" hidden></p>${link('entrar','Voltar para entrar','text-link')}
    </form>`}</section>`;
}
