"""Read originals without modifying them. Requires pymupdf==1.28.2.
python scripts/extract-materials.py --downloads "C:/Users/you/Downloads" --output ../materials
"""
import argparse,csv,hashlib,io,json
from pathlib import Path
import pymupdf
p=argparse.ArgumentParser();p.add_argument('--downloads',type=Path,required=True);p.add_argument('--output',type=Path,required=True);args=p.parse_args()
args.output.mkdir(parents=True,exist_ok=True)
names=['Radar das 200 melhores universidades da América do Norte.pdf','Estudar nos EUA  guia completo + radar das 200 universidades.pdf','Estudar nos EUA  guia completo + radar das 200 universidades (PDF).pdf','Funil de metas das 400 universidades (CSV).csv','Base de dados das 200 universidades adicionais (CSV).csv']
def save(name,value): (args.output/name).write_text(json.dumps(value,ensure_ascii=False),encoding='utf-8')
for i,name in enumerate(names):
 path=args.downloads/name
 if i<3:
  doc=pymupdf.open(path)
  pages=[dict(page=n+1,text=page.get_text(sort=True),links=[x['uri'] for x in page.get_links() if x.get('uri')]) for n,page in enumerate(doc)]
  save(f'fast-pdf-{i}.json',pages)
  save(f'fast-meta-{i}.json',dict(file=name,sha256=hashlib.sha256(path.read_bytes()).hexdigest(),pages=len(pages),chars=sum(len(x['text']) for x in pages),links=sum(len(x['links']) for x in pages)))
 else:
  content=path.read_text(encoding='utf-8-sig');dialect=csv.Sniffer().sniff(content[:10000],delimiters=',;\t')
  save(f'csv-{i}.json',list(csv.DictReader(io.StringIO(content),dialect=dialect)))
 print(f'Extracted {i+1}/{len(names)}')
