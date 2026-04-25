/* ============================================================
   SAYANG — walker.js
   Karakter pixel yang jalan ngikutin scroll ke tiap section
   ============================================================ */

(function () {
  const wrap    = document.getElementById('walkerWrap');
  const char    = document.getElementById('walkerChar');
  const bubble  = document.getElementById('walkerBubble');
  const label   = document.getElementById('walkerLabel');

  if (!wrap) return;

  /* ── Section definitions ── */
  const SECTIONS = [
    {
      sel: '.hero',
      bottomPct: 15,   // % dari viewport bottom
      mood: 'happy',
      say: 'haii sayang~~ 🌸',
      label: 'haii 🌸',
    },
    {
      sel: '.photo-section',
      bottomPct: 20,
      mood: 'waving',
      say: 'itu kamu yg imut!! 😍',
      label: 'ngefans 😍',
    },
    {
      sel: '.message-section',
      bottomPct: 25,
      mood: 'idle',
      say: 'baca pesannya ya 💌',
      label: 'nulis surat 💌',
    },
    {
      sel: '.reasons-section',
      bottomPct: 30,
      mood: 'happy',
      say: 'ini alasannya nih!! 🥺',
      label: 'bilang alasan 🥺',
    },
    {
      sel: '.minigames-section',
      bottomPct: 20,
      mood: 'jumping',
      say: 'main game yukk!! 🎮',
      label: 'ngajak main 🎮',
    },
    {
      sel: '.final-section',
      bottomPct: 30,
      mood: 'spinning',
      say: 'aku cinta kamu!! 💖',
      label: 'ngungkapin 💖',
    },
  ];

  /* ── State ── */
  let currentSection = -1;
  let bubbleTimer    = null;
  let petalInterval  = null;
  let lastScrollY    = window.scrollY;
  let ticking        = false;
  let charVisible    = false;

  /* ── Show/hide ── */
  function showChar() {
    if (charVisible) return;
    charVisible = true;
    wrap.classList.add('visible');
  }
  function hideChar() {
    if (!charVisible) return;
    charVisible = false;
    wrap.classList.remove('visible');
    hideBubble();
  }

  /* ── Speech bubble ── */
  function showBubble(text) {
    clearTimeout(bubbleTimer);
    bubble.textContent = text;
    bubble.classList.add('show');
    bubbleTimer = setTimeout(() => bubble.classList.remove('show'), 3500);
  }
  function hideBubble() {
    clearTimeout(bubbleTimer);
    bubble.classList.remove('show');
  }

  /* ── Set mood ── */
  const MOODS = ['idle','walking','waving','happy','jumping','spinning','pundung'];
  function setMood(mood) {
    MOODS.forEach(m => char.classList.remove(m));
    if (mood) char.classList.add(mood);
    // jumping & spinning are one-shot — revert to idle after
    if (mood === 'jumping' || mood === 'spinning') {
      setTimeout(() => {
        char.classList.remove(mood);
        char.classList.add('idle');
      }, 700);
    }
  }

  /* ── Sakura petals around char ── */
  function spawnCharPetal() {
    const p = document.createElement('div');
    p.classList.add('char-petal');
    p.textContent = ['🌸','🌺','💕','✨'][Math.floor(Math.random()*4)];
    const dx = (Math.random() - 0.5) * 60;
    const dy = -(20 + Math.random() * 40);
    p.style.setProperty('--px', dx + 'px');
    p.style.setProperty('--py', dy + 'px');
    p.style.left = (10 + Math.random() * 20) + 'px';
    p.style.bottom = (40 + Math.random() * 20) + 'px';
    p.style.animationDuration = (0.8 + Math.random() * 0.6) + 's';
    wrap.appendChild(p);
    setTimeout(() => p.remove(), 1500);
  }
  function startPetals()  { if (!petalInterval) petalInterval = setInterval(spawnCharPetal, 400); }
  function stopPetals()   { clearInterval(petalInterval); petalInterval = null; }

  /* ── Position character vertically ── */
  function positionToSection(idx) {
    const def = SECTIONS[idx];
    if (!def) return;

    const el = document.querySelector(def.sel);
    if (!el) return;

    const rect     = el.getBoundingClientRect();
    const viewH    = window.innerHeight;
    const targetBottom = def.bottomPct / 100 * viewH;   // px from viewport bottom

    // walking animation before settling
    wrap.classList.add('walking');
    char.classList.add('walking');
    char.classList.remove('idle','waving','happy','jumping','spinning','pundung');

    // compute target bottom (distance from viewport bottom)
    // rect.top is distance from viewport top
    // we want char to appear at bottom of section on screen
    const sectionBottom = rect.bottom;          // px from viewport top
    const charBottom    = viewH - sectionBottom + targetBottom;
    const clampedBottom = Math.max(8, Math.min(viewH * 0.7, charBottom));

    wrap.style.bottom = clampedBottom + 'px';

    setTimeout(() => {
      wrap.classList.remove('walking');
      char.classList.remove('walking');
      setMood(def.mood);
      label.textContent = def.label;
      showBubble(def.say);
      startPetals();
      setTimeout(stopPetals, 3000);
    }, 500);
  }

  /* ── Detect which section is active ── */
  function getActiveSection() {
    const viewH  = window.innerHeight;
    const middle = viewH * 0.5;  // check against middle of screen

    for (let i = SECTIONS.length - 1; i >= 0; i--) {
      const el = document.querySelector(SECTIONS[i].sel);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (rect.top <= middle && rect.bottom >= middle * 0.3) return i;
    }
    return -1;
  }

  /* ── Scroll handler ── */
  function onScroll() {
    const sy   = window.scrollY;
    const down = sy > lastScrollY;
    lastScrollY = sy;

    // Show char after scrolling past first 100px
    if (sy > 100) showChar();
    else { hideChar(); return; }

    const active = getActiveSection();

    // Flip direction
    if (down) wrap.classList.remove('flip-x');
    else      wrap.classList.add('flip-x');

    if (active !== currentSection && active !== -1) {
      currentSection = active;
      positionToSection(active);
    }
  }

  /* ── rAF throttle ── */
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => { onScroll(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });

  /* ── Click on char: little reaction ── */
  wrap.style.pointerEvents = 'all';
  wrap.addEventListener('click', () => {
    const reactions = [
      { mood: 'jumping', say: 'HEHE kaget! 😂' },
      { mood: 'spinning', say: 'woaaa pusing 😵' },
      { mood: 'pundung', say: 'ih jangan ganggu 😤' },
      { mood: 'waving', say: 'haii haii!! 👋' },
      { mood: 'happy', say: 'aku seneng deh 🥺💖' },
    ];
    const r = reactions[Math.floor(Math.random() * reactions.length)];
    setMood(r.mood);
    showBubble(r.say);
    spawnCharPetal(); spawnCharPetal(); spawnCharPetal();
    if (typeof spawnNgakakRain === 'function') spawnNgakakRain(['🌸','💖','✨'], 6);
  });

  /* ── Long press char: secret ── */
  let holdTimer = null;
  wrap.addEventListener('pointerdown', () => {
    holdTimer = setTimeout(() => {
      setMood('pundung');
      showBubble('aku pundung sekarang 😤💢');
      if (typeof spawnNgakakRain === 'function') spawnNgakakRain(['😤','💢','😒'], 8);
    }, 1500);
  });
  wrap.addEventListener('pointerup', () => clearTimeout(holdTimer));
  wrap.addEventListener('pointercancel', () => clearTimeout(holdTimer));

  /* ── Double tap: dance ── */
  let lastTap = 0;
  wrap.addEventListener('pointerdown', () => {
    const now = Date.now();
    if (now - lastTap < 350) {
      setMood('spinning');
      showBubble('kita dance bareng!! 💃🕺');
      startPetals(); setTimeout(stopPetals, 2000);
    }
    lastTap = now;
  });

  /* ── Init: start hidden, idle at bottom ── */
  wrap.style.bottom = '12px';
  setMood('idle');

  /* ── Random idle dialogue every 12s ── */
  const IDLE_SAYS = [
    'lagi mikirin kamu 💭',
    'jangan lupa makan ya 🍜',
    'aku di sini terus kok 🌸',
    'kamu cantik deh 😍',
    'scrollnya pelan-pelan dong 🥺',
    'hii! aku bosen nih 😅',
    'klik aku dong~ 👆',
  ];
  let idleSayIdx = 0;
  setInterval(() => {
    if (!charVisible) return;
    const mood = char.className.match(/idle|waving/);
    if (!mood) return;
    showBubble(IDLE_SAYS[idleSayIdx % IDLE_SAYS.length]);
    idleSayIdx++;
  }, 12000);

})();
