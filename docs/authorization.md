# Autorização e privacidade

- Sessão é a única origem de identidade para rotas privadas.
- Estudante: CRUD dos próprios dados e compartilhamento explícito.
- Responsável: leitura limitada ao estudante vinculado e autorizado; sem editar essays por padrão.
- Orientador: escopos selecionáveis por estudante, com expiração e revogação.
- Administrador: sem acesso a conteúdo privado por padrão; ações de fonte e segurança separadas e auditadas.
- Documentos: links temporários, acesso mínimo, expiração e exclusão cascata conforme retenção.
- Analytics: eventos sem essays, documentos ou respostas completas.
- Menores: consentimento de responsável antes de recursos que exigem compartilhamento.
- Exclusão e exportação: disponíveis na conta, com confirmação e log.
- Toda alteração relevante usa `expectedVersion` para evitar sobrescrita silenciosa.
