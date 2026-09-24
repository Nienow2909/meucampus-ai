import test from 'node:test';
import assert from 'node:assert/strict';
import {nextSlot,validateProfile,readiness,escapeHtml} from '../src/domain.js';
test('limites, duplicatas e sequência da lista',()=>{
 const rows=[];
 for(const [category,n] of [['dream',3],['target',4],['likely',5]])for(let i=0;i<n;i++){const id=category+i;rows.push({university_id:id,category,slot:nextSlot(rows,category,id)});}
 assert.throws(()=>nextSlot(rows,'dream','extra'),/completo/);
 assert.throws(()=>nextSlot(rows,'likely','dream0'),/já está/);
 assert.throws(()=>nextSlot([],'target','id'),/anteriores/);
 assert.equal(rows.length,12);
});
test('meta de SAT não substitui resultado no diagnóstico',()=>{
 const p={sat_actual:1200,sat_target:1500};
 const u={requirements:{sat_required:true,sat_minimum:1400}};
 assert.ok(readiness(p,u).some(x=>x.includes('abaixo')));
 assert.ok(readiness(p,u,1500).some(x=>x.includes('atendido')));
 assert.equal(p.sat_actual,1200);
});
test('valida escala escolar e SAT sem inventar conversão',()=>{
 const p={full_name:'Ana',sat_actual:null,sat_target:null,grade_average:9,grade_scale:10,budget_annual:0};
 assert.equal(validateProfile(p),p);
 assert.throws(()=>validateProfile({...p,grade_average:11}),/escala/);
 assert.throws(()=>validateProfile({...p,sat_target:1455}),/intervalos/);
 assert.equal(escapeHtml('<script>'), '&lt;script&gt;');
});
