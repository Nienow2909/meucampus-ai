# MeuCampus — acabamento visual

Atualização de 24/09/2026. Referência: sistema claymorphism fornecido pelo usuário, combinado com o pedido posterior de um visual mais clean e menos genérico.

## Direção

Nunito nos títulos e números; DM Sans na leitura. Canvas #F4F1FA, texto #332F3A, secundário #635F69 e ação principal #7C3AED. Profundidade em quatro camadas, botões de 56 px, campos de 64 px, cartões arredondados e cores pontuais por função. Os gradientes e as sombras seguem a referência, com menos estrelas, enfeites e frases vagas.

O tema está centralizado em `src/styles/clay.css`, separado da estrutura das telas. As seções do arquivo cobrem tokens, controles, navegação, apresentação, áreas de trabalho e tamanhos de tela. `home-tools.css` e `editorial.css` complementam o tema com os layouts da apresentação e leitura, reutilizando os mesmos tokens.

## Comportamento

- Navegação móvel com menu lateral, Escape, foco e fechamento ao selecionar a própria página.
- Fundo com três luzes ambientes, sem capturar cliques.
- Movimento discreto; `prefers-reduced-motion` desativa animações e transições.
- Mesmos componentes visuais para catálogo, perfil, lista, essays, SAT, documentos, candidaturas e assistentes.
- Página inicial com composição assimétrica; páginas de trabalho priorizam dados e ações.
- Nenhuma imagem inventada de campus, avaliação fictícia, depoimento ou promessa de aprovação.

## Verificação

Testes unitários e de navegador cobrem domínio, autenticação, jornada e conteúdo público. Testes de layout cobrem 320, 390, 768, 1024 e 1440 px. Os testes de autenticação usam respostas simuladas; separadamente, um envio real de recuperação foi aceito e o recebimento confirmado pelo responsável. Isso não comprova o fluxo completo de redefinição ou a entrega a outros alunos.

## Pendências operacionais

A ativação das quatro IAs foi adiada pelo usuário. A publicação automática do Supabase está preparada, mas exige configuração de credencial administrativa no GitHub. As URLs de retorno foram configuradas e confirmadas no Supabase. SMTP próprio e validação completa de cadastro, confirmação e redefinição continuam pendentes. O responsável está preparando o e-mail e o telefone oficiais. Consulte `deployment.md`.

## Consistência entre telas e contas

O carregamento tardio do catálogo atualiza somente os resultados e filtros, preservando campos de login já preenchidos e o foco. Ao entrar em uma conta ou iniciar a demonstração, rascunhos e estados temporários anteriores são descartados. Respostas de carregamento de perfil iniciadas antes dessa troca não substituem o contexto atual. Testes com a API simulada cobrem preservação de credenciais digitadas e isolamento do rascunho de demonstração.

## Conteúdo público

Quem somos apresenta a proposta e os princípios da plataforma sem inventar equipe, credenciais ou resultados. O Blog tem três artigos completos e referências oficiais consultadas em 24/09/2026. Perguntas frequentes explica demonstração, catálogo, grupos 3/4/5 e o estado das IAs. O rodapé e a navegação pública dão acesso a essas páginas em todas as larguras. Links diretos dos artigos sobrevivem ao recarregamento e recebem título próprio no navegador.

As capas são composições CSS com os ícones existentes, sem imagens externas adicionais. O conteúdo fica versionado no GitHub e não altera tabelas ou permissões do Supabase. Para editar artigos, atualize `src/content/articles.js`; para publicar contatos reais, atualize o rodapé e a resposta correspondente em `src/views/editorial.js`. Não há formulário de contato ou newsletter sem um destino configurado.
