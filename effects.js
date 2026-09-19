/* White Rose FX — single-canvas falling flowers + subtle ambient motion */
(() => {
  'use strict';
  const mobile=matchMedia('(max-width: 800px)').matches; const cfg={count:mobile?18:30,maxFlowers:mobile?4:7,spawnEvery:mobile?980:760,maxDpr:mobile?1:1.25};
  const state={items:[],last:0,lastSpawn:0,raf:0,visible:true,started:false};
  const flowerSrc='assets/roses/white-rose.svg', petalSrc='assets/roses/petal.svg';
  let canvas,ctx,W=0,H=0,dpr=1,flowerImg,petalImg;
  const rand=(a,b)=>a+Math.random()*(b-a);
  function resize(){if(!canvas)return; dpr=Math.min(devicePixelRatio||1,cfg.maxDpr); W=innerWidth;H=innerHeight;canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(dpr,0,0,dpr,0,0)}
  function make(kind,initial=false){return {kind,x:rand(-30,W+30),y:initial?rand(-H,H):rand(-70,-20),size:kind==='flower'?rand(17,30):rand(9,17),vx:rand(-.18,.18),vy:rand(.42,.9),wind:rand(.7,1.7),phase:rand(0,Math.PI*2),spin:rand(-.012,.012),rot:rand(0,Math.PI*2),alpha:rand(.55,.88)}}
  function seed(){state.items=[];for(let i=0;i<cfg.count;i++)state.items.push(make(i<cfg.maxFlowers?'flower':'petal',true))}
  function draw(o,t){if(o.x<-80||o.x>W+80||o.y>H+80)return;ctx.save();ctx.globalAlpha=o.alpha;ctx.translate(o.x,o.y);ctx.rotate(o.rot);const img=o.kind==='flower'?flowerImg:petalImg;if(img&&img.complete)ctx.drawImage(img,-o.size/2,-o.size/2,o.size,o.size*(o.kind==='flower'?1:.95));ctx.restore()}
  function frame(t){if(!state.visible){state.raf=requestAnimationFrame(frame);return}const dt=Math.min(32,state.last?t-state.last:16);state.last=t;ctx.clearRect(0,0,W,H);if(t-state.lastSpawn>cfg.spawnEvery&&state.items.length<cfg.count+8){state.items.push(make(Math.random()<.18?'flower':'petal'));state.lastSpawn=t}for(let i=state.items.length-1;i>=0;i--){const o=state.items[i];o.phase+=.012*dt;o.x+=o.vx*dt+Math.sin(o.phase)*o.wind*.075*dt;o.y+=o.vy*dt;o.rot+=o.spin*dt;if(o.y>H+70){state.items.splice(i,1);continue}draw(o,t)}state.raf=requestAnimationFrame(frame)}
  function setupCanvas(){canvas=document.createElement('canvas');canvas.id='roseCanvas';canvas.setAttribute('aria-hidden','true');document.body.appendChild(canvas);ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});flowerImg=new Image();petalImg=new Image();flowerImg.src=flowerSrc;petalImg.src=petalSrc;resize();seed();addEventListener('resize',resize,{passive:true});document.addEventListener('visibilitychange',()=>{state.visible=!document.hidden});state.started=true;requestAnimationFrame(frame)}
  function addDecor(){
    const sections=[...document.querySelectorAll('.hero,.birthday,.memory,.gallery,.quote,.letter-section,.calendar-section,.final')];
    sections.forEach((section,i)=>{
      if(section.querySelector('.rose-decor'))return;
      section.style.position=section.style.position||'relative';
      const pos=['tl','tr','bl','br'][i%4];
      const d=document.createElement('div');d.className='rose-decor '+pos;d.innerHTML='<img src="assets/roses/cluster.svg" alt="" loading="lazy">';section.appendChild(d);
      if(i%2===0){const bloom=document.createElement('div');bloom.className='rose-bloom';bloom.style.left=(i%3===0?'8%':'auto');bloom.style.right=(i%3===0?'auto':'8%');bloom.style.top='48%';bloom.innerHTML='<img src="assets/roses/white-rose.svg" alt="" loading="lazy">';section.appendChild(bloom)}
    });
  }
  function start(){if(state.started)return;setupCanvas();addDecor();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
