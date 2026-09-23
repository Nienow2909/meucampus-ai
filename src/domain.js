export const groups = { dream: { label: 'Sonho', limit: 3 }, target: { label: 'Possíveis', limit: 4 }, likely: { label: 'Mais acessíveis', limit: 5 } };
export const agents = { universities: ['Orientador de universidades', 'Encontre opções que fazem sentido para você.'], essays: ['Mentor de essays', 'Dê clareza à sua história, com a sua voz.'], sat: ['Tutor de SAT', 'Entenda seus erros e planeje o próximo estudo.'], application: ['Mentor de candidatura', 'Transforme requisitos em próximos passos.'] };
export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const wordCount = text => text.trim() ? text.trim().split(/\s+/u).length : 0;
export function nextSlot(list, category, universityId) {
  if (!groups[category]) throw new Error('Categoria inválida.');
  if (list.some(x => x.university_id === universityId)) throw new Error('Esta universidade já está na sua lista.');
  const previous = Object.keys(groups).slice(0, Object.keys(groups).indexOf(category));
  if (previous.some(key => list.filter(x => x.category === key).length < groups[key].limit)) throw new Error('Complete os grupos anteriores primeiro.');
  for (let slot = 1; slot <= groups[category].limit; slot++) if (!list.some(x => x.category === category && x.slot === slot)) return slot;
  throw new Error('Este grupo já está completo. Remova uma escolha antes de adicionar outra.');
}
export function validateProfile(p) {
  if (!p.full_name?.trim()) throw new Error('Informe seu nome.');
  for (const field of ['sat_actual','sat_target']) if (p[field] !== null && (!Number.isInteger(p[field]) || p[field] < 400 || p[field] > 1600 || p[field] % 10)) throw new Error('O SAT deve estar entre 400 e 1600, em intervalos de 10.');
  if (p.grade_average !== null && (p.grade_scale === null || p.grade_average < 0 || p.grade_average > p.grade_scale)) throw new Error('Informe uma média dentro da escala da sua escola.');
  if (p.budget_annual !== null && p.budget_annual < 0) throw new Error('O orçamento não pode ser negativo.');
  return p;
}
export function profileProgress(p) {
  if (!p) return 0;
  const values=[p.full_name,p.school_year,p.interest,p.target_countries?.length,p.grade_scale,p.grade_average !== null && p.grade_average !== undefined,p.english_level,p.extracurriculars,p.budget_annual !== null && p.budget_annual !== undefined];
  return Math.round(values.filter(Boolean).length / values.length * 100);
}
export function readiness(profile, university, simulatedSat = null) {
  const requirements = university.requirements || {};
  const score = simulatedSat ?? profile?.sat_actual;
  const facts=[];
  if (!profile) return ['Complete seu perfil para comparar requisitos.'];
  if (requirements.sat_required === true) facts.push(score == null ? 'SAT exigido: resultado ainda não informado.' : `SAT ${simulatedSat == null ? 'realizado' : 'simulado'}: ${score}.`);
  else facts.push('Consulte a política de SAT da instituição para este ciclo.');
  if (requirements.sat_minimum != null) facts.push(score == null ? 'Falta a nota para comparar com o mínimo documentado.' : score >= requirements.sat_minimum ? 'Mínimo de SAT documentado atendido; isso não garante admissão.' : 'Nota abaixo do mínimo de SAT documentado.');
  if (profile.needs_aid) facts.push('A disponibilidade e a elegibilidade para bolsa precisam ser verificadas.');
  facts.push('Probabilidade individual de admissão: não calculada.');
  return facts;
}
