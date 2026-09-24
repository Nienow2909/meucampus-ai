# Acesso

Cada aluno pode ler/escrever somente seus próprios registros, conforme RLS com USING e WITH CHECK.
Catálogo publicado e fontes verificadas são públicos para leitura; publicação exige serviço administrativo.
O aluno não pode escrever histórico de assistente, consumir a cota em nome de outra pessoa ou transferir seus registros.
Documentos têm caminho {user_id}/{uuid}-{nome}, bucket privado e URLs de 60 segundos.
Frontend não contém service role nem credencial de IA.
Nesta versão, não há papéis de responsável/orientador, compartilhamento, exportação nem exclusão integral de conta. Esses fluxos precisam de implementação antes de oferecer tais recursos.
