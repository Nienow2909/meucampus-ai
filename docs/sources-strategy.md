# Fontes e importação

Os PDFs das 400 universidades ainda não foram recebidos nesta sessão.
Fluxo previsto: extrair → normalizar → identificar instituição/ciclo → revisar trechos, URLs e páginas → importar como rascunho → publicar após revisão.

O script scripts/import-universities.mjs valida JSON estruturado. Por padrão só valida; --write grava rascunhos e --publish exige fontes verificadas.
Requer SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY somente no ambiente administrativo. Nunca use credenciais privadas em argumentos ou no Git.

Formato: array de registros com id UUID, name, country, cycle, courses[], summary, requirements{}, costs{}, scholarships[] e sources[].
Cada fonte: id UUID, title, url HTTPS ou document_name, page quando PDF, excerpt, cycle, status e verified_at quando verificada.
IDs estáveis permitem reimportação. Os requisitos devem representar o mesmo ciclo das fontes.
A extração de PDFs e a revisão editorial dependem dos documentos reais e não foram executadas.
