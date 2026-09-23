import test from 'node:test';
import assert from 'node:assert/strict';
import {rankUniversities} from '../supabase/functions/counselor/retrieval.js';
const universities=[
 {id:'mit',name:'Massachusetts Institute of Technology',country:'Estados Unidos',courses:['Engenharia']},
 {id:'harvard',name:'Harvard University',country:'Estados Unidos',courses:['Engenharia']},
 {id:'toronto',name:'University of Toronto',country:'Canadá',courses:['Medicina']}
];
test('nome ou sigla explícita supera interesses e escolhas anteriores',()=>{
 const matches=rankUniversities(universities,'Como melhorar para o MIT?','Engenharia',['harvard']);
 assert.equal(matches[0].u.id,'mit');assert.equal(matches[0].named,true);
 assert.equal(matches[1].named,false);
 assert.equal(rankUniversities(universities,'Quero Harvard','Medicina',['toronto'])[0].u.id,'harvard');
});
test('busca geral preserva contexto sem alegar correspondência de nome',()=>{
 const matches=rankUniversities(universities,'Quais universidades combinam comigo?','Medicina',[]);
 assert.deepEqual(matches.map(x=>x.u.id),['toronto']);assert.equal(matches[0].named,false);
});
