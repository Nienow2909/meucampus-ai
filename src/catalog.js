export const normalizeSearch = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function filterCatalog(universities, {search = '', country = '', group = '', sort = 'catalog'}) {
  const terms = normalizeSearch(search).trim().split(/\s+/).filter(Boolean);
  const result = universities.filter(u => {
    if (country && u.country !== country || group && u.institutional_group !== group) return false;
    const words = u.name.split(/\s+/).filter(w => !['of', 'the', 'at', 'and'].includes(w.toLowerCase()));
    const acronym = words.map(w => w[0]).join('');
    const text = normalizeSearch([u.name, acronym, u.country, u.institutional_group, ...u.courses].join(' '));
    return terms.every(term => text.includes(term));
  });
  if (sort === 'name') result.sort((a,b) => a.name.localeCompare(b.name, 'pt-BR'));
  if (sort === 'country') result.sort((a,b) => a.country.localeCompare(b.country, 'pt-BR') || a.name.localeCompare(b.name));
  return result;
}
