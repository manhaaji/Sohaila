'use strict';

const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const state = {
  started: false,
  music: false,
  letter: false,
  galleryIndex: 0,
  dragging: false,
  startX: 0,
  startScroll: 0,
  lenis: null,
  petalTimer: null,
  typingRun: 0,
  autoScrollFrame: null,
  autoScrollStopped: false,
  autoScrollPausedUntil: 0,
  flowerTimer: null,
  songIndex: 0,
  pendingCanPlayHandler: null
};

const intro = $('#intro');
const site = $('#site');
const startButton = $('#startButton');
const music = $('#birthdayMusic');
const musicButton = $('#musicControl');
const petals = $('#petals');
const envelopeButton = $('#envelopeButton');
const passwordModal = $('#passwordModal');
const passwordInput = $('#letterPassword');
const passwordSubmit = $('#passwordSubmit');
const passwordClose = $('#passwordClose');
const passwordError = $('#passwordError');
const letterModal = $('#letterModal');
const reassuranceModal = $('#reassuranceModal');
const reassuranceContinue = $('#reassuranceContinue');

function init() {
  document.documentElement.classList.add('js');
  preloader();
  startSmoothScroll();
  calendar();
  safeImages();
  setupMusic();
  setupReasons();
  setupMessageJar();
  setupMiniPlayer();
  setupWishBox();
  setupLetterMusic();
  setupCountdown();
  setupSectionFX();
  setupIntro();
  startFlowerRain();
  setupLetter();
  setupGallery();
  setupLightbox();
  setupReveal();
  setupTilt();
  setupCursor();
  setupAnchors();
  // Decorative flower rain starts after intro; no continuous particle engine.
}

function preloader() {
  const p = $('#preloader');
  if (!p) return;
  const hide = () => p.classList.add('hide');
  window.addEventListener('load', () => setTimeout(hide, 350), { once: true });
  setTimeout(hide, 1800);
}

function startSmoothScroll() {
  // Lightweight native scrolling: no Lenis animation loop.
  document.documentElement.style.scrollBehavior = 'smooth';
}

function stopScroll() {
  state.lenis?.stop();
  document.body.classList.add('locked');
}

function resumeScroll() {
  document.body.classList.remove('locked');
  state.lenis?.start();
}

function setupIntro() {
  if (!startButton) return;
  startButton.onclick = startExperience;
  setupAccessGate();
}

function setPasswordMode(mode){
  if(!passwordModal)return;
  const kicker=$('.password-kicker',passwordModal);
  const title=$('#passwordTitle');
  const copy=$('.password-copy',passwordModal);
  const submit=$('.password-submit span',passwordModal);
  const note=$('.password-note',passwordModal);
  if(mode==='site'){
    passwordModal.classList.add('site-gate');
    if(kicker)kicker.textContent='PRIVATE ACCESS';
    if(title)title.textContent='دخول خاص';
    if(copy)copy.textContent='هذه الصفحة خاصة. أدخل رمز الوصول للمتابعة.';
    if(submit)submit.textContent='متابعة';
    if(note)note.textContent='';
  }else{
    passwordModal.classList.remove('site-gate');
    if(kicker)kicker.textContent='PRIVATE LETTER';
    if(title)title.textContent='الجواب الخاص';
    if(copy)copy.textContent='هناك رسالة خاصة بالداخل.';
    if(submit)submit.textContent='فتح الجواب';
    if(note)note.textContent='';
  }
}

function setupAccessGate(){
  if(!passwordModal || !passwordInput || !passwordSubmit) return;
  document.body.classList.add('access-locked');
  setPasswordMode('site');
  passwordModal.classList.add('open','site-gate');
  passwordModal.setAttribute('aria-hidden','false');
  passwordError?.classList.remove('show');
  passwordInput.value='';
  setTimeout(()=>{try{passwordInput.focus();}catch(e){}},180);
  passwordSubmit.onclick = handlePasswordSubmit;
  passwordInput.onkeydown = e=>{if(e.key==='Enter'){e.preventDefault();handlePasswordSubmit()}};
  passwordInput.oninput = ()=>passwordError?.classList.remove('show');
}
async function handlePasswordSubmit(){
  if(passwordModal?.classList.contains('site-gate')) return verifySiteAccess();
  return verifyLetterPassword();
}

async function verifySiteAccess(){
  if(!passwordInput)return;
  const value=passwordInput.value.trim().toUpperCase();
  if(value!=='S'){
    passwordError?.classList.add('show');
    passwordInput.classList.remove('shake');
    void passwordInput.offsetWidth;
    passwordInput.classList.add('shake');
    passwordInput.select();
    return;
  }
  passwordSubmit?.classList.add('unlocking');
  burst($('.password-seal',passwordModal));
  $('.password-card',passwordModal)?.classList.add('accepted');
  await wait(720);
  closeSiteAccess();
  passwordSubmit?.classList.remove('unlocking');
}
function closeSiteAccess(){
  document.body.classList.remove('access-locked');
  $('#preloader')?.classList.add('hide');
  passwordModal?.classList.remove('open','site-gate');
  passwordModal?.setAttribute('aria-hidden','true');
  if(passwordModal) passwordModal.style.display='none';
  if(intro){ intro.style.visibility='visible'; intro.style.opacity='1'; intro.style.pointerEvents='auto'; }
  if(startButton){ startButton.disabled=false; startButton.style.visibility='visible'; startButton.style.pointerEvents='auto'; }
  passwordInput?.blur();
  $('.password-card',passwordModal)?.classList.remove('accepted');
}
async function playOpeningReveal(){
  const reveal=$('#cinematicReveal');
  if(!reveal)return;
  document.body.classList.add('opening-reveal-active');
  reveal.classList.remove('fade-out');
  reveal.classList.add('play');
  await wait(2400);
  reveal.classList.add('fade-out');
  await wait(850);
  reveal.classList.remove('play','fade-out');
  document.body.classList.remove('opening-reveal-active');
}
async function startExperience(event) {
  event?.preventDefault();
  if (state.started || document.body.classList.contains('access-locked') || !intro) return;
  state.started = true;
  intro.style.visibility='visible';
  stopScroll();
  burst(startButton);
  musicStart();
  startButton.classList.add('pressed');

  if (window.gsap) gsap.to('.intro-center',{scale:.9,opacity:0,y:-22,duration:.55,ease:'power3.in'});

  const cinematic = playOpeningReveal();
  await wait(280);
  intro?.classList.add('opening');
  scheduleReassuranceModal();
  createPetalBurst(34);
  await cinematic;

  site?.classList.add('visible');
  site?.setAttribute('aria-hidden','false');
  if (window.gsap) gsap.from('.hero-inner > *',{opacity:0,y:34,duration:1,stagger:.08,ease:'power3.out'});

  await wait(550);
  intro?.classList.add('done');
  resumeScroll();
  setupReveal();
  setupScrollAnimations();
  startGentleOpeningScroll();
}

function scheduleReassuranceModal(){
  if(!reassuranceModal || reassuranceModal.dataset.scheduled==='1') return;
  reassuranceModal.dataset.scheduled='1';
  window.setTimeout(openReassuranceModal,5000);
}

function openReassuranceModal(){
  if(!reassuranceModal || !state.started) return;
  stopScroll();
  reassuranceModal.classList.add('open');
  reassuranceModal.setAttribute('aria-hidden','false');
  if(window.gsap) gsap.fromTo('.reassurance-card',{opacity:0,y:22,scale:.975},{opacity:1,y:0,scale:1,duration:1.05,ease:'power3.out'});
}

function closeReassuranceModal(){
  if(!reassuranceModal) return;
  const finish=()=>{reassuranceModal.classList.remove('open');reassuranceModal.setAttribute('aria-hidden','true');resumeScroll();};
  if(window.gsap) gsap.to('.reassurance-card',{opacity:0,y:10,scale:.99,duration:.5,ease:'power2.in',onComplete:finish});
  else finish();
}

function startGentleOpeningScroll(){
  if (state.autoScrollFrame || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  state.autoScrollStopped = false;
  state.autoScrollPausedUntil = performance.now() + 900;
  const speed = window.innerWidth < 600 ? 7.2 : 10.5;
  let lastTime = performance.now();
  const pauseBriefly = () => { state.autoScrollPausedUntil = performance.now() + 2600; };
  window.addEventListener('wheel', pauseBriefly, {passive:true});
  window.addEventListener('touchstart', pauseBriefly, {passive:true});
  const cleanup = () => {
    if (state.autoScrollFrame) cancelAnimationFrame(state.autoScrollFrame);
    state.autoScrollFrame = null;
    window.removeEventListener('wheel', pauseBriefly);
    window.removeEventListener('touchstart', pauseBriefly);
  };
  const frame = now => {
    if (state.autoScrollStopped) { cleanup(); return; }
    const dt = Math.min(50, now-lastTime)/1000; lastTime=now;
    const modalOpen = !!document.querySelector('.modal.open, .password-modal.open, .letter-modal.open, body.modal-open');
    const editing = document.activeElement && /^(TEXTAREA|INPUT)$/.test(document.activeElement.tagName);
    if (now >= state.autoScrollPausedUntil && !document.hidden && !modalOpen && !editing && !document.body.classList.contains('locked')) {
      const max = Math.max(0, document.documentElement.scrollHeight-window.innerHeight);
      const current = window.scrollY || document.documentElement.scrollTop || 0;
      if (current >= max-2) { state.autoScrollStopped=true; cleanup(); return; }
      const next = Math.min(max, current + speed*dt);
      if (state.lenis) state.lenis.scrollTo(next,{immediate:true}); else window.scrollTo(0,next);
    }
    state.autoScrollFrame=requestAnimationFrame(frame);
  };
  state.autoScrollFrame=requestAnimationFrame(frame);
}

function setupScrollAnimations() {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.refresh();
  gsap.to('.hero-watermark', {
    yPercent: 24,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });
  gsap.to('.hero-ring', {
    rotation: 80,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });
  $$('.photo-card').forEach((card, i) => {
    gsap.to(card, {
      y: i % 2 ? 28 : -22,
      ease: 'none',
      scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });
}

const MAIN_SONGS = [
  'music/song-1.mp3',
  'music/song-2.mp3',
  'music/song-3.mp3',
  'music/song-4.mp3'
];
const MAIN_SONG_NAMES = [
  'A little song for you',
  'For my favorite person',
  'White roses & memories',
  'Always, Suhaila'
];
let musicNext = null;
const MUSIC_VOLUME = 0.72;
const MUSIC_CROSSFADE = 2600;
const MUSIC_PRELOAD_AHEAD = 4.0;

function activeMusicDeck(){
  return state.activeDeck === 1 ? musicNext : music;
}
function otherMusicDeck(){
  return state.activeDeck === 1 ? music : musicNext;
}

function setDeckSource(deck,index){
  if(!deck) return;
  index = (index + MAIN_SONGS.length) % MAIN_SONGS.length;
  const current = deck.dataset.songSrc || '';
  const src = MAIN_SONGS[index];
  deck.dataset.index = String(index);
  if(current !== src){
    deck.pause();
    deck.currentTime = 0;
    deck.volume = 0;
    deck.dataset.songSrc = src;
    deck.src = src;
    deck.preload = 'auto';
    deck.load();
  }
}

function chooseMainSong(){
  if(!music) return;
  let index = Number(localStorage.getItem('suhailaMainSongIndex'));
  if(!Number.isInteger(index) || index < 0 || index >= MAIN_SONGS.length) index = 0;
  state.songIndex = index;
  state.activeDeck = 0;
  state.mainCrossfading = false;
  setDeckSource(music,index);
  if(musicNext) setDeckSource(musicNext,(index+1)%MAIN_SONGS.length);
  syncMainPlayer();
}

function fadeDeckVolume(deck,target,duration=700){
  if(!deck) return Promise.resolve();
  const from = Number.isFinite(deck.volume) ? deck.volume : 0;
  const start = performance.now();
  return new Promise(resolve=>{
    const tick = now=>{
      const q = Math.min(1,(now-start)/duration);
      const e = 1-Math.pow(1-q,3);
      deck.volume = from + (target-from)*e;
      if(q<1) requestAnimationFrame(tick); else resolve();
    };
    requestAnimationFrame(tick);
  });
}

function syncMainPlayer(){
  const deck=activeMusicDeck();
  const track=$('#playerTrack');
  const vinyl=$('#vinyl');
  if(track) track.textContent=`${String((state.songIndex||0)+1).padStart(2,'0')} · ${MAIN_SONG_NAMES[state.songIndex||0]}`;
  vinyl?.classList.toggle('playing',!!deck && !deck.paused && deck.volume>0.02);
  const play=$('#playerPlay');
  if(play){const icon=play.querySelector('span');if(icon)icon.textContent=deck&&!deck.paused?'Ⅱ':'▶';}
}

function fmtTime(x){
  if(!Number.isFinite(x) || x<0) return '0:00';
  return `${Math.floor(x/60)}:${String(Math.floor(x%60)).padStart(2,'0')}`;
}
function syncMainProgress(){
  const deck=activeMusicDeck(); if(!deck)return;
  const p=$('#playerProgress'),t=$('#playerTime');
  const d=deck.duration||0,c=deck.currentTime||0;
  if(p)p.value=d?(c/d*100):0;
  if(t)t.textContent=`${fmtTime(c)} / ${fmtTime(d)}`;
}

function prebufferNextMainSong(){
  const next=otherMusicDeck();
  if(!next)return;
  const nextIndex=(state.songIndex+1)%MAIN_SONGS.length;
  setDeckSource(next,nextIndex);
}

function crossfadeDecks(nextIndex,duration=MUSIC_CROSSFADE){
  if(!music || !musicNext || state.mainCrossfading) return false;
  const from=activeMusicDeck(), to=otherMusicDeck();
  if(!from || !to || from===to) return false;
  if(state.pendingCanPlayHandler){ try{to.removeEventListener('canplay',state.pendingCanPlayHandler);}catch(e){} state.pendingCanPlayHandler=null; }
  nextIndex=(nextIndex+MAIN_SONGS.length)%MAIN_SONGS.length;
  setDeckSource(to,nextIndex);

  const begin=()=>{
    to.removeEventListener('canplay',begin);
    if(state.pendingCanPlayHandler===begin) state.pendingCanPlayHandler=null;
    if(state.mainCrossfading || activeMusicDeck()!==from) return;
    state.mainCrossfading=true;
    state.pendingNextIndex=nextIndex;
    to.currentTime=0; to.volume=0;
    const p=to.play(); if(p?.catch)p.catch(()=>{});
    const start=performance.now();
    const fromStart=Math.max(0,Math.min(MUSIC_VOLUME,from.volume||MUSIC_VOLUME));
    const tick=now=>{
      const q=Math.min(1,(now-start)/duration),e=1-Math.pow(1-q,3);
      from.volume=fromStart*(1-e); to.volume=MUSIC_VOLUME*e;
      if(q<1){requestAnimationFrame(tick);return;}
      from.pause(); from.currentTime=0; from.volume=0;
      state.activeDeck=state.activeDeck===0?1:0;
      state.songIndex=nextIndex; state.mainCrossfading=false; state.pendingNextIndex=null;
      localStorage.setItem('suhailaMainSongIndex',String(nextIndex));
      syncMainPlayer(); prebufferNextMainSong();
    };
    requestAnimationFrame(tick);
  };

  if(to.readyState>=3) begin();
  else {
    state.pendingCanPlayHandler=begin;
    to.addEventListener('canplay',begin,{once:true});
    // If loading is unusually slow, the ended handler below will use forceNextTrack().
  }
  return true;
}
function forceNextTrack(){
  if(!music || !musicNext || state.mainCrossfading) return;
  const from=activeMusicDeck(), to=otherMusicDeck();
  const nextIndex=(state.songIndex+1)%MAIN_SONGS.length;
  if(state.pendingCanPlayHandler){try{to.removeEventListener('canplay',state.pendingCanPlayHandler);}catch(e){} state.pendingCanPlayHandler=null;}
  setDeckSource(to,nextIndex);
  const launch=()=>{
    to.removeEventListener('canplay',launch);
    if(state.pendingCanPlayHandler===launch) state.pendingCanPlayHandler=null;
    if(state.mainCrossfading)return;
    state.mainCrossfading=true; state.pendingNextIndex=nextIndex;
    to.currentTime=0; to.volume=0;
    const p=to.play(); if(p?.catch)p.catch(()=>{});
    const start=performance.now(); const fromStart=from?.paused?0:Math.min(MUSIC_VOLUME,from.volume||MUSIC_VOLUME);
    const tick=now=>{
      const q=Math.min(1,(now-start)/1400),e=1-Math.pow(1-q,3);
      if(from)from.volume=fromStart*(1-e); to.volume=MUSIC_VOLUME*e;
      if(q<1){requestAnimationFrame(tick);return;}
      if(from){from.pause();from.currentTime=0;from.volume=0;}
      state.activeDeck=state.activeDeck===0?1:0; state.songIndex=nextIndex; state.mainCrossfading=false; state.pendingNextIndex=null;
      localStorage.setItem('suhailaMainSongIndex',String(nextIndex)); syncMainPlayer(); prebufferNextMainSong();
    }; requestAnimationFrame(tick);
  };
  if(to.readyState>=3) launch(); else {state.pendingCanPlayHandler=launch; to.addEventListener('canplay',launch,{once:true});}
}
function setupMusic(){
  musicNext=$('#birthdayMusicNext');
  if(!music)return;
  music.preload='auto';
  if(musicNext)musicNext.preload='auto';
  chooseMainSong();

  const decks=[music,musicNext].filter(Boolean);
  decks.forEach(deck=>{
    deck.addEventListener('play',()=>{
      state.music=true;
      musicButton?.classList.add('playing');
      syncMainPlayer();
    });
    deck.addEventListener('pause',()=>{
      if(deck===activeMusicDeck() && !state.mainCrossfading)syncMainPlayer();
    });
    deck.addEventListener('timeupdate',()=>{
      if(deck!==activeMusicDeck())return;
      syncMainProgress();
      const duration=deck.duration||0;
      const remaining=duration-(deck.currentTime||0);
      if(duration>0 && remaining<=MUSIC_PRELOAD_AHEAD && !state.mainCrossfading){
        crossfadeDecks((state.songIndex+1)%MAIN_SONGS.length,MUSIC_CROSSFADE);
      }
    });
    deck.addEventListener('loadedmetadata',()=>{if(deck===activeMusicDeck())syncMainProgress()});
    deck.addEventListener('error',()=>{
      if(deck===activeMusicDeck() && !state.mainCrossfading){
        // Do not loop a broken track forever; move on to the next available file.
        setTimeout(()=>crossfadeDecks((state.songIndex+1)%MAIN_SONGS.length,1200),250);
      }
    });
    deck.addEventListener('ended',()=>{
      if(deck!==activeMusicDeck() || state.mainCrossfading)return;
      forceNextTrack();
    });
  });

  musicButton?.addEventListener('click',()=>{
    const deck=activeMusicDeck();if(!deck)return;
    if(deck.paused){
      deck.play().then(()=>{state.music=true;musicButton.classList.add('playing');fadeDeckVolume(deck,MUSIC_VOLUME,650);}).catch(()=>{});
    }else{
      fadeDeckVolume(deck,0,650).then(()=>deck.pause());
      state.music=false;musicButton.classList.remove('playing');
    }
  });
}

function musicStart(){
  if(!music)return;
  if(!music.src || music.dataset.songSrc===undefined) chooseMainSong();
  const deck=activeMusicDeck();
  deck.volume=0;
  const p=deck.play();
  if(p?.then){
    p.then(()=>{
      state.music=true;
      musicButton?.classList.add('playing');
      fadeDeckVolume(deck,MUSIC_VOLUME,1100);
      syncMainPlayer();
      prebufferNextMainSong();
    }).catch(()=>{});
  }
}

function setupLetterMusic(){
  const letterMusic=$('#letterMusic');
  if(!letterMusic)return;
  letterMusic.volume=0;
  letterMusic.loop=true;
  window.playLetterMusic=async()=>{
    const main=activeMusicDeck();
    state.mainMusicWasPlaying=!!(main && !main.paused);
    letterMusic.currentTime=0;
    letterMusic.volume=0;
    try{
      await letterMusic.play();
      if(main && !main.paused) await fadeDeckVolume(main,0,1800);
      letterMusic.volume=0;
      await fadeDeckVolume(letterMusic,.58,1800);
    }catch(e){}
  };
  window.stopLetterMusic=async()=>{
    const main=activeMusicDeck();
    if(!letterMusic.paused){
      await fadeDeckVolume(letterMusic,0,1800);
      letterMusic.pause();
      letterMusic.currentTime=0;
    }
    if(main && state.mainMusicWasPlaying){
      if(main.paused){try{await main.play();}catch(e){}}
      await fadeDeckVolume(main,MUSIC_VOLUME,1800);
      state.music=true; musicButton?.classList.add('playing');
    }else if(main){
      main.volume=0; state.music=false; musicButton?.classList.remove('playing');
    }
  };
}

function burst(element) {
  if (!element) return;
  const r = element.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  for (let i = 0; i < 34; i++) {
    const particle = document.createElement('span');
    particle.className = 'burst-particle';
    particle.textContent = Math.random() > .25 ? '✦' : '♡';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    document.body.appendChild(particle);
    const angle = Math.random() * Math.PI * 2;
    const distance = 90 + Math.random() * 220;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    if (window.gsap) {
      gsap.to(particle, {
        x: dx,
        y: dy,
        rotation: Math.random() * 480,
        scale: .1,
        opacity: 0,
        duration: .8 + Math.random() * .55,
        ease: 'power2.out',
        onComplete: () => particle.remove()
      });
    } else {
      const anim = particle.animate(
        [{ transform: 'translate(-50%,-50%)', opacity: 1 }, { transform: `translate(${dx}px,${dy}px) scale(.1)`, opacity: 0 }],
        { duration: 1100 }
      );
      anim.onfinish = () => particle.remove();
    }
  }
}

function createWhiteRosePetal(){
  if (!petals || document.hidden) return;
  const petal=document.createElement('span');
  const flowers=['🌷','🌱','🌼','🌸','🌿'];
  petal.className='petal emoji-flower';
  petal.textContent=flowers[Math.floor(Math.random()*flowers.length)];
  const size=11+Math.random()*8, drift=(Math.random()-.5)*130, duration=9+Math.random()*6, rotation=(Math.random()-.5)*260;
  petal.style.left=`${Math.random()*100}vw`;
  petal.style.fontSize=`${size}px`; petal.style.width='auto'; petal.style.height='auto';
  petal.style.opacity=`${.16+Math.random()*.22}`;
  petal.style.setProperty('--wind',`${drift}px`); petal.style.setProperty('--spin',`${rotation}deg`); petal.style.setProperty('--fall-duration',`${duration}s`);
  petals.appendChild(petal);
  window.setTimeout(()=>petal.remove(),(duration+1)*1000);
}

function startFlowerRain(){
  if (!petals || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  createWhiteRosePetal();
  state.flowerTimer = window.setInterval(() => {
    if (!document.hidden) createWhiteRosePetal();
  }, window.innerWidth < 600 ? 1600 : 1200);
}

function createPetalBurst(count) {
  // Continuous falling flowers are handled by the single optimized canvas in effects.js.
  // This short burst remains DOM-light and only happens during transitions.
  for (let i = 0; i < Math.min(count, 14); i++) setTimeout(createWhiteRosePetal, i * 55);
}

function setupReveal(){
  const elements=$$('.reveal'); if(!elements.length)return;
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      const el=entry.target;
      const siblings=el.parentElement?[...el.parentElement.querySelectorAll('.reveal')]:[];
      el.style.setProperty('--reveal-delay',`${Math.min(360,Math.max(0,siblings.indexOf(el))*75)}ms`);
      el.classList.add('in-view'); observer.unobserve(el);
    });
  },{threshold:.08,rootMargin:'0px 0px -10% 0px'});
  elements.forEach(el=>{if(!el.classList.contains('in-view'))observer.observe(el)});
}

function setupLetter() {
  if (!envelopeButton || !letterModal) return;
  reassuranceContinue?.addEventListener('click', closeReassuranceModal);
  $('.reassurance-backdrop', reassuranceModal)?.addEventListener('click', closeReassuranceModal);
  envelopeButton.addEventListener('click', openPasswordGate);
  // The same password UI is used for the initial site gate and the private letter.
  passwordClose?.addEventListener('click', closePasswordGate);
  $('.password-backdrop', passwordModal)?.addEventListener('click', closePasswordGate);
  passwordInput?.addEventListener('input', () => {
    passwordError?.classList.remove('show');
  });
  // Enter is handled by the active password gate.
  $('#closeLetter')?.addEventListener('click', closeLetter);
  $('.letter-bottom-close')?.addEventListener('click', closeLetter);
  $('.letter-backdrop', letterModal)?.addEventListener('click', closeLetter);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (reassuranceModal?.classList.contains('open')) closeReassuranceModal();
      else if (state.letter) closeLetter();
      else if (passwordModal?.classList.contains('open') && !passwordModal.classList.contains('site-gate')) closePasswordGate();
    }
  });
}

function openPasswordGate() {
  if (state.letter || !passwordModal) return;
  setPasswordMode('letter');
  passwordModal.style.display='grid';
  passwordModal.classList.add('open');
  passwordModal.setAttribute('aria-hidden','false');
  passwordError?.classList.remove('show');
  if (passwordInput) { passwordInput.value=''; setTimeout(()=>passwordInput.focus(),220); }
  if (window.gsap) gsap.fromTo('.password-card',{y:30,scale:.94,opacity:0},{y:0,scale:1,opacity:1,duration:.65,ease:'power3.out'});
}

function closePasswordGate() {
  if(passwordModal?.classList.contains('site-gate')) return;
  passwordModal?.classList.remove('open');
  passwordModal?.setAttribute('aria-hidden','true');
  passwordInput?.blur();
}

async function verifyLetterPassword() {
  if (!passwordInput) return;
  const value = passwordInput.value.trim().toUpperCase();
  if (value !== 'S') {
    passwordError?.classList.add('show');
    passwordInput.classList.remove('shake');
    void passwordInput.offsetWidth;
    passwordInput.classList.add('shake');
    passwordInput.select();
    return;
  }
  passwordSubmit?.classList.add('unlocking');
  burst($('.password-seal', passwordModal));
  await wait(520);
  closePasswordGate();
  await openLetterSequence();
  passwordSubmit?.classList.remove('unlocking');
}

async function openLetterSequence() {
  if (state.letter || envelopeButton.classList.contains('opened')) return;
  envelopeButton.classList.add('opened');
  burst($('.wax-seal', envelopeButton));
  await wait(1350);
  openLetterModal();
}

function openLetterModal() {
  state.letter = true;
  stopScroll();
  letterModal.classList.add('open');
  letterModal.setAttribute('aria-hidden', 'false');
  $('.scroll-paper', letterModal)?.setAttribute('data-lenis-prevent', '');
  resetTypedLetter();
  if (window.gsap) {
    const tl = gsap.timeline();
    tl.fromTo('.letter-dialog', { y: 45, scale: .96 }, { y: 0, scale: 1, duration: .7, ease: 'power3.out' })
      .fromTo('.old-letter', { rotateY: -22, rotateX: 5, scaleX: .72 }, { rotateY: 0, rotateX: 0, scaleX: 1, duration: .95, ease: 'power3.out' }, '-=.35')
      .fromTo('.paper-corner,.top-ornament,.old-letter-head', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .45, stagger: .05 }, '-=.25');
  }
  typeLetter();
  window.playLetterMusic?.();
}


function resetTypedLetter() {
  $$('.type-line').forEach(line => {
    line.textContent = '';
    line.classList.remove('typed');
  });
  $('.signature-line')?.classList.remove('show');
}

async function typeLetter() {
  const run = ++state.typingRun;
  const lines = $$('.type-line');
  await wait(850);
  for (const line of lines) {
    if (run !== state.typingRun) return;
    const text = line.dataset.text || '';
    const speed = Number(line.dataset.speed || 16);
    for (let i = 0; i < text.length; i++) {
      if (run !== state.typingRun) return;
      line.textContent += text[i];
      await wait(speed + (text[i] === ' ' ? 1 : 0));
    }
    line.classList.add('typed');
    await wait(130);
  }
  $('.signature-line')?.classList.add('show');
}

function closeLetter() {
  if (!state.letter) return;
  state.typingRun++;
  state.letter = false;
  letterModal.classList.remove('open');
  letterModal.setAttribute('aria-hidden', 'true');
  envelopeButton?.classList.remove('opened');
  window.stopLetterMusic?.();
  resumeScroll();
}

function setupGallery() {
  const stage = $('#galleryStage');
  const track = $('#galleryTrack');
  if (!stage || !track) return;
  const cards = $$('.gallery-card', track);
  cards.forEach(card => card.addEventListener('click', () => {
    state.galleryIndex = Number(card.dataset.index) || 0;
    openLightbox(state.galleryIndex);
  }));
  $('#galleryPrev')?.addEventListener('click', () => moveGallery(-1));
  $('#galleryNext')?.addEventListener('click', () => moveGallery(1));

  stage.addEventListener('pointerdown', event => {
    state.dragging = true;
    state.startX = event.clientX;
    state.startScroll = stage.scrollLeft;
    stage.setPointerCapture?.(event.pointerId);
  });
  stage.addEventListener('pointermove', event => {
    if (!state.dragging) return;
    stage.scrollLeft = state.startScroll - (event.clientX - state.startX) * 1.12;
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(type => stage.addEventListener(type, () => state.dragging = false));
  updateGalleryProgress();
}

function moveGallery(direction) {
  const stage = $('#galleryStage');
  const card = $('.gallery-card', stage);
  if (!stage || !card) return;
  const amount = card.getBoundingClientRect().width + 24;
  stage.scrollBy({ left: direction * amount, behavior: 'smooth' });
  const count = $$('.gallery-card').length;
  state.galleryIndex = (state.galleryIndex + direction + count) % count;
  updateGalleryProgress();
}

function updateGalleryProgress() {
  const progress = $('#galleryProgress');
  const count = $$('.gallery-card').length || 1;
  if (progress) progress.style.width = `${((state.galleryIndex + 1) / count) * 100}%`;
}

function setupLightbox() {
  const box = $('#lightbox');
  if (!box) return;
  $('#lightboxClose')?.addEventListener('click', closeLightbox);
  $('#lightboxPrev')?.addEventListener('click', () => lightboxMove(-1));
  $('#lightboxNext')?.addEventListener('click', () => lightboxMove(1));
  box.addEventListener('click', event => { if (event.target === box) closeLightbox(); });
  document.addEventListener('keydown', event => {
    if (!box.classList.contains('open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') lightboxMove(-1);
    if (event.key === 'ArrowRight') lightboxMove(1);
  });
}

function galleryItems() {
  return $$('.gallery-card').map(card => ({ src: $('img', card)?.getAttribute('src') || '', title: card.dataset.title || '' }));
}

function openLightbox(index) {
  const box = $('#lightbox');
  if (!box) return;
  state.galleryIndex = index;
  renderLightbox();
  box.classList.add('open');
  box.setAttribute('aria-hidden', 'false');
  stopScroll();
}

function renderLightbox() {
  const item = galleryItems()[state.galleryIndex];
  if (!item) return;
  const image = $('#lightboxImage');
  if (image) { image.src = item.src; image.alt = item.title; }
  $('#lightboxTitle').textContent = item.title;
  updateGalleryProgress();
}

function lightboxMove(direction) {
  const count = galleryItems().length;
  if (!count) return;
  state.galleryIndex = (state.galleryIndex + direction + count) % count;
  renderLightbox();
}

function closeLightbox() {
  const box = $('#lightbox');
  if (!box) return;
  box.classList.remove('open');
  box.setAttribute('aria-hidden', 'true');
  if (!state.letter) resumeScroll();
}

function setupCountdown(){
  const root=$('#countdownTimer'); if(!root)return;
  const els={d:$('#cdDays'),h:$('#cdHours'),m:$('#cdMinutes'),s:$('#cdSeconds'),note:$('#countdownNote')};
  const pad=n=>String(Math.max(0,n)).padStart(2,'0');
  function target(){
    const now=new Date(); let y=now.getFullYear();
    let t=new Date(y,8,20,0,0,0,0);
    if(now>=t)t=new Date(y+1,8,20,0,0,0,0);
    return t;
  }
  let t=target();
  function tick(){
    const now=new Date(); if(now>=t){t=target();}
    let diff=Math.max(0,t-now); const d=Math.floor(diff/86400000);diff-=d*86400000;
    const h=Math.floor(diff/3600000);diff-=h*3600000;const m=Math.floor(diff/60000);diff-=m*60000;const sec=Math.floor(diff/1000);
    if(els.d)els.d.textContent=pad(d);if(els.h)els.h.textContent=pad(h);if(els.m)els.m.textContent=pad(m);if(els.s)els.s.textContent=pad(sec);
    if(els.note)els.note.textContent=t.getFullYear()===2026?'كل ثانية بتقرّبنا من يوم سُهيلة العشرين.':'العد التنازلي للعيد ميلاد القادم بدأ من جديد — 20 سبتمبر 2027.';
  }
  tick(); setInterval(tick,1000);
}

function setupSectionFX(){
  const section=$('#birthday'); if(!section)return;
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){section.classList.add('fx-active');burstRoseSparkles(section,18);}
    else section.classList.remove('fx-active');
  }),{threshold:.35}); observer.observe(section);
  const timeline=$('#memoryTimeline'), progress=$('.timeline-progress',timeline);
  if(timeline&&progress){
    const update=()=>{const r=timeline.getBoundingClientRect(),vh=innerHeight;const q=Math.max(0,Math.min(1,(vh*.72-r.top)/(r.height*.7)));progress.style.height=(18+q*82)+'%'};
    addEventListener('scroll',update,{passive:true});addEventListener('resize',update,{passive:true});update();
  }
}
function burstRoseSparkles(section,count){
  const rect=section.getBoundingClientRect();
  for(let i=0;i<count;i++){
    const s=document.createElement('span');s.className='rose-spark';s.textContent=i%4===0?'✿':'·';
    s.style.left=(rect.width*.35+Math.random()*rect.width*.3)+'px';s.style.top=(rect.height*.42+Math.random()*rect.height*.18)+'px';
    section.appendChild(s); setTimeout(()=>s.remove(),1800);
  }
}

function calendar() {
  const root = $('#calendarDays');
  if (!root) return;
  root.innerHTML = '';
  const firstDay = new Date(2026, 8, 1).getDay();
  const totalDays = new Date(2026, 9, 0).getDate();
  const event = $('#calendarEvent');
  const details = {
    1:'بداية شهر مميز.', 2:'يوم عادي… لحد ما نوصل لليوم الكبير.', 3:'تفصيلة صغيرة في شهر كبير.',
    4:'يوم جديد من شهر سُهيلة.', 5:'كل يوم بيقربنا أكتر.', 6:'لسه بدري… الحكاية مستنية يوم 20.',
    7:'أسبوع جديد وذكرى جديدة.', 8:'الورد الأبيض بيليق بالشهر ده.', 9:'التاريخ قرب.', 10:'10 أيام أقل من يومها المميز.',
    11:'يوم هادي قبل الاحتفال.', 12:'كل سنة وهي بخير مقدماً.', 13:'لحظة تستاهل ابتسامة.', 14:'منتصف الطريق تقريباً.',
    15:'خمسة أيام على اليوم المنتظر.', 16:'التفاصيل الحلوة بتقرب.', 17:'ثلاثة أيام ونوصل.', 18:'يومين بس.', 19:'بكرة… 🤍',
    20:'عيد ميلاد سُهيلة — بداية سنة العشرين.', 21:'أول يوم بعد اليوم الكبير.', 22:'والفرحة لسه مكملة.', 23:'ذكريات جديدة بدأت.',
    24:'يوم من أيام سنة سُهيلة الجديدة.', 25:'نتمنى لها سنة أجمل.', 26:'ضحكة جديدة تستاهل تتسجل.', 27:'حلم جديد في الطريق.',
    28:'خطوة أخرى نحو كل ما تتمناه.', 29:'شهر جميل قرب يخلص.', 30:'نهاية سبتمبر… وبداية حكايات جديدة.'
  };
  for (let i = 0; i < firstDay; i++) {
    const blank = document.createElement('span');
    blank.className = 'day empty';
    blank.setAttribute('aria-hidden','true');
    root.appendChild(blank);
  }
  for (let day = 1; day <= totalDays; day++) {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'day';
    item.dataset.day = day;
    item.setAttribute('role','gridcell');
    item.setAttribute('aria-label', `سبتمبر ${day} 2026`);
    item.innerHTML = `<span>${day}</span><i></i>`;
    if (day === 20) {
      item.classList.add('birthday');
      item.innerHTML = '<span>20</span><i>♡</i><b>يومها</b>';
      item.setAttribute('aria-label','20 سبتمبر 2026 — عيد ميلاد سُهيلة');
    }
    item.addEventListener('click', () => {
      $$('.day.selected', root).forEach(d => d.classList.remove('selected'));
      item.classList.add('selected');
      const title = $('.event-copy strong', event);
      const text = $('.event-copy p', event);
      const date = $('.event-date b', event);
      if (title) title.textContent = day === 20 ? 'عيد ميلاد سُهيلة' : `سبتمبر ${day}`;
      if (text) text.textContent = details[day] || 'يوم جميل من شهر سبتمبر.';
      if (date) date.textContent = day;
      event?.classList.toggle('special', day === 20);
      if (day === 20) burst(item);
    });
    root.appendChild(item);
  }
  const birthday = root.querySelector('[data-day="20"]');
  birthday?.classList.add('selected');
  event?.classList.add('special');
}

function safeImages() {
  $$('img').forEach(img => {
    img.decoding = 'async';
    if (!img.closest('.hero')) img.loading = 'lazy';
    img.addEventListener('error', () => {
      img.classList.add('broken');
      img.removeAttribute('src');
      img.alt = 'أضيفي الصورة هنا';
    }, { once: true });
  });
}

function setupTilt() {
  if (matchMedia('(pointer:coarse)').matches) return;
  $$('[data-tilt]').forEach(card => {
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      card.style.transform = `perspective(1000px) rotateX(${-y * 3}deg) rotateY(${x * 4}deg) translateY(-5px)`;
    });
    card.addEventListener('pointerleave', () => card.style.transform = '');
  });
}

function setupCursor() {
  const cursor = $('.cursor');
  if (!cursor || matchMedia('(pointer:coarse)').matches) return;
  window.addEventListener('pointermove', event => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
  }, { passive: true });
}

function setupAnchors() {
  $$('a[href^="#"]').forEach(anchor => anchor.addEventListener('click', event => {
    const target = $(anchor.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    if (state.lenis) state.lenis.scrollTo(target, { offset: -72, duration: .75 });
    else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
}



function setupReasons(){
 const root=$('#reasonsGrid'); if(!root) return;
 const reasons=[
 ['01','ضحكتكِ','بتعرف تغيّر مود يوم كامل في ثانية.'],['02','طيبة قلبكِ','من غير ما تحاولي… بتبان في كل تصرف.'],['03','طريقتكِ في الكلام','حتى الكلام العادي منكِ له طعم مختلف.'],['04','اهتمامكِ','التفاصيل الصغيرة منكِ بتفضل كبيرة عندي.'],['05','عينيكِ','فيهم هدوء يخلي الدنيا تهدى معاهم.'],['06','وجودكِ','مجرد إنكِ موجودة بيخلّي اليوم ألطف.'],['07','قلبكِ','أحن من إن الكلام يوصفه.'],['08','طموحكِ','بحب أشوفكِ بتكبري وتحققي اللي نفسك فيه.'],['09','خجلكِ','تفصيلة صغيرة… بس من أكتر الحاجات اللي بحبها.'],['10','عفويتكِ','أجمل نسخة منكِ هي النسخة اللي مش بتحاول.'],['11','صوتكِ','له مكان خاص جدًا في قلبي.'],['12','صبركِ','بتحملي حاجات كتير ولسه عندكِ قلب جميل.'],['13','تفاصيلكِ','حتى الحاجات اللي إنتِ شايفاها عادية أنا باخد بالي منها.'],['14','حضوركِ','بتدخلي المكان… والمكان نفسه بيتغيّر.'],['15','حنانكِ','بيوصل من غير شرح ولا كلام كتير.'],['16','قوتكِ','بحب إنكِ قوية وفي نفس الوقت رقيقة.'],['17','ضحكتكِ التانية','اللي بتطلع لما تكوني مبسوطة بجد.'],['18','ذكرياتنا','كل ذكرى معاكي بتستاهل تتخزن للأبد.'],['19','أنتِ','بحبكِ مش بسبب سبب واحد… بحبكِ لأنكِ إنتِ.'],['20','ولسه في أكتر','العشرين سبب دول مجرد بداية… والباقي عمر كامل.']
 ];
 root.innerHTML=reasons.map(r=>`<article class="reason-card reveal" style="--r:${(Math.random()*2-1).toFixed(2)}deg"><span class="tape"></span><div class="reason-photo"></div><span class="reason-number">${r[0]} / 20</span><h3>${r[1]}</h3><p>${r[2]}</p></article>`).join('');
 setupReveal();
}

function setupMessageJar(){
 const btn=$('#messageJarButton'), out=$('#randomMessage'); if(!btn||!out)return;
 const messages=['إنتِ مش بس جزء من حكايتي… إنتِ من أجمل فصولها.','لو الدنيا فيها ألف طريق حلو، أنا هختار الطريق اللي فيه إنتِ.','في تفاصيل صغيرة منكِ بتفضل عالقة في قلبي أكتر من أي حاجة كبيرة.','كل مرة بتضحكي فيها، حاجة جوايا بتقول: الحمد لله إنها موجودة.','أحبكِ في الأيام العادية قبل الأيام المميزة.','أتمنى سنتك العشرين تكون أهدى وأجمل من كل اللي فات.','إنتِ تستاهلي ورد أبيض كتير… وطمأنينة أكتر.','في حاجات بتتقال بالكلام، وحاجات وجودكِ بيقولها لوحده.','لو فتحتِ الرسالة دي مرة تانية، اعتبريها علامة إني لسه بحبكِ أكتر.','العمر مش بعدد السنين… العمر بالأشخاص اللي خلّوا السنين أحلى.','أجمل حاجة حصلت إن تفاصيلكِ بقت من تفاصيل أيامي.','أنا ممتن لكل لحظة خلتني أعرفكِ أكتر.','سنتك العشرين؟ أتمنى تكون بداية أحلام كتير بتتحقق واحدة واحدة.','مفيش رسالة قصيرة تكفي قد إيه إنتِ غالية.','احتفظي بالرسالة دي… يمكن تحتاجي تفتكري إن في حد شايفكِ جميلة جدًا.','لو الحب كان صورة، كانت هتبقى ضحكتكِ.','أنتِ الهدوء اللي الواحد نفسه يلاقيه بعد يوم طويل.','كل سنة بتكبري سنة، وأنا بلاقي أسباب جديدة أحبكِ بيها.','رسالة من صندوق قديم: إنتِ لسه أجمل صدفة.','والرسالة الأخيرة بتقول: لسه الحكاية في أولها.'];
 let last=-1;
 btn.addEventListener('click',()=>{let i;do{i=Math.floor(Math.random()*messages.length)}while(i===last);last=i;out.classList.remove('show');void out.offsetWidth;out.querySelector('span').textContent=messages[i];out.classList.add('show');burst(btn);});
}

function setupMiniPlayer(){
 const play=$('#playerPlay'),next=$('#playerNext'),progress=$('#playerProgress');
 if(!music||!play)return;
 const refresh=()=>syncMainPlayer();
 play.addEventListener('click',()=>{
   const deck=activeMusicDeck(); if(!deck)return;
   if(deck.paused){deck.play().then(()=>{state.music=true;fadeDeckVolume(deck,.72,500)}).catch(()=>{});}
   else{fadeDeckVolume(deck,0,300);setTimeout(()=>deck.pause(),320);state.music=false;}
 });
 next?.addEventListener('click',()=>crossfadeDecks((state.songIndex+1)%MAIN_SONGS.length,1100));
 progress?.addEventListener('input',()=>{const deck=activeMusicDeck();if(deck?.duration)deck.currentTime=(Number(progress.value)/100)*deck.duration});
 refresh();
}

function setupWishBox(){
 const form=$('#wishForm'),input=$('#wishInput'),count=$('#wishCount'),status=$('#wishStatus');
 if(!form||!input)return;
 input.addEventListener('input',()=>{if(count)count.textContent=`${input.value.length} / 600`});
 form.addEventListener('submit',e=>{
   e.preventDefault();
   const wish=input.value.trim();
   if(!wish)return;
   const phone='201283806755';
   const message=`أمنيتي في سنتي العشرين هي:\n\n${wish}`;
   const url=`https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
   status.textContent='جاري فتح واتساب والأمنية جاهزة للإرسال… 🤍';
   status.className='wish-status ok';
   const popup=window.open(url,'_blank','noopener,noreferrer');
   if(!popup) window.location.href=url;
 });
}

document.addEventListener('DOMContentLoaded', init);
