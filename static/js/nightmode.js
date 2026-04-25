/* ============================================================
   SAYANG — Night Mode Otomatis + Langit Cinematic 🌙✨
   Auto-detects time of day and shifts the sky accordingly
   ============================================================ */

(function () {

  /* ── Sky Phases ─────────────────────────────────────────── */
  const SKY_PHASES = {
    //     hour range   [from, to]
    dawn:    { hours: [4, 6],   label: 'Subuh 🌅',   emoji: '🌄' },
    morning: { hours: [6, 11],  label: 'Pagi 🌤️',    emoji: '🌤️' },
    noon:    { hours: [11, 15], label: 'Siang ☀️',   emoji: '☀️' },
    golden:  { hours: [15, 18], label: 'Sore 🌇',    emoji: '🌇' },
    dusk:    { hours: [18, 20], label: 'Magrib 🌆',  emoji: '🌆' },
    night:   { hours: [20, 24], label: 'Malam 🌙',   emoji: '🌙' },
    midnight:{ hours: [0, 4],   label: 'Tengah Malam 🌌', emoji: '🌌' },
  };

  const SKY_GRADIENTS = {
    dawn:     'linear-gradient(180deg, #1a0a2e 0%, #4a1942 20%, #c4607a 50%, #e8a878 75%, #fdd8a0 100%)',
    morning:  'linear-gradient(180deg, #87ceeb 0%, #b8e0f5 30%, #e0f4ff 60%, #fff8e8 100%)',
    noon:     'linear-gradient(180deg, #1e90ff 0%, #6ab4ff 30%, #b0d8ff 70%, #e8f5ff 100%)',
    golden:   'linear-gradient(180deg, #1a0a2e 0%, #4a2060 15%, #c4607a 40%, #e8a050 60%, #fdd090 80%, #ffe8c0 100%)',
    dusk:     'linear-gradient(180deg, #0d0a1e 0%, #1a0a2e 20%, #4a1942 45%, #c4607a 70%, #e8a4b8 100%)',
    night:    'linear-gradient(180deg, #020408 0%, #040d1a 25%, #0a0d20 50%, #0d0a1e 75%, #12081a 100%)',
    midnight: 'linear-gradient(180deg, #000005 0%, #020408 25%, #04060f 55%, #080512 100%)',
  };

  const NIGHT_THEMES = ['night', 'midnight', 'dusk'];
  const DARK_APP_THEMES = ['dark', 'gold'];

  /* ── State ──────────────────────────────────────────────── */
  let currentPhase = null;
  let starsEl = null;
  let moonEl = null;
  let firefliesEl = null;
  let skyBgEl = null;
  let autoEnabled = true;
  let userOverride = false;

  function getPhase(hour) {
    for (const [key, val] of Object.entries(SKY_PHASES)) {
      const [a, b] = val.hours;
      if (a <= b ? (hour >= a && hour < b) : (hour >= a || hour < b)) return key;
    }
    return 'night';
  }

  function isNightPhase(phase) {
    return NIGHT_THEMES.includes(phase);
  }

  /* ── DOM Setup ──────────────────────────────────────────── */
  function setupDOM() {
    // Sky background layer (behind everything)
    skyBgEl = document.createElement('div');
    skyBgEl.id = 'sky-bg';
    skyBgEl.style.cssText = `
      position: fixed; inset: 0; z-index: 0;
      pointer-events: none;
      transition: background 4s ease, opacity 3s ease;
      opacity: 0;
    `;
    document.body.prepend(skyBgEl);

    // Stars container
    starsEl = document.createElement('div');
    starsEl.id = 'sky-stars';
    starsEl.style.cssText = `
      position: fixed; inset: 0; z-index: 1;
      pointer-events: none; overflow: hidden;
      opacity: 0; transition: opacity 3s ease;
    `;
    document.body.insertBefore(starsEl, skyBgEl.nextSibling);

    // Moon
    moonEl = document.createElement('div');
    moonEl.id = 'sky-moon';
    moonEl.innerHTML = '🌙';
    moonEl.style.cssText = `
      position: fixed; top: 8vh; right: 10vw;
      font-size: clamp(36px, 6vw, 72px);
      z-index: 2; pointer-events: none;
      opacity: 0; transition: opacity 3s ease, transform 3s ease;
      transform: translateY(-20px);
      filter: drop-shadow(0 0 30px rgba(255,240,180,0.6));
      animation: moonFloat 6s ease-in-out infinite;
    `;
    document.body.insertBefore(moonEl, starsEl.nextSibling);

    // Fireflies container
    firefliesEl = document.createElement('div');
    firefliesEl.id = 'sky-fireflies';
    firefliesEl.style.cssText = `
      position: fixed; inset: 0; z-index: 2;
      pointer-events: none; overflow: hidden;
      opacity: 0; transition: opacity 3s ease;
    `;
    document.body.insertBefore(firefliesEl, moonEl.nextSibling);

    injectCSS();
  }

  function injectCSS() {
    const style = document.createElement('style');
    style.id = 'nightmode-styles';
    style.textContent = `
      @keyframes moonFloat {
        0%, 100% { transform: translateY(0px) rotate(-5deg); }
        50%       { transform: translateY(-12px) rotate(5deg); }
      }
      @keyframes starTwinkle {
        0%, 100% { opacity: var(--star-op, 0.8); transform: scale(1); }
        50%       { opacity: calc(var(--star-op, 0.8) * 0.3); transform: scale(0.6); }
      }
      @keyframes firefly {
        0%   { transform: translate(0px, 0px) scale(1); opacity: 0; }
        15%  { opacity: 1; }
        50%  { transform: translate(var(--fx, 40px), var(--fy, -30px)) scale(1.3); opacity: 0.8; }
        85%  { opacity: 0.6; }
        100% { transform: translate(var(--fx2, -20px), var(--fy2, 20px)) scale(0.8); opacity: 0; }
      }
      @keyframes shootingStar {
        0%   { transform: translateX(0) translateY(0) rotate(-45deg); opacity: 1; width: 3px; }
        100% { transform: translateX(300px) translateY(300px) rotate(-45deg); opacity: 0; width: 120px; }
      }
      .star-dot {
        position: absolute;
        border-radius: 50%;
        background: white;
        animation: starTwinkle var(--dur, 2s) ease-in-out infinite;
        animation-delay: var(--dly, 0s);
      }
      .shooting-star {
        position: absolute;
        height: 1.5px;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.9), white);
        border-radius: 99px;
        animation: shootingStar 1.5s ease-out forwards;
        pointer-events: none;
      }
      .firefly-dot {
        position: absolute;
        width: 4px; height: 4px;
        border-radius: 50%;
        background: #ffe87c;
        box-shadow: 0 0 6px 2px rgba(255,232,100,0.7), 0 0 12px 4px rgba(255,200,50,0.4);
        animation: firefly var(--ff-dur, 4s) ease-in-out infinite;
        animation-delay: var(--ff-dly, 0s);
      }
      /* Night mode UI pill */
      #nightmode-pill {
        position: fixed; bottom: 5.5rem; right: 1rem;
        background: rgba(10, 10, 30, 0.7);
        border: 1px solid rgba(200,160,255,0.3);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-radius: 999px;
        padding: 0.4rem 0.85rem;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.7rem;
        color: rgba(200,180,255,0.9);
        z-index: 99998;
        display: flex; align-items: center; gap: 0.4rem;
        cursor: pointer;
        transition: all 0.3s ease;
        opacity: 0;
        transform: translateY(10px);
        user-select: none;
      }
      #nightmode-pill.visible {
        opacity: 1; transform: translateY(0);
      }
      #nightmode-pill:hover {
        background: rgba(20,10,40,0.85);
        border-color: rgba(200,160,255,0.6);
        box-shadow: 0 0 20px rgba(180,120,255,0.25);
      }
      #nightmode-pill .pill-dot {
        width: 6px; height: 6px;
        border-radius: 50%;
        background: #a78bfa;
        box-shadow: 0 0 6px rgba(167,139,250,0.8);
        flex-shrink: 0;
        animation: starTwinkle 1.5s ease-in-out infinite;
      }
      /* Day pill variant */
      #nightmode-pill.day-pill {
        background: rgba(255,250,235,0.7);
        border-color: rgba(255,180,80,0.4);
        color: rgba(120,80,20,0.9);
      }
      #nightmode-pill.day-pill .pill-dot {
        background: #f59e0b;
        box-shadow: 0 0 6px rgba(245,158,11,0.8);
      }
      /* Shooting star trail */
      #sky-stars canvas {
        position: absolute; inset: 0;
      }
      /* Overlay tint for body during night */
      body.night-active {
        --night-tint: rgba(5,3,20,0.45);
      }
      /* Transition for hero sky during night */
      body.night-active .hero {
        background: transparent !important;
      }
    `;
    document.head.appendChild(style);
  }

  /* ── Stars ───────────────────────────────────────────────── */
  function createStars(count = 180) {
    starsEl.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const s = document.createElement('div');
      s.className = 'star-dot';
      const size = Math.random() < 0.15 ? (2.5 + Math.random() * 1.5) : (0.8 + Math.random() * 1.8);
      const op = 0.3 + Math.random() * 0.7;
      s.style.cssText = `
        left: ${Math.random() * 100}vw;
        top: ${Math.random() * 65}vh;
        width: ${size}px; height: ${size}px;
        --star-op: ${op};
        --dur: ${1.5 + Math.random() * 3}s;
        --dly: ${Math.random() * 4}s;
        opacity: ${op};
      `;
      starsEl.appendChild(s);
    }
  }

  function spawnShootingStar() {
    if (!isNightPhase(currentPhase)) return;
    const s = document.createElement('div');
    s.className = 'shooting-star';
    s.style.cssText = `
      left: ${10 + Math.random() * 50}vw;
      top: ${5 + Math.random() * 35}vh;
    `;
    starsEl.appendChild(s);
    s.addEventListener('animationend', () => s.remove());
    // Schedule next
    setTimeout(spawnShootingStar, 5000 + Math.random() * 12000);
  }

  /* ── Fireflies ───────────────────────────────────────────── */
  function createFireflies(count = 18) {
    firefliesEl.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const f = document.createElement('div');
      f.className = 'firefly-dot';
      const dur = 3 + Math.random() * 5;
      const fx = (Math.random() - 0.5) * 120;
      const fy = (Math.random() - 0.5) * 80;
      const fx2 = (Math.random() - 0.5) * 80;
      const fy2 = (Math.random() - 0.5) * 60;
      f.style.cssText = `
        left: ${Math.random() * 100}vw;
        top: ${30 + Math.random() * 65}vh;
        --ff-dur: ${dur}s;
        --ff-dly: ${Math.random() * 5}s;
        --fx: ${fx}px; --fy: ${fy}px;
        --fx2: ${fx2}px; --fy2: ${fy2}px;
      `;
      firefliesEl.appendChild(f);
    }
  }

  /* ── Apply Phase ─────────────────────────────────────────── */
  function applyPhase(phase, announce = false) {
    if (phase === currentPhase) return;
    const prevPhase = currentPhase;
    currentPhase = phase;
    const isNight = isNightPhase(phase);
    const info = SKY_PHASES[phase];

    // Sky gradient
    skyBgEl.style.background = SKY_GRADIENTS[phase];
    skyBgEl.style.opacity = isNight ? '0.92' : (phase === 'dawn' || phase === 'golden' || phase === 'dusk') ? '0.75' : '0';

    // Stars & moon
    if (isNight) {
      createStars(phase === 'midnight' ? 230 : 170);
      starsEl.style.opacity = phase === 'midnight' ? '1' : '0.85';
      moonEl.style.opacity = '1';
      moonEl.style.transform = 'translateY(0)';
      moonEl.innerHTML = phase === 'midnight' ? '🌕' : '🌙';
      createFireflies(phase === 'midnight' ? 25 : 14);
      firefliesEl.style.opacity = '0.85';
      document.body.classList.add('night-active');
      setTimeout(spawnShootingStar, 3000);
    } else if (phase === 'dawn' || phase === 'dusk') {
      starsEl.style.opacity = phase === 'dawn' ? '0.3' : '0.5';
      moonEl.style.opacity = phase === 'dawn' ? '0.3' : '0.6';
      moonEl.style.transform = 'translateY(0)';
      firefliesEl.style.opacity = '0';
      document.body.classList.remove('night-active');
      if (prevPhase && isNightPhase(prevPhase)) {
        // still some stars from night fading out
      }
    } else {
      starsEl.style.opacity = '0';
      moonEl.style.opacity = '0';
      moonEl.style.transform = 'translateY(-20px)';
      firefliesEl.style.opacity = '0';
      document.body.classList.remove('night-active');
    }

    // Auto switch app theme
    if (!userOverride) {
      const html = document.documentElement;
      const curTheme = html.dataset.theme;
      if (isNight && !DARK_APP_THEMES.includes(curTheme)) {
        html.dataset.theme = 'dark';
        localStorage.setItem('sayang-theme', 'dark');
        refreshThemeUI('dark');
      } else if (!isNight && DARK_APP_THEMES.includes(curTheme) && curTheme === 'dark') {
        // Restore to sakura if we auto-set it to dark
        if (!localStorage.getItem('sayang-theme-user-set')) {
          html.dataset.theme = 'sakura';
          localStorage.setItem('sayang-theme', 'sakura');
          refreshThemeUI('sakura');
        }
      }
    }

    // Update pill
    updatePill(phase, isNight);

    // Announce if changed
    if (announce && prevPhase !== null && typeof showToast === 'function') {
      const msgs = {
        night:    ['🌙 Malam tiba sayang... indah ya? 🌟', '✨ Langit malam buat kamu~'],
        midnight: ['🌌 Tengah malam, bintang penuh buat kamu 💖', '🌕 Bulan purnama sayang~'],
        dawn:     ['🌅 Subuh tiba, hari baru dimulai bersamamu 🌸', '🌄 Fajar untukmu sayang~'],
        morning:  ['☀️ Pagi yang indah, good morning sayang! 💌', '🌤️ Selamat pagi~'],
        noon:     ['🌞 Siang ini tetap inget aku ya! 😝', '☀️ Semangat siangnya sayang~'],
        golden:   ['🌇 Sore yang romantis buat kita 🌸', '✨ Golden hour buat kamu~'],
        dusk:     ['🌆 Magrib yang indah, langit merah buat kamu 💖', '🌅 Senja untukmu sayang~'],
      };
      const options = msgs[phase] || [];
      if (options.length) showToast(options[Math.floor(Math.random() * options.length)]);
    }
  }

  function refreshThemeUI(theme) {
    const opts = document.querySelectorAll('.theme-opt');
    opts.forEach(o => o.classList.toggle('active', o.dataset.theme === theme));
  }

  /* ── Pill UI ─────────────────────────────────────────────── */
  let pillEl = null;
  function createPill() {
    pillEl = document.createElement('div');
    pillEl.id = 'nightmode-pill';
    pillEl.innerHTML = `<span class="pill-dot"></span><span class="pill-label">–</span>`;
    pillEl.title = 'Mode malam otomatis aktif. Klik untuk toggle.';
    pillEl.addEventListener('click', () => {
      autoEnabled = !autoEnabled;
      userOverride = !autoEnabled;
      if (autoEnabled) {
        userOverride = false;
        localStorage.removeItem('sayang-theme-user-set');
        // re-apply current time phase
        const h = new Date().getHours();
        applyPhase(getPhase(h), false);
        if (typeof showToast === 'function') showToast('🌙 Mode malam otomatis aktif!');
      } else {
        // Turn off night effects
        skyBgEl.style.opacity = '0';
        starsEl.style.opacity = '0';
        moonEl.style.opacity = '0';
        firefliesEl.style.opacity = '0';
        document.body.classList.remove('night-active');
        if (typeof showToast === 'function') showToast('☀️ Mode malam dimatikan~');
      }
      updatePill(currentPhase, autoEnabled && isNightPhase(currentPhase));
    });
    document.body.appendChild(pillEl);
    setTimeout(() => pillEl.classList.add('visible'), 1500);
  }

  function updatePill(phase, isNight) {
    if (!pillEl) return;
    const info = SKY_PHASES[phase] || {};
    const label = pillEl.querySelector('.pill-label');
    if (label) label.textContent = autoEnabled ? (info.label || phase) : 'Auto: Off';
    pillEl.classList.toggle('day-pill', !isNight || !autoEnabled);
  }

  /* ── Main Init ───────────────────────────────────────────── */
  function init() {
    setupDOM();
    createPill();

    const h = new Date().getHours();
    const phase = getPhase(h);
    // Force instant first paint
    skyBgEl.style.transition = 'none';
    starsEl.style.transition = 'none';
    moonEl.style.transition = 'none';
    firefliesEl.style.transition = 'none';

    applyPhase(phase, false);

    // Re-enable transitions
    requestAnimationFrame(() => {
      setTimeout(() => {
        skyBgEl.style.transition = 'background 4s ease, opacity 3s ease';
        starsEl.style.transition = 'opacity 3s ease';
        moonEl.style.transition = 'opacity 3s ease, transform 3s ease';
        firefliesEl.style.transition = 'opacity 3s ease';
      }, 100);
    });

    // Check every minute for phase change
    setInterval(() => {
      if (!autoEnabled) return;
      const newH = new Date().getHours();
      const newPhase = getPhase(newH);
      applyPhase(newPhase, true); // will announce if changed
    }, 60000);
  }

  /* ── Wait for DOM ────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for debug
  window._nightmode = { getPhase, applyPhase, SKY_PHASES };

})();
