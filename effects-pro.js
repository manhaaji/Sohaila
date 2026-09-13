(function(){
'use strict';
const q=s=>document.querySelector(s), qa=s=>[...document.querySelectorAll(s)];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let rafId=0, petals=[], last=0, visible=true;

/* Light flower/particle layer: one canvas, capped for mobile performance. */
function initRoseWind(){
  const canvas=document.createElement('canvas');canvas.className='rose-wind-canvas';document.body.appendChild(canvas);
  const ctx=canvas.getContext('2d',{alpha:true}); if(!ctx)return;
  let dpr=Math.min(window.devicePixelRatio||1,1.5), w=0,h=0;
  function resize(){w=innerWidth;h=innerHeight;dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0)}
  addEventListener('resize',resize,{passive:true});resize();
  const n=innerWidth<700?18:30;
  for(let i=0;i<n;i++) petals.push({x:Math.random()*w,y:Math.random()*h,r:2+Math.random()*3,v:.18+Math.random()*.38,a:Math.random()*6.28,s:.5+Math.random()*1.1,rot:Math.random()*6.28});
  function draw(t){if(!visible){rafId=requestAnimationFrame(draw);return} if(t-last<32){rafId=requestAnimationFrame(draw);return}last=t;ctx.clearRect(0,0,w,h);for(const p of petals){p.y+=p.v;p.a+=.012;p.x+=Math.sin(p.a)*p.s*.25;if(p.y>h+20){p.y=-20;p.x=Math.random()*w}ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.globalAlpha=.32;ctx.fillStyle='#fff';ctx.strokeStyle='rgba(190,168,160,.45)';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(0,-p.r*1.7);ctx.bezierCurveTo(p.r*1.5,-p.r*.7,p.r*1.2,p.r*1.25,0,p.r*1.65);ctx.bezierCurveTo(-p.r*1.2,p.r*1.25,-p.r*1.5,-p.r*.7,0,-p.r*1.7);ctx.fill();ctx.stroke();ctx.restore()}rafId=requestAnimationFrame(draw)}requestAnimationFrame(draw);
  document.addEventListener('visibilitychange',()=>visible=!document.hidden);
}


function fixedRoses(){
 const layer=document.createElement('div');layer.className='fixed-rose-garden';
 const spots=[['rose-a','6%','18%','92px'],['rose-b','88%','25%','76px'],['rose-c','3%','66%','105px'],['rose-d','90%','70%','90px'],['rose-e','48%','5%','58px'],['rose-f','52%','94%','64px']];
 for(const [c,l,t,z] of spots){const img=document.createElement('img');img.className='fixed-rose '+c;img.src='assets/roses/white-rose.svg';img.alt='';img.setAttribute('aria-hidden','true');img.style.left=l;img.style.top=t;img.style.width=z;layer.appendChild(img)}
 document.body.appendChild(layer);
}

function countdown(){
 const ids=['cdDays','cdHours','cdMinutes','cdSeconds'].map(q);const status=q('#countdownStatus');if(ids.some(!Boolean))return;
 function tick(){const now=new Date(), targetYear=now<new Date('2026-09-20T00:00:00')?2026:2027;const target=new Date(`${targetYear}-09-20T00:00:00`);let diff=Math.max(0,target-now);const d=Math.floor(diff/864e5);diff-=d*864e5;const h=Math.floor(diff/36e5);diff-=h*36e5;const m=Math.floor(diff/6e4);const s=Math.floor((diff%6e4)/1e3);[d,h,m,s].forEach((v,i)=>ids[i].textContent=String(v).padStart(2,'0'));status.textContent=targetYear===2026?'العد التنازلي ليوم سُهيلة...':'السنة الجديدة بدأت — بنستنى 20 سبتمبر 2027 🤍';requestAnimationFrame(()=>setTimeout(tick,250))}tick();
}

function starMap(){const img=q('#starMapImage');if(!img)return;img.addEventListener('load',()=>q('.star-map-frame')?.classList.add('has-image'));img.addEventListener('error',()=>{});}

function premiumScroll(){
 if(window.Lenis){const lenis=new Lenis({duration:.9,lerp:.09,smoothWheel:true,wheelMultiplier:.98,touchMultiplier:1.05});function loop(t){lenis.raf(t);requestAnimationFrame(loop)}requestAnimationFrame(loop);}
 if(window.gsap&&window.ScrollTrigger){gsap.registerPlugin(ScrollTrigger);qa('.timeline-item,.countdown-shell,.premium-birthday-date,.star-map-frame').forEach(el=>gsap.from(el,{y:35,opacity:0,duration:.8,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}}));}
}

function installLetterAudio(){
 const main=q('#birthdayMusic'), letter=q('#letterMusic'), btn=q('#envelopeButton');if(!main||!letter||!btn)return;
 let mainVolume=.72, switching=false;
 const fade=(audio,target,ms,done)=>{const from=audio.volume,t0=performance.now();function step(t){const p=Math.min(1,(t-t0)/ms);audio.volume=from+(target-from)*(1-Math.pow(1-p,3));if(p<1)requestAnimationFrame(step);else done&&done()}requestAnimationFrame(step)};
 async function enter(){if(switching)return;switching=true;const ct=main.currentTime;fade(main,0,1400,()=>{main.pause();});await sleep(650);letter.currentTime=0;letter.volume=0;try{await letter.play()}catch(e){}fade(letter,.72,1200);switching=false}
 function leave(){if(switching)return;switching=true;fade(letter,0,1100,()=>{letter.pause();letter.currentTime=0});setTimeout(()=>{try{main.currentTime=ctSafe(ct)}catch(e){}main.volume=0;main.play().catch(()=>{});fade(main,mainVolume,1200);switching=false},650)}
 function ctSafe(v){return Number.isFinite(v)?v:0}
 window.__letterAudio={enter,leave};
}

function chooseMainSong(){
 const audio=q('#birthdayMusic');if(!audio)return;const tracks=['music/song.mp3','music/song2.mp3','music/song3.mp3','music/song4.mp3'];let index=Number(localStorage.getItem('suhailaSongIndex')||'-1');index=(index+1)%tracks.length;localStorage.setItem('suhailaSongIndex',index);localStorage.setItem('suhailaLastVisit',Date.now());audio.src=tracks[index];audio.dataset.trackIndex=index;
}

function revealFix(){qa('.reveal').forEach(el=>{const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible','in-view');io.unobserve(e.target)}}),{threshold:.08,rootMargin:'0px 0px -30px'});io.observe(el)})}

function boot(){chooseMainSong();initRoseWind();fixedRoses();countdown();starMap();premiumScroll();revealFix();installLetterAudio();
 const env=q('#envelopeButton'), close=q('#closeLetter'), modal=q('#letterModal'), overlay=q('.letter-overlay');
 if(env){env.addEventListener('click',()=>window.__letterAudio?.enter(),{capture:true})}
 if(close)close.addEventListener('click',()=>window.__letterAudio?.leave(),{capture:true});
 if(overlay)overlay.addEventListener('click',()=>window.__letterAudio?.leave(),{capture:true});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal?.classList.contains('open'))window.__letterAudio?.leave()});
 const img=q('#starMapImage');if(img&&img.complete&&img.naturalWidth)q('.star-map-frame')?.classList.add('has-image');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
