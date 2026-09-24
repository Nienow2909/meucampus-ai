# Contratos

Frontend usa Supabase Auth, REST com chave publicável e RLS, e Storage autenticado.
POST /functions/v1/counselor: Authorization Bearer com token da sessão.
Body: {agent: universities|essays|sat|application, question: string de até 6000 caracteres}.
Sucesso: {answer: string, citations: [{id,title,url,document_name,page,cycle}]}.
Erros: 400 entrada inválida, 401 sessão inválida, 403 sem consentimento, 429 cota diária, 503 provedor não configurado, 502 resposta/provedor inválido, 500 falha interna.
A identidade jamais vem do body. Citações são filtradas e verificadas contra IDs de fontes do contexto.
A IA não executa mutações no perfil, candidaturas ou escolhas.

Essays: update exige id e versão conhecida; zero linhas indica conflito e o editor preserva o texto local para cópia.
