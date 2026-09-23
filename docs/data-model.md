# Modelo ativo

- student_profiles: dono auth.users; contexto escolar, notas, SAT atual/meta, interesses, condições financeiras e consentimento.
- universities: informações por ciclo; somente published=true é público.
- university_sources: documento/página ou URL, trecho, ciclo, data e estado da revisão; apenas fontes verificadas de universidades publicadas são expostas.
- student_universities: chave por dono/categoria/slot, universidade única por dono e limites 3/4/5.
- tasks: título, prazo, conclusão e universidade opcional.
- essays: texto, enunciado, limite e versão para controle de concorrência.
- sat_attempts: tentativas nos exercícios autorais; não são notas oficiais.
- ai_messages: histórico por dono e especialidade; clientes só podem ler.
- private.ai_usage: contador diário atômico; acesso apenas por função privada com identidade da sessão.
- storage student-documents: bucket privado, prefixo obrigatório do usuário.

Fonte executável de verdade: supabase/migrations/. Scripts db/ são legados.
