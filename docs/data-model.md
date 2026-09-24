# Modelo ativo

- student_profiles: dono auth.users; contexto escolar, notas, SAT atual/meta, interesses, condições financeiras e consentimento.
- universities: 400 fichas, ordem no catálogo, grupo, áreas, detalhes e guidance editorial separado de requirements; somente published=true é público.
- university_sources: documento/página inicial/final ou registro CSV, URL, trecho, ciclo e estado. Fontes provided e verified de universidades publicadas são expostas com rótulos distintos.
- knowledge_chunks: 3.334 trechos do guia canônico, com página, atribuição de universidade quando não ambígua e índice textual em português. Somente usuários autenticados podem ler. Nenhum aluno pode gravar.
- student_universities: chave por dono/categoria/slot, universidade única por dono e limites 3/4/5.
- tasks: título, prazo, conclusão e universidade opcional.
- essays: texto, enunciado, limite e versão para controle de concorrência.
- sat_attempts: tentativas nos exercícios autorais; não são notas oficiais.
- ai_messages: histórico por dono e especialidade; clientes só podem ler.
- private.ai_usage: contador diário atômico; acesso apenas por função privada com identidade da sessão.
- storage student-documents: bucket privado, prefixo obrigatório do usuário.

Fonte executável de verdade: supabase/migrations/. Scripts db/ são legados.
