/* ── THEME SWITCHER ── */
(function() {
  const html = document.documentElement;
  const saved = localStorage.getItem('sayang-theme') || 'sakura';
  html.dataset.theme = saved;

  document.addEventListener('DOMContentLoaded', () => {
    const btn   = document.getElementById('themeToggleBtn');
    const panel = document.getElementById('themePanel');
    const opts  = document.querySelectorAll('.theme-opt');

    // mark active
    opts.forEach(o => o.classList.toggle('active', o.dataset.theme === saved));

    btn && btn.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.classList.toggle('open');
    });
    document.addEventListener('click', () => panel && panel.classList.remove('open'));
    panel && panel.addEventListener('click', (e) => e.stopPropagation());

    opts.forEach(o => {
      o.addEventListener('click', () => {
        const t = o.dataset.theme;
        if (!t) return; // skip non-theme opts (like auto night button)
        html.dataset.theme = t;
        localStorage.setItem('sayang-theme', t);
        localStorage.setItem('sayang-theme-user-set', '1');
        // Signal nightmode to not auto-override
        if (window._nightmode) window._nightmode._userSetTheme = true;
        opts.forEach(x => x.classList.toggle('active', x.dataset.theme === t));
        panel.classList.remove('open');
        if (typeof showToast === 'function') showToast('✨ Tema: ' + t.charAt(0).toUpperCase() + t.slice(1));
      });
    });

    // Auto Night button
    const nightAutoBtn = document.getElementById('themeNightAuto');
    if (nightAutoBtn) {
      nightAutoBtn.addEventListener('click', () => {
        localStorage.removeItem('sayang-theme-user-set');
        panel.classList.remove('open');
        const nm = window._nightmode;
        if (nm) {
          const h = new Date().getHours();
          const phase = nm.getPhase(h);
          nm.applyPhase(phase, false);
          if (typeof showToast === 'function') showToast('🌙 Mode malam otomatis diaktifkan!');
          // Reinit pill visibility
          const pill = document.getElementById('nightmode-pill');
          if (pill) pill.classList.add('visible');
        }
      });
    }
  });
})();

/* ============================================================
   SAYANG — main.js v3  (jedag jedug + glitch + NGAKAK 🤣)
   ============================================================ */

// ── Cursor Glow ──────────────────────────────────────────────
const glow = document.getElementById('cursorGlow');
document.addEventListener('mousemove', (e) => {
  glow.style.left = e.clientX + 'px';
  glow.style.top  = e.clientY + 'px';
});

// ── Toast ────────────────────────────────────────────────────
const toast = document.getElementById('toast');
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ── Floating Particles ────────────────────────────────────────
const particlesEl = document.getElementById('particles');
const COLORS = ['#e8a4b8', '#c4607a', '#d4a853', '#f0e6d6', '#a87ec0'];
const EMOJIS = ['✦', '·', '⋆', '✧', '♡', '✿'];

function createParticle() {
  const p = document.createElement('div');
  p.classList.add('particle');
  const isEmoji = Math.random() > 0.5;
  const size  = Math.random() * 6 + 2;
  const x     = Math.random() * 100;
  const dur   = Math.random() * 12 + 8;
  const delay = Math.random() * 10;
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  if (isEmoji) {
    p.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    p.style.cssText = `left:${x}vw;bottom:-20px;font-size:${size+8}px;color:${color};animation-duration:${dur}s;animation-delay:${delay}s;`;
  } else {
    p.style.cssText = `left:${x}vw;bottom:-20px;width:${size}px;height:${size}px;background:${color};opacity:0.4;animation-duration:${dur}s;animation-delay:${delay}s;`;
  }
  particlesEl.appendChild(p);
  setTimeout(() => p.remove(), (dur + delay) * 1000);
}
setInterval(createParticle, 400);
for (let i = 0; i < 15; i++) setTimeout(createParticle, i * 150);

// ══════════════════════════════════════════════════════════════
//   JEDAG JEDUG — Hero Text
// ══════════════════════════════════════════════════════════════
const jdWords = document.querySelectorAll('.jd-word, .jd-emoji');
jdWords.forEach((el, idx) => {
  const delay = 0.4 + idx * 0.15;
  el.style.transition = `opacity 0.01s ${delay}s, transform 0.5s cubic-bezier(0.34,1.56,0.64,1) ${delay}s`;
  setTimeout(() => {
    el.style.opacity   = '1';
    el.style.transform = 'translateY(0) scale(1)';
  }, delay * 1000);
});

const jedagBPM = 128;
const beatMs   = (60 / jedagBPM) * 1000;
let beat = 0;
const lastDelay = 0.4 + (jdWords.length - 1) * 0.15 + 0.6;
setTimeout(() => {
  setInterval(() => {
    const el = jdWords[beat % jdWords.length];
    el.classList.remove('beating');
    void el.offsetWidth;
    el.classList.add('beating');
    el.addEventListener('animationend', () => el.classList.remove('beating'), { once: true });
    beat++;
  }, beatMs);
}, lastDelay * 1000);

// Caption jedag
const caption = document.getElementById('jedagCaption');
if (caption) {
  setInterval(() => {
    caption.classList.remove('beating');
    void caption.offsetWidth;
    caption.classList.add('beating');
    caption.addEventListener('animationend', () => caption.classList.remove('beating'), { once: true });
  }, beatMs * 2);
}

// ══════════════════════════════════════════════════════════════
//   LOVE BURST — semburan hati di foto
// ══════════════════════════════════════════════════════════════
const photoFrame = document.querySelector('.photo-frame-outer');
const LOVE_EMOJIS = ['💖','💗','💓','💕','♥️','💘','💝','❤️','🩷'];

function burstLoveFromPhoto(count = 12) {
  if (!photoFrame) return;
  const rect = photoFrame.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top  + rect.height / 2;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.textContent = LOVE_EMOJIS[Math.floor(Math.random() * LOVE_EMOJIS.length)];
    const size   = 18 + Math.random() * 28;
    const startX = rect.left + Math.random() * rect.width;
    const startY = rect.top  + Math.random() * rect.height;
    el.style.cssText = `position:fixed;left:${startX}px;top:${startY}px;font-size:${size}px;pointer-events:none;z-index:9998;opacity:1;transform:translate(-50%,-50%) scale(0.3);will-change:transform,opacity;`;
    document.body.appendChild(el);
    const dx = (startX - cx) + (Math.random() - 0.5) * 80;
    const dy = (startY - cy) + (Math.random() - 0.5) * 80;
    const dist = 80 + Math.random() * 120;
    const len  = Math.abs(dx) + Math.abs(dy) || 1;
    const nx   = dx / len * dist;
    const ny   = dy / len * dist - (30 + Math.random() * 40);
    const dur  = 900 + Math.random() * 600;
    const dly  = i * 40;
    setTimeout(() => {
      el.style.transition = `transform ${dur}ms cubic-bezier(0.2,0.8,0.4,1) ${dly}ms, opacity ${dur*0.6}ms ease ${dly+dur*0.4}ms`;
      requestAnimationFrame(() => {
        el.style.transform = `translate(calc(-50% + ${nx}px), calc(-50% + ${ny}px)) scale(1) rotate(${(Math.random()-0.5)*40}deg)`;
        el.style.opacity   = '0';
      });
      setTimeout(() => el.remove(), dur + dly + 100);
    }, 10);
  }
}
setInterval(burstLoveFromPhoto, 2500);
setTimeout(burstLoveFromPhoto, 800);

// ══════════════════════════════════════════════════════════════
//   🤣 FUNNY BUTTONS
// ══════════════════════════════════════════════════════════════
const photoMain  = document.getElementById('photoMain');
const photoFrame2 = document.getElementById('photoFrameOuter');
const glitchWrap = document.getElementById('glitchWrap');
const photoStamp = document.getElementById('photoStamp');

const STAMP_TEXTS = [
  'PUNDUNG MODE: ON 😤',
  'CEMBERUT LEVEL: 9000 😒',
  'LAGI NGAMBEK ™️',
  'DO NOT DISTURB 🚫',
  'MOODSWING AKTIF ⚡',
  'SEDANG PUNDUNG, TUNGGU... 🕐',
  'STATUS: DIEM-DIEMAN 😶',
  'ERROR: TERLALU IMUT 💀',
];

let activeEffect = null;

function clearEffects() {
  photoMain.className = 'photo-main';
  activeEffect = null;
}

// 🫨 GOYANG
document.getElementById('btnWobble').addEventListener('click', () => {
  if (activeEffect === 'wobble') { clearEffects(); showToast('oke oke diem dulu 😅'); return; }
  clearEffects();
  activeEffect = 'wobble';
  photoMain.classList.add('wobble');
  photoFrame2.classList.add('shaking');
  setTimeout(() => photoFrame2.classList.remove('shaking'), 500);
  showToast('💃 GOYANG TERUS SAYANG!');
  // Shake frame repeatedly
  const shakeInterval = setInterval(() => {
    photoFrame2.classList.add('shaking');
    setTimeout(() => photoFrame2.classList.remove('shaking'), 500);
  }, 600);
  setTimeout(() => clearInterval(shakeInterval), 5000);
  burstLoveFromPhoto(6);
});

// 🌀 MUTER
document.getElementById('btnSpin').addEventListener('click', () => {
  if (activeEffect === 'spin') { clearEffects(); showToast('woy pusing aku 😵'); return; }
  clearEffects();
  activeEffect = 'spin';
  photoMain.classList.add('spin');
  showToast('🌀 MUTER MUTER MUTER!!!');
  spawnNgakakRain(['😵','💫','🌀'], 8);
});

// 🔬 MENGECIL
document.getElementById('btnTiny').addEventListener('click', () => {
  if (activeEffect === 'tiny') {
    photoMain.classList.remove('tiny');
    void photoMain.offsetWidth;
    photoMain.classList.add('normal');
    setTimeout(() => photoMain.classList.remove('normal'), 600);
    activeEffect = null;
    showToast('KEMBALI NORMAL! 🙏');
    return;
  }
  clearEffects();
  activeEffect = 'tiny';
  photoMain.classList.add('tiny');
  showToast('🔬 KEMANA KAMU?? JANGAN ILANG DONG 😭');
  spawnNgakakRain(['🔍','😱','👀'], 10);
});

// 🙃 BALIK
document.getElementById('btnFlip').addEventListener('click', () => {
  if (activeEffect === 'flip') { clearEffects(); showToast('oke oke normal lagi 😌'); return; }
  clearEffects();
  activeEffect = 'flip';
  photoMain.classList.add('flip');
  showToast('🙃 DUNIA TERBALIK KARNA KAMU PUNDUNG!');
  spawnNgakakRain(['🙃','🌍','😵'], 12);
  // Rotate stamp too
  photoStamp.style.transform = 'translateX(-50%) rotate(175deg)';
  setTimeout(() => { photoStamp.style.transform = ''; }, 3000);
});

// 🌈 RAINBOW
document.getElementById('btnRainbow').addEventListener('click', () => {
  if (activeEffect === 'rainbow') { clearEffects(); showToast('rainbow off 😔'); return; }
  clearEffects();
  activeEffect = 'rainbow';
  photoMain.classList.add('rainbow');
  showToast('🌈 KAMU COLORFUL BGT SAYANGGG!');
  spawnNgakakRain(['🌈','✨','💎','🎨'], 15);
});

// 😭 NANGIS
document.getElementById('btnCry').addEventListener('click', () => {
  clearEffects();
  showToast('😭 JANGAN PUNDUNG LAGIII AKU SEDIH!!!');
  spawnCryTears();
  spawnNgakakRain(['😭','💧','😢','🥺'], 20);
  // Photo wobble sekali
  photoMain.classList.add('wobble');
  setTimeout(() => {
    photoMain.classList.remove('wobble');
    activeEffect = null;
  }, 2000);
  // Semburan love banyak
  setTimeout(() => burstLoveFromPhoto(20), 300);
});

// ── Random stamp changer ──
setInterval(() => {
  photoStamp.textContent = STAMP_TEXTS[Math.floor(Math.random() * STAMP_TEXTS.length)];
  photoStamp.style.animation = 'none';
  void photoStamp.offsetWidth;
  photoStamp.style.animation = '';
}, 4000);

// ── Klik foto → glitch + love burst ──
if (photoFrame2) {
  photoFrame2.addEventListener('click', (e) => {
    // Only if not clicking buttons
    if (e.target.closest('.fbtn')) return;
    triggerGlitch();
    setTimeout(triggerGlitch, 200);
    burstLoveFromPhoto(8);
  });
}

// ══════════════════════════════════════════════════════════════
//   😭 CRY TEARS
// ══════════════════════════════════════════════════════════════
function spawnCryTears() {
  if (!photoFrame) return;
  const rect = photoFrame.getBoundingClientRect();
  // tears dari kiri kanan atas foto
  for (let i = 0; i < 14; i++) {
    const tear = document.createElement('div');
    tear.textContent = ['💧','😭','💦'][Math.floor(Math.random()*3)];
    tear.classList.add('cry-tear');
    tear.style.left = (20 + Math.random() * 60) + '%';
    tear.style.top  = (15 + Math.random() * 30) + '%';
    tear.style.animationDelay = (i * 80) + 'ms';
    tear.style.fontSize = (1 + Math.random() * 1.2) + 'rem';
    photoFrame.appendChild(tear);
    setTimeout(() => tear.remove(), 1500);
  }
}

// ══════════════════════════════════════════════════════════════
//   🤣 NGAKAK RAIN — emoji hujan dari atas
// ══════════════════════════════════════════════════════════════
const ngakakOverlay = document.getElementById('ngakakOverlay');

function spawnNgakakRain(emojiList, count = 12) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.classList.add('ngakak-emoji');
      el.textContent = emojiList[Math.floor(Math.random() * emojiList.length)];
      el.style.left = (Math.random() * 100) + 'vw';
      el.style.animationDuration = (1.5 + Math.random() * 2) + 's';
      el.style.fontSize = (1.5 + Math.random() * 2.5) + 'rem';
      ngakakOverlay.appendChild(el);
      setTimeout(() => el.remove(), 4000);
    }, i * 80);
  }
}

// ── Random ngakak event setiap 8 detik ──
const RANDOM_EVENTS = [
  () => { showToast('😤 LAGI PUNDUNG YA? IMUT DEH!'); spawnNgakakRain(['😤','💢','😒'], 8); },
  () => { showToast('💌 PSST.. AKU SAYANG KAMU TAU!'); burstLoveFromPhoto(15); },
  () => { showToast('🎭 DRAMA MODE ACTIVATED!'); spawnNgakakRain(['🎭','🎬','⭐'], 10); },
  () => { showToast('😂 PUNDUNG LAGI? KETEBAK!'); spawnNgakakRain(['😂','🤣','💀'], 12); },
  () => { showToast('🌸 TETEP CANTIK WALAU PUNDUNG!'); burstLoveFromPhoto(10); spawnNgakakRain(['🌸','✨'], 6); },
];
let eventIdx = 0;
setInterval(() => {
  RANDOM_EVENTS[eventIdx % RANDOM_EVENTS.length]();
  eventIdx++;
}, 8000);

// ══════════════════════════════════════════════════════════════
//   PHOTO GLITCH
// ══════════════════════════════════════════════════════════════
function triggerGlitch() {
  if (!glitchWrap) return;
  glitchWrap.classList.add('glitching');
  setTimeout(() => glitchWrap.classList.remove('glitching'), 200);
}
function scheduleGlitch() {
  setTimeout(() => { triggerGlitch(); scheduleGlitch(); }, 2000 + Math.random() * 4000);
}
scheduleGlitch();

// ── Scroll Reveal ─────────────────────────────────────────────
const revealEls = document.querySelectorAll('.section-title, .reason-card, .final-text, .final-sub');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay ? parseInt(entry.target.dataset.delay) : 0;
      setTimeout(() => entry.target.classList.add('visible'), delay);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => observer.observe(el));

// ── Message Refresh ───────────────────────────────────────────
const msgEl  = document.getElementById('dailyMsg');
const btnRef = document.getElementById('btnRefresh');
btnRef && btnRef.addEventListener('click', async () => {
  msgEl.style.transition = 'opacity 0.35s, transform 0.35s';
  msgEl.style.opacity    = '0';
  msgEl.style.transform  = 'translateY(-10px)';
  try {
    const res  = await fetch('/api/message');
    const data = await res.json();
    setTimeout(() => {
      msgEl.textContent     = data.message;
      msgEl.style.transform = 'translateY(10px)';
      requestAnimationFrame(() => { msgEl.style.opacity = '1'; msgEl.style.transform = 'translateY(0)'; });
    }, 380);
  } catch {
    setTimeout(() => { msgEl.style.opacity = '1'; msgEl.style.transform = 'translateY(0)'; }, 380);
  }
});

// ── Big Heart Click ───────────────────────────────────────────
const bigHeart = document.getElementById('bigHeart');
bigHeart && bigHeart.addEventListener('click', () => {
  bigHeart.classList.add('clicked');
  burstHearts(bigHeart);
  spawnNgakakRain(['💖','💗','💕'], 10);
  setTimeout(() => bigHeart.classList.remove('clicked'), 700);
});

function burstHearts(origin) {
  const rect = origin.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top  + rect.height / 2;
  for (let i = 0; i < 14; i++) {
    const h = document.createElement('div');
    h.textContent = ['💖','♥️','💗','💕'][Math.floor(Math.random()*4)];
    h.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;font-size:${Math.random()*22+14}px;pointer-events:none;z-index:9999;transition:transform 1s ease-out,opacity 1s ease-out;transform:translate(-50%,-50%);opacity:1;`;
    document.body.appendChild(h);
    const angle = (i/14)*360, rad = angle*Math.PI/180;
    const dist  = Math.random()*130+60;
    requestAnimationFrame(() => {
      setTimeout(() => {
        h.style.transform = `translate(calc(-50% + ${Math.cos(rad)*dist}px), calc(-50% + ${Math.sin(rad)*dist}px)) scale(0.5)`;
        h.style.opacity   = '0';
      }, 20);
    });
    setTimeout(() => h.remove(), 1100);
  }
}

// ── Parallax Hero ─────────────────────────────────────────────
const titleWrap = document.querySelector('.title-wrap');
window.addEventListener('scroll', () => {
  const sy = window.scrollY;
  if (titleWrap) {
    titleWrap.style.transform = `translateY(${sy * 0.3}px)`;
    titleWrap.style.opacity   = Math.max(0, 1 - sy / 400);
  }
});

// ── 🤣 Easter egg: konami-ish — ketik "pundung" ──
let typed = '';
document.addEventListener('keydown', (e) => {
  typed += e.key.toLowerCase();
  if (typed.includes('pundung')) {
    typed = '';
    showToast('😤💢 PUNDUNG DETECTED!! 💢😤');
    spawnNgakakRain(['😤','💢','😒','🙄','😑'], 25);
    for (let r = 0; r < 4; r++) setTimeout(() => burstLoveFromPhoto(8), r * 300);
    // shake everything
    document.body.style.animation = 'none';
    photoFrame2 && photoFrame2.classList.add('shaking');
    setTimeout(() => photoFrame2 && photoFrame2.classList.remove('shaking'), 600);
  }
  if (typed.length > 20) typed = typed.slice(-20);
});

// ── Music Player ──────────────────────────────────────────────
(function () {
  const audio   = document.getElementById('bgMusic');
  const btn     = document.getElementById('musicBtn');
  const icon    = document.getElementById('musicIcon');
  const volSldr = document.getElementById('musicVol');
  const volVal  = document.getElementById('volVal');
  const volIcon = document.getElementById('volIcon');
  const vinyl   = document.getElementById('musicVinyl');
  if (!audio || !btn) return;

  let playing = false;
  let targetVol = 0.45;

  function setPlaying(state) {
    playing = state;
    btn.classList.toggle('playing', state);
    icon.textContent = state ? '❚❚' : '▶';
    if (vinyl) vinyl.classList.toggle('spinning', state);
  }

  btn.addEventListener('click', () => {
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.volume = 0;
      audio.play().then(() => {
        setPlaying(true);
        // Fade in
        let v = 0;
        const fade = setInterval(() => {
          v = Math.min(v + 0.04, targetVol);
          audio.volume = v;
          if (v >= targetVol) clearInterval(fade);
        }, 60);
      }).catch(() => setPlaying(false));
    }
  });

  // Volume slider
  if (volSldr) {
    volSldr.addEventListener('input', () => {
      const val = parseInt(volSldr.value);
      targetVol = val / 100;
      audio.volume = targetVol;
      volVal.textContent = val + '%';
      // Update icon
      if (volIcon) {
        volIcon.textContent = val === 0 ? '🔇' : val < 40 ? '🔈' : val < 75 ? '🔉' : '🔊';
      }
    });

    // Klik vol icon → mute/unmute
    if (volIcon) {
      volIcon.addEventListener('click', () => {
        if (audio.volume > 0) {
          targetVol = audio.volume;
          audio.volume = 0;
          volSldr.value = 0;
          volVal.textContent = '0%';
          volIcon.textContent = '🔇';
        } else {
          const restore = targetVol || 0.45;
          audio.volume = restore;
          volSldr.value = Math.round(restore * 100);
          volVal.textContent = Math.round(restore * 100) + '%';
          volIcon.textContent = restore < 0.4 ? '🔈' : restore < 0.75 ? '🔉' : '🔊';
        }
      });
    }
  }

  audio.addEventListener('pause', () => setPlaying(false));
  audio.addEventListener('ended', () => setPlaying(false));
})();
