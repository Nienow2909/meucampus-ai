// Shared by the Edge Function and unit tests. No browser or secret dependencies.
export const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export function rankUniversities(catalog, question, interest, chosenIds = []) {
 const query = normalize(question);
 const words = query.split(/[^a-z0-9]+/).filter(x => x.length >= 3);
 const interestWords = normalize(interest).split(/[^a-z0-9]+/).filter(x => x.length >= 4);
 const ignored = new Set(['university','college','institute','technology','state','universidade','quero','para','como','qual','quais','minha','meus']);
 const chosen = new Set(chosenIds);
 return catalog.map(u => {
  const name = normalize(u.name);
  const acronym = name.split(/[^a-z0-9]+/).filter(w => w && !['of','the','at','and'].includes(w)).map(w => w[0]).join('');
  const named = query.includes(name) || (acronym.length >= 3 && words.includes(acronym)) || words.some(w => !ignored.has(w) && name.split(/[^a-z0-9]+/).includes(w));
  const context = normalize([u.country,u.institutional_group,...u.courses].join(' '));
  const score = (named ? 100 : 0) + (chosen.has(u.id) ? 4 : 0) + interestWords.filter(w=>context.includes(w)).length;
  return {u,score,named};
 }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score || a.u.name.localeCompare(b.u.name)).slice(0,8);
}
