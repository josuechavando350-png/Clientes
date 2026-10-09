(()=>{
/* ---------- Eric TV: reproductores bajo demanda ----------
 YouTube exige que la página tenga una dirección web real (https) para
 reproducir dentro del sitio. En el dominio publicado se reproduce aquí;
 en vistas previas locales el enlace abre YouTube/TikTok directamente. */
const webCtx=(()=>{try{return /^https?:\/\//.test(self.origin)&&/^https?:/.test(document.baseURI)}catch(e){return false}})();
const srcOf=a=>{const k=a.dataset.kind,id=a.dataset.id;
 if(k==='yt')return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&playsinline=1&modestbranding=1&origin=${encodeURIComponent(self.origin)}`;
 if(k==='sp')return `https://open.spotify.com/embed/${a.dataset.type||'episode'}/${id}?utm_source=generator&theme=0&autoplay=1`;
 if(k==='tt')return `https://www.tiktok.com/player/v1/${id}?autoplay=1&loop=1&description=0&music_info=0&rel=0`;
 return ''};
const canEmbed=a=>{const k=a.dataset.kind;if(k==='sp')return true;if(!webCtx)return false;return k==='yt'||(k==='tt'&&!!a.dataset.id)};
const mount=(card,a)=>{const f=document.createElement('iframe');f.setAttribute('referrerpolicy','strict-origin-when-cross-origin');f.className='b32-frame';f.src=srcOf(a);f.title=a.getAttribute('aria-label')||'Reproductor';f.allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture; web-share';f.allowFullscreen=true;card.appendChild(f);card.classList.add('is-live')};
const NAME={yt:'YouTube',tt:'TikTok',sp:'Spotify'};
document.querySelectorAll('.b32-tv [data-kind]').forEach(a=>{const card=a.closest('.b32-card');
 a.addEventListener('click',e=>{
  if(card.classList.contains('is-live')){e.preventDefault();return}
  if(canEmbed(a)){e.preventDefault();mount(card,a);return}
  /* sin reproductor integrado: el enlace real abre la app o una pestaña nueva */
  let n=card.querySelector('.b32-note');if(!n){n=document.createElement('span');n.className='b32-note';card.appendChild(n)}
  n.textContent='Abriendo en '+NAME[a.dataset.kind]+' ↗';card.classList.add('is-out');clearTimeout(card._t);card._t=setTimeout(()=>card.classList.remove('is-out'),2600);
 })});
/* TikTok: con el enlace corto se obtiene el número de video para reproducirlo dentro del sitio */
if(webCtx&&'IntersectionObserver' in window){const io=new IntersectionObserver(es=>es.forEach(async en=>{if(!en.isIntersecting)return;io.unobserve(en.target);const a=en.target,u=a.dataset.url||'';let id=(u.match(/\/video\/(\d+)/)||[])[1];
 if(!id){try{const ctl=new AbortController();setTimeout(()=>ctl.abort(),5000);const r=await fetch('https://www.tiktok.com/oembed?url='+encodeURIComponent(u),{signal:ctl.signal});if(r.ok){const j=await r.json();id=j.embed_product_id||((j.html||'').match(/data-video-id="(\d+)"/)||[])[1]}}catch(e){}}
 if(id)a.dataset.id=id}),{rootMargin:'700px 0px'});document.querySelectorAll('.b32-tv [data-kind="tt"]:not([data-id])').forEach(a=>io.observe(a))}
/* en pantallas táctiles la portada pasa a color al quedar en vista */
if(matchMedia('(hover:none)').matches&&'IntersectionObserver' in window){const io2=new IntersectionObserver(es=>es.forEach(en=>en.target.classList.toggle('is-in',en.intersectionRatio>.55)),{threshold:[0,.55,1]});document.querySelectorAll('.b32-tv .b32-card').forEach(c=>io2.observe(c))}
document.querySelectorAll('.b32-yt img,.b32-cover img').forEach(im=>{const bad=()=>{if(im.closest('.b32-yt')&&!im.dataset.f){im.dataset.f=1;im.src=im.src.replace('maxresdefault','hqdefault');return}im.style.display='none';(im.closest('.b32-yt')||im.closest('.b32-cover')).classList.add('b32-noimg')};im.addEventListener('error',bad);if(im.complete&&!im.naturalWidth&&im.src)bad()});

/* ---------- Galería ---------- */
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
document.querySelectorAll('.b32-gal').forEach(sec=>{
 const stick=sec.querySelector('.b32-stick'),track=sec.querySelector('.b32-track'),prog=sec.querySelector('.b32-prog');
 const phs=[...sec.querySelectorAll('.b32-ph')];let pin=false,dist=0,raf=0;
 const canPin=()=>!reduced&&innerWidth>=760&&CSS.supports('overflow','clip');
 function layout(){pin=canPin();sec.classList.toggle('is-pin',pin);
  if(pin){track.style.removeProperty('--tx');const last=track.lastElementChild,pr=parseFloat(getComputedStyle(track).paddingRight)||0;dist=Math.max(0,(last?last.offsetLeft+last.offsetWidth:track.scrollWidth)+pr-innerWidth);sec.style.height=(innerHeight+dist)+'px'}else{sec.style.height='';dist=0}
  tick()}
 function focusCard(){let best=null,bd=1e9;const cx=innerWidth/2;phs.forEach(p=>{const r=p.getBoundingClientRect();const d=Math.abs(r.left+r.width/2-cx);if(d<bd){bd=d;best=p}
  if(!reduced){const off=((r.left+r.width/2)-cx)/innerWidth;p.style.setProperty('--px',(off*-24).toFixed(1)+'px')}});
  const vis=sec.getBoundingClientRect();const inView=vis.top<innerHeight*.6&&vis.bottom>innerHeight*.4;
  phs.forEach(p=>p.classList.toggle('is-on',inView&&p===best&&bd<innerWidth*.32))}
 function tick(){raf=0;let p=0;
  if(pin){const r=sec.getBoundingClientRect();p=Math.max(0,Math.min(1,-r.top/Math.max(1,dist)));track.style.setProperty('--tx',(-p*dist).toFixed(1)+'px')}
  else{const m=track.scrollWidth-track.clientWidth;p=m>0?track.scrollLeft/m:0}
  prog&&prog.style.setProperty('--p',p.toFixed(4));focusCard()}
 const req=()=>{if(!raf)raf=requestAnimationFrame(tick)};
 addEventListener('scroll',req,{passive:true});track.addEventListener('scroll',req,{passive:true});addEventListener('resize',layout);
 phs.forEach(p=>{const im=p.querySelector('img');if(im&&!im.complete)im.addEventListener('load',layout,{once:true})});
 layout();setTimeout(layout,600);
 /* visor */
 phs.forEach((p,i)=>p.addEventListener('click',()=>openLB(phs.map(x=>x.querySelector('img').src),i)));
});
let lb=null,lbList=[],lbI=0;
function buildLB(){lb=document.createElement('div');lb.className='b32-lb';lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');lb.setAttribute('aria-label','Galería de clientes');
 lb.innerHTML=`<div class="b32-lb-top"><span class="b32-k">Clientes satisfechos</span><button type="button" aria-label="Cerrar"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div><div class="b32-lb-st"><img alt=""><button class="b32-lb-nav p" type="button" aria-label="Anterior"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M15 5l-7 7 7 7"/></svg></button><button class="b32-lb-nav n" type="button" aria-label="Siguiente"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M9 5l7 7-7 7"/></svg></button></div><div class="b32-lb-dots"></div>`;
 document.body.appendChild(lb);
 lb.querySelector('.b32-lb-top button').onclick=closeLB;lb.querySelector('.p').onclick=()=>go(-1);lb.querySelector('.n').onclick=()=>go(1);
 lb.addEventListener('click',e=>{if(e.target.classList.contains('b32-lb-st'))closeLB()});
 let x0=null;const st=lb.querySelector('.b32-lb-st');st.addEventListener('pointerdown',e=>{x0=e.clientX});st.addEventListener('pointerup',e=>{if(x0==null)return;const dx=e.clientX-x0;x0=null;if(Math.abs(dx)>50)go(dx<0?1:-1)});
 addEventListener('keydown',e=>{if(!lb.classList.contains('on'))return;if(e.key==='Escape')closeLB();if(e.key==='ArrowRight')go(1);if(e.key==='ArrowLeft')go(-1)})}
function show(){const im=lb.querySelector('img');im.classList.remove('in');setTimeout(()=>{im.src=lbList[lbI];requestAnimationFrame(()=>im.classList.add('in'))},120);lb.querySelector('.b32-lb-dots').innerHTML=lbList.map((_,k)=>`<i class="${k===lbI?'on':''}"></i>`).join('')}
function go(d){lbI=(lbI+d+lbList.length)%lbList.length;show()}
function openLB(list,i){if(!lb)buildLB();lbList=list;lbI=i;lb.classList.add('on');document.documentElement.style.overflow='hidden';show()}
function closeLB(){lb.classList.remove('on');document.documentElement.style.overflow=''}
})();
