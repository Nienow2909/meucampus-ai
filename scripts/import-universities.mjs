import {readFile} from 'node:fs/promises';
import {createClient} from '@supabase/supabase-js';
const args=process.argv.slice(2),file=args.find(x=>!x.startsWith('--'));
if(!file)throw new Error('Uso: node scripts/import-universities.mjs arquivo.json [--write] [--publish]');
const rows=JSON.parse(await readFile(file,'utf8'));
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if(!Array.isArray(rows)||!rows.length)throw new Error('Esperado array não vazio.');
const ids=new Set(),sourceIds=new Set();
for(const row of rows){
 if(!uuid.test(row.id)||ids.has(row.id)||!row.name?.trim()||!row.country?.trim()||!row.cycle?.trim())throw new Error('ID, nome, país e ciclo são obrigatórios; IDs devem ser únicos.');
 ids.add(row.id);
 if(!Array.isArray(row.courses)||row.courses.some(x=>typeof x!=='string'))throw new Error('courses deve ser uma lista de textos.');
 if(!Array.isArray(row.sources)||!row.sources.length)throw new Error('Cada universidade precisa de fontes.');
 for(const source of row.sources){
  if(!uuid.test(source.id)||sourceIds.has(source.id)||!source.title?.trim()||!source.excerpt?.trim()||source.cycle!==row.cycle)throw new Error('Fonte inválida, repetida ou de ciclo diferente.');
  sourceIds.add(source.id);
  if(source.url&&!source.url.startsWith('https://'))throw new Error('URL de fonte deve usar HTTPS.');
  if(!source.url&&(!source.document_name||!Number.isInteger(source.page)||source.page<1))throw new Error('Fonte PDF exige documento e página.');
  if(args.includes('--publish')&&(source.status!=='verified'||!source.verified_at||Number.isNaN(Date.parse(source.verified_at))))throw new Error('Publicação exige todas as fontes verificadas e datadas.');
 }
}
console.log('Validação concluída: '+rows.length+' universidades, '+sourceIds.size+' fontes.');
if(!args.includes('--write')){console.log('Nenhuma gravação. Use --write para importar rascunhos.');process.exit(0);}
if(!process.env.SUPABASE_URL||!process.env.SUPABASE_SERVICE_ROLE_KEY)throw new Error('Configure credenciais administrativas no ambiente, nunca no frontend.');
const client=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
for(const row of rows){
 const record=Object.fromEntries(['id','name','country','city','website_url','courses','summary','cycle','requirements','costs','scholarships'].filter(k=>row[k]!==undefined).map(k=>[k,row[k]]));
 const {error}=await client.from('universities').upsert({...record,published:false});
 if(error)throw error;
 const sources=row.sources.map(s=>({...Object.fromEntries(['id','title','url','document_name','page','excerpt','cycle','verified_at','status'].filter(k=>s[k]!==undefined).map(k=>[k,s[k]])),university_id:row.id}));
 const {error:sourceError}=await client.from('university_sources').upsert(sources);
 if(sourceError)throw sourceError;
 const {error:expireError}=await client.from('university_sources').update({status:'expired'}).eq('university_id',row.id).not('id','in','('+row.sources.map(s=>s.id).join(',')+')');
 if(expireError)throw expireError;
 if(args.includes('--publish')){
  const {error:publishError}=await client.from('universities').update({published:true}).eq('id',row.id);
  if(publishError)throw publishError;
 }
}
console.log(args.includes('--publish')?'Registros publicados após validação.':'Rascunhos importados; ainda não são públicos.');
