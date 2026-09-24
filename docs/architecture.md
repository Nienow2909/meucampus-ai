# Organização do projeto

## Frontend

- `src/main.js`: sessão, estado, navegação e ações do aluno.
- `src/views/overview.js`: página inicial e painel de próximos passos.
- `src/views/catalog.js`: busca, filtros, paginação e cartões.
- `src/views/index.js`: formulários e telas de preparação.
- `src/ui/`: componentes compartilhados, navegação e ícones SVG.
- `src/styles/`: base visual, layout, painel, catálogo, formulários e responsividade.
- `src/catalog.js`: busca por termos, acentos, siglas e ordenação.
- `src/domain.js`: regras de perfil, preparação e lista 3/4/5.
- `src/data.js`: consultas Supabase e armazenamento da demonstração.

O catálogo carrega somente os campos necessários aos cartões. Ao abrir uma instituição, a aplicação consulta a ficha e suas fontes e mantém o resultado em memória. A busca atualiza apenas os resultados, preservando o campo e o foco. Fechar uma ficha durante o carregamento impede que uma resposta atrasada reabra o modal.

Rascunhos de perfil e essays permanecem em memória ao navegar entre telas. O salvamento continua explícito. Fechar/recarregar a página com alterações pendentes produz o aviso nativo do navegador. Sair da conta limpa esses rascunhos. Não há envio automático de textos à IA.

## Supabase

`supabase/migrations/` é a fonte ativa do esquema. `db/` contém apenas o protótipo legado e está identificado como tal. Não executar os dois conjuntos juntos.

| Conjunto | Tabelas / recursos | Acesso |
| --- | --- | --- |
| Catálogo | `universities`, `university_sources` | Consulta de instituições publicadas e fontes permitidas |
| Conteúdo para orientação | `knowledge_chunks` | Leitura autenticada; sem escrita por alunos |
| Espaço do aluno | `student_profiles`, `student_universities`, `tasks`, `essays`, `sat_attempts` | RLS por dono |
| Conversas | `ai_messages` | Leitura por dono; escrita controlada no servidor |
| Limites | `private.ai_usage` | Função privada controlada |
| Documentos | Bucket `student-documents` | Privado, com prefixo do usuário |

As mudanças visuais desta versão não exigem nova migração nem alteram permissões. A consulta de inventário confirmou 400 universidades, 1.000 registros de fontes, 3.334 trechos e RLS nas nove tabelas públicas. A ativação do provedor de IA permanece pendente por escolha do usuário.

## Verificação

- `npm test`: regras de domínio, busca e recuperação de conteúdo.
- `npm run test:e2e:local`: jornada demonstrativa, telas responsivas, rascunhos, filtros e carregamento de fichas com API controlada no teste.
- `npm run test:e2e`: inclui também a integração com o catálogo real; exige conexão Supabase configurada e acesso à rede.
- `npm run build`: distribuição estática em `dist/`.

O GitHub Actions verifica regras, build e os fluxos locais no Chromium. O teste com o catálogo real é executado separadamente em um ambiente configurado, sem credenciais privadas no repositório.

## Resultado desta revisão

Em 23/09/2026: 7 testes de regras e 9 testes no Chrome aprovados, incluindo a consulta ao catálogo real e suas fontes. Build de produção aprovado. Capturas de desktop e celular foram inspecionadas. Login/cadastro com entrega real de e-mail e respostas do provedor de IA não foram revalidados nesta revisão visual.
