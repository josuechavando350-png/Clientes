(()=>{if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;const sel='main h2, .sig-service-chapter h3, .b17-quote blockquote p';const els=[...document.querySelectorAll(sel)].filter(e=>!e.closest('.sig-browse,.hero')&&e.textContent.trim());els.forEach(e=>{const s=document.createElement('span');s.className='b25';while(e.firstChild)s.appendChild(e.firstChild);e.appendChild(s)});const spans=els.map(e=>e.firstChild);if(!('IntersectionObserver'in window)){spans.forEach(s=>s.classList.add('on'));return}const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('on');io.unobserve(x.target)}}),{rootMargin:'0px 0px -12% 0px',threshold:.01});spans.forEach(s=>io.observe(s));setTimeout(()=>spans.forEach(s=>{const r=s.getBoundingClientRect();if(r.top<innerHeight&&!s.classList.contains('on'))s.classList.add('on')}),5000)})()
;(()=>{
const root=document.documentElement,reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
const mkImg=document.querySelector('.footer-brand img,.sig-brand img,header img');const MK=mkImg?mkImg.src:'';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* ---------- telón ---------- */
const cur=document.createElement('div');cur.className='b26-curtain';cur.setAttribute('aria-hidden','true');if(MK)cur.innerHTML='<img alt="" src="'+MK+'">';document.body.appendChild(cur);
if(root.classList.contains('sig-loading')||reduced){cur.classList.add('now','lift')}else{requestAnimationFrame(()=>requestAnimationFrame(()=>cur.classList.add('lift')))}
addEventListener('click',e=>{if(reduced)return;const a=e.target.closest&&e.target.closest('a[href]');if(!a||e.button!==0||e.metaKey||e.ctrlKey)return;const h=a.getAttribute('href')||'';if(!h||h.startsWith('#')||/^(mailto:|tel:|javascript:|blob:|data:)/.test(h))return;if(/^https?:/.test(h)&&!/ericramirez\.com\.mx/.test(h))return;if(a.closest('.b26-env'))return;cur.classList.add('now');cur.classList.remove('lift');void cur.offsetWidth;cur.classList.remove('now')},true);
/* ---------- despacho vivo ---------- */
const fr=document.querySelector('.footer-row');
if(fr){const live=document.createElement('div');live.className='b26-live';live.innerHTML='<i></i><span>CDMX · Zapopan · Colima</span><b></b>';fr.appendChild(live);const b=live.querySelector('b');const tick=()=>{try{b.textContent=new Intl.DateTimeFormat('es-MX',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'America/Mexico_City'}).format(new Date())+' h'}catch{b.textContent=''}};tick();setInterval(tick,20000)}
/* ---------- expediente desclasificado ---------- */
const PH=['responsabilidad solidaria','multas de la UIF','prisión preventiva','extinción de dominio','créditos fiscales','antes que la autoridad','flujo de efectivo'];
const main=document.querySelector('main');const reds=[];
if(main&&!reduced){const used=new Set();const w=document.createTreeWalker(main,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement.closest('script,style,h1,h2,h3,button,.b26-red,.sig-browse')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});const nodes=[];while(w.nextNode())nodes.push(w.currentNode);
for(const n of nodes){for(const p of PH){if(used.has(p))continue;const k=n.nodeValue.indexOf(p);if(k<0)continue;const after=n.splitText(k);after.splitText(p.length);const s=document.createElement('span');s.className='b26-red';after.parentNode.replaceChild(s,after);s.appendChild(after);used.add(p);reds.push(s);break}}
if('IntersectionObserver'in window){const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){setTimeout(()=>x.target.classList.add('open'),260);io.unobserve(x.target)}}),{rootMargin:'0px 0px -30% 0px'});reds.forEach(r=>io.observe(r))}else reds.forEach(r=>r.classList.add('open'))}
/* ---------- sobre lacrado ---------- */
let env=null,moment='';
function build(){env=document.createElement('div');env.className='b26-env';env.setAttribute('role','dialog');env.setAttribute('aria-modal','true');env.setAttribute('aria-label','Consulta privada');env.style.setProperty('--mk','url("'+MK+'")');
env.innerHTML='<div class="b26-stage"><div class="b26-envelope"><div class="b26-flap"></div><button class="b26-seal" type="button" aria-label="Romper el sello y abrir"><i></i></button></div><div class="b26-hint">Toque el sello para abrir</div>'+
'<form class="b26-letter" novalidate><button class="b26-x" type="button" aria-label="Cerrar">×</button><small>Consulta privada · Confidencial</small><h3>Escríbale al licenciado.</h3>'+
'<label>Su nombre<input name="n" autocomplete="name"></label>'+
'<label>Momento del asunto</label><div class="b26-moment"><button type="button" data-m="Quiero prevenir" aria-pressed="false">Quiero prevenir</button><button type="button" data-m="Ya me está pasando" aria-pressed="false">Ya me está pasando</button></div>'+
'<label>Su asunto, en pocas palabras<textarea name="a" rows="3"></textarea></label>'+
'<label>Teléfono o correo<input name="c" autocomplete="email"></label>'+
'<div class="b26-err" aria-live="polite"></div><button class="b26-send" type="submit">Sellar y enviar</button><p class="b26-fine">Al enviar se abrirá su correo con la carta lista. Nada se comparte con terceros.</p></form>'+
'<div class="b26-done" aria-live="polite"><button class="b26-seal" type="button" tabindex="-1" aria-hidden="true"><i></i></button><h3></h3><p>Su carta fue sellada. Envíela desde su correo y el licenciado la leerá personalmente.</p><div class="b26-acts"><a class="prim b26-mail" href="#">Enviar mi carta</a><button type="button" class="b26-pdf">Descargar mi carta · PDF</button><button type="button" class="b26-close">Volver al sitio</button></div></div></div>';
document.body.appendChild(env);
env.querySelector('.b26-envelope .b26-seal').addEventListener('click',()=>{env.classList.add('open');setTimeout(()=>{const i=env.querySelector('input[name=n]');i&&i.focus({preventScroll:true})},1500)});
env.querySelectorAll('.b26-moment button').forEach(b=>b.addEventListener('click',()=>{moment=b.dataset.m;env.querySelectorAll('.b26-moment button').forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'))}));
env.querySelector('.b26-x').addEventListener('click',close);env.querySelector('.b26-close').addEventListener('click',close);
env.addEventListener('click',e=>{if(e.target===env)close()});
addEventListener('keydown',e=>{if(e.key==='Escape'&&env&&env.classList.contains('show'))close()});
env.querySelector('form').addEventListener('submit',e=>{e.preventDefault();const f=e.target,n=f.n.value.trim(),a=f.a.value.trim(),c=f.c.value.trim(),er=f.querySelector('.b26-err');
if(!n||!a){er.textContent='Escriba al menos su nombre y su asunto.';return}er.textContent='';
const first=n.split(/\s+/)[0];env.querySelector('.b26-done h3').textContent='Gracias, '+first+'.';
const body='Licenciado Eric Ramírez:\n\n'+a+'\n\nMomento: '+(moment||'Sin especificar')+'\nContacto: '+(c||'—')+'\n\n'+n;
env.querySelector('.b26-mail').href='mailto:abogado@ericramirez.com.mx?subject='+encodeURIComponent('Consulta privada — '+n)+'&body='+encodeURIComponent(body);
env._data={n,a,c,m:moment||'Sin especificar'};env.classList.add('sealed');setTimeout(()=>env.classList.add('done'),650)});
env.querySelector('.b26-pdf').addEventListener('click',()=>pdf(env._data))}
function open(){if(!env)build();env.classList.remove('open','sealed','done');env.querySelector('form').reset();moment='';env.querySelectorAll('.b26-moment button').forEach(x=>x.setAttribute('aria-pressed','false'));env.style.display='grid';requestAnimationFrame(()=>env.classList.add('show'));document.body.style.overflow='hidden';setTimeout(()=>env.querySelector('.b26-envelope .b26-seal').focus({preventScroll:true}),400)}
function close(){env.classList.remove('show');document.body.style.overflow='';setTimeout(()=>{env.style.display='none'},460)}
addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-consult]');if(!t)return;e.preventDefault();e.stopImmediatePropagation();open()},true);
/* ---------- carta PDF ---------- */
function latin(s){return String(s).replace(/[“”«»]/g,'"').replace(/[‘’]/g,"'").replace(/[—–]/g,'-').replace(/…/g,'...').replace(/[^\x00-\xff]/g,'')}
function pesc(s){return latin(s).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)')}
function wrap(s,max){const out=[];String(s).split(/\n/).forEach(par=>{let line='';par.split(/\s+/).forEach(w=>{if((line+' '+w).trim().length>max){if(line)out.push(line);line=w}else line=(line+' '+w).trim()});out.push(line)});return out}
function sigJpeg(){return new Promise(res=>{const im=document.querySelector('.hero-sign,.profile-hero-media .signature');if(!im){res(null);return}const go=()=>{try{const W=600,H=Math.round(W*im.naturalHeight/im.naturalWidth);const c1=document.createElement('canvas');c1.width=W;c1.height=H;const x=c1.getContext('2d');x.drawImage(im,0,0,W,H);x.globalCompositeOperation='source-in';x.fillStyle='#141312';x.fillRect(0,0,W,H);const c2=document.createElement('canvas');c2.width=W;c2.height=H;const y=c2.getContext('2d');y.fillStyle='#fff';y.fillRect(0,0,W,H);y.drawImage(c1,0,0);res({d:atob(c2.toDataURL('image/jpeg',.9).split(',')[1]),w:W,h:H})}catch(err){res(null)}};im.complete?go():im.addEventListener('load',go,{once:true})})}
async function pdf(d){if(!d)return;const sig=await sigJpeg();const date=new Intl.DateTimeFormat('es-MX',{day:'numeric',month:'long',year:'numeric',timeZone:'America/Mexico_City'}).format(new Date());
let s='';const T=(f,sz,x,y,t)=>{s+='BT /'+f+' '+sz+' Tf '+x+' '+y+' Td ('+pesc(t)+') Tj ET\n'};
s+='0.05 0.05 0.04 rg\n';T('F3',9,72,740,'E R I C   R A M Í R E Z');T('F3',7,72,727,'DEFENSA PENAL/FISCAL E INMOBILIARIA.');
s+='0.75 0.73 0.70 RG 0.5 w 72 712 m 540 712 l S\n';
T('F1',10,72,684,'Ciudad de México, '+date);T('F2',22,72,640,'Consulta privada');
T('F1',11,72,612,'De: '+d.n);T('F1',11,72,596,'Momento del asunto: '+d.m);T('F1',11,72,580,'Contacto: '+(d.c||'—'));
s+='0.75 0.73 0.70 RG 72 564 m 540 564 l S\n';let y=540;T('F3',7,72,y,'ASUNTO');y-=20;
wrap(d.a,82).slice(0,24).forEach(l=>{T('F1',12,72,y,l);y-=17});
y-=26;T('F2',12,72,y,'Recibida con la confidencialidad de siempre.');y-=12;
let img='';if(sig){const w=170,h=Math.round(170*sig.h/sig.w);s+='q '+w+' 0 0 '+h+' 72 '+(y-h-6)+' cm /Im1 Do Q\n';y-=h+16}
T('F1',10,72,Math.max(y,120),'Mtro. Eric Ricardo Ramírez Álvarez');
s+='0.75 0.73 0.70 RG 72 92 m 540 92 l S\n';T('F3',6.5,72,78,'CDMX · Homero 229, Polanco V   |   ZAPOPAN · Patria 2085, Puerta de Hierro   |   COLIMA · Av. Felipe Sevilla del Río 551');T('F3',6.5,72,66,'+52 312 690 1871  ·  abogado@ericramirez.com.mx  ·  ericramirez.com.mx');
const objs=[];objs.push('<< /Type /Catalog /Pages 2 0 R >>');objs.push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
objs.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R /F3 6 0 R >>'+(sig?' /XObject << /Im1 8 0 R >>':'')+' >> /Contents 7 0 R >>');
objs.push('<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman /Encoding /WinAnsiEncoding >>');objs.push('<< /Type /Font /Subtype /Type1 /BaseFont /Times-Italic /Encoding /WinAnsiEncoding >>');objs.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
const cs=latin(s);objs.push('<< /Length '+cs.length+' >>\nstream\n'+cs+'endstream');
if(sig)objs.push('<< /Type /XObject /Subtype /Image /Width '+sig.w+' /Height '+sig.h+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+sig.d.length+' >>\nstream\n'+sig.d+'\nendstream');
let out='%PDF-1.4\n%\xe2\xe3\xcf\xd3\n';const off=[];objs.forEach((o,k)=>{off.push(out.length);out+=(k+1)+' 0 obj\n'+o+'\nendobj\n'});const xr=out.length;
out+='xref\n0 '+(objs.length+1)+'\n0000000000 65535 f \n'+off.map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')+'trailer\n<< /Size '+(objs.length+1)+' /Root 1 0 R >>\nstartxref\n'+xr+'\n%%EOF';
const bytes=new Uint8Array(out.length);for(let k=0;k<out.length;k++)bytes[k]=out.charCodeAt(k)&255;
const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));const a=document.createElement('a');a.href=url;a.download='Carta-consulta-privada-Eric-Ramirez.pdf';document.body.appendChild(a);a.click();setTimeout(()=>{a.remove();URL.revokeObjectURL(url)},4000);window.__b26pdf=bytes.length}
})();

;(()=>{const hp=document.querySelector('.hero-photo');if(hp){const b=document.createElement('div');b.className='b27-blinds';b.setAttribute('aria-hidden','true');if(getComputedStyle(hp).position==='static')hp.style.position='relative';hp.appendChild(b)}
document.addEventListener('submit',e=>{const f=e.target;if(!f.classList||!f.classList.contains('b26-letter'))return;const n=(f.n&&f.n.value||'').trim();if(!n||!(f.a&&f.a.value.trim()))return;const done=document.querySelector('.b26-done');if(!done)return;let c=done.querySelector('.b27-card');if(!c){c=document.createElement('div');c.className='b27-card';c.innerHTML='<small>De</small><div class="b27-h b27-from"></div><small>Para</small><div class="b27-h">Lic. Eric Ramírez</div><span class="b27-wax"><i></i></span>';done.insertBefore(c,done.firstChild)}c.querySelector('.b27-from').textContent=n;c.classList.remove('write');void c.offsetWidth;setTimeout(()=>c.classList.add('write'),750)},true)})()
;(()=>{const f=document.querySelector(".b29-float");if(!f)return;const show=()=>f.classList.add("on");const r=document.documentElement;const t0=Date.now();(function w(){if(!r.classList.contains("sig-loading")||Date.now()-t0>5000)return setTimeout(show,1400);requestAnimationFrame(w)})()})()