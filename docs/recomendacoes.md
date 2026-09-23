# MeuCampus AI — entrega e conteúdos recomendados

Relatório de 23 de setembro de 2026.

**Situação da entrega:** catálogo e base de conhecimento gravados no Supabase; revisão visual e funcional enviada ao [GitHub, PR 1](https://github.com/Nienow2909/meucampus-ai/pull/1). Sete testes de regras, nove testes no Chrome e a verificação automática do GitHub passaram. A hospedagem privada usa o projeto registrado em `.openai/hosting.json`. A ativação das respostas reais de IA foi adiada pelo usuário. A função counselor versão 3 está ativa; o refinamento de filtragem no código deve ser publicado e validado junto com a próxima revisão das IAs. Cadastro, e-mail e URL de retorno ainda precisam de validação operacional antes de abrir a plataforma para alunos.

## O que está implementado

A plataforma organiza a jornada em perfil → 3 universidades sonho → 4 possíveis → 5 mais acessíveis. O perfil guarda notas na escala original, extracurriculares, área, países, orçamento, necessidade de bolsa, inglês e SAT realizado separado da meta. Há tarefas por universidade, editor de essays, prática SAT inicial e documentos privados.

O catálogo real contém **400 instituições: 376 dos Estados Unidos e 24 do Canadá**, com busca, filtros, paginação e fichas disponíveis antes do login. A demonstração com instituições fictícias permanece separada. A identidade visual e o código são próprios: a referência ao Collegize é de experiência de orientação, sem acesso ou reutilização do seu código-fonte.

Os quatro assistentes têm integração no servidor, autenticação, consentimento, histórico, limite diário e consulta ao catálogo e ao guia. **As respostas reais ainda não foram ativadas nem testadas com um modelo: falta cadastrar a chave privada de IA.** O cadastro também precisa de configuração da URL final no Supabase e validação de entrega do e-mail. Esses passos impedem considerar a plataforma um lançamento completo.

O editor detecta conflitos de versão, mas não oferece histórico completo de revisões. O SAT tem quatro exercícios autorais iniciais; não é curso completo nem simulado oficial. A aplicação organiza o trabalho do aluno sem enviar candidaturas automaticamente.

## Auditoria dos arquivos

| Material | Conteúdo | Uso |
| --- | --- | --- |
| Radar das 200 melhores universidades da América do Norte | 900 páginas | Referência registrada |
| Guia completo + radar das 200 universidades | 1.635 páginas, abrangendo 400 instituições | Guia canônico das IAs |
| Guia completo + radar das 200 universidades (PDF) | 1.580 páginas, conteúdo sobreposto | Versão alternativa registrada |
| Funil de metas das 400 universidades | 400 registros únicos | Metas editoriais e classificação |
| Base das 200 universidades adicionais | Registros 201–400 do funil | Complementação das fichas |

Os PDFs somam 4.115 páginas, mas não são três bases independentes. A importação gerou **1.000 registros de origem** e **3.334 trechos pesquisáveis**, com documento e página. Esses totais medem organização do material, não fatos oficialmente confirmados.

No funil faltam taxa de admissão em 5 registros, metas de SAT em 17 e URL de `fonte_nota` em 59. Campo vazio não significa dispensa de teste. Há anos diferentes, fontes oficiais e de terceiros, além de informação de transferência e pós-graduação em fichas gerais. Nenhuma ficha recebeu automaticamente selo de verificação oficial.

Exemplos que precisam de revisão: o dossiê do MIT contém referências conflitantes ao portal de candidatura e mistura tópicos de graduação e pós; Williams tem datas diferentes de Regular Decision. O próprio material sinaliza divergências. Resolva-as na fonte oficial do ciclo, não escolhendo uma data arbitrariamente.

## Como ensinar as IAs

Os arquivos viraram uma base consultável. A cada pergunta, o servidor recupera instituições e trechos relevantes, acrescenta o perfil autorizado e pede uma resposta com referências. Isso é consulta contextual, não treinamento de um novo modelo. Recomendo começar assim porque uma fonte corrigida pode atualizar as respostas sem retreinar o modelo.

A recuperação atual combina nomes, siglas, interesses e busca textual. Busca semântica em português e inglês é uma próxima melhoria, acompanhada de testes de recuperação. Não recomendo começar por fine-tuning: primeiro complete as fontes e avalie as respostas.

O padrão preparado é OpenAI `gpt-5-mini`, como ponto de partida de menor custo para tarefas delimitadas, com possibilidade de troca. A documentação informa suporte a Chat Completions e respostas estruturadas. Qualidade, custo real e disponibilidade na sua conta ainda precisam de validação. [Documentação do modelo](https://developers.openai.com/api/docs/models/gpt-5-mini).

| Assistente | Conteúdo prioritário | Exemplos de comportamento para ensinar |
| --- | --- | --- |
| Universidades | Requisitos oficiais por ciclo, cursos de graduação, custo total para internacionais e bolsas | Comparar opções com justificativa, fonte, limitações e alternativa compatível com orçamento |
| Essays | Enunciados atuais, limites, rubricas e exemplos autorizados com comentários humanos | Rascunho → diagnóstico → perguntas → revisão preservando a voz e experiências verdadeiras |
| SAT | Habilidades, questões autorais revisadas, gabaritos, explicações, dificuldade e tempo | Explicar o raciocínio e por que cada alternativa errada parece correta |
| Candidatura | Checklist por instituição, calendário, documentos, traduções, recomendações e portfólio | Plano semanal compatível com etapa escolar, tempo disponível e prazos confirmados |

**Universidades:** separe first-year, transfer e pós-graduação; indique ciclo e público de cada regra. Para bolsas, registre elegibilidade internacional, necessidade versus mérito, valor, condições e renovação. Custo por crédito ou semestre não deve aparecer como total anual.

**Essays:** comece com 20–30 exemplos autorizados, incluindo textos fracos e revisões explicadas. O objetivo é ensinar melhoria, não oferecer textos para copiar. Use os [enunciados oficiais da Common App](https://www.commonapp.org/apply/essay-prompts/) e registre os suplementos de cada universidade e ciclo separadamente.

**SAT:** recomendo 100–200 questões autorais revisadas por alguém que domine a prova. Cada uma deve trazer habilidade, dificuldade, solução, justificativa dos distratores e tempo esperado. O [Student Question Bank](https://satsuite.collegeboard.org/practice/student-question-bank) oferece prática oficial por habilidade e dificuldade; os [simulados do Bluebook](https://satsuite.collegeboard.org/practice/practice-tests) servem como referência externa de desempenho. Encaminhe os alunos a esses recursos; incorporar material de terceiros depende das condições de uso.

**Candidatura:** prepare trilhas para 9º ano, início e fim do ensino médio, gap year e transferência. Considere trabalho remunerado, cuidado familiar e iniciativas em escola pública como parte do contexto extracurricular. Atividade cara ou medalha nacional não deve virar obrigação universal.

## A porcentagem em tempo real

**Não implementei uma porcentagem individual inventada.** Os materiais contêm taxas gerais e metas sugeridas, mas não uma base validada de resultados individuais que permita afirmar “você tem 73% de chance”. Atingir a meta de SAT não sustenta essa conclusão.

O aplicativo já atualiza preenchimento do perfil, progresso de tarefas e diferença entre SAT realizado e meta editorial. Recomendo um painel por universidade com requisitos confirmados atendidos, pendências, informações desconhecidas e comparação entre cenário atual e meta futura.

Para estimar probabilidade futuramente, reúna resultados consentidos e anonimizados de aprovados e recusados, com ciclo, curso, tipo de candidatura, necessidade de bolsa e perfil acadêmico. Valide em alunos que não participaram do ajuste, meça calibração e apresente incerteza. Sem amostra suficiente, mostre “evidência insuficiente”.

## Ordem recomendada de evolução

1. **Ativar e validar:** cadastrar a chave no servidor, ajustar URL no Auth, testar e-mail e avaliar os quatro assistentes. Configurar limites de gasto na conta do provedor.
2. **Revisar informações decisivas:** conferir oficialmente prazos, testes, bolsas e custos das universidades escolhidas pelos primeiros alunos. Mostrar data de revisão e conflitos pendentes.
3. **Criar painel editorial:** corrigir campos, revisar fontes, despublicar conteúdo vencido e registrar alterações. Hoje isso depende de scripts e administração do banco.
4. **Aprofundar o plano individual:** próximos passos por instituição, cronograma semanal, simulação de metas e extracurriculares compatíveis com oportunidades reais.
5. **Completar o estudo:** banco SAT, caderno de erros, revisão espaçada, rubricas de essays e histórico de versões.
6. **Preparar operação:** recuperação de senha, exportação e exclusão de conta, informação clara sobre uso de dados, tratamento de contas de menores, suporte, backups e revisão humana de respostas problemáticas.

O advisor do Supabase apontou proteção contra senhas vazadas desativada. Confira a disponibilidade no plano e ative antes do lançamento com alunos. [Orientação do Supabase](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). O aviso informativo de RLS sem policy em `private.ai_usage` é intencional: alunos não escrevem diretamente no contador.

## Formato para os próximos conteúdos

Uma planilha por tema, com uma linha por fato ou exercício, é mais útil do que novos PDFs sem estrutura. Para requisitos, use:

`instituição | curso | público | ciclo | campo | valor | unidade | tipo de fonte | URL ou arquivo/página | trecho | data de conferência | status | conflito`

Para ensinar o comportamento da IA, use:

`assistente | pergunta do aluno | contexto anonimizado | resposta esperada | fontes permitidas | erros proibidos | justificativa do avaliador`

Inclua casos de orçamento incompatível, estudante sem SAT, nota desejada ainda não obtida, fonte ausente e prazo conflitante. Histórias de aprovados podem dar contexto, mas não devem virar regras de aprovação.

## Critério para liberar as respostas

Prepare pelo menos 25 perguntas por assistente para avaliação humana no piloto. Essa é uma recomendação, não um teste já concluído. Confira fonte correta, ciclo, distinção entre regra e sugestão, preservação da voz do aluno e clareza do próximo passo.

Casos obrigatórios: meta de SAT confundida com resultado; taxa geral confundida com chance pessoal; custo por crédito confundido com anual; auxílio doméstico atribuído a internacional; pós confundida com graduação; pedido para inventar conquista; instrução maliciosa dentro do PDF; prazo conflitante; fonte ausente. A resposta deve reconhecer a limitação e orientar a conferência.

## Verificação executada e limites

Foram verificados regras de perfil e lista, prioridade de nomes/siglas, jornada no navegador, catálogo público de 400 instituições, filtros, origem das fichas e visualização móvel. Testes transacionais no Supabase verificaram isolamento entre alunos, bloqueio de escrita no catálogo, proteção do histórico de IA e limite de uso. As contas dessas verificações foram revertidas.

Isso não substitui avaliação pedagógica, conferência de cada requisito ou teste com o provedor de IA. A entrega é uma base funcional para revisão e ativação; este relatório separa capacidades existentes das evoluções recomendadas.
