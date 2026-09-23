# Configuração operacional

## Supabase

Projeto: qfjvkidwyyhsenfgvpiy. Região: sa-east-1.
Estrutura aplicada via migração international_platform. O timestamp local foi alinhado ao histórico retornado pelo servidor.

A função counselor está publicada com verify_jwt=true. Além da verificação do gateway, ela valida o usuário com getUser, consulta dados com RLS e exige consentimento de IA.
A credencial service role é usada exclusivamente no servidor para salvar histórico de respostas. Nenhuma chave privada foi incluída no repositório.

Configure pelo painel de Secrets das Edge Functions:
- AI_API_KEY: credencial privada do provedor escolhido.
- AI_CHAT_URL: endpoint HTTPS compatível com Chat Completions.
- AI_MODEL: modelo compatível com messages, max_completion_tokens e response_format json_object.
- APP_ORIGIN: origem HTTPS do frontend publicado.

A função usa o contrato Chat Completions; provedores incompatíveis exigem adaptar o servidor. Sem as três configurações de IA, retorna 503 com mensagem explícita. O limite é de 40 solicitações por usuário/dia UTC; falhas após a reserva também contam.

Antes de ativar para alunos, testar o modelo, limites, qualidade, citações e latência. A geração real não foi testada sem uma credencial de provedor.

## Frontend

Configure as variáveis públicas de .env.example no serviço de hospedagem. Nunca use service_role no navegador.
Publique dist/ após npm run build. A navegação usa fragmentos (#), dispensando regras especiais de fallback para rotas.

Configure no Supabase Auth a URL do site final e os redirecionamentos autorizados. Não desative confirmação de e-mail para contornar problemas de entrega.

## Observações dos advisors

Nenhum warning/error encontrado na revisão inicial. Há INFO esperado de RLS sem policy em private.ai_usage: a tabela é deliberadamente inacessível diretamente; só a função privada controlada registra consumo.
Referência: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy
Índices sem uso são esperados antes de tráfego de produção: https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index
