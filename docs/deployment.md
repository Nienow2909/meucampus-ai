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

Em 24/09/2026, a URL publicada e os dois retornos exatos abaixo foram configurados e confirmados no painel do Supabase Auth. Não desative confirmação de e-mail para contornar problemas de entrega.

## Observações dos advisors

Na revisão de 23/09/2026, há WARN de proteção contra senhas vazadas desativada; conferir disponibilidade no plano e ativar no painel antes do lançamento. Há INFO esperado de RLS sem policy em private.ai_usage: a tabela é deliberadamente inacessível diretamente; só a função privada controlada registra consumo.
Referência: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
Referência: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy
Índices sem uso são esperados antes de tráfego de produção: https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index

## Hospedagem para revisão

Sites project: appgprj_6ab3b72655688191bc70300bd15e95c8. O manifest declara saída estática em dist/. O repositório GitHub permanece a base de desenvolvimento; Sites recebe a mesma versão para hospedagem privada.

O painel do Supabase foi acessado em 24/09/2026. O Site URL foi corrigido de http://localhost:3000 para o endereço publicado. A lista de Redirect URLs foi confirmada com dois registros exatos, sem curingas. Nenhuma configuração de proteção foi desativada. Cadastro, confirmação e recuperação ainda precisam ser testados com uma conta e caixa de e-mail reais.

Os PDFs completos e as credenciais não estão no Git. A auditoria e os scripts permitem reconstruir a importação a partir dos arquivos originais.

## Recuperação de senha e retorno do cadastro

O frontend inclui `#recuperar` e `#nova-senha`. O envio solicita retorno para a origem atual com `/?flow=recovery`. O evento PASSWORD_RECOVERY abre a tela de nova senha; os tokens são removidos da URL. Senhas diferentes são rejeitadas antes do envio, e links sem sessão válida exibem a opção de solicitar outro link.

URLs exatas já salvas e confirmadas no projeto hospedado:
- https://meucampus-ai-nienow.joao-gabril2909.chatgpt.site/
- https://meucampus-ai-nienow.joao-gabril2909.chatgpt.site/?flow=recovery

O callback do cadastro usa a primeira URL. A recuperação usa a segunda. Os testes interceptam a API: nenhum e-mail foi enviado para terceiros durante os testes. A validação de entrega, expiração e uso do link em uma conta real continua pendente. O acesso privado do Sites também precisa ser considerado antes de abrir a plataforma a alunos.

Referências: [recuperação de senha](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail) e [eventos de autenticação](https://supabase.com/docs/reference/javascript/auth-onauthstatechange).

## Publicação pelo GitHub

O workflow `.github/workflows/deploy-supabase.yml` publica somente a função `counselor`, com verificação JWT preservada. Ele executa testes antes de publicar e nunca altera secrets de IA nem aplica migrações automaticamente.

Para ativar após revisão e merge no branch master:
1. Criar o environment `production` no GitHub e configurar as proteções desejadas.
2. Adicionar nesse environment o secret `SUPABASE_ACCESS_TOKEN`, uma credencial administrativa do Supabase. Não é a chave da IA; nunca adicioná-la a arquivos ou ao chat.
3. Definir a repository variable `SUPABASE_DEPLOY_ENABLED=true` para publicação automática de alterações em funções. Sem essa variável, o acionamento automático fica desativado. A execução manual só aceita master e exige a mesma credencial.

Este workflow foi preparado no código; a credencial e a variável não foram configuradas, e nenhuma implantação por ele foi executada. A função já publicada no Supabase permanece na versão anteriormente verificada, com a IA desativada.

## Envio de e-mail — pendência para abertura aos alunos

Na leitura do painel em 24/09/2026, o SMTP personalizado estava desativado. A tela de templates informa que usa modelos padrão e requer SMTP próprio para editar assunto e corpo. Nenhuma credencial foi criada, obtida do navegador ou compartilhada.

Próximo passo: configurar um serviço de envio e um remetente autorizado, inserir a credencial diretamente no painel do Supabase e validar o ciclo completo de cadastro, confirmação e recuperação em uma conta de teste controlada pelo responsável. Não declarar a entrega de e-mail como validada antes disso.

O acabamento visual e os fluxos implementados estão publicados. As execuções periódicas foram pausadas após esta revisão; as pendências externas são SMTP/teste real, credencial de implantação do GitHub e abertura do acesso privado. A ativação de IA permanece explicitamente adiada.
