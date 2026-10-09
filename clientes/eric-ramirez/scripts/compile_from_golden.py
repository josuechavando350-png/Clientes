from pathlib import Path
import json, re, base64, io, hashlib, shutil, textwrap, os
from PIL import Image
from bs4 import BeautifulSoup
from fontTools.ttLib import TTFont
from fontTools import subset

BASE = Path(__file__).resolve().parents[1]
GOLDEN = Path(os.environ.get('ERIC_GOLDEN', BASE/'golden/eric_ramirez_NEXUS33_oro.html'))
DIST = BASE/'dist'
GOLDEN_DIR = BASE/'golden'
NEXUS_DIR = BASE/'nexus'
SCRIPTS_DIR = BASE/'scripts'
EVIDENCE_DIR = BASE/'evidence'
if not GOLDEN.exists():
    raise SystemExit(f'GOLDEN_NOT_AVAILABLE:{GOLDEN}')
if DIST.exists(): shutil.rmtree(DIST)
for d in [DIST/'assets/images', DIST/'assets/css', DIST/'assets/js', GOLDEN_DIR, NEXUS_DIR, SCRIPTS_DIR, EVIDENCE_DIR/'qa']:
    d.mkdir(parents=True, exist_ok=True)

src = GOLDEN.read_text(encoding='utf-8')
sha = hashlib.sha256(GOLDEN.read_bytes()).hexdigest()
golden_target=GOLDEN_DIR/'eric_ramirez_NEXUS33_oro.html'
if GOLDEN.resolve()!=golden_target.resolve(): shutil.copy2(GOLDEN,golden_target)

# Parse preview payload exactly.
p_idx = src.index('const ERIC_PAGES=') + len('const ERIC_PAGES=')
pages, _ = json.JSONDecoder().raw_decode(src[p_idx:])
r_idx = src.index('ERIC_RESOURCES=') + len('ERIC_RESOURCES=')
resources, _ = json.JSONDecoder().raw_decode(src[r_idx:])

# Helpers.
def decode_data(uri):
    meta, data = uri.split(',',1)
    return meta.split(';')[0].split(':',1)[1], base64.b64decode(data)

def save_image(idx, name, fmt, **kwargs):
    mime, raw = decode_data(resources[idx])
    im = Image.open(io.BytesIO(raw))
    out = DIST/'assets/images'/name
    im.save(out, format=fmt, **kwargs)
    return out, im.size

# Visual assets: modern formats without altering geometry/crop.
img_map = {}
p, dims = save_image(1,'logo-splash.avif','AVIF',quality=75); img_map[1]='/assets/images/logo-splash.avif'
p, dims2 = save_image(2,'er-mark.webp','WEBP',lossless=True,method=6); img_map[2]='/assets/images/er-mark.webp'
p, dims3 = save_image(3,'eric-portrait-1024.avif','AVIF',quality=75); img_map[3]='/assets/images/eric-portrait-1024.avif'
p, dims4 = save_image(4,'eric-signature.webp','WEBP',lossless=True,method=6); img_map[4]='/assets/images/eric-signature.webp'
p, dims5 = save_image(5,'eric-portrait-720.avif','AVIF',quality=72); img_map[5]='/assets/images/eric-portrait-720.avif'
p, dims6 = save_image(6,'eric-signature-wide.webp','WEBP',lossless=True,method=6); img_map[6]='/assets/images/eric-signature-wide.webp'
for n, idx in enumerate(range(13,18),1):
    out,_ = save_image(idx,f'client-{n:02d}.avif','AVIF',quality=65)
    img_map[idx]=f'/assets/images/client-{n:02d}.avif'

# Font subsetting. Do not emit standalone font files; keep subsets embedded in CSS.
# Corpus includes rendered text plus dynamic strings/scripts so Spanish punctuation survives.
corpus = ''.join(pages.values())
codepoints = set(ord(c) for c in corpus if ord(c) <= 0x024F or 0x2000 <= ord(c) <= 0x206F)
codepoints.update(range(0x20,0x100))

def subset_font_resource(idx):
    mime, raw = decode_data(resources[idx])
    in_path = BASE/f'.font-{idx}.bin'
    out_path = BASE/f'.font-{idx}.woff2'
    in_path.write_bytes(raw)
    font = TTFont(str(in_path))
    opts = subset.Options()
    opts.flavor = 'woff2'
    opts.layout_features = ['*']
    opts.name_IDs = ['*']
    opts.name_legacy = True
    opts.name_languages = ['*']
    sub = subset.Subsetter(options=opts)
    sub.populate(unicodes=codepoints)
    sub.subset(font)
    font.flavor = 'woff2'
    font.save(str(out_path))
    data = out_path.read_bytes()
    in_path.unlink(missing_ok=True); out_path.unlink(missing_ok=True)
    return 'data:font/woff2;base64,' + base64.b64encode(data).decode('ascii'), len(raw), len(data)

font_map = {}
font_stats = {}
for idx in [7,10,11,12]:
    uri, before, after = subset_font_resource(idx)
    font_map[idx] = uri
    font_stats[idx] = {'before':before,'after':after}

# Extract canonical scripts from source pages.
def scripts_for(route):
    soup = BeautifulSoup(pages[route], 'html.parser')
    return [(x.get('id'), x.get('type'), x.string or '') for x in soup.find_all('script')]

home_scripts = scripts_for('home')
normal_scripts = scripts_for('areas')
profile_scripts = scripts_for('conoceme')
media_scripts = scripts_for('clientes')

runtime = next(t for i,ty,t in normal_scripts if i=='signature-runtime')
# Production patch: standalone pages must follow normal internal links instead of posting to preview parent.
old = "if(!route)return;e.preventDefault();closeMenu(false);send('ERIC_ROUTE',{route,at});if(parent===window&&route===C.route)scrollToSection(at);"
new = "if(!route)return;if(parent===window){if(route===C.route){e.preventDefault();closeMenu(false);scrollToSection(at)}return}e.preventDefault();closeMenu(false);send('ERIC_ROUTE',{route,at});"
if old not in runtime:
    raise RuntimeError('Expected preview navigation clause not found')
runtime = runtime.replace(old,new)
(DIST/'assets/js/runtime.js').write_text(runtime,encoding='utf-8')

# Hash->script text catalog.
def anon_by_len(route, length):
    for i,ty,t in scripts_for(route):
        if i is None and ty is None and len(t.strip()) in (length,length-1,length+1):
            return t
    raise RuntimeError((route,length))

# Use positions to avoid ambiguity.
normal_non = [t for i,ty,t in normal_scripts if i is None and ty is None]
core_effects = '\n;'.join(normal_non)
(DIST/'assets/js/core-effects.js').write_text(core_effects,encoding='utf-8')
# Home-specific scripts by original order indices (excluding common blocks).
hanon=[t for i,ty,t in home_scripts if i is None and ty is None]
# Original anonymous sequence: 145,835,1111,871,11381,951,289,883,20486,7900
profile_effects='\n;'.join([hanon[0],hanon[2]])
home_foil='\n;'.join([hanon[1],hanon[7],hanon[8]])
media_effects=hanon[9]
(DIST/'assets/js/profile-effects.js').write_text(profile_effects,encoding='utf-8')
(DIST/'assets/js/home-foil.js').write_text(home_foil,encoding='utf-8')
(DIST/'assets/js/media-effects.js').write_text(media_effects,encoding='utf-8')

# Utility: production CSS hydration.
fontface_remove_patterns = [
    r"@font-face\{font-family:'Berenis VIP';src:url\('__ERIC_RESOURCE_0__'\).*?\}",
    r"@font-face\{font-family:'Instrument Serif';src:url\('__ERIC_RESOURCE_8__'\).*?\}",
    r"@font-face\{font-family:'Italiana';src:url\('__ERIC_RESOURCE_9__'\).*?\}",
]

def production_css(css):
    for pat in fontface_remove_patterns:
        css = re.sub(pat,'',css,flags=re.S)
    for idx,uri in font_map.items():
        css = css.replace(f'__ERIC_RESOURCE_{idx}__',uri)
    css = css.replace('__ERIC_RESOURCE_2__',img_map[2])
    # No other resource placeholder is allowed in stylesheet.
    leftovers = sorted(set(re.findall(r'__ERIC_RESOURCE_(\d+)__',css)))
    if leftovers: raise RuntimeError(f'CSS placeholders remain {leftovers}')
    return css

css_variants={}
for route,label in [('areas','site'),('home','home'),('conoceme','profile')]:
    soup=BeautifulSoup(pages[route],'html.parser')
    css=soup.find('style',id='nexus-orchestration-15').string or ''
    css=production_css(css)
    # Defensive performance hints that preserve layout.
    css += "\nimg{content-visibility:auto} @media(prefers-reduced-data:reduce){body::after{display:none!important}.b27-blinds{display:none!important}}\n"
    (DIST/f'assets/css/{label}.css').write_text(css,encoding='utf-8')
    css_variants[label]=css

route_path = {
 'home':'index.html','conoceme':'conoceme.html','servicios':'servicios.html','areas':'areas/index.html',
 'areas/defensa-fiscal':'areas/defensa-fiscal.html','areas/derecho-penal-patrimonial':'areas/derecho-penal-patrimonial.html',
 'areas/amparo':'areas/amparo.html','areas/intangibles':'areas/intangibles.html','eric-tv':'eric-tv.html','medios':'medios.html',
 'historias':'historias.html','recursos':'recursos.html','clientes':'clientes.html','contacto':'contacto.html'
}
indexable=set(route_path)-{'historias','recursos'}

# Raw script regex preserves the authored body exactly except script extraction.
script_re=re.compile(r'<script(?P<attrs>[^>]*)>(?P<body>.*?)</script>',re.S|re.I)
style_re=re.compile(r'<style id="nexus-orchestration-15">.*?</style>',re.S|re.I)

def rel_prefix(route):
    return '../' if (route=='areas' or route.startswith('areas/')) else ''

def build_page(route, html):
    css_name='home' if route=='home' else ('profile' if route=='conoceme' else 'site')
    prefix=rel_prefix(route)
    html=style_re.sub(f'<link rel="stylesheet" href="{prefix}assets/css/{css_name}.css">',html,count=1)
    # Keep JSON-LD and per-route config inline; move all executable JS to cacheable files.
    def script_sub(m):
        attrs=m.group('attrs') or ''
        if 'application/json' in attrs or 'application/ld+json' in attrs:
            return m.group(0)
        return ''
    html=script_re.sub(script_sub,html)
    # Hydrate image assets in markup.
    for idx,path in img_map.items(): html=html.replace(f'__ERIC_RESOURCE_{idx}__',path)
    # Remove dead font placeholders if any survived outside CSS.
    for idx in [0,7,8,9,10,11,12]: html=html.replace(f'__ERIC_RESOURCE_{idx}__','')
    leftovers=sorted(set(re.findall(r'__ERIC_RESOURCE_(\d+)__',html)))
    if leftovers: raise RuntimeError(f'{route}: HTML placeholders remain {leftovers}')
    # Production robots: keep incomplete editorial placeholders out of index, all substantive pages crawlable.
    robots='index,follow,max-image-preview:large' if route in indexable else 'noindex,follow'
    html=re.sub(r'<meta content="noindex,nofollow" name="robots"/?>',f'<meta content="{robots}" name="robots"/>',html)
    html=re.sub(r'<meta name="robots" content="noindex,nofollow"\s*/?>',f'<meta name="robots" content="{robots}"/>',html)
    # Intrinsic dimensions on high-priority art to prevent layout movement.
    html=html.replace('class="vip-splash-logo" decoding="sync" fetchpriority="high" src="/assets/images/logo-splash.avif"',
                      'class="vip-splash-logo" decoding="async" fetchpriority="high" width="1408" height="761" src="/assets/images/logo-splash.avif"')
    html=html.replace('alt="Eric Ramírez" fetchpriority="high" src="/assets/images/eric-portrait-1024.avif"',
                      'alt="Eric Ramírez" decoding="async" fetchpriority="high" width="1024" height="1536" src="/assets/images/eric-portrait-1024.avif"')
    html=html.replace('alt="" class="hero-sign" src="/assets/images/eric-signature.webp"',
                      'alt="" class="hero-sign" decoding="async" width="1380" height="360" src="/assets/images/eric-signature.webp"')
    html=html.replace('src="/assets/images/eric-portrait-720.avif"', 'src="/assets/images/eric-portrait-720.avif"')
    # Correct resource URLs for nested /areas pages: absolute URLs already used for media; CSS/JS use relative prefix.
    # Add home preloads and manifest metadata.
    if route=='home':
        preload=(
            '<link rel="canonical" href="https://ericramirez.com.mx/">'
            '<link rel="preload" as="image" href="/assets/images/logo-splash.avif" fetchpriority="high">'
            '<link rel="preload" as="image" href="/assets/images/eric-portrait-1024.avif" fetchpriority="high">'
        )
        html=html.replace('</head>',preload+'</head>',1)
        html=html.replace('<button data-folio-next="" type="button"></button>','<button data-folio-next="" type="button" aria-label="Ir a la siguiente sección"></button>')
    # Cached executable layers: effect listeners first, preview-derived runtime last.
    tags=[]
    if route in {'home','conoceme'}: tags.append(f'<script defer src="{prefix}assets/js/profile-effects.js"></script>')
    if route=='home': tags.append(f'<script defer src="{prefix}assets/js/home-foil.js"></script>')
    tags.append(f'<script defer src="{prefix}assets/js/core-effects.js"></script>')
    if route in {'home','eric-tv','clientes'}: tags.append(f'<script defer src="{prefix}assets/js/media-effects.js"></script>')
    tags.append(f'<script defer src="{prefix}assets/js/runtime.js"></script>')
    html=html.replace('</body>',''.join(tags)+'</body>',1)
    # Production build marker.
    html=html.replace('data-build="orchestration-15"', 'data-build="nexus33-production"')
    return html

for route,html in pages.items():
    out=DIST/route_path[route]
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(build_page(route,html),encoding='utf-8')

# Robots + sitemap. Domain kept from canonical URLs in approved artifact.
(DIST/'robots.txt').write_text('User-agent: *\nAllow: /\nDisallow: /historias.html\nDisallow: /recursos.html\nSitemap: https://ericramirez.com.mx/sitemap.xml\n',encoding='utf-8')
sitemap_routes=[r for r in route_path if r in indexable]
urls=[]
for r in sitemap_routes:
    path=route_path[r]
    url='https://ericramirez.com.mx/' + ('' if path=='index.html' else path)
    urls.append(f'  <url><loc>{url}</loc></url>')
(DIST/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+'\n'.join(urls)+'\n</urlset>\n',encoding='utf-8')

# Security/performance headers for eventual Vercel deployment; not deployed yet.
vercel={
  'cleanUrls': False,
  'trailingSlash': False,
  'headers':[
    {'source':'/assets/(.*)','headers':[{'key':'Cache-Control','value':'public, max-age=31536000, immutable'}]},
    {'source':'/(.*)','headers':[{'key':'X-Content-Type-Options','value':'nosniff'},{'key':'Referrer-Policy','value':'strict-origin-when-cross-origin'},{'key':'Permissions-Policy','value':'camera=(), microphone=(), geolocation=()'}]}
  ]
}
(DIST/'vercel.json').write_text(json.dumps(vercel,ensure_ascii=False,indent=2),encoding='utf-8')

# Nexus project contracts.
project_dna={
  'nexus':{'ownedProject':False,'clientProject':True},
  'project':{'id':'eric-ramirez','domain':'ericramirez.com.mx','primaryViewport':{'width':390}},
  'goldenTargets':[{'id':'nexus33-oro','kind':'REFERENCE','path':'golden/eric_ramirez_NEXUS33_oro.html','immutable':True,'sha256':sha}],
  'constraints':[
    {'id':'GOLDEN_IMMUTABLE','authority':'HUMAN_ART_DIRECTOR','category':'DELIVERY','rule':'NEXUS33_oro is the immutable visual and functional source of truth. Production optimization must not redesign it.','locked':True},
    {'id':'CANO_DENY','authority':'HUMAN_ART_DIRECTOR','category':'DELIVERY','rule':'This project may never read, write, deploy, move, or modify Cano Penal artifacts.','locked':True},
    {'id':'CLIENT_SCOPE_LOCK','authority':'PROJECT_DESIGN_DNA','category':'DELIVERY','rule':'Writes are restricted to clientes/eric-ramirez/** and root registry metadata explicitly owned by the Clientes repository.','locked':True},
    {'id':'VERCEL_GATED','authority':'HUMAN_ART_DIRECTOR','category':'DELIVERY','rule':'No Vercel deployment is permitted until the user explicitly starts the deployment phase.','locked':True},
    {'id':'MOBILE_PRIMARY','authority':'HUMAN_ART_DIRECTOR','category':'RESPONSIVE','rule':'390px is the primary mobile judgment surface; desktop 1366, 1440 and 1920 are separately composed QA surfaces.','locked':True},
    {'id':'MOTION_REDUCED','authority':'ENGINE_RULE','category':'MOTION','rule':'All motion must preserve prefers-reduced-motion behavior and may not create layout shifts.','locked':True},
    {'id':'CONTENT_TRUTH','authority':'HUMAN_ART_DIRECTOR','category':'CONTENT','rule':'Do not invent cases, testimonials, awards, results, credentials, media appearances, or client claims.','locked':True},
    {'id':'HISTORIAS_PENDING','authority':'HUMAN_ART_DIRECTOR','category':'CONTENT','rule':'Historias de Éxito remains noindex until Eric provides authorized source material.','locked':True},
    {'id':'PERFORMANCE_BUDGET','authority':'ENGINE_RULE','category':'DELIVERY','rule':'Target Lighthouse/PageSpeed 99+ on primary production URL; local budgets fail closed on CLS, JS errors, broken assets and excessive LCP resource weight.','locked':True},
    {'id':'DELIVERY_FAIL_CLOSED','authority':'ENGINE_RULE','category':'DELIVERY','rule':'NOT_TESTED is never PASS. Production certification requires measured evidence after deployment.','locked':True}
  ]
}
(NEXUS_DIR/'project-dna.json').write_text(json.dumps(project_dna,ensure_ascii=False,indent=2),encoding='utf-8')
(NEXUS_DIR/'scope-lock.json').write_text(json.dumps({
  'clientId':'eric-ramirez','allowedWriteGlobs':['clientes/eric-ramirez/**','.nexus/registry.json','README.md'],
  'deniedGlobs':['**/cano/**','**/cano-penal/**','**/*cano*penal*'],'deployment':{'vercel':'DENY_UNTIL_EXPLICIT_PHASE'}
},ensure_ascii=False,indent=2),encoding='utf-8')
(NEXUS_DIR/'performance-budget.json').write_text(json.dumps({
  'target':{'performance':99,'accessibility':99,'bestPractices':99,'seo':99},
  'labBudgets':{'clsMax':0.05,'lcpMsMax':2200,'fcpMsMax':1500,'jsErrorsMax':0,'brokenRequestsMax':0,'homeInitialImageBytesMax':90000,'homeJsBytesMax':80000,'homeCssBytesMax':180000},
  'note':'Final PageSpeed scores require a public HTTPS URL and are NOT_TESTED until deployment.'
},ensure_ascii=False,indent=2),encoding='utf-8')

registry={'schemaVersion':1,'clients':[{'id':'eric-ramirez','name':'Eric Ramírez','path':'clientes/eric-ramirez','status':'PRODUCTION_CANDIDATE','goldenSha256':sha}]}
# Root repository metadata is managed outside the client compiler; fail-closed scope isolation.
(BASE/'README.md').write_text(textwrap.dedent(f'''\
# Eric Ramírez

- Client project: `true`
- Golden: `golden/eric_ramirez_NEXUS33_oro.html`
- Golden SHA-256: `{sha}`
- Production output: `dist/`
- Vercel: gated; not deployed in this phase.
- Cano Penal: explicit deny scope.

`dist/` is a static, cacheable decompilation of the Golden preview. The Golden remains byte-for-byte immutable.
'''),encoding='utf-8')

# Build manifest with actual sizes/hashes.
manifest={'goldenSha256':sha,'routes':{},'assets':{},'fontSubsetting':font_stats}
for route,path in route_path.items():
    p=DIST/path
    manifest['routes'][route]={'path':path,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'indexable':route in indexable}
for p in sorted((DIST/'assets').rglob('*')):
    if p.is_file():
        rel=p.relative_to(DIST).as_posix();manifest['assets'][rel]={'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
(NEXUS_DIR/'build-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')

# Save compiler itself in client project for reproducibility.
# Compiler source is already versioned in scripts/; do not overwrite it.

print(json.dumps({
 'root':str(BASE.parent.parent),'golden_sha256':sha,'routes':len(route_path),
 'dist_bytes':sum(p.stat().st_size for p in DIST.rglob('*') if p.is_file()),
 'golden_bytes':GOLDEN.stat().st_size,'font_stats':font_stats,
 'images':{k:{'path':v,'bytes':(DIST/v.lstrip('/')).stat().st_size} for k,v in img_map.items()}
},ensure_ascii=False,indent=2))
