// Administrative importer. Reads prepared files; --write is required for mutations.
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createClient} from '@supabase/supabase-js';
const folder=process.argv[2];
if(!folder)throw new Error('Uso: node scripts/import-materials.mjs pasta [--write]');
const read=async name=>JSON.parse(await readFile(resolve(folder,name+'.json'),'utf8'));
const [catalog,sources,chunks]=await Promise.all(['catalog','sources','chunks'].map(read));
if(catalog.length!==400||new Set(catalog.map(x=>x.id)).size!==400||new Set(catalog.map(x=>x.name)).size!==400)throw new Error('Catálogo deve conter 400 instituições únicas.');
const ids=new Set(catalog.map(x=>x.id));
if(sources.some(x=>!ids.has(x.university_id))||chunks.some(x=>x.university_id&&!ids.has(x.university_id)))throw new Error('Origem sem instituição correspondente.');
if(catalog.some(x=>Object.keys(x.requirements).length)||sources.some(x=>x.status!=='provided'))throw new Error('Este importador preserva materiais fornecidos; validação oficial exige fluxo separado.');
console.log(`Validados: ${catalog.length} universidades, ${sources.length} origens, ${chunks.length} trechos.`);
if(!process.argv.includes('--write'))process.exit(0);
const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key)throw new Error('Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente administrativo.');
const client=createClient(url,key,{auth:{persistSession:false}});
for(const [table,rows] of [['universities',catalog.map(x=>({...x,published:false}))],['university_sources',sources],['knowledge_chunks',chunks]]){
 for(let n=0;n<rows.length;n+=100){const {error}=await client.from(table).upsert(rows.slice(n,n+100));if(error)throw error;}
}
const {count,error:checkError}=await client.from('universities').select('id',{count:'exact',head:true}).in('id',[...ids]);
if(checkError||count!==400)throw new Error('Importação não validada; fichas permanecem em rascunho.');
const {error}=await client.from('universities').update({published:true}).in('id',[...ids]);if(error)throw error;
console.log('400 fichas publicadas como material fornecido, sem selo de validação oficial.');
