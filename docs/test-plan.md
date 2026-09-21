# Plano de testes

## Autorização

- estudante A não lê perfil, tasks, essays ou documentos de estudante B;
- responsável perde acesso ao revogar vínculo;
- orientador só vê escopos autorizados;
- administrador não recebe essay no painel padrão.

## Fontes

- requisito sem fonte é exibido como `não confirmado`;
- ciclo e data aparecem em toda estatística;
- fonte vencida cria alerta;
- conflito impede publicação sem revisão.

## Agente

- usuário não consegue enviar `userId` de outra pessoa para alterar dados;
- ação relevante exige confirmação;
- cancelamento não altera banco;
- desfazer restaura versão anterior;
- resposta sem fonte admite incerteza;
- prompt injection em documento não muda instruções do sistema.

## Candidatura

- limites de palavra e caracteres contam corretamente;
- versões de essay são preservadas;
- atividades não aceitam impacto inventado como fato verificado;
- deadlines usam fuso e ciclo corretos;
- exportação inclui dados do usuário e fontes associadas;
- exclusão remove ou agenda todos os dados privados.

## Produto

- keyboard navigation e labels;
- layout em 320px, 768px e desktop;
- estados vazio, carregando e erro;
- `npm run build` sem erros e links internos navegáveis.
