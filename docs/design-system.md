# MeuCampus — acabamento visual

Atualização de 24/09/2026. Referência: sistema claymorphism fornecido pelo usuário, combinado com o pedido posterior de um visual mais clean e menos genérico.

## Direção

Nunito nos títulos e números; DM Sans na leitura. Canvas #F4F1FA, texto #332F3A, secundário #635F69 e ação principal #7C3AED. Profundidade em quatro camadas, botões de 56 px, campos de 64 px, cartões arredondados e cores pontuais por função. Os gradientes e as sombras seguem a referência, com menos estrelas, enfeites e frases vagas.

O tema está centralizado em `src/styles/clay.css`, separado da estrutura das telas. As seções do arquivo cobrem tokens, controles, navegação, apresentação, áreas de trabalho e tamanhos de tela. Os estilos de layout existentes são preservados; o tema final é importado por último em `src/style.css`.

## Comportamento

- Navegação móvel com menu lateral, Escape, foco e fechamento ao selecionar a própria página.
- Fundo com três luzes ambientes, sem capturar cliques.
- Movimento discreto; `prefers-reduced-motion` desativa animações e transições.
- Mesmos componentes visuais para catálogo, perfil, lista, essays, SAT, documentos, candidaturas e assistentes.
- Página inicial com composição assimétrica; páginas de trabalho priorizam dados e ações.
- Nenhuma imagem inventada de campus, avaliação fictícia, depoimento ou promessa de aprovação.

## Verificação

11 testes unitários e 13 testes de navegador locais passaram. A verificação adicional do catálogo real confirmou 400 instituições. Testes de layout cobrem 320, 390, 768 e 1024 px; capturas de desktop em 1440 px e de celular foram inspecionadas. Testes de autenticação usam respostas simuladas: não comprovam entrega de e-mail em produção.

## Pendências operacionais

A ativação das quatro IAs foi adiada pelo usuário. A publicação automática do Supabase está preparada, mas exige configuração de credencial administrativa no GitHub. Cadastro, confirmação e recuperação por e-mail precisam de validação real após confirmar a configuração de URLs e SMTP no Supabase. Consulte `deployment.md`.
