import test from 'node:test';
import assert from 'node:assert/strict';
import {filterCatalog} from '../src/catalog.js';

const universities = [
  {id:'mit', name:'Massachusetts Institute of Technology', country:'Estados Unidos', courses:['Engenharia'], institutional_group:'Privada'},
  {id:'quebec', name:'Université du Québec', country:'Canadá', courses:['Computação'], institutional_group:'Pública'},
  {id:'broward', name:'Broward College', country:'Estados Unidos', courses:['Negócios'], institutional_group:'Pública'},
];

test('busca por sigla e termos sem acento combinada com filtros', () => {
  assert.deepEqual(filterCatalog(universities,{search:'MIT'}).map(x=>x.id),['mit']);
  assert.deepEqual(filterCatalog(universities,{search:'quebec computacao',country:'Canadá',group:'Pública'}).map(x=>x.id),['quebec']);
  assert.equal(filterCatalog(universities,{search:'MIT',country:'Canadá'}).length,0);
});

test('ordenação não altera a ordem original do catálogo', () => {
  assert.deepEqual(filterCatalog(universities,{sort:'name'}).map(x=>x.id),['broward','mit','quebec']);
  assert.deepEqual(filterCatalog(universities,{}).map(x=>x.id),['mit','quebec','broward']);
});
