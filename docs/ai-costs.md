# Modo econômico das IAs

Revisão: 23/09/2026. O modelo preparado para os quatro assistentes é **GPT-5 nano**, com a mesma integração e especializações por instrução. O cliente não escolhe modelo nem aumenta o limite de resposta. `AI_MODEL` deixou de controlar o modelo: a política está em `supabase/functions/counselor/economy.js`.

## Controles implementados

- Uma chamada por pergunta ao assistente escolhido, sem chamar os quatro simultaneamente.
- Até 1.500 tokens de conclusão, incluindo raciocínio, com `reasoning_effort=minimal` e instrução de resposta de até 250 palavras.
- Somente as duas últimas interações, com trechos abreviados e identificados.
- Até quatro universidades e doze fontes/trechos, sem repetir dossiês completos dentro do prompt.
- Até 40.000 bytes de mensagens de entrada. Esse limite mede tamanho, não tokens. Contexto maior é rejeitado antes da chamada paga e antes de reservar a cota.
- Cota existente de 40 perguntas por usuário/dia, compartilhada entre as quatro especialidades e protegida por operação atômica no banco.
- Sem nova tentativa automática, modelo alternativo mais caro ou chamadas em segundo plano. Resposta truncada produz um erro explícito.
- `AI_ENABLED=true` é necessário no servidor para ativar chamadas. Sem isso, permanece desativado mesmo que uma chave tenha sido cadastrada.

Abrir o site, buscar universidades, organizar tarefas, escrever/salvar essays e responder aos exercícios SAT já cadastrados não chama o provedor de IA. Supabase e hospedagem têm seus próprios custos e limites.

## Preço e limitações

Na documentação oficial consultada, GPT-5 nano custa US$ 0,05 por milhão de tokens de entrada e US$ 0,40 por milhão de tokens de saída. Cache de entrada tem preço próprio. Consulte sempre os preços antes de ativar: https://developers.openai.com/api/docs/models/gpt-5-nano

Exemplo ilustrativo, sem cache: 1.000 consultas com 5.000 tokens de entrada e 1.000 de saída faturável cada custariam US$ 0,65 de API. Isso não é uma previsão do site: contexto, raciocínio, tamanho das respostas, quantidade de alunos, impostos, câmbio e outros serviços mudam o total.

Não há consumo zero nem um teto monetário global implementado. A cota é por usuário, portanto o total cresce com o número de contas. Configurar acompanhamento e limites de gasto na conta da API faz parte da ativação; não foi feito nesta revisão.

O modelo mais barato pode ter desempenho inferior em feedback profundo de essays e problemas complexos de SAT. A qualidade precisa ser avaliada com perguntas reais antes de liberar para alunos. Trechos abreviados não podem ser usados para concluir que um requisito não existe.

## Ativação futura

A ativação continua adiada. Quando autorizada, cadastrar uma credencial válida como `OPENAI_API_KEY`, validar a conta/faturamento e definir `AI_ENABLED=true` nos Secrets das Edge Functions. Não reutilizar chaves expostas em conversas. Nenhuma credencial foi adicionada e nenhuma chamada paga foi usada para testar esta revisão.

As mudanças foram verificadas por testes locais de política de consumo e não representam uma avaliação da qualidade do modelo.
