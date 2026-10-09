from pathlib import Path
from bs4 import BeautifulSoup
import json,re,hashlib,brotli,gzip,io
from jsonschema import Draft202012Validator
BASE=Path(__file__).resolve().parents[1]
DIST=BASE/'dist';N=BASE/'nexus';QA=BASE/'evidence/qa'
route_paths=['index.html','conoceme.html','servicios.html','areas/index.html','areas/defensa-fiscal.html','areas/derecho-penal-patrimonial.html','areas/amparo.html','areas/intangibles.html','eric-tv.html','medios.html','historias.html','recursos.html','clientes.html','contacto.html']

def br(p):return len(brotli.compress(p.read_bytes(),quality=11))
def gz(p):
 b=io.BytesIO();
 with gzip.GzipFile(fileobj=b,mode='wb',compresslevel=9) as f:f.write(p.read_bytes())
 return len(b.getvalue())

# Exact Nexus Project DNA schema from engine.
schema={
 '$schema':'https://json-schema.org/draft/2020-12/schema','$id':'https://nexus.local/schemas/project-design-dna.schema.json','title':'Nexus Project Design DNA','type':'object','additionalProperties':False,'required':['nexus','project','goldenTargets','constraints'],
 'properties':{
  'nexus':{'type':'object','additionalProperties':False,'required':['ownedProject','clientProject'],'properties':{'ownedProject':{'type':'boolean'},'clientProject':{'type':'boolean'}},'allOf':[{'if':{'properties':{'ownedProject':{'const':True}},'required':['ownedProject']},'then':{'properties':{'clientProject':{'const':False}}}},{'if':{'properties':{'clientProject':{'const':True}},'required':['clientProject']},'then':{'properties':{'ownedProject':{'const':False}}}}]},
  'project':{'type':'object','additionalProperties':False,'required':['id','domain','primaryViewport'],'properties':{'id':{'type':'string','pattern':'^[a-z0-9][a-z0-9-]*$'},'domain':{'type':'string','minLength':3},'primaryViewport':{'type':'object','additionalProperties':False,'required':['width'],'properties':{'width':{'type':'integer','minimum':240,'maximum':2000}}}}},
  'goldenTargets':{'type':'array','minItems':1,'items':{'type':'object','additionalProperties':False,'required':['id','kind','path','immutable'],'properties':{'id':{'type':'string','minLength':1},'kind':{'enum':['REFERENCE','ASSET']},'path':{'type':'string','minLength':1},'immutable':{'type':'boolean'},'sha256':{'type':'string','pattern':'^[a-f0-9]{64}$'}}}},
  'constraints':{'type':'array','minItems':1,'items':{'type':'object','additionalProperties':False,'required':['id','authority','category','rule'],'properties':{'id':{'type':'string','pattern':'^[A-Z0-9_]+$'},'authority':{'enum':['HUMAN_ART_DIRECTOR','PROJECT_DESIGN_DNA','ENGINE_RULE']},'category':{'enum':['TYPOGRAPHY','COLOR','MOTION','STRUCTURE','CONTENT','ASSET','RESPONSIVE','DELIVERY']},'rule':{'type':'string','minLength':1},'locked':{'type':'boolean','default':True}}}}
 }}
dna=json.loads((N/'project-dna.json').read_text())
errors=[e.message for e in Draft202012Validator(schema).iter_errors(dna)]

# Link resolver.
def resolve_internal(page_path,href):
 href=href.split('#')[0].split('?')[0]
 if not href or href.startswith(('mailto:','tel:','https://','http://','javascript:','data:','blob:')):return None
 p=(page_path.parent/href).resolve()
 try:p.relative_to(DIST.resolve())
 except:return ('OUTSIDE',str(p))
 return p

pages=[]; broken=[]; a11y=[]; seo=[]
for rel in route_paths:
 p=DIST/rel;s=BeautifulSoup(p.read_text(),'html.parser')
 ids=[x.get('id') for x in s.find_all(attrs={'id':True})]
 dups=sorted({x for x in ids if ids.count(x)>1})
 for a in s.find_all('a',href=True):
  q=resolve_internal(p,a['href'])
  if isinstance(q,Path) and not q.exists():broken.append({'page':rel,'href':a['href'],'resolved':str(q.relative_to(DIST))})
 for im in s.find_all('img'):
  if not im.has_attr('alt'):a11y.append({'page':rel,'issue':'IMG_ALT_MISSING','src':im.get('src')})
 for b in s.find_all('button'):
  if not (b.get_text(strip=True) or b.get('aria-label')):a11y.append({'page':rel,'issue':'BUTTON_NAME_MISSING'})
 canonical=s.find('link',rel='canonical'); desc=s.find('meta',attrs={'name':'description'}); robots=s.find('meta',attrs={'name':'robots'})
 if not canonical:seo.append({'page':rel,'issue':'CANONICAL_MISSING'})
 if not desc or not desc.get('content'):seo.append({'page':rel,'issue':'DESCRIPTION_MISSING'})
 pages.append({'path':rel,'bytes':p.stat().st_size,'brotli':br(p),'gzip':gz(p),'duplicateIds':dups,'robots':robots.get('content') if robots else None})

assets=[]
for p in sorted((DIST/'assets').rglob('*')):
 if p.is_file():assets.append({'path':p.relative_to(DIST).as_posix(),'bytes':p.stat().st_size,'brotli':br(p) if p.suffix in ['.css','.js'] else None})

home_css=list(sorted((DIST/'assets/css').glob('home-*.css')));jsfiles=[DIST/'assets/js/profile-effects.js',DIST/'assets/js/home-foil.js',DIST/'assets/js/core-effects.js',DIST/'assets/js/media-effects.js',DIST/'assets/js/runtime.js']
initial_imgs=[DIST/'assets/images/logo-splash.avif',DIST/'assets/images/eric-portrait-1024.avif']
perf={
 'homeHtmlBytes':(DIST/'index.html').stat().st_size,'homeHtmlBrotli':br(DIST/'index.html'),
 'homeCssBytes':sum(p.stat().st_size for p in home_css),'homeCssBrotli':sum(br(p) for p in home_css),
 'homeJsBytes':sum(x.stat().st_size for x in jsfiles),'homeJsBrotli':sum(br(x) for x in jsfiles),
 'homePriorityImageBytes':sum(x.stat().st_size for x in initial_imgs),
 'homePriorityImages':[{'path':x.name,'bytes':x.stat().st_size} for x in initial_imgs],
}
bud=json.loads((N/'performance-budget.json').read_text())['labBudgets']
perf['budgetChecks']={
 'homeInitialImageBytes':perf['homePriorityImageBytes']<=bud['homeInitialImageBytesMax'],
 'homeJsBytes':perf['homeJsBytes']<=bud['homeJsBytesMax'],
 'homeCssBytes':perf['homeCssBytes']<=bud['homeCssBytesMax'],
}
qa=json.loads((QA/'qa-report.json').read_text()) if (QA/'qa-report.json').exists() else None
visual=json.loads((QA/'visual-parity.json').read_text()) if (QA/'visual-parity.json').exists() else None
report={'status':'PASS_STATIC' if not errors and not broken and not a11y and not seo and all(perf['budgetChecks'].values()) and qa and qa['summary']['pass'] else 'FAIL','projectDnaErrors':errors,'brokenLocalLinks':broken,'accessibilityStaticIssues':a11y,'seoStaticIssues':seo,'pages':pages,'assets':assets,'performance':perf,'browserQA':qa['summary'] if qa else None,'visualParity':visual,'pagespeed':{'status':'NOT_TESTED','reason':'Requires a public HTTPS deployment URL; target is 99+ in all four Lighthouse categories on primary production URL.'}}
(N/'certification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps({'status':report['status'],'dnaErrors':len(errors),'broken':len(broken),'a11y':len(a11y),'seo':len(seo),'perf':perf,'browserQA':report['browserQA']},ensure_ascii=False,indent=2))
