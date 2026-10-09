import asyncio,re,json,base64,mimetypes
from pathlib import Path
from playwright.async_api import async_playwright
CLIENT=Path(__file__).resolve().parents[1]
ROOT=CLIENT/'dist'
OUT=CLIENT/'evidence/qa';OUT.mkdir(parents=True,exist_ok=True)
ROUTES={'home':'index.html','conoceme':'conoceme.html','servicios':'servicios.html','areas':'areas/index.html','areas/defensa-fiscal':'areas/defensa-fiscal.html','areas/derecho-penal-patrimonial':'areas/derecho-penal-patrimonial.html','areas/amparo':'areas/amparo.html','areas/intangibles':'areas/intangibles.html','eric-tv':'eric-tv.html','medios':'medios.html','historias':'historias.html','recursos':'recursos.html','clientes':'clientes.html','contacto':'contacto.html'}

def data_uri(p):
 m=mimetypes.guess_type(p.name)[0] or 'application/octet-stream';return f'data:{m};base64,'+base64.b64encode(p.read_bytes()).decode()
IMG={('/assets/images/'+p.name):data_uri(p) for p in (ROOT/'assets/images').iterdir() if p.is_file()}

def inline(path):
 h=path.read_text(encoding='utf-8')
 def css(m):
  href=m.group(1);fp=(path.parent/href).resolve();txt=fp.read_text(encoding='utf-8')
  for k,v in IMG.items():txt=txt.replace(k,v)
  return '<style>'+txt+'</style>'
 h=re.sub(r'<link rel="stylesheet" href="([^"]+)">',css,h)
 for k,v in IMG.items():h=h.replace(k,v)
 def js(m):
  src=m.group(1);fp=(path.parent/src).resolve();return '<script>'+fp.read_text().replace('</script>','<\\/script>')+'</script>'
 h=re.sub(r'<script defer src="([^"]+)"></script>',js,h)
 return h.replace('data-intro="first"','data-intro="skip"')

async def main():
 rep={'matrix':[],'interactions':{}}
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
  for w,h in [(390,844),(1440,1000)]:
   page=await browser.new_page(viewport={'width':w,'height':h})
   current=[]
   page.on('console',lambda m: current.append('console:'+m.text) if m.type=='error' else None)
   page.on('pageerror',lambda e: current.append('pageerror:'+str(e)))
   for route,rel in ROUTES.items():
    current.clear()
    await page.set_content(inline(ROOT/rel),wait_until='domcontentloaded',timeout=15000)
    await page.wait_for_timeout(80)
    st=await page.evaluate('()=>({sw:document.documentElement.scrollWidth,iw:innerWidth,ready:window.__signatureQA?.initialized===true,loading:document.documentElement.classList.contains("sig-loading")})')
    rep['matrix'].append({'route':route,'width':w,'overflow':st['sw']>st['iw']+1,'ready':st['ready'],'loadingReleased':not st['loading'],'errors':list(current)})
   await page.close()
  # interaction home mobile and desktop
  for w,h in [(390,844),(1440,1000)]:
   page=await browser.new_page(viewport={'width':w,'height':h});errs=[]
   page.on('pageerror',lambda e:errs.append(str(e)))
   await page.set_content(inline(ROOT/'index.html'),wait_until='domcontentloaded');await page.wait_for_timeout(150)
   checks={}
   if await page.locator('#sigMenuOpen').count():
    await page.locator('#sigMenuOpen').click();await page.wait_for_timeout(50);checks['menuOpen']=not await page.locator('#sigBrowse').evaluate('(e)=>e.hidden')
    await page.locator('#sigMenuClose').click();await page.wait_for_timeout(220);checks['menuClose']=await page.locator('#sigBrowse').evaluate('(e)=>e.hidden')
   a=page.locator('[data-home-practice-trigger]').first
   if await a.count():await a.click();checks['areaExpand']=(await a.get_attribute('aria-expanded'))=='true'
   checks['riskSelectable']=await page.locator('[data-subject]').count()>=1
   await page.screenshot(path=str(OUT/f'production-{w}.png'),full_page=False)
   rep['interactions'][str(w)]={'checks':checks,'errors':errs}
   await page.close()
  await browser.close()
 fails=[x for x in rep['matrix'] if x['overflow'] or not x['ready'] or not x['loadingReleased'] or x['errors']]
 rep['summary']={'cases':len(rep['matrix']),'failures':len(fails),'pass':not fails}
 (OUT/'qa-report.json').write_text(json.dumps(rep,ensure_ascii=False,indent=2))
 print(json.dumps(rep['summary']))
 if fails:print(json.dumps(fails[:10],ensure_ascii=False,indent=2))
 print(json.dumps(rep['interactions'],ensure_ascii=False,indent=2))
asyncio.run(main())
