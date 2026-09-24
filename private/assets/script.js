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
  petalTimer: null,
  typingRun: 0,
  autoScrollFrame: null,
  autoScrollStopped: false,
  autoScrollPausedUntil: 0,
  flowerTimer: null,
  songIndex: 0
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

function init() {
  document.documentElement.classList.add('js');
  preloader();
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
  // The password is verified server-side before this file can ever reach the browser.
  // After successful login, play the sealed-cover opening inspired by the supplied reference video.
  setTimeout(() => playOpeningReveal(), 450);
  // Decorative flower rain starts after intro; no continuous particle engine.
}


async function playOpeningReveal(){
  const reveal=$('#cinematicReveal');
  if(!reveal)return;
  document.body.classList.add('opening-reveal-active');
  reveal.classList.add('play');
  await wait(2400);
  reveal.classList.add('fade-out');
  await wait(850);
  reveal.remove();
  document.body.classList.remove('opening-reveal-active');
}

function preloader() {
  const p = $('#preloader');
  if (!p) return;
  const hide = () => p.classList.add('hide');
  window.addEventListener('load', () => setTimeout(hide, 350), { once: true });
  setTimeout(hide, 1800);
}

function stopScroll() {
  document.body.classList.add('locked');
}

function resumeScroll() {
  document.body.classList.remove('locked');
}

function setupIntro() {
  if (!startButton) return;
  startButton.addEventListener('click', startExperience);
}

async function startExperience(event) {
  event?.preventDefault();
  if (state.started) return;
  state.started = true;
  stopScroll();
  burst(startButton);
  musicStart();
  startButton.classList.add('pressed');

  if (window.gsap) {
    gsap.to('.intro-center', {
      scale: .9,
      opacity: 0,
      y: -22,
      duration: .55,
      ease: 'power3.in'
    });
  }

  await wait(280);
  intro?.classList.add('opening');
  createPetalBurst(34);
  await wait(1500);

  site?.classList.add('visible');
  site?.setAttribute('aria-hidden', 'false');

  if (window.gsap) {
    gsap.from('.hero-inner > *', {
      opacity: 0,
      y: 34,
      duration: 1,
      stagger: .08,
      ease: 'power3.out'
    });
  }

  await wait(550);
  intro?.classList.add('done');
  resumeScroll();
  setupReveal();
  setupScrollAnimations();
  startGentleOpeningScroll();
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
      window.scrollTo(0,next);
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

const MAIN_SONGS = ['asset.php?f=music/song-1.mp3','asset.php?f=music/song-2.mp3','asset.php?f=music/song-3.mp3','asset.php?f=music/song-4.mp3'];
const MAIN_SONG_NAMES = ['A little song for you','For my favorite person','White roses & memories','Always, Suhaila'];
let musicNext = null;

function activeMusicDeck(){ return state.activeDeck === 1 ? musicNext : music; }
function otherMusicDeck(){ return state.activeDeck === 1 ? music : musicNext; }

function prepareDeck(deck,index){
  if(!deck)return;
  deck.pause();
  deck.currentTime=0;
  deck.volume=0;
  deck.dataset.index=String(index);
  deck.src=MAIN_SONGS[index];
  deck.load();
}

function chooseMainSong(){
  if(!music)return;
  let index=Number(localStorage.getItem('suhailaMainSongIndex'));
  if(!Number.isInteger(index)||index<0||index>=MAIN_SONGS.length)index=0;
  state.songIndex=index;
  state.activeDeck=0;
  state.mainCrossfading=false;
  prepareDeck(music,index);
  if(musicNext) prepareDeck(musicNext,(index+1)%MAIN_SONGS.length);
  localStorage.setItem('suhailaMainSongIndex',String((index+1)%MAIN_SONGS.length));
}

function waitForDeckReady(deck,timeout=7000){
  return new Promise(resolve=>{
    if(deck.readyState>=3){resolve(true);return;}
    let done=false;
    const finish=ok=>{if(done)return;done=true;clearTimeout(timer);deck.removeEventListener('canplay',onReady);deck.removeEventListener('canplaythrough',onReady);resolve(ok)};
    const onReady=()=>finish(true);
    const timer=setTimeout(()=>finish(deck.readyState>=2),timeout);
    deck.addEventListener('canplay',onReady,{once:true});
    deck.addEventListener('canplaythrough',onReady,{once:true});
  });
}

async function crossfadeDecks(nextIndex,duration=1600){
  if(!music||!musicNext||state.mainCrossfading)return;
  const from=activeMusicDeck(),to=otherMusicDeck();
  if(!from||!to)return;
  state.mainCrossfading=true;
  nextIndex=(nextIndex+MAIN_SONGS.length)%MAIN_SONGS.length;
  if(to.dataset.index!==String(nextIndex)) prepareDeck(to,nextIndex);
  else { to.pause(); to.currentTime=0; to.volume=0; }
  const ready=await waitForDeckReady(to,7000);
  if(!ready){
    state.mainCrossfading=false;
    return;
  }
  to.currentTime=0;
  to.volume=0;
  try{await to.play();}catch(e){state.mainCrossfading=false;return;}
  const started=performance.now();
  const fromStart=Math.max(0,Math.min(.72,from.volume||.72));
  const tick=now=>{
    const q=Math.min(1,(now-started)/duration),e=1-Math.pow(1-q,3);
    from.volume=fromStart*(1-e);
    to.volume=.72*e;
    if(q<1){requestAnimationFrame(tick);return;}
    from.pause();
    from.currentTime=0;
    state.activeDeck=state.activeDeck===0?1:0;
    state.songIndex=nextIndex;
    state.mainCrossfading=false;
    localStorage.setItem('suhailaMainSongIndex',String((nextIndex+1)%MAIN_SONGS.length));
    syncMainPlayer();
    prebufferNextMainSong();
  };
  requestAnimationFrame(tick);
}

function prebufferNextMainSong(){
  const next=otherMusicDeck();
  if(!next)return;
  const nextIndex=(state.songIndex+1)%MAIN_SONGS.length;
  if(next.dataset.index!==String(nextIndex)||next.readyState<2) prepareDeck(next,nextIndex);
}

function syncMainPlayer(){
  const deck=activeMusicDeck(),track=$('#playerTrack'),vinyl=$('#vinyl');
  if(track)track.textContent=`${String(state.songIndex+1).padStart(2,'0')} · ${MAIN_SONG_NAMES[state.songIndex]}`;
  vinyl?.classList.toggle('playing',!!deck&&!deck.paused);
  const play=$('#playerPlay');
  if(play)play.querySelector('span').textContent=deck&&!deck.paused?'Ⅱ':'▶';
}
function syncMainProgress(){
  const deck=activeMusicDeck(),progress=$('#playerProgress'),time=$('#playerTime');
  if(!deck)return;
  const d=deck.duration||0,c=deck.currentTime||0;
  if(progress)progress.value=d?(c/d*100):0;
  if(time)time.textContent=`${fmtTime(c)} / ${fmtTime(d)}`;
}
function fmtTime(x){return isFinite(x)?`${Math.floor(x/60)}:${String(Math.floor(x%60)).padStart(2,'0')}`:'0:00'}

function musicStart(){
  if(!music)return;
  chooseMainSong();
  const deck=activeMusicDeck();
  deck.volume=0;
  deck.play().then(()=>{state.music=true;musicButton?.classList.add('playing');syncMainPlayer();fadeDeckVolume(deck,.72,900);prebufferNextMainSong()}).catch(()=>{});
}
function fadeDeckVolume(deck,target,duration=600){
  if(!deck)return;
  const from=deck.volume,start=performance.now();
  const tick=now=>{const q=Math.min(1,(now-start)/duration),e=1-Math.pow(1-q,3);deck.volume=from+(target-from)*e;if(q<1)requestAnimationFrame(tick)};
  requestAnimationFrame(tick);
}
function setupMusic(){
  musicNext=$('#birthdayMusicNext');
  if(!music||!musicNext)return;
  [music,musicNext].forEach(deck=>{
    deck.addEventListener('play',()=>{state.music=true;musicButton?.classList.add('playing');syncMainPlayer()});
    deck.addEventListener('pause',()=>{if(deck===activeMusicDeck()&&!state.mainCrossfading)syncMainPlayer()});
    deck.addEventListener('timeupdate',()=>{
      if(deck!==activeMusicDeck())return;
      syncMainProgress();
      const remaining=(deck.duration||0)-deck.currentTime;
      if(remaining>0&&remaining<=1.8&&!state.mainCrossfading)crossfadeDecks((state.songIndex+1)%MAIN_SONGS.length,1800);
    },{passive:true});
    deck.addEventListener('ended',()=>{
      if(deck===activeMusicDeck()&&!state.mainCrossfading)crossfadeDecks((state.songIndex+1)%MAIN_SONGS.length,1200);
    });
  });
  musicButton?.addEventListener('click',()=>{
    const deck=activeMusicDeck();if(!deck)return;
    if(deck.paused){deck.play().then(()=>{state.music=true;musicButton.classList.add('playing');fadeDeckVolume(deck,.72,600);prebufferNextMainSong()}).catch(()=>{})}
    else{fadeDeckVolume(deck,0,450);setTimeout(()=>deck.pause(),470);state.music=false;musicButton.classList.remove('playing')}
  });
}
function crossfade(from,to,fromTarget,toTarget,duration=1200){
  const start=performance.now(),a=from?.volume??0,b=to?.volume??0;
  const tick=now=>{const q=Math.min(1,(now-start)/duration),e=1-Math.pow(1-q,3);if(from)from.volume=a+(fromTarget-a)*e;if(to)to.volume=b+(toTarget-b)*e;if(q<1)requestAnimationFrame(tick)};
  requestAnimationFrame(tick);
}

function setupLetterMusic(){
  const letterMusic=$('#letterMusic');
  if(!letterMusic)return;
  letterMusic.volume=0;
  let mainWasPlayingBeforeLetter=false;
  window.playLetterMusic=()=>{
    const main=activeMusicDeck();
    mainWasPlayingBeforeLetter=!!main && !main.paused;
    const startLetter=()=>{
      letterMusic.volume=0;
      letterMusic.currentTime=0;
      const p=letterMusic.play();
      if(p?.then){
        p.then(()=>{
          if(main && !main.paused) fadeDeckVolume(main,0,1800);
          fadeDeckVolume(letterMusic,.58,1800);
        }).catch(()=>{});
      }
    };
    startLetter();
  };
  window.stopLetterMusic=()=>{
    const main=activeMusicDeck();
    const finish=()=>{
      letterMusic.pause();
      letterMusic.currentTime=0;
      letterMusic.volume=0;
    };
    if(!letterMusic.paused){
      if(main && mainWasPlayingBeforeLetter){
        if(main.paused) main.play().catch(()=>{});
        main.volume=0;
        crossfade(letterMusic,main,0,.72,1800);
        setTimeout(finish,1850);
      }else{
        fadeDeckVolume(letterMusic,0,1200);
        setTimeout(finish,1250);
      }
    }else{
      finish();
    }
  };
}

function setupLetter() {
  if (!envelopeButton || !letterModal) return;
  envelopeButton.addEventListener('click', openPasswordGate);
  passwordClose?.addEventListener('click', closePasswordGate);
  $('.password-backdrop', passwordModal)?.addEventListener('click', closePasswordGate);
  passwordInput?.addEventListener('input', () => {
    passwordError?.classList.remove('show');
  });
  passwordSubmit?.addEventListener('click', verifyLetterPassword);
  passwordInput?.addEventListener('keydown', event => {
    if (event.key === 'Enter') verifyLetterPassword();
  });
  $('#closeLetter')?.addEventListener('click', closeLetter);
  $('.letter-bottom-close')?.addEventListener('click', closeLetter);
  $('.letter-backdrop', letterModal)?.addEventListener('click', closeLetter);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (state.letter) closeLetter();
      else if (passwordModal?.classList.contains('open')) closePasswordGate();
    }
  });
}

function openPasswordGate() {
  if (state.letter || !passwordModal) return;
  passwordModal.classList.add('open');
  passwordModal.setAttribute('aria-hidden','false');
  passwordError?.classList.remove('show');
  if (passwordInput) { passwordInput.value=''; setTimeout(()=>passwordInput.focus(),220); }
  if (window.gsap) gsap.fromTo('.password-card',{y:30,scale:.94,opacity:0},{y:0,scale:1,opacity:1,duration:.65,ease:'power3.out'});
}

function closePasswordGate() {
  passwordModal?.classList.remove('open');
  passwordModal?.setAttribute('aria-hidden','true');
  passwordInput?.blur();
}

async function verifyLetterPassword() {
  if (!passwordInput) return;
  const value = passwordInput.value.trim();
  if (value.length !== 1 || value.toUpperCase() !== 'S') {
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
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
