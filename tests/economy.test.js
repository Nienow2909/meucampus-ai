import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import {Script} from 'node:vm';
import {ECONOMY,compactHistory,compactSources,economyRequest} from '../supabase/functions/counselor/economy.js';

test('contexto acima do limite é bloqueado antes de uma chamada paga',()=>{
  assert.throws(()=>economyRequest([{role:'user',content:'á'.repeat(25000)}]),RangeError);
  const request=economyRequest([{role:'user',content:'Ajude com meu essay.'}]);
  assert.equal(request.model,'gpt-5-nano');
  assert.equal(request.max_completion_tokens,1500);
  assert.equal(request.reasoning_effort,'minimal');
});

test('somente duas interações recentes entram no histórico em ordem cronológica',()=>{
  const rows=[{question:'Recente',answer:'a'.repeat(3000)},{question:'Anterior',answer:'Resposta'},{question:'Antiga',answer:'Não reenviar'}];
  const result=compactHistory(rows);
  assert.equal(result.length,4);
  assert.equal(result[0].content,'Anterior');
  assert.equal(result[2].content,'Recente');
  assert.match(result[3].content,/\[trecho abreviado\]$/);
  assert.equal(rows[0].question,'Recente');
});

test('fontes preservam origem e indicam corte sem duplicar conteúdo',()=>{
  const source={id:'source-1',university_id:'mit',page:59,status:'provided',excerpt:'x'.repeat(5000),content:'duplicado',internal:'não enviar'};
  const [result]=compactSources([source]);
  assert.equal(result.id,'source-1');
  assert.equal(result.page,59);
  assert.equal(result.status,'provided');
  assert.equal(result.excerpt_truncated,true);
  assert.equal(result.content,undefined);
  assert.equal(result.internal,undefined);
  assert.equal(source.excerpt.length,5000);
  assert.equal(ECONOMY.historyTurns,2);
});

test('IA desativada não reserva cota nem chama o provedor mesmo com chave presente',async()=>{
  let handler;
  let calls=0;
  const query={select:()=>query,eq:()=>query,maybeSingle:async()=>({data:{ai_consent:true},error:null})};
  const client={auth:{getUser:async()=>({data:{user:{id:'test-user'}},error:null})},from:()=>query,rpc:()=>{calls++;throw new Error('Quota must not be used');}};
  const code=stripTypeScriptTypes(readFileSync(new URL('../supabase/functions/counselor/index.ts',import.meta.url),'utf8')).replace(/^import .*$/gm,'');
  new Script(code).runInNewContext({
    Deno:{env:{get:name=>name==='OPENAI_API_KEY'?'test-key':undefined},serve:fn=>handler=fn},
    createClient:()=>client,
    Response,
    fetch:()=>{calls++;throw new Error('Provider must not be called');},
  });
  const result=await handler(new Request('https://test.invalid',{method:'POST',headers:{Authorization:'Bearer test-session'},body:JSON.stringify({agent:'sat',question:'Como estudar?'})}));
  assert.equal(result.status,503);
  assert.match((await result.json()).error,/modo econômico/);
  assert.equal(calls,0);
});
