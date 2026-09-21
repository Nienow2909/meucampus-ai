# Banco e armazenamento

`001_initial_schema.sql` contém as tabelas propostas para o produto. `002_rls_policies.sql` contém a camada inicial de isolamento por estudante.

Os buckets `documents` e `essays` devem ser privados. Nunca exponha caminho de storage diretamente no HTML: gere URL assinada no servidor, valide que o caminho começa no `user_id` da sessão, limite tamanho e tipo MIME, registre download e expire o link.

Antes de produção, adicionar políticas explícitas para vínculos de responsáveis e orientadores, testes de autorização, retenção, antivírus e exclusão em cascata de objetos privados.
