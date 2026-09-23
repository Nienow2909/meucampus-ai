# MeuCampus AI

Plataforma em português para brasileiros que planejam graduação no exterior. Identidade própria, inspirada na categoria de orientação universitária do Collegize. Nenhum código-fonte do Collegize foi acessado ou reutilizado.

Visual e experiência revisados em 23/09/2026. Veja [alterações](CHANGELOG.md) e [organização do projeto](docs/architecture.md).

## Estado da implementação

- Perfil com notas na escala original, extracurriculares, curso, países, orçamento, bolsa e SAT atual/meta separados.
- Catálogo público com 400 instituições reais, 1.000 registros de origem e 3.334 trechos pesquisáveis no Supabase.
- Lista de 3 sonho, 4 possíveis e 5 mais acessíveis. Limites e unicidade protegidos no banco.
- Candidaturas com tarefas, prazos informados pelo aluno e vínculo à universidade.
- Essays com editor, contagem, persistência e controle otimista de versão (não é histórico completo de versões).
- SAT com 4 exercícios autorais iniciais e registro de tentativas; não é simulado oficial nem curso completo.
- Quatro assistentes via Edge Function autenticada, consulta ao guia e OpenAI preparada. Modo econômico GPT-5 nano; ativação adiada. Exige OPENAI_API_KEY e AI_ENABLED=true após autorização e validação.
- Documentos privados de até 10 MB, URLs temporárias e exclusão.
- Modo demonstração explícito com 15 instituições fictícias, separado das contas reais.

## Rodar

Requer Node.js 22.12 ou mais recente.

1. Execute `npm ci`.
2. Copie `.env.example` para `.env.local` e configure a URL e chave **publicável** do Supabase.
3. Execute `npm run dev`.

Projeto Supabase preparado: `qfjvkidwyyhsenfgvpiy`, região São Paulo.
Nunca coloque service role, senha ou chave de IA em variáveis `VITE_*`, código frontend ou Git.

## Verificação

- `npm test`: regras de domínio.
- `npm run test:e2e:local`: Chrome instalado, jornada, responsividade e regressões de usabilidade.
- `npm run test:e2e`: inclui integração com Supabase real; exige rede e `.env.local`.
- `npm run build`: bundle de produção.
- `tests/database-rls.sql`: teste transacional do banco com fixtures revertidas.

## Implantação

O frontend pode ser hospedado em um serviço compatível com sites estáticos. Configure as duas variáveis `VITE_*` no ambiente de build, execute `npm run build` e publique `dist/`. O projeto está registrado no Sites para hospedagem privada de revisão; a identidade da hospedagem fica em `.openai/hosting.json`.

No Supabase Auth, configure a URL final do site e redirecionamentos permitidos. O fluxo utiliza cadastro por e-mail e senha com confirmação. Envio/entrega real de e-mail e recuperação de senha ainda precisam de validação e implementação, respectivamente.

A migração em `supabase/migrations/` corresponde à estrutura já aplicada ao projeto. Não reaplique em banco legado sem revisar compatibilidade. Consulte `docs/deployment.md`.

## Pendências para um lançamento completo

- Conferir oficialmente requisitos por ciclo; as 400 fichas importadas estão rotuladas como material fornecido.
- Configurar e validar o modelo/provedor de IA com perguntas reais e checagem de fontes.
- Ampliar o banco SAT e validar pedagogicamente o diagnóstico adaptativo.
- Implementar painel editorial, atualização de fontes, exportação/exclusão de conta e requisitos operacionais de privacidade.
- Validar cadastro e e-mail ponta a ponta, recuperação de senha e domínio final.
- Validar o domínio e a experiência de cadastro antes da abertura para alunos.
- Probabilidade individual de admissão não implementada: exige dados históricos e validação. O sistema não exibe percentuais inventados.

Consulte `docs/` para contratos, fontes e próximos passos.

Relatório de conteúdo e próximos passos: [docs/recomendacoes.md](docs/recomendacoes.md). Auditoria: [docs/catalog-audit.json](docs/catalog-audit.json).

Política de consumo e custos dos assistentes: [docs/ai-costs.md](docs/ai-costs.md).
