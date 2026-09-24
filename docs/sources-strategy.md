# Fontes e importação

Os três PDFs e os dois CSVs foram recebidos e extraídos. São 400 instituições únicas: 376 nos EUA e 24 no Canadá. O CSV adicional corresponde aos registros 201–400 do funil, não a mais 200 instituições.

O guia de 1.635 páginas é a versão canônica para recuperação. Os PDFs de 900 e 1.580 páginas foram extraídos e registrados, sem triplicar evidências. `catalog-audit.json` registra hashes e lacunas. A posição no catálogo original não equivale a ranking acadêmico independente.

## Reprodução da importação fornecida

1. Instale Python e `pymupdf==1.28.2` em um ambiente de trabalho.
2. Execute `python scripts/extract-materials.py --downloads "pasta dos originais" --output ../materials`.
3. Execute `python scripts/prepare-materials.py --materials ../materials --output ../import`.
4. Confira `audit.json`, `catalog.json`, `sources.json` e `chunks.json`.
5. Execute `node scripts/import-materials.mjs ../import` para validar sem gravar.
6. Para gravar, configure as credenciais administrativas no ambiente e acrescente `--write`.

Os originais não são modificados. A publicação inicial ocorreu somente após validar 400 instituições, 1.000 registros de origem e 3.334 trechos. Identificadores estáveis permitem reimportação. O importador mantém fichas em rascunho durante a carga; uma interrupção exige retomá-la antes da publicação.

`provided` significa material fornecido, sem conferência oficial independente. `verified` exige revisão da fonte e do ciclo. Ambos aparecem no catálogo com rótulos diferentes. Publicação não significa verificação.

Metas do CSV ficam em `guidance`. `sat_piso` não vira mínimo obrigatório; `sat_meta` não substitui resultado realizado. A classificação extracurricular é editorial; a taxa geral não é chance individual. `requirements` permanece vazio na importação inicial.

Os detalhes preservam conflitos, custos não comparáveis e diferenças entre graduação, transferência e pós-graduação. Cursos nos cartões são áreas identificadas no texto, não confirmação de um bacharelado disponível. PDFs têm páginas; CSVs têm número de registro.

Trechos em páginas de transição ficam sem universidade atribuída para evitar associar o fim de um dossiê à instituição seguinte. A recuperação confere o nome no conteúdo. A busca atual é textual, com nomes e siglas; busca semântica é uma evolução futura.

## Importação de fichas oficialmente revisadas

O script scripts/import-universities.mjs valida JSON estruturado. Por padrão só valida; --write grava rascunhos e --publish exige fontes verificadas.
Requer SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY somente no ambiente administrativo. Nunca use credenciais privadas em argumentos ou no Git.

Formato: array de registros com id UUID, name, country, cycle, courses[], summary, requirements{}, costs{}, scholarships[] e sources[].
Cada fonte: id UUID, title, url HTTPS ou document_name, page quando PDF, excerpt, cycle, status e verified_at quando verificada.
IDs estáveis permitem reimportação. Os requisitos devem representar o mesmo ciclo das fontes.
A extração foi executada. A revisão oficial dos requisitos por ciclo permanece pendente e não deve ser presumida a partir da importação.
