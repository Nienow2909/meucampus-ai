# Configuração operacional

## Supabase

Projeto: qfjvkidwyyhsenfgvpiy. Região: sa-east-1.
Estrutura aplicada via migração international_platform. O timestamp local foi alinhado ao histórico retornado pelo servidor.

A função counselor está publicada com verify_jwt=true. Além da verificação do gateway, ela valida o usuário com getUser, consulta dados com RLS e exige consentimento de IA.
A credencial service role é usada exclusivamente no servidor para salvar histórico de respostas. Nenhuma chave privada foi incluída no repositório.

Configure pelo painel de Secrets das Edge Functions:
- OPENAI_API_KEY: credencial privada da conta OpenAI. AI_API_KEY também é aceito para compatibilidade.
- AI_CHAT_URL: opcional; padrão https://api.openai.com/v1/chat/completions.
- AI_ENABLED: manter ausente ou false até autorizar a ativação. Definir true somente na ativação.
- Modelo fixado em gpt-5-nano, reasoning_effort minimal e limite de 1.500 tokens de saída/raciocínio. AI_MODEL não é mais usado; veja docs/ai-costs.md.
- APP_ORIGIN: origem HTTPS do frontend publicado.

A função usa Chat Completions e consulta 400 fichas e trechos do guia via search_knowledge. Sem a chave privada retorna 503 explícito. O limite é 40 solicitações por usuário/dia UTC; falhas após a reserva também contam. Configure também limites de gasto na conta do provedor.

Antes de ativar para alunos, testar o modelo, limites, qualidade, citações e latência. A geração real não foi testada sem uma credencial de provedor.

## Frontend

Configure as variáveis públicas de .env.example no serviço de hospedagem. Nunca use service_role no navegador.
Publique dist/ após npm run build. A navegação usa fragmentos (#), dispensando regras especiais de fallback para rotas.

Configure no Supabase Auth a URL do site final e os redirecionamentos autorizados. Não desative confirmação de e-mail para contornar problemas de entrega.

## Observações dos advisors

Na revisão de 23/09/2026, há WARN de proteção contra senhas vazadas desativada; conferir disponibilidade no plano e ativar no painel antes do lançamento. Há INFO esperado de RLS sem policy em private.ai_usage: a tabela é deliberadamente inacessível diretamente; só a função privada controlada registra consumo.
Referência: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
Referência: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy
Índices sem uso são esperados antes de tráfego de produção: https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index

## Hospedagem para revisão

Sites project: appgprj_6ab3b72655688191bc70300bd15e95c8. O manifest declara saída estática em dist/. O repositório GitHub permanece a base de desenvolvimento; Sites recebe a mesma versão para hospedagem privada.

A configuração da URL de retorno no Supabase Auth depende de acesso ao painel. O navegador desta sessão não estava autenticado; nenhuma configuração de proteção foi desativada. Após definir a URL do site, testar cadastro, confirmação e login com e-mail real.

Os PDFs completos e as credenciais não estão no Git. A auditoria e os scripts permitem reconstruir a importação a partir dos arquivos originais.
