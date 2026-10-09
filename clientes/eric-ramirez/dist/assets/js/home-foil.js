(()=>{const m=document.querySelector('.b19-mark');if(!m)return;const q=m.closest('section');const red=()=>document.documentElement.classList.contains('sig-reduced')||matchMedia('(prefers-reduced-motion:reduce)').matches;function u(){if(red()){m.style.setProperty('--b19-o','1');m.style.setProperty('--b19-c','0%');m.style.setProperty('--b19-y','0px');m.style.setProperty('--b19-s','1');return}const r=q.getBoundingClientRect(),vh=innerHeight;const p=Math.max(0,Math.min(1,(vh*.95-r.top)/(vh*.6)));const e=p*p*(3-2*p);m.style.setProperty('--b19-o',String(e));m.style.setProperty('--b19-c',((1-e)*100).toFixed(1)+'%');m.style.setProperty('--b19-y',((1-e)*14).toFixed(1)+'px');m.style.setProperty('--b19-s',(.92+e*.08).toFixed(3))}addEventListener('scroll',()=>requestAnimationFrame(u),{passive:true});addEventListener('resize',u);u()})()
;(()=>{const e=document.querySelector('.b30-emb');if(!e)return;const red=matchMedia('(prefers-reduced-motion:reduce)').matches;let flashed=false;const c=(v)=>Math.max(0,Math.min(1,v));
function u(){if(red){e.style.setProperty('--rv','1');e.style.setProperty('--done','1');return}const r=e.getBoundingClientRect(),vh=innerHeight,mid=r.top+r.height/2;const rv=c((vh*.95-mid)/(vh*.42));const s=rv*rv*(3-2*rv);e.style.setProperty('--rv',s.toFixed(4));e.closest('section').style.setProperty('--rv',s.toFixed(4));e.style.setProperty('--done',s>=.999?'1':'0');const p=c((vh-r.top)/(vh+r.height));e.style.setProperty('--sw2',(140-p*190).toFixed(1)+'%');if(s>=.999&&!flashed){flashed=true;e.classList.add('flash');setTimeout(()=>e.classList.remove('flash'),1200)}if(s<.2)flashed=false}
addEventListener('scroll',()=>requestAnimationFrame(u),{passive:true});addEventListener('resize',u);u()})()
;(()=>{
const sec=document.querySelector('.b23-seal');const emb=sec&&sec.querySelector('.b30-emb');if(!sec||!emb)return;
const METAL=sec.getAttribute('data-metal')||'oro';
const D='M20.72 3.16C18.78 3.38 18.72 3.61 20.46 4.18C22.48 4.84 23.97 5.67 24.78 6.57C25.70 7.59 26.08 8.33 26.55 9.97L26.92 11.25 L26.97 60.33C27.02 109.34 27.00 111.77 26.47 115.30C26.13 117.52 25.48 118.02 22.42 118.40C20.30 118.65 16.37 119.48 14.83 119.99C14.33 120.16 13.56 120.42 13.13 120.57C12.69 120.71 12.01 120.94 11.63 121.07C9.57 121.75 8.30 122.30 7.88 122.68C7.63 122.92 7.20 123.24 6.93 123.41C6.53 123.66 6.49 123.73 6.71 123.86C6.89 123.95 7.25 123.90 7.78 123.69C8.22 123.51 9.03 123.28 9.58 123.17C10.13 123.05 11.04 122.79 11.60 122.58C12.16 122.37 13.14 122.12 13.77 122.02C14.40 121.92 15.46 121.66 16.12 121.43C16.90 121.17 19.16 120.76 22.54 120.27C27.14 119.60 28.18 119.51 31.42 119.44C35.13 119.37 40.48 119.56 42.17 119.82C43.48 120.02 46.78 120.43 50.33 120.84C52.03 121.03 53.87 121.29 54.42 121.42C54.98 121.54 56.55 121.84 57.92 122.08C59.30 122.32 60.79 122.62 61.25 122.75C61.71 122.88 62.80 123.11 63.67 123.25C64.54 123.40 65.89 123.70 66.67 123.92C67.45 124.15 68.87 124.48 69.83 124.67C74.53 125.60 78.56 126.59 79.33 127.00C79.51 127.10 79.74 127.32 79.83 127.50C79.95 127.72 80.01 135.63 80.02 152.04L80.04 176.25 L79.67 178.33C79.12 181.40 78.24 183.43 76.91 184.73C76.21 185.40 73.68 186.76 72.36 187.17L71.46 187.45 L72.69 187.62C74.51 187.88 100.76 187.81 101.02 187.54C101.18 187.39 101.17 187.33 100.99 187.26C100.86 187.22 100.15 186.99 99.42 186.75C96.84 185.90 95.48 184.92 94.45 183.16C93.88 182.18 93.03 178.74 92.83 176.61C92.59 174.05 92.73 130.51 92.98 130.04C93.39 129.27 93.85 129.24 96.00 129.84C97.24 130.19 99.43 130.59 101.00 130.76C104.00 131.08 108.52 132.98 111.23 135.06C112.82 136.29 119.12 142.70 120.74 144.75C121.11 145.21 121.78 146.00 122.25 146.50C122.71 147.00 123.69 148.23 124.42 149.23C125.15 150.22 126.23 151.68 126.81 152.48C127.80 153.82 128.61 154.97 131.33 158.90C131.93 159.77 132.84 161.02 133.35 161.69C133.86 162.37 135.02 163.95 135.93 165.22C136.84 166.48 137.84 167.87 138.16 168.30C138.74 169.10 142.24 174.09 144.29 177.05C146.53 180.31 147.60 181.74 150.17 184.94C152.03 187.25 153.39 189.04 154.67 190.82C155.17 191.53 156.63 193.41 157.91 195.01C159.18 196.61 160.50 198.25 160.82 198.67C162.44 200.71 165.29 203.76 170.19 208.69C175.08 213.61 176.66 215.08 180.52 218.27C183.43 220.67 187.72 223.63 190.70 225.28C191.64 225.80 193.14 226.66 194.03 227.18C195.95 228.29 200.57 230.61 202.33 231.34C212.28 235.44 219.44 237.19 228.92 237.82C233.20 238.11 241.58 238.23 243.50 238.03C244.46 237.93 246.38 237.73 247.75 237.58C250.50 237.30 253.30 236.69 254.33 236.17C254.69 235.98 255.25 235.83 255.57 235.83C256.26 235.83 257.00 235.58 257.00 235.34C257.00 235.12 256.24 235.12 255.50 235.34C254.97 235.51 253.41 235.63 245.08 236.18C241.97 236.39 240.28 236.33 235.66 235.84C230.45 235.29 226.71 234.40 221.25 232.38C215.53 230.27 214.30 229.72 211.08 227.85C209.98 227.21 208.67 226.45 208.17 226.17C201.40 222.42 195.37 217.51 185.74 207.92C181.79 203.98 177.93 199.80 176.46 197.87C175.35 196.41 167.58 186.64 163.87 182.05C163.27 181.29 162.14 179.79 161.38 178.71C160.61 177.63 159.80 176.49 159.57 176.17C159.34 175.85 158.86 175.17 158.50 174.67C158.14 174.16 157.32 173.04 156.68 172.17C156.04 171.30 155.14 170.06 154.67 169.42C153.45 167.72 151.50 165.11 150.36 163.64C149.81 162.93 149.27 162.18 149.15 161.97C149.04 161.76 148.74 161.32 148.48 161.00C147.70 160.03 144.94 156.31 144.33 155.42C142.79 153.13 138.93 148.16 137.36 146.43C135.45 144.31 131.54 140.42 130.13 139.23C127.08 136.66 124.03 135.05 118.25 132.98C117.45 132.69 117.28 132.17 117.86 131.77C118.06 131.63 118.19 131.47 118.14 131.42C117.91 131.19 115.92 130.98 113.49 130.94C110.86 130.89 110.80 130.88 110.38 130.46C110.01 130.09 109.95 129.89 109.97 129.04C109.97 128.50 110.17 127.12 110.39 125.99C110.62 124.85 110.89 123.35 110.99 122.67C111.09 121.98 111.44 120.25 111.75 118.83C112.63 114.89 112.92 112.50 112.52 112.50C112.29 112.50 111.50 113.61 111.30 114.21C111.01 115.07 109.67 117.17 108.78 118.16C107.58 119.49 104.97 121.53 103.21 122.51C100.68 123.92 97.95 124.84 94.87 125.34C93.52 125.56 93.48 125.55 93.12 125.19L92.75 124.82 L92.71 103.01C92.67 82.34 92.80 70.61 93.08 69.96C93.49 69.00 94.47 70.37 94.92 72.54C95.51 75.39 95.87 76.05 96.21 74.91C96.36 74.38 96.27 71.26 95.98 66.87C95.88 65.38 95.85 63.81 95.91 63.37C96.08 62.26 96.86 61.55 98.59 60.96C100.29 60.37 101.77 60.19 105.08 60.19C108.22 60.18 110.67 60.02 110.67 59.81C110.67 59.73 109.49 59.66 108.04 59.65C106.60 59.64 103.45 59.62 101.05 59.61L96.67 59.58 L96.23 59.14C95.80 58.70 95.79 58.66 95.82 56.62C95.85 54.37 95.66 53.43 95.25 53.85C95.13 53.98 94.72 54.98 94.34 56.08C93.32 59.04 92.81 59.69 91.32 59.90C90.90 59.96 86.85 60.01 82.32 60.01C74.57 60.02 71.50 60.16 71.50 60.52C71.50 60.58 71.76 60.73 72.08 60.83C73.23 61.21 72.95 62.41 71.69 62.55C71.23 62.59 71.31 62.62 72.00 62.64C73.38 62.69 76.16 63.37 77.03 63.88C77.87 64.37 78.86 65.70 79.26 66.88C79.39 67.27 79.58 68.22 79.68 69.00C79.93 71.08 80.15 92.43 80.08 109.25L80.03 123.91 L79.59 124.29C79.32 124.52 78.93 124.67 78.59 124.67C77.74 124.67 75.39 124.20 74.00 123.75C73.31 123.53 72.04 123.23 71.17 123.10C70.30 122.96 69.13 122.69 68.58 122.50C68.03 122.31 66.87 122.04 66.00 121.90C65.13 121.77 63.89 121.51 63.25 121.33C62.61 121.16 61.60 120.97 61.00 120.91C60.40 120.85 58.81 120.58 57.46 120.32C56.11 120.05 54.19 119.72 53.21 119.59C52.22 119.45 50.78 119.22 50.00 119.08C49.22 118.94 47.02 118.68 45.10 118.50C41.32 118.14 40.79 117.98 40.34 117.07C40.02 116.44 39.86 101.77 39.93 79.97C39.99 63.59 39.97 63.95 40.79 63.53C40.95 63.45 44.05 63.33 47.67 63.27C64.39 63.01 67.10 62.94 67.42 62.83C68.39 62.46 66.21 62.37 54.17 62.26C46.39 62.19 41.20 62.08 40.87 61.98C40.58 61.88 40.24 61.64 40.14 61.45C39.84 60.90 39.71 6.27 40.00 5.23C40.41 3.78 38.48 3.91 60.35 3.86C80.35 3.81 82.03 3.85 87.92 4.51C94.43 5.23 97.23 5.88 100.83 7.50C103.93 8.88 105.67 10.23 107.72 12.79C108.80 14.16 109.38 15.18 110.00 16.83C110.40 17.92 110.91 19.19 111.52 20.66C112.00 21.81 112.18 19.05 111.76 17.04C111.45 15.57 110.15 6.96 109.92 4.80C109.86 4.25 109.68 3.68 109.50 3.46L109.20 3.08 L97.81 3.12C74.79 3.20 26.35 3.19 24.17 3.11C22.93 3.07 21.38 3.09 20.72 3.16ZM126.42 59.61C124.93 59.68 124.23 59.90 125.02 60.06C125.68 60.20 128.79 60.98 131.04 61.57C132.55 61.98 133.79 62.45 135.37 63.23C143.23 67.12 147.40 71.83 150.36 80.17C151.05 82.12 152.04 86.54 152.38 89.17C152.77 92.29 152.86 98.03 152.53 99.75C152.43 100.30 152.23 101.73 152.09 102.94C151.95 104.14 151.76 105.34 151.66 105.60C151.56 105.86 151.22 107.01 150.89 108.15C150.57 109.29 150.10 110.64 149.84 111.15C149.59 111.66 149.32 112.27 149.25 112.50C149.13 112.86 148.76 113.54 146.99 116.58C146.01 118.27 143.83 121.12 142.68 122.21C139.19 125.54 135.63 127.37 128.33 129.58C127.00 129.98 125.66 130.39 125.35 130.48C125.04 130.58 124.18 130.74 123.43 130.84C122.69 130.94 122.02 131.08 121.95 131.16C121.70 131.40 123.52 131.52 124.73 131.35C125.38 131.25 126.82 131.06 127.92 130.91C129.02 130.77 130.48 130.58 131.17 130.48C132.60 130.28 138.16 128.96 139.12 128.59C139.46 128.46 140.09 128.27 140.50 128.16C141.34 127.95 142.28 127.55 146.50 125.61C151.01 123.54 152.66 122.47 155.89 119.55C159.17 116.56 161.62 113.31 163.65 109.22C165.18 106.15 165.91 103.95 166.42 100.91C166.78 98.73 166.83 97.92 166.83 94.42C166.82 90.52 166.81 90.35 166.26 87.75C164.73 80.50 161.45 74.56 156.68 70.38C154.61 68.56 153.17 67.57 149.24 65.22C148.78 64.95 147.69 64.40 146.82 64.01C145.96 63.62 144.69 63.04 144.00 62.72C139.85 60.79 131.85 59.37 126.42 59.61Z',VW=276.0,VH=241.0;
const cv=document.createElement('canvas');cv.className='b31-gl';cv.setAttribute('aria-hidden','true');
let gl=null;try{gl=cv.getContext('webgl',{premultipliedAlpha:true,alpha:true,antialias:false,powerPreference:'high-performance'})}catch(e){}
if(!gl)return;
const red=matchMedia('(prefers-reduced-motion:reduce)').matches;
const P=METAL==='plata'?{f0:[0.93,0.94,0.97],tint:[0.82,0.88,1.0],chrome:1.0,exp:1.2}:{f0:[1.0,0.78,0.36],tint:[1.0,0.82,0.55],chrome:0.0,exp:1.25};
const VS='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const FS=`precision highp float;
uniform sampler2D uA;uniform sampler2D uB;uniform vec2 uRes;uniform vec4 uG;uniform vec4 uAm;uniform vec4 uBm;
uniform float uT,uRv,uDone,uFlash,uSw,uDpr,uOn,uChrome,uExp;uniform vec2 uL;uniform vec3 uF0,uTint;
float h1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
vec2 h2(vec2 p){return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);}
float nz(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h1(i),h1(i+vec2(1.,0.)),f.x),mix(h1(i+vec2(0.,1.)),h1(i+vec2(1.,1.)),f.x),f.y);}
vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
float env(vec3 r,float sw){
 float a=-0.55+uL.x*0.45;
 vec2 d=vec2(cos(a)*r.x-sin(a)*r.y,sin(a)*r.x+cos(a)*r.y);
 float e=0.045;
 e+=1.35*smoothstep(-0.02,-0.5,r.y+uL.y*.12);
 e+=0.16*smoothstep(0.9,-0.9,r.y);
 e+=3.0*smoothstep(0.09,0.0,abs(d.x-0.16+sw))*smoothstep(1.3,.0,abs(d.y));
 e+=0.85*smoothstep(0.2,0.0,abs(d.x+0.36+sw*0.6))*smoothstep(1.3,.0,abs(d.y));
 e+=0.5*smoothstep(0.5,0.95,r.y);
 e*=mix(1.,0.7+0.6*smoothstep(-.4,.4,d.x+sw*.3),uChrome);
 return e;}
vec2 inb(vec2 u){return step(vec2(0.),u)*step(u,vec2(1.));}
void main(){
 vec2 fr=vec2(gl_FragCoord.x,uRes.y-gl_FragCoord.y);
 vec2 g=(fr-uG.xy)/uG.zw;
 vec2 ua=(g-uAm.xy)/uAm.zw,ub=(g-uBm.xy)/uBm.zw;
 vec2 ia=inb(ua),ib=inb(ub);
 vec4 A=mix(vec4(.5,.5,0.,0.),texture2D(uA,ua),ia.x*ia.y);
 vec4 B=texture2D(uB,ub)*ib.x*ib.y;
 float cov=A.a;float t=uT;
 vec2 gc=uG.xy+uG.zw*.5;float W=uG.z;
 vec2 q=(fr-gc)/W;
 float topY=-gc.y/W;float yy=q.y-topY;
 float pool=exp(-dot(q*vec2(.95,1.25),q*vec2(.95,1.25))*2.4);
 float beam=smoothstep(0.6,0.0,abs(q.x)/(0.28+yy*0.42))*smoothstep(2.2,0.2,yy);
 beam*=0.7+0.3*nz(vec2(q.x*5.+t*.05,t*.12));
 vec2 so=vec2(-uL.x*.03,.045);vec2 ubs=(g-so-uBm.xy)/uBm.zw;vec2 is=inb(ubs);
 float sh=texture2D(uB,ubs).g*is.x*is.y;
 vec3 bg=uTint*(pool*0.0075*(1.-sh*0.9)+beam*0.0042)*uOn;
 float m=0.;
 for(int i=0;i<3;i++){float fi=float(i);float cs=(22.+fi*20.)*uDpr;
  vec2 sp=fr+vec2(sin(t*.07+fi*2.)*26.*uDpr,t*(5.+fi*3.5)*uDpr);
  vec2 c=sp/cs;vec2 id=floor(c);vec2 f=fract(c);float hh=h1(id+fi*17.3);
  if(hh>0.7){vec2 o=.22+.56*h2(id+fi*7.1);o+=.1*vec2(sin(t*.5+hh*30.),cos(t*.4+hh*20.));
   float r=.03+fi*.035;float dd=length(f-o);float tw=.5+.5*sin(t*(.7+hh*1.6)+hh*50.);
   m+=smoothstep(r,r*.15,dd)*tw*(1.-fi*.28);}}
 bg+=uTint*m*(beam*0.09+pool*0.035)*uOn;
 bg+=uF0*B.r*0.010*uRv;
 float fade=smoothstep(0.,70.*uDpr,fr.y)*smoothstep(0.,110.*uDpr,uRes.y-fr.y);
 bg*=fade;
 vec3 bgd=pow(max(bg,0.),vec3(1./2.2));
 vec3 cd=vec3(0.);
 if(cov>.002){
  vec3 n=vec3((A.rg-.5)*2.,0.);
  float br=nz(vec2(g.x*4.,g.y*700.))-.5;
  float wv=nz(g*6.+vec2(0.,t*.02))-.5;
  n.y+=br*.012+wv*.035;n.x+=wv*.025;
  n.z=sqrt(max(.04,1.-dot(n.xy,n.xy)));n=normalize(n);
  vec3 V=normalize(vec3((gc-fr)/(W*1.15),1.));
  vec3 R=reflect(-V,n);
  float e=env(R,uSw);
  vec3 L=normalize(vec3(uL.x*.9,-.65+uL.y*.5,.7));
  vec3 H=normalize(L+V);float nh=max(dot(n,H),0.);
  float sp=pow(nh,300.)*4.0+pow(nh,40.)*.4;
  sp*=.88+.24*nz(vec2(g.x*3.,g.y*340.));
  float fres=pow(1.-max(dot(n,V),0.),5.);
  vec3 F=uF0+(1.-uF0)*fres;
  float ao=mix(.62,1.,smoothstep(0.,.55,A.b));
  vec3 deep=uF0*uF0*mix(uF0,vec3(1.),uChrome);
  vec3 metal=e*ao*mix(deep,F,clamp(e*.7,0.,1.));
  metal+=sp*mix(uF0,vec3(1.),.55);
  vec2 gq=fr/(10.*uDpr);vec2 gid=floor(gq);vec2 gf=fract(gq)-.5;float gh=h1(gid+3.7);
  if(gh>.9){vec2 go=(h2(gid)-.5)*.45;vec2 dv=gf-go;float tw=pow(max(0.,sin(t*(1.1+gh*2.2)+gh*70.)),14.);
   float st=exp(-length(dv)*24.)+(exp(-abs(dv.x)*55.)*exp(-abs(dv.y)*7.)+exp(-abs(dv.y)*55.)*exp(-abs(dv.x)*7.))*.7;
   metal+=st*tw*2.2*smoothstep(.8,2.2,e+sp)*vec3(1.,.97,.92);}
  float fp=mix(-.6,1.7,uFlash);float fb=exp(-pow((g.x*.72+g.y*.55-fp)/.05,2.))*sin(uFlash*3.14159);
  metal+=fb*1.6*mix(uF0,vec3(1.),.35);
  vec3 blind=vec3(.010)+vec3(e*.022+sp*.22)*ao;
  float lv=1.06-uRv*1.16+(nz(vec2(g.x*7.,t*.7))-.5)*.04*(1.-uDone);
  float fm=smoothstep(lv-.006,lv+.006,g.y);
  float edge=exp(-pow((g.y-lv)/.016,2.))*(1.-uDone)*step(.01,uRv)*step(uRv,.995);
  vec3 col=mix(blind,metal,fm)+edge*mix(uF0,vec3(1.),.45)*4.;
  cd=pow(aces(col*uExp),vec3(1./2.2));
 }
 vec3 o=mix(bgd,cd,cov);
 float al=clamp(max(cov,max(max(o.r,o.g),o.b)),0.,1.);
 gl_FragColor=vec4(min(o,vec3(al)),al);
}`;
function S(tp,src){const s=gl.createShader(tp);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){console.warn('b31',gl.getShaderInfoLog(s));return null}return s}
const vs=S(gl.VERTEX_SHADER,VS),fs=S(gl.FRAGMENT_SHADER,FS);if(!vs||!fs)return;
const pr=gl.createProgram();gl.attachShader(pr,vs);gl.attachShader(pr,fs);gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))return;
gl.useProgram(pr);
const bf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,bf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
const ap=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(ap);gl.vertexAttribPointer(ap,2,gl.FLOAT,false,0,0);
const U={};['uA','uB','uRes','uG','uAm','uBm','uT','uRv','uDone','uFlash','uSw','uDpr','uOn','uChrome','uExp','uL','uF0','uTint'].forEach(k=>U[k]=gl.getUniformLocation(pr,k));
/* ---------- geometría: vector -> cobertura, bisel y normales ---------- */
function edt1(f,n,d,v,z){let k=0;v[0]=0;z[0]=-1e20;z[1]=1e20;for(let q=1;q<n;q++){let s=((f[q]+q*q)-(f[v[k]]+v[k]*v[k]))/(2*q-2*v[k]);while(s<=z[k]){k--;s=((f[q]+q*q)-(f[v[k]]+v[k]*v[k]))/(2*q-2*v[k])}k++;v[k]=q;z[k]=s;z[k+1]=1e20}k=0;for(let q=0;q<n;q++){while(z[k+1]<q)k++;d[q]=(q-v[k])*(q-v[k])+f[v[k]]}}
function edt(gr,w,h){const n=Math.max(w,h),f=new Float64Array(n),d=new Float64Array(n),v=new Int32Array(n),z=new Float64Array(n+1);for(let x=0;x<w;x++){for(let y=0;y<h;y++)f[y]=gr[y*w+x];edt1(f,h,d,v,z);for(let y=0;y<h;y++)gr[y*w+x]=d[y]}for(let y=0;y<h;y++){const o=y*w;for(let x=0;x<w;x++)f[x]=gr[o+x];edt1(f,w,d,v,z);for(let x=0;x<w;x++)gr[o+x]=Math.sqrt(d[x])}}
function blur(a,w,h,r,it){const t=new Float32Array(a.length);for(let k=0;k<it;k++){for(let y=0;y<h;y++){let s=0;const o=y*w;for(let x=-r;x<=r;x++)s+=a[o+Math.min(w-1,Math.max(0,x))];for(let x=0;x<w;x++){t[o+x]=s/(2*r+1);s+=a[o+Math.min(w-1,x+r+1)]-a[o+Math.max(0,x-r)]}}for(let x=0;x<w;x++){let s=0;for(let y=-r;y<=r;y++)s+=t[Math.min(h-1,Math.max(0,y))*w+x];for(let y=0;y<h;y++){a[y*w+x]=s/(2*r+1);s+=t[Math.min(h-1,y+r+1)*w+x]-t[Math.max(0,y-r)*w+x]}}}}
function raster(scale,pad){const w=Math.ceil(VW*scale+pad*2),h=Math.ceil(VH*scale+pad*2);const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.translate(pad,pad);x.scale(scale,scale);x.fillStyle='#fff';x.fill(new Path2D(D),'evenodd');const id=x.getImageData(0,0,w,h).data;const a=new Float32Array(w*h);for(let i=0;i<w*h;i++)a[i]=id[i*4+3]/255;return{a,w,h}}
function mkTex(unit,data,w,h){const t=gl.createTexture();gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,data);[gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T].forEach(p=>gl.texParameteri(gl.TEXTURE_2D,p,gl.CLAMP_TO_EDGE));gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);return t}
let ready=false;
function build(){
 const G=Math.min(760,Math.max(520,Math.round(emb.getBoundingClientRect().width*0.82*Math.min(devicePixelRatio||1,2))));
 const sc=G/VW,pad=20;const A=raster(sc,pad),w=A.w,h=A.h,n=w*h;
 const gr=new Float64Array(n);for(let i=0;i<n;i++)gr[i]=A.a[i]>=.5?1e20:0;edt(gr,w,h);
 const B=11*G/640;const hgt=new Float32Array(n);
 for(let i=0;i<n;i++){const d=Math.max(0,gr[i]-0.5+A.a[i]);hgt[i]=A.a[i]<.02?0:Math.sin(Math.min(d/B,1)*Math.PI/2)}
 blur(hgt,w,h,1,2);
 const out=new Uint8Array(n*4),K=B*0.95;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;const dx=(hgt[y*w+Math.min(w-1,x+1)]-hgt[y*w+Math.max(0,x-1)])*.5,dy=(hgt[Math.min(h-1,y+1)*w+x]-hgt[Math.max(0,y-1)*w+x])*.5;let nx=-dx*K,ny=-dy*K;const l=Math.sqrt(nx*nx+ny*ny+1);nx/=l;ny/=l;out[i*4]=Math.round((nx*.5+.5)*255);out[i*4+1]=Math.round((ny*.5+.5)*255);out[i*4+2]=Math.round(hgt[i]*255);out[i*4+3]=Math.round(A.a[i]*255)}
 mkTex(0,out,w,h);
 const aW=VW*sc,aH=VH*sc;U.am=[-pad/aW,-pad/aH,w/aW,h/aH];
 const qs=sc/4,pb=Math.round(VW*qs*.55);const Bq=raster(qs,pb),bw=Bq.w,bh=Bq.h;
 const g1=Float32Array.from(Bq.a),g2=Float32Array.from(Bq.a);blur(g1,bw,bh,Math.max(2,Math.round(bw*.035)),3);blur(g2,bw,bh,Math.max(1,Math.round(bw*.008)),3);
 let m1=0,m2=0;for(let i=0;i<g1.length;i++){m1=Math.max(m1,g1[i]);m2=Math.max(m2,g2[i])}
 const ob=new Uint8Array(bw*bh*4);for(let i=0;i<bw*bh;i++){ob[i*4]=Math.round(g1[i]/m1*255);ob[i*4+1]=Math.round(g2[i]/m2*255);ob[i*4+3]=255}
 mkTex(1,ob,bw,bh);
 const bW=VW*qs,bH=VH*qs;U.bm=[-pb/bW,-pb/bH,bw/bW,bh/bH];
 gl.uniform1i(U.uA,0);gl.uniform1i(U.uB,1);gl.uniform4fv(U.uAm,U.am);gl.uniform4fv(U.uBm,U.bm);
 gl.uniform3fv(U.uF0,P.f0);gl.uniform3fv(U.uTint,P.tint);gl.uniform1f(U.uChrome,P.chrome);gl.uniform1f(U.uExp,P.exp);
 gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
 sec.insertBefore(cv,sec.firstChild);sec.classList.add('b31-on');ready=true;
}
/* ---------- estado ---------- */
let dpr=Math.min(devicePixelRatio||1,2),rv=0,on=0,L=[0,0],Lt=[0,0],flashT=-1,flashed=false,vis=false,raf=0,t0=performance.now(),last=t0,slow=0;
const cl=v=>Math.max(0,Math.min(1,v)),ss=v=>v*v*(3-2*v);
addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;Lt=[Math.max(-1,Math.min(1,(e.clientX/innerWidth-.5)*2)),Math.max(-1,Math.min(1,(e.clientY/innerHeight-.5)*2))]},{passive:true});
addEventListener('deviceorientation',e=>{if(e.gamma==null)return;Lt=[Math.max(-1,Math.min(1,e.gamma/35)),Math.max(-1,Math.min(1,((e.beta||45)-45)/35))]},{passive:true});
function size(){const r=sec.getBoundingClientRect();const w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h}gl.viewport(0,0,w,h);return r}
function frame(now){
 raf=0;if(!ready)return;const H=window.__b31hold;const dt=H?1:Math.min(.05,(now-last)/1000);last=now;const t=H?(window.__b31t||0):(now-t0)/1000;
 if(dt>.032)slow++;else slow=Math.max(0,slow-1);if(slow>40&&dpr>1.1){dpr=Math.max(1,dpr-.35);slow=0}
 const sr=size(),er=emb.getBoundingClientRect(),vh=innerHeight;
 const mid=er.top+er.height/2;const tgt=red?1:ss(cl((vh*.95-mid)/(vh*.45)));
 if(H){rv=tgt;on=cl(tgt*3)}else{rv+=(tgt-rv)*Math.min(1,dt*7);on+=(cl(tgt*3)-on)*Math.min(1,dt*3)}
 if(rv>.995&&!flashed){flashed=true;flashT=t}if(rv<.15){flashed=false;flashT=-1}
 const fl=H?(window.__b31fl||0):(flashT<0?0:cl((t-flashT)/1.5));
 if(H){L=window.__b31L||[0,0]}else{L[0]+=(Lt[0]-L[0])*Math.min(1,dt*3);L[1]+=(Lt[1]-L[1])*Math.min(1,dt*3)}
 const ox=red?0:Math.sin(t*.33)*.35,oy=red?0:Math.cos(t*.27)*.2;
 const p=cl((vh-sr.top)/(vh+sr.height));const sw=(.5-p)*1.25+(red?0:Math.sin(t*.45)*.07);
 const gw=er.width*.92,gh=gw*VH/VW;const gx=(er.left-sr.left)+(er.width-gw)/2,gy=(er.top-sr.top)+(er.height-gh)/2;
 gl.uniform2f(U.uRes,cv.width,cv.height);gl.uniform4f(U.uG,gx*dpr,gy*dpr,gw*dpr,gh*dpr);
 gl.uniform1f(U.uT,t);gl.uniform1f(U.uRv,rv);gl.uniform1f(U.uDone,ss(cl((rv-.97)/.03)));gl.uniform1f(U.uFlash,fl);gl.uniform1f(U.uSw,sw);gl.uniform1f(U.uDpr,dpr);gl.uniform1f(U.uOn,on);gl.uniform2f(U.uL,cl((L[0]+ox+1)/2)*2-1,cl((L[1]+oy+1)/2)*2-1);
 gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,3);
 sec.style.setProperty('--b31',rv.toFixed(3));
 if(vis&&!H&&!(red&&rv>.999))raf=requestAnimationFrame(frame);
}
function go(){if(!raf)raf=requestAnimationFrame(frame)}
const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){if(!ready){try{build()}catch(e){console.warn('b31',e);return}}vis=true;last=performance.now();go()}else vis=false}),{rootMargin:'600px 0px'});
io.observe(sec);
addEventListener('scroll',()=>{if(vis)go()},{passive:true});
cv.addEventListener('webglcontextlost',e=>{e.preventDefault();ready=false;sec.classList.remove('b31-on');cv.remove()});
window.__b31=()=>({ready,rv,dpr});window.__b31draw=()=>frame(performance.now());
})();
