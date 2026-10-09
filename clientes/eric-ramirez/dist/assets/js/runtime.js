/* Deterministic, local-only interaction layer. No API, AI chat, analytics or storage. */
(() => {
 'use strict';
 function init(){
  const C=JSON.parse(document.getElementById('signature-config').textContent);
  const $=(q,base=document)=>base.querySelector(q), $$=(q,base=document)=>[...base.querySelectorAll(q)];
  const root=document.documentElement, shell=$('#siteShell'), media=matchMedia('(prefers-reduced-motion: reduce)'), compact=matchMedia('(max-width:980px)');
  let reduced=media.matches, menuReturn=null, consultReturn=null, activeSubject=null, openSubject=false, scene=0;
  const answers={subject:null,moment:null};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normal=s=>s.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const subjectById=id=>C.subjects.find(x=>x.id===id);
  const send=(type,payload={})=>{if(parent!==window)parent.postMessage({type,...payload},'*')};
  function announce(message){const el=$('#sigAnnounce');if(el)el.textContent=message}
  function animate(el){if(!el||reduced)return;el.classList.remove('sig-motion-reveal');void el.offsetWidth;el.classList.add('sig-motion-reveal')}
  function applyMotion(value){reduced=Boolean(value)||media.matches;root.classList.toggle('sig-reduced',reduced);const b=$('[data-motion-toggle]');if(b){b.textContent=reduced?'Movimiento reducido':'Movimiento suave';b.setAttribute('aria-pressed',String(reduced))}if(reduced){root.style.removeProperty('--hero-depth');root.style.removeProperty('--hero-drift')}updateScroll()}
  media.addEventListener?.('change',()=>applyMotion(media.matches));
  $('[data-motion-toggle]')?.addEventListener('click',()=>{applyMotion(!reduced);send('ERIC_MOTION',{reduced})});
  function scrollToSection(id){if(!id){window.scrollTo({top:0,behavior:reduced?'instant':'smooth'});return}const target=document.getElementById(id);if(target){target.scrollIntoView({block:'start',behavior:reduced?'auto':'smooth'});if(target.tagName==='H3')target.focus({preventScroll:true})}}

  let menuCloseTimer=0;
  const menuScrim=$('#b14MenuScrim');
  function searchMenu(open,focus=true){
    const menu=$('#sigBrowse'),field=$('#b14MenuSearch'),toggle=$('#b14SearchToggle');
    field.hidden=!open;toggle.setAttribute('aria-expanded',String(open));menu.dataset.searching=String(open);
    if(!open){$('#sigSearch').value='';filterMenu('')}
    else if(focus)requestAnimationFrame(()=>$('#sigSearch').focus({preventScroll:true}));
  }
  function openMenu(withSearch=false){
    clearTimeout(menuCloseTimer);menuReturn=document.activeElement;const menu=$('#sigBrowse');
    root.classList.remove('b14-menu-closing');menu.hidden=false;menuScrim.hidden=false;
    if(shell)shell.inert=true;document.body.style.overflow='hidden';$('#sigMenuOpen')?.setAttribute('aria-expanded','true');
    $('#sigSearch').value='';filterMenu('');searchMenu(withSearch,false);menu.scrollTop=0;
    requestAnimationFrame(()=>{(withSearch?$('#sigSearch'):$('#sigMenuClose')).focus({preventScroll:true})});
  }
  function closeMenu(restore=true){
    const menu=$('#sigBrowse');if(menu.hidden)return;clearTimeout(menuCloseTimer);
    const done=()=>{menu.hidden=true;menuScrim.hidden=true;root.classList.remove('b14-menu-closing');
      if(shell)shell.inert=false;document.body.style.overflow='';$('#sigMenuOpen')?.setAttribute('aria-expanded','false');
      if(restore&&menuReturn?.isConnected)menuReturn.focus({preventScroll:true});};
    if(reduced||!restore){done();return}
    root.classList.add('b14-menu-closing');menuCloseTimer=setTimeout(done,180);
  }
  function filterMenu(query){
    let count=0;const norm=normal(query);
    $$('.sig-browse-link').forEach(a=>{a.hidden=!normal(a.dataset.search+' '+a.textContent).includes(norm);if(!a.hidden)count++});
    $('#sigSearchStatus').textContent=count?'':'Sin coincidencias. Pruebe “Fiscal”, “Servicios” o “Contacto”.';
  }
  $('#sigMenuOpen')?.addEventListener('click',()=>openMenu(false));
  $('#sigMenuClose')?.addEventListener('click',()=>closeMenu());
  menuScrim?.addEventListener('click',()=>closeMenu());
  $('#b14SearchToggle')?.addEventListener('click',()=>searchMenu($('#b14MenuSearch').hidden));
  $('#sigSearch')?.addEventListener('input',e=>filterMenu(e.target.value));
  document.addEventListener('keydown',e=>{
    const menu=$('#sigBrowse');
    if(!menu.hidden){
      if(e.key==='Escape'){e.preventDefault();closeMenu();return}
      if(e.key==='Tab'){
        const all=$$('button,a[href],input',menu).filter(x=>!x.hidden&&!x.closest('[hidden]')&&!x.disabled&&x.getClientRects().length);
        const first=all[0],last=all.at(-1);
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}
      }
    } else if(e.key==='/'&&!/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)&&!$('#sigConsult').open){e.preventDefault();openMenu(true)}
  });
  // Clean route controls. A route never points outside the packaged preview by accident.
  function routeOf(path){let p=path.replace(/^\/+/, '');if(!p||p==='index.html')return 'home';if(p==='areas/'||p==='areas/index.html')return 'areas';if(p.endsWith('.html'))p=p.slice(0,-5);return C.routes.includes(p)?p:null}
  document.addEventListener('click',e=>{
   const consult=e.target.closest('[data-consult]');if(consult){e.preventDefault();closeMenu(false);openConsult(consult.dataset.consult||null,consult);return}
   const a=e.target.closest('a[href]');if(!a||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.hasAttribute('download'))return;
   const href=a.getAttribute('href');if(!href||/^(mailto:|tel:|javascript:)/.test(href))return;
   let route=null,at='';
   if(href.startsWith('#')){route=C.route;at=decodeURIComponent(href.slice(1))}
   else{let u;try{u=new URL(href,'https://preview.invalid/'+C.source)}catch{return}if(!['preview.invalid','ericramirez.com.mx','www.ericramirez.com.mx'].includes(u.hostname))return;route=routeOf(u.pathname);at=decodeURIComponent(u.hash.slice(1))}
   if(!route)return;if(parent===window){if(route===C.route){e.preventDefault();closeMenu(false);scrollToSection(at)}return}e.preventDefault();closeMenu(false);send('ERIC_ROUTE',{route,at});
  },true);
  // Inline practice disclosures. Hidden panels are inert; all six keep their original copy.
  const entries=$$('[data-home-practice],[data-practice-entry]');
  function setPractice(entry,open){
    const trigger=$('[data-home-practice-trigger],[data-practice-trigger]',entry), panel=$('[data-home-practice-panel],[data-practice-panel]',entry);
    entry.dataset.open=String(open);trigger.setAttribute('aria-expanded',String(open));if(panel){panel.inert=!open;panel.setAttribute('aria-hidden',String(!open));if(!panel.id)panel.id='sig-area-'+entries.indexOf(entry);trigger.setAttribute('aria-controls',panel.id)}
    const caption=$('.practice-state',entry)||trigger.querySelector(':scope > span');if(caption)caption.textContent=open?'Cerrar materia':'Abrir materia';
  }
  entries.forEach(entry=>{setPractice(entry,false);$('[data-home-practice-trigger],[data-practice-trigger]',entry).addEventListener('click',()=>{const opening=entry.dataset.open!=='true';entries.forEach(other=>setPractice(other,other===entry&&opening));if(opening){const title=$('h2,h3',entry);announce('Materia abierta: '+title.textContent)}})});
  // The navigator is a catalog index, not a risk assessment engine.
  const risk=$('#sigRiskResult');
  function resultHTML(d){return `<span class="sig-label">Lectura del catálogo</span><h3>${esc(d.title)}</h3><div class="sig-result-readout">${d.groups.map(g=>`<div class="sig-result-group"><small>${esc(g.label)}</small>${g.services.map(id=>{const s=C.services.find(x=>x.id===id);return `<a class="sig-result-service" href="servicios.html#${s.id}">${esc(s.title)}</a>`}).join('')}</div>`).join('')}</div><p class="sig-result-context">${esc(d.note)}</p><div class="sig-result-bottom"><p>Esta selección organiza la navegación. No determina riesgo, viabilidad ni estrategia jurídica.</p><button type="button" class="sig-link" data-consult="${d.id}">Llevar a mi consulta</button></div>`}
  function positionResult(){if(!risk||!activeSubject)return;const target=compact.matches?$(`[data-subject-slot="${activeSubject}"]`):$('#sigRiskDesktop');target.appendChild(risk);risk.hidden=!openSubject}
  function selectSubject(id){const d=subjectById(id);if(!d||!risk)return;activeSubject=id;openSubject=true;$$('[data-subject]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.subject===id));b.setAttribute('aria-controls','sigRiskResult')});risk.innerHTML=resultHTML(d);risk.hidden=false;positionResult();animate(risk);if(compact.matches){const active=$(`[data-subject="${id}"]`);requestAnimationFrame(()=>{const r=active.getBoundingClientRect();if(r.top<76||r.top>innerHeight*.36)window.scrollTo({top:r.top+scrollY-92,behavior:reduced?'instant':'smooth'})})}announce('Selección: '+d.title+'. Los servicios relacionados aparecen a continuación.');}
  $$('[data-subject]').forEach(b=>b.addEventListener('click',()=>selectSubject(b.dataset.subject)));
  if(risk&&!compact.matches)selectSubject(C.subjects[0].id);compact.addEventListener?.('change',()=>{if(risk&&!activeSubject&&!compact.matches)selectSubject(C.subjects[0].id);positionResult()});
  // Editor's room. Only user-provided destinations; no fake player or episode.
  const stage=$('#sigChannelPanel');
  function selectChannel(id){if(!stage)return;const data=C.channels.find(c=>c.id===id);if(!data)return;$$('[data-channel]').forEach(b=>{const active=b.dataset.channel===id;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1});stage.setAttribute('aria-labelledby','channel-'+id);stage.innerHTML=`<span class="sig-label">${esc(data.label)}</span><h3>${esc(data.title)}</h3><p class="sig-quiet">${esc(data.copy)}</p><a class="sig-link" href="${esc(data.url)}" target="_blank" rel="noopener noreferrer">Abrir ${esc(data.name)}</a>`;animate(stage)}
  $$('[data-channel]').forEach((b,i,all)=>{b.addEventListener('click',()=>selectChannel(b.dataset.channel));b.addEventListener('keydown',e=>{let next=i;if(e.key==='ArrowRight')next=(i+1)%all.length;else if(e.key==='ArrowLeft')next=(i+all.length-1)%all.length;else return;e.preventDefault();selectChannel(all[next].dataset.channel);all[next].focus()})});if(stage)selectChannel('youtube');
  // Guided contact: transient selections in memory, no server writes, no automatic sends.
  const dialog=$('#sigConsult'), form=$('#sigConsultForm'), stepMarks=$$('[data-consult-step]');
  const moments=[{id:'prevencion',title:'Quiero prevenir una contingencia',sub:'La conversación parte de una revisión preventiva.'},{id:'curso',title:'El asunto ya está en curso',sub:'Quiero explicar el contexto y la etapa actual.'},{id:'fecha',title:'Tengo una notificación o una fecha',sub:'Necesito comunicar esta circunstancia al despacho.'}];
  function openConsult(subject,trigger){consultReturn=trigger||document.activeElement;if(subjectById(subject)){answers.subject=subject;scene=1}else{scene=0}renderConsult();if(!dialog.open)dialog.showModal();requestAnimationFrame(()=>$('h3',form)?.focus({preventScroll:true}));}
  function closeConsult(){if(dialog.open)dialog.close()}
  $('#sigConsultClose').addEventListener('click',closeConsult);
  dialog.addEventListener('close',()=>{document.body.style.overflow='';if(consultReturn?.isConnected)consultReturn.focus({preventScroll:true})});
  function choicesHTML(name,choices,value){return `<div class="sig-form-choices" role="radiogroup" aria-labelledby="sigQuestion">${choices.map(c=>`<label class="sig-form-choice"><input type="radio" name="${name}" value="${c.id}" ${value===c.id?'checked':''}><span>${esc(c.title)}</span></label>`).join('')}</div>`}
  function renderConsult(){stepMarks.forEach((mark,i)=>{if(i===scene)mark.setAttribute('aria-current','step');else mark.removeAttribute('aria-current')});
   if(scene===0){form.innerHTML=`<h3 tabindex="-1" id="sigQuestion">¿Qué le gustaría conversar?</h3><p>Elija el punto de partida. No necesita compartir documentos ni datos personales aquí.</p>${choicesHTML('subject',[...C.subjects.map(s=>({id:s.id,title:s.label})),{id:'otro',title:'Prefiero explicarlo directamente'}],answers.subject)}<p class="sig-form-error" role="status"></p><div class="sig-form-footer"><span></span><button type="button" class="sig-link" data-consult-next>Continuar</button></div>`}
   else if(scene===1){form.innerHTML=`<h3 tabindex="-1" id="sigQuestion">¿En qué momento se encuentra?</h3><p>Esta elección sólo añade contexto al mensaje; no reserva una cita ni activa atención inmediata.</p>${choicesHTML('moment',moments,answers.moment)}<p class="sig-form-error" role="status"></p><div class="sig-form-footer"><button type="button" class="sig-form-back" data-consult-back>Volver a situación</button><button type="button" class="sig-link" data-consult-next>Preparar resumen</button></div>`}
   else{const subject=subjectById(answers.subject)?.label||'Prefiero explicarlo directamente';const moment=moments.find(m=>m.id===answers.moment)?.title||'Por comentar';const text=`Hola, Eric. Me gustaría solicitar una primera conversación.\n\nSituación: ${subject}\nMomento: ${moment}\n\nQuedo atento(a) para conocer disponibilidad y siguientes pasos.`;const url='mailto:abogado@ericramirez.com.mx?subject='+encodeURIComponent('Solicitud de conversación · '+subject)+'&body='+encodeURIComponent(text);form.innerHTML=`<h3 tabindex="-1" id="sigQuestion">Una conversación con contexto.</h3><p>Revise su resumen y elija cómo contactar al despacho.</p><label class="sig-label" for="sigSummary">Mensaje preparado</label><textarea class="sig-summary" id="sigSummary" readonly spellcheck="false">${esc(text)}</textarea><div class="sig-summary-actions"><a class="sig-link" id="sigEmail" href="${esc(url)}">Abrir mi correo</a><button type="button" class="sig-link" id="sigCopy">Copiar resumen</button><a class="sig-link" href="tel:+523126901871">Llamar al despacho</a></div><p class="sig-copy-status" id="sigCopyStatus" role="status"></p><p>El correo se abre en su aplicación; usted decide enviarlo. No se ha enviado ni guardado esta selección en un servidor.</p><div class="sig-form-footer"><button type="button" class="sig-form-back" data-consult-back>Revisar selección</button><button type="button" class="sig-form-back" id="sigRestart">Empezar de nuevo</button></div>`;
    $('#sigCopy')?.addEventListener('click',async()=>{const textarea=$('#sigSummary');try{if(navigator.clipboard&&isSecureContext)await navigator.clipboard.writeText(textarea.value);else{textarea.focus();textarea.select();if(!document.execCommand('copy'))throw new Error('copy unavailable')}$('#sigCopyStatus').textContent='Resumen copiado.'}catch{$('#sigCopyStatus').textContent='Seleccione el texto del resumen y use «Copiar» en su navegador.';textarea.focus();textarea.select()}});$('#sigRestart')?.addEventListener('click',()=>{answers.subject=null;answers.moment=null;scene=0;renderConsult();$('#sigQuestion').focus({preventScroll:true})});
   }
   $$('input[type=radio]',form).forEach(input=>input.addEventListener('change',()=>{answers[input.name]=input.value;$('.sig-form-error',form).textContent=''}));
   $('[data-consult-next]',form)?.addEventListener('click',()=>{if((scene===0&&!answers.subject)||(scene===1&&!answers.moment)){$('.sig-form-error',form).textContent='Seleccione una opción para continuar.';return}scene++;renderConsult();$('#sigQuestion').focus({preventScroll:true});dialog.scrollTop=0});
   $('[data-consult-back]',form)?.addEventListener('click',()=>{scene=Math.max(0,scene-1);renderConsult();$('#sigQuestion').focus({preventScroll:true});dialog.scrollTop=0});
  }
  // NEXUS 15 scroll choreography: restore the editorial dissolve without hijacking scroll.
  let raf=0;const hero=$('.hero'),photo=$('.hero-photo img'),folio=$('#sigFolio'),method=$('#metodo');
  const folioSections=$$('main > section[id]').filter(s=>s.dataset.chapter);
  const softExitEls=$$('[data-soft-exit]');
  const dissolveEls=$$('.dissolve,[data-dissolve]').filter(el=>!el.hasAttribute('data-soft-exit'));
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  function dissolveOut(el,strong=false){
    if(reduced){el.style.setProperty('--n15-opacity','1');el.style.setProperty('--n15-y','0px');el.style.setProperty('--n15-blur','0px');return}
    const r=el.getBoundingClientRect(),vh=innerHeight,top=84,start=Math.max(top+140,vh*.44);
    const q=clamp((start-r.bottom)/(start-top)),p=q*q*(3-2*q);
    el.style.setProperty('--n15-opacity',String(1-p*.95));
    el.style.setProperty('--n15-y',(-p*(strong?22:16)).toFixed(2)+'px');
    el.style.setProperty('--n15-blur',(p*(innerWidth<700?1.1:2)).toFixed(2)+'px');
  }
  function updateScroll(){
    if(photo&&hero&&!reduced&&innerWidth>980){const rect=hero.getBoundingClientRect();const p=clamp(-rect.top/rect.height);root.style.setProperty('--hero-drift',(p*9).toFixed(2)+'px');root.style.setProperty('--hero-depth',(1+p*.013).toFixed(4))}
    softExitEls.forEach(el=>dissolveOut(el,true));
    dissolveEls.forEach(el=>dissolveOut(el,false));
    if(method&&!reduced&&innerWidth>980){const r=method.getBoundingClientRect();const p=clamp((innerHeight*.62-r.top)/(r.height+innerHeight*.2));root.style.setProperty('--n15-method-drift',(p*24).toFixed(2)+'px')}
    if(folio&&innerWidth>1100){let current=null;for(const section of folioSections)if(section.getBoundingClientRect().top<innerHeight*.45)current=section;const visible=Boolean(current)&&scrollY>innerHeight*.7;folio.classList.toggle('on',visible);if(current){$('.sig-folio-current',folio).textContent=current.dataset.chapter;const next=folioSections[folioSections.indexOf(current)+1];const btn=$('button',folio);btn.hidden=!next;if(next){btn.textContent='Siguiente: '+next.dataset.chapter;btn.dataset.next=next.id}}}
    raf=0;
  }
  function requestScroll(){if(!raf)raf=requestAnimationFrame(updateScroll)}
  addEventListener('scroll',requestScroll,{passive:true});addEventListener('resize',()=>{requestScroll();if(!$('#sigBrowse').hidden)requestScroll()},{passive:true});
  $('[data-folio-next]')?.addEventListener('click',e=>scrollToSection(e.currentTarget.dataset.next));
  // One entry, assets embedded, a finite black gate. No white flash or broken logo URL.
  async function intro(){const splash=$('#vipSplash');if(!splash){root.classList.remove('sig-loading');return}if(root.dataset.intro==='skip'){splash.classList.add('hidden');root.classList.remove('sig-loading');document.body.classList.remove('preloading');shell.inert=false;return}
    shell.inert=true;const start=performance.now();const wait=ms=>new Promise(r=>setTimeout(r,ms));const imgs=$$('img',splash);if(photo)imgs.push(photo);await Promise.race([Promise.allSettled([...imgs.map(i=>i.decode?.()),document.fonts.ready]),wait(950)]);await wait(Math.max(0,810-(performance.now()-start)));root.classList.remove('sig-loading');document.body.classList.remove('preloading');shell.style.visibility='visible';shell.style.opacity='1';shell.inert=false;splash.style.transition='opacity .28s ease, visibility .28s ease';splash.classList.add('hidden');window.__signatureQA.introReleasedAt=performance.now();}
  addEventListener('message',e=>{if(e.source!==parent)return;const d=e.data;if(d?.type==='ERIC_SCROLL')scrollToSection(d.at);else if(d?.type==='ERIC_MOTION_APPLY')applyMotion(d.reduced)});
  window.__signatureQA={version:'orchestration-15',route:C.route,initialized:true,services:C.services.map(s=>s.id),getSelection:()=>({...answers}),selectSubject,openConsult,closeConsult,applyMotion,updateScroll};
  applyMotion(reduced);intro().finally(()=>{send('ERIC_READY',{route:C.route});updateScroll()});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
