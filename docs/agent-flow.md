# Fluxo dos quatro assistentes

1. Validar método, JWT, usuário e tamanho da pergunta.
2. Buscar somente o perfil autorizado e verificar consentimento.
3. Confirmar que o provedor foi configurado.
4. Reservar cota diária de forma atômica.
5. Buscar catálogo publicado, lista do aluno e até quatro interações da especialidade.
6. Selecionar até oito instituições pelo contexto da lista e termos da pergunta. A busca inicial é lexical; não é um sistema vetorial.
7. Montar instruções específicas de universidades, essays, SAT ou candidatura.
8. Enviar contexto ao provedor. Documentos privados não são enviados automaticamente.
9. Validar JSON e IDs das fontes citadas.
10. Salvar resposta no servidor, vinculada ao usuário autenticado.

A existência de uma citação não prova que cada afirmação do modelo está correta. Avaliações editoriais e testes de groundedness continuam necessários antes do lançamento.
