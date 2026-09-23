"""Normalize supplied materials. Inputs: extracted fast-pdf-*.json and csv-*.json.
Run from repository: python scripts/prepare-materials.py --materials ../materials --output ../import
The canonical guide is document 1; other PDF versions remain in the audit manifest.
"""
import argparse, json, re, uuid, hashlib
from pathlib import Path

def stable(value):
    return str(uuid.uuid5(uuid.NAMESPACE_URL, 'https://meucampus.ai/catalog/' + value))

def clean(text):
    return re.sub(r'\s+', ' ', text).strip()

def course_labels(text):
    # Dossiers mix names and commentary; never split a salary such as $82,157 into a course.
    labels = {
      'Computação': r'computa|computer science|EECS', 'Engenharia': r'engenharia|engineering',
      'Matemática': r'matemática|mathematics', 'Física': r'\bfísica\b|\bphysics\b',
      'Biologia': r'biologia|biology', 'Química': r'química|chemistry',
      'Economia': r'economia|economics', 'Negócios': r'negócios|business|administração',
      'Enfermagem': r'enfermagem|nursing', 'Saúde': r'medicina|medicine|health|saúde',
      'Psicologia': r'psicologia|psychology', 'Direito': r'\bdireito\b|\blaw\b',
      'Artes': r'\bartes\b|\barts\b', 'Design': r'\bdesign\b', 'Música': r'música|music',
      'Cinema': r'cinema|film', 'Arquitetura': r'arquitetura|architecture',
      'Educação': r'educação|education', 'Comunicação': r'comunicação|communication|journalism',
      'Ciências sociais': r'sociologia|sociology|ciência política|political science',
      'História': r'história|history', 'Literatura': r'literatura|literature',
      'Meio ambiente': r'ambiental|environmental', 'Agricultura': r'agricultura|agriculture'
    }
    return [name for name,pattern in labels.items() if re.search(pattern,text,re.I)]

def main():
    p = argparse.ArgumentParser()
    p.add_argument('--materials', type=Path, required=True)
    p.add_argument('--output', type=Path, required=True)
    args = p.parse_args()
    read = lambda name: json.loads((args.materials / name).read_text(encoding='utf-8'))
    master, extra, pages = read('csv-3.json'), read('csv-4.json'), read('fast-pdf-1.json')
    assert len(master) == 400 and len({x['universidade'] for x in master}) == 400
    assert sorted(int(x['rank']) for x in master) == list(range(1, 401))
    extra = {int(x['rank']): x for x in extra}
    text, page_positions = '', []
    for page in pages:
        page_positions.append((len(text), page['page']))
        text += page['text'] + '\n\n'
    headings = []
    for m in re.finditer(r'(?m)^\s*(\d{1,3})\.\s+([^\n]+)', text):
        rank = int(m[1])
        if 1 <= rank <= 400 and master[rank-1]['universidade'] in m[2]:
            headings.append((rank, m.start(), m.end()))
    assert [x[0] for x in headings] == list(range(1, 401)), 'Dossier mapping changed; review before import.'
    page_at = lambda pos: next(n for start,n in reversed(page_positions) if start <= pos)
    doc = read('fast-meta-1.json')['file']
    catalog, sources, chunks = [], [], []
    fields = ['Identidade', 'Foco institucional', 'Perfil de aluno valorizado', 'O que dizem buscar', 'Processo de candidatura', 'Prazos', 'Provas e proficiência', 'Taxa de admissão', 'Custo para internacional', 'Bolsas para internacionais', 'Cursos mais fortes', 'Diferenciais', 'Empregabilidade', 'Vida no campus', 'Relatos de alunos e ex-alunos', 'Fontes', 'Fontes complementares']
    pattern = r'(?m)^\s*(' + '|'.join(map(re.escape, fields)) + r'):\s*'
    for index, (rank, start, content_start) in enumerate(headings):
        row = master[rank-1]
        end = headings[index+1][1] if index+1 < len(headings) else len(text)
        # The interstitial tables between parts III and IV are not part of Grand Canyon's dossier.
        if rank == 200:
            marker = re.search(r'(?m)^\s*Parte IV\s*[—–]', text[content_start:end])
            if marker: end = content_start + marker.start()
        dossier = text[content_start:end]
        matches = list(re.finditer(pattern, dossier))
        details = {m[1]: clean(dossier[m.end():matches[i+1].start() if i+1<len(matches) else len(dossier)]) for i,m in enumerate(matches)}
        details = {k:v for k,v in details.items() if k not in ['Relatos de alunos e ex-alunos','Fontes','Fontes complementares']}
        if rank in extra:
            other = extra[rank]
            assert other['universidade'] == row['universidade']
            for key, field in [('Identidade','identidade'),('Foco institucional','foco'),('Custo para internacional','custo'),('Provas e proficiência','testes'),('Prazos','prazos'),('Cursos mais fortes','cursos')]:
                details[key] = other[field]
        details = {k:v[:8000] for k,v in details.items()}
        uid = stable(str(rank))
        guidance = {key:row[key] or None for key in ['taxa_admissao_pct','sat_piso','sat_meta','media_br_alvo','nivel_extracurricular','alavanca_principal','fonte_nota']}
        guidance['classification'] = 'editorial_targets_not_requirements'
        courses = course_labels(details.get('Cursos mais fortes',''))
        catalog.append(dict(id=uid,name=row['universidade'],country='Estados Unidos' if row['pais']=='EUA' else row['pais'],catalog_rank=rank,institutional_group=row['grupo_ou_arquetipo'],collection=row['conjunto'],cycle='Anos mistos · confirmar ciclo',courses=courses,summary=details.get('Foco institucional',row['grupo_ou_arquetipo'])[:900],requirements={},costs={},scholarships=[],guidance=guidance,details=details,published=False))
        first,last=page_at(start),page_at(end-1)
        sources.append(dict(id=stable(f'{rank}/guide'),university_id=uid,title='Dossiê do guia fornecido',url=None,document_name=doc,page=first,page_end=last,record_number=None,excerpt='Material fornecido, com referências oficiais e de terceiros. Requer validação por ciclo; não constitui confirmação oficial.',cycle='Anos mistos',status='provided'))
        sources.append(dict(id=stable(f'{rank}/targets'),university_id=uid,title='Funil editorial de metas',url=row['fonte_nota'] if row['fonte_nota'].startswith('https://') else None,document_name='Funil de metas das 400 universidades (CSV).csv',page=None,page_end=None,record_number=rank,excerpt='Metas sugeridas de SAT, média e atividades. Taxa geral não é chance individual; metas não são mínimos oficiais.',cycle='Anos mistos',status='provided'))
        if rank in extra:
            sources.append(dict(id=stable(f'{rank}/extra'),university_id=uid,title='Base adicional fornecida',url=None,document_name='Base de dados das 200 universidades adicionais (CSV).csv',page=None,page_end=None,record_number=rank-200,excerpt=extra[rank]['fontes'][:5000],cycle='Anos mistos',status='provided'))
    # A transition page may contain the end of one dossier and start of another.
    # Keep it unassigned rather than silently credit both passages to the new university.
    transition_pages={page_at(start) for _,start,_ in headings}
    interstitial_start=next((page_at(m.start()) for m in re.finditer(r'(?m)^\s*Parte IV\s*[—–]',text) if headings[199][1]<m.start()<headings[200][1]),page_at(headings[200][1]))
    # Page-boundary chunks preserve exact provenance. Source contents never become instructions.
    for page in pages:
        content=page['text'].strip()
        rank=next((rank for rank,start,_ in reversed(headings) if page_at(start)<=page['page']),None)
        if page['page'] in transition_pages or page['page'] < page_at(headings[0][1]) or interstitial_start <= page['page'] < page_at(headings[200][1]): rank=None
        offset=0
        while offset<len(content):
            end=min(offset+3000,len(content))
            if end<len(content):
                boundary=content.rfind(' ',offset+2200,end)
                if boundary>offset: end=boundary
            body=content[offset:end].strip()
            chunks.append(dict(id=stable(f'guide/page/{page["page"]}/{offset}'),university_id=stable(str(rank)) if rank else None,document_name=doc,page=page['page'],content=body,source_status='provided'))
            if end==len(content): break
            offset=max(offset+1,end-180)
    args.output.mkdir(parents=True,exist_ok=True)
    for name,data in [('catalog',catalog),('sources',sources),('chunks',chunks)]:
        (args.output/f'{name}.json').write_text(json.dumps(data,ensure_ascii=False),encoding='utf-8')
    audit=dict(universities=len(catalog),countries={c:sum(x['country']==c for x in catalog) for c in sorted({x['country'] for x in catalog})},sources=len(sources),knowledge_chunks=len(chunks),canonical_document=doc,pdfs=[{k:v for k,v in read(f'fast-meta-{i}.json').items() if k in ['file','sha256','pages','chars','links']} for i in range(3)],missing={key:sum(not x[key] for x in master) for key in master[0]},officially_verified=0,notes=['CSV adicional já está contido nas 400 linhas do funil.', 'Nenhuma meta editorial foi convertida em requisito obrigatório.', 'Os três PDFs são versões sobrepostas; somente o guia completo de 1.635 páginas alimenta a recuperação, evitando triplicar evidências.'])
    (args.output/'audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({k:v for k,v in audit.items() if k not in ['pdfs','missing']},ensure_ascii=False))

if __name__ == '__main__': main()
