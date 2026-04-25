/* ============================================================
   SAYANG — games.js
   Mini Games: Tampar Pundung | Tebak Perasaan | Catch Hearts
   Easter Eggs: 6 hidden triggers
   ============================================================ */

/* ══════════════════════════════════════════════════════════════
   UTILS
══════════════════════════════════════════════════════════════ */
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

['gmClose1','gmClose2','gmClose3'].forEach((id, i) => {
  document.getElementById(id).addEventListener('click', () => closeModal('gameModal' + (i+1)));
});

// Close modal on backdrop click
['gameModal1','gameModal2','gameModal3'].forEach(id => {
  document.getElementById(id).addEventListener('click', function(e) {
    if (e.target === this) closeModal(id);
  });
});

// Open from section cards
document.getElementById('btnGame1').addEventListener('click', () => openModal('gameModal1'));
document.getElementById('btnGame2').addEventListener('click', () => openModal('gameModal2'));
document.getElementById('btnGame3').addEventListener('click', () => openModal('gameModal3'));

/* ══════════════════════════════════════════════════════════════
   GAME 1 — TAMPAR PUNDUNG 😤
   Tap the pundung face before it escapes. Score as many as possible in 10s.
══════════════════════════════════════════════════════════════ */
(function() {
  const arena     = document.getElementById('g1Arena');
  const startMsg  = document.getElementById('g1StartMsg');
  const result    = document.getElementById('g1Result');
  const resultTxt = document.getElementById('g1ResultText');
  const scoreEl   = document.getElementById('g1Score');
  const timeEl    = document.getElementById('g1Time');
  const comboEl   = document.getElementById('g1Combo');
  const startBtn  = document.getElementById('g1StartBtn');
  const restartBtn= document.getElementById('g1RestartBtn');

  const FACES = ['😤','😒','🙄','😑','😐','🫤','😶','😮‍💨'];
  const COMMENTS = ['KENA!!! 😂','ADUH! 😭','SAKIT!! 😤','AMPUN!! 🙏','JANGAN!! 😱','YA AMPUN 😵'];
  let score = 0, combo = 1, timeLeft = 10, timer = null, spawnInterval = null, running = false;

  function spawnTarget() {
    if (!running) return;
    const el = document.createElement('div');
    el.classList.add('pundung-target');
    el.textContent = FACES[Math.floor(Math.random() * FACES.length)];
    const aW = arena.offsetWidth  - 60;
    const aH = arena.offsetHeight - 60;
    el.style.left = (10 + Math.random() * aW) + 'px';
    el.style.top  = (10 + Math.random() * aH) + 'px';
    arena.appendChild(el);

    // Auto escape after random time
    const escapeTime = 800 + Math.random() * 1000;
    const escTimeout = setTimeout(() => {
      if (el.parentNode) { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); combo = 1; comboEl.textContent = 'x1'; }
    }, escapeTime);

    el.addEventListener('pointerdown', () => {
      clearTimeout(escTimeout);
      score += combo;
      combo = Math.min(combo + 1, 8);
      scoreEl.textContent = score;
      comboEl.textContent = 'x' + combo;
      el.classList.add('hit');

      // Hit particles
      for (let i = 0; i < 5; i++) {
        const p = document.createElement('div');
        p.classList.add('hit-particle');
        p.textContent = ['💥','⭐','✨','💫','🌟'][Math.floor(Math.random()*5)];
        p.style.left = el.style.left;
        p.style.top  = el.style.top;
        const angle = (i/5)*360, rad = angle*Math.PI/180;
        const dist  = 40 + Math.random()*30;
        p.style.setProperty('--dx', Math.cos(rad)*dist+'px');
        p.style.setProperty('--dy', Math.sin(rad)*dist+'px');
        arena.appendChild(p);
        setTimeout(() => p.remove(), 700);
      }

      // Floating comment
      const com = document.createElement('div');
      com.textContent = COMMENTS[Math.floor(Math.random()*COMMENTS.length)];
      com.style.cssText = `position:absolute;left:${el.style.left};top:${el.style.top};color:var(--rose);font-family:var(--font-ui);font-size:0.75rem;pointer-events:none;z-index:10;animation:hitParticle 0.8s ease forwards;--dx:0px;--dy:-50px;font-weight:700;white-space:nowrap;`;
      arena.appendChild(com);
      setTimeout(() => com.remove(), 900);
      setTimeout(() => el.remove(), 350);

      // Trigger main.js love burst if available
      if (typeof burstLoveFromPhoto === 'function' && combo >= 3) burstLoveFromPhoto(combo);
    });
  }

  function startGame() {
    score = 0; combo = 1; timeLeft = 10;
    running = true;
    scoreEl.textContent = '0'; comboEl.textContent = 'x1'; timeEl.textContent = '10';
    startMsg.style.display = 'none';
    result.style.display   = 'none';
    // Clear existing targets
    arena.querySelectorAll('.pundung-target,.hit-particle').forEach(e => e.remove());

    spawnTarget();
    spawnInterval = setInterval(() => {
      const count = Math.min(1 + Math.floor((10-timeLeft)/3), 3);
      for (let i = 0; i < count; i++) setTimeout(spawnTarget, i * 200);
    }, 700);

    timer = setInterval(() => {
      timeLeft--;
      timeEl.textContent = timeLeft;
      if (timeLeft <= 0) endGame();
    }, 1000);
  }

  function endGame() {
    running = false;
    clearInterval(timer); clearInterval(spawnInterval);
    arena.querySelectorAll('.pundung-target').forEach(e => e.remove());

    let msg;
    if      (score >= 40) msg = `WOW ${score} POIN!! Kamu sadis bet namparin dia 😂💀`;
    else if (score >= 25) msg = `${score} poin! Namparin pundungnya kenceng banget 💪😂`;
    else if (score >= 15) msg = `${score} poin! Lumayan jago juga hehe 😄`;
    else if (score >= 5)  msg = `${score} poin... coba lagi dong sayang 🥺`;
    else                  msg = `${score} poin 💀 gak ada tenaga namparin atau kasian? 😂`;

    resultTxt.textContent = msg;
    result.style.display = 'flex';
    if (typeof showToast === 'function') showToast('Skor: ' + score + ' 🎯');
    if (typeof spawnNgakakRain === 'function') spawnNgakakRain(['😤','💥','⭐','😂'], 15);
  }

  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', startGame);
})();

/* ══════════════════════════════════════════════════════════════
   GAME 2 — TEBAK PERASAAN 💭
   5 questions with silly wrong answers. Always "cinta" is right.
══════════════════════════════════════════════════════════════ */
(function() {
  const QUESTIONS = [
    {
      emoji: '💭', q: 'Apa yang aku rasain tiap liat kamu pagi hari?',
      correct: 'Mau peluk erat banget 🫂',
      wrong: ['Mau tidur lagi 😴','Mau makan dulu 🍜','Mau nonton anime 📺']
    },
    {
      emoji: '😤', q: 'Waktu kamu pundung, aku ngerasa...?',
      correct: 'Mau rayu kamu terus 🥺',
      wrong: ['Seneng diem-dieman 😌','Mau main HP aja 📱','Mau kabur ke warung 🏃']
    },
    {
      emoji: '🌙', q: 'Tiap malem sebelum tidur aku mikirin...?',
      correct: 'Kamu mulu sampe ga bisa tidur 😍',
      wrong: ['Mie instan buat besok 🍜','Deadline yang menumpuk 😭','Kenapa langit gelap 🌚']
    },
    {
      emoji: '💌', q: 'Kalau bisa ngirim satu hal ke kamu, aku mau kirim...?',
      correct: 'Semua cintaku dalam satu paket 💝',
      wrong: ['Tugas PR yang belum dikerjain 📚','Tagihan listrik bulan ini 💸','Kode error yang belum kelar 💻']
    },
    {
      emoji: '🌸', q: 'Hal yang bikin aku senyum paling lebar adalah...?',
      correct: 'Senyum kamu yang bikin dunia berhenti 😊',
      wrong: ['Diskon 90% di marketplace 🛒','Internet ga lemot 📶','Baterai hp 100% 🔋']
    },
  ];

  const g2Content = document.getElementById('g2Content');
  const g2Result  = document.getElementById('g2Result');
  const g2Emoji   = document.getElementById('g2Emoji');
  const g2Question= document.getElementById('g2Question');
  const g2Options = document.getElementById('g2Options');
  const g2Feedback= document.getElementById('g2Feedback');
  const g2Num     = document.getElementById('g2Num');
  const g2Right   = document.getElementById('g2Right');
  const g2ResultEmoji = document.getElementById('g2ResultEmoji');
  const g2ResultText  = document.getElementById('g2ResultText');
  const g2RestartBtn  = document.getElementById('g2RestartBtn');

  let qIdx = 0, rightCount = 0;

  function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

  function showQuestion() {
    const q = QUESTIONS[qIdx];
    g2Num.textContent = qIdx + 1;
    g2Emoji.textContent = q.emoji;
    g2Question.textContent = q.q;
    g2Feedback.textContent = '';
    g2Options.innerHTML = '';

    const opts = shuffle([q.correct, ...q.wrong.slice(0, 3)]);
    opts.forEach(opt => {
      const btn = document.createElement('button');
      btn.classList.add('g2-opt');
      btn.textContent = opt;
      btn.addEventListener('click', () => handleAnswer(btn, opt === q.correct, q.correct));
      g2Options.appendChild(btn);
    });
  }

  function handleAnswer(btn, isCorrect, correctText) {
    g2Options.querySelectorAll('.g2-opt').forEach(b => {
      b.disabled = true;
      if (b.textContent === correctText) b.classList.add('correct');
    });

    if (isCorrect) {
      btn.classList.add('correct');
      rightCount++;
      g2Right.textContent = rightCount;
      g2Feedback.textContent = ['Yesss bener!! 🎉','Tau aja kamu 😍','Cerdas banget sayangku 💖','BETUL BANGET!! ✨'][Math.floor(Math.random()*4)];
      if (typeof burstLoveFromPhoto === 'function') burstLoveFromPhoto(8);
    } else {
      btn.classList.add('wrong');
      g2Feedback.textContent = ['Salah dong 😂 tapi tetep lucu!','Hahaha bukan itu 😂','Yakin nih? 😂 Keliatan deh!'][Math.floor(Math.random()*3)];
      if (typeof spawnNgakakRain === 'function') spawnNgakakRain(['😂','💀','🤣'], 6);
    }

    setTimeout(() => {
      qIdx++;
      if (qIdx < QUESTIONS.length) showQuestion();
      else showResult();
    }, 1200);
  }

  function showResult() {
    g2Content.style.display = 'none';
    g2Result.style.display = 'block';
    let emoji, msg;
    if (rightCount === 5) {
      emoji = '🏆'; msg = '5/5 PERFECT! Kamu tau banget isi hatiku sayang 🥺💖';
      if (typeof spawnNgakakRain === 'function') spawnNgakakRain(['🏆','💖','🌸','✨'], 20);
    } else if (rightCount >= 3) {
      emoji = '😊'; msg = `${rightCount}/5 — Lumayan kenal aku ya hehe 😊💕`;
    } else if (rightCount >= 1) {
      emoji = '😅'; msg = `${rightCount}/5 — Masih harus belajar kenal aku nih 😂`;
    } else {
      emoji = '💀'; msg = '0/5 💀 Ini salah semua... tapi aku tetep sayang kok 🥺';
      if (typeof spawnNgakakRain === 'function') spawnNgakakRain(['😂','💀','🤣'], 15);
    }
    g2ResultEmoji.textContent = emoji;
    g2ResultText.textContent = msg;
    if (typeof showToast === 'function') showToast(rightCount + '/5 bener ' + emoji);
  }

  function resetGame() {
    qIdx = 0; rightCount = 0;
    g2Right.textContent = '0';
    g2Result.style.display = 'none';
    g2Content.style.display = 'block';
    showQuestion();
  }

  g2RestartBtn.addEventListener('click', resetGame);

  // Init when modal opens
  document.getElementById('btnGame2').addEventListener('click', resetGame);
  document.getElementById('gmClose2').addEventListener('click', () => {
    g2Content.style.display = 'block';
    g2Result.style.display = 'none';
  });
})();

/* ══════════════════════════════════════════════════════════════
   GAME 3 — CATCH HEARTS 💖
   Move basket to catch ❤️, avoid 💔. 3 misses = game over.
══════════════════════════════════════════════════════════════ */
(function() {
  const arena    = document.getElementById('g3Arena');
  const basket   = document.getElementById('g3Basket');
  const startMsg = document.getElementById('g3StartMsg');
  const result   = document.getElementById('g3Result');
  const resultTxt= document.getElementById('g3ResultText');
  const scoreEl  = document.getElementById('g3Score');
  const missEl   = document.getElementById('g3Miss');
  const livesEl  = document.getElementById('g3Lives');
  const startBtn = document.getElementById('g3StartBtn');
  const restartBtn=document.getElementById('g3RestartBtn');

  let score = 0, miss = 0, running = false;
  let basketX = 50, spawnInterval = null, rafId = null;
  let items = [];
  const HEARTS    = ['❤️','💖','💗','💓','💕','🌸','💝'];
  const BAD       = ['💔','😤','🙄','💢'];
  const LIVES_MAP = ['❤️❤️❤️','❤️❤️🖤','❤️🖤🖤','🖤🖤🖤'];

  function getArenaW() { return arena.offsetWidth; }

  // Move basket: mouse + touch
  arena.addEventListener('pointermove', (e) => {
    if (!running) return;
    const rect = arena.getBoundingClientRect();
    basketX = ((e.clientX - rect.left) / rect.width) * 100;
    basketX = Math.max(5, Math.min(95, basketX));
    basket.style.left = basketX + '%';
  });

  function spawnItem() {
    if (!running) return;
    const isBad = Math.random() < 0.25;
    const el = document.createElement('div');
    el.classList.add('falling-item');
    el.textContent = isBad
      ? BAD[Math.floor(Math.random()*BAD.length)]
      : HEARTS[Math.floor(Math.random()*HEARTS.length)];
    el.dataset.bad = isBad ? '1' : '0';
    const x = 5 + Math.random() * 88;
    el.style.left = x + '%';
    const speed = 1.8 + Math.random() * 1.2 + (score * 0.04);
    el.style.animationDuration = speed + 's';
    arena.appendChild(el);
    items.push({ el, x, bad: isBad, speed });
  }

  function gameLoop() {
    if (!running) return;
    const aH = arena.offsetHeight;
    const bRect = basket.getBoundingClientRect();
    const aRect = arena.getBoundingClientRect();
    const bLeft = bRect.left - aRect.left;
    const bRight= bRect.right - aRect.left;
    const bTop  = bRect.top  - aRect.top;

    items = items.filter(item => {
      if (!item.el.parentNode) return false;
      const iRect = item.el.getBoundingClientRect();
      const iLeft = iRect.left - aRect.left;
      const iBottom= iRect.bottom - aRect.top;

      // Check catch
      if (iBottom >= bTop && iBottom <= bTop + 40 &&
          iLeft + iRect.width/2 >= bLeft && iLeft + iRect.width/2 <= bRight) {
        item.el.remove();
        if (item.bad) {
          // caught a bad item
          miss++;
          missEl.textContent = miss;
          livesEl.textContent = LIVES_MAP[Math.min(miss, 3)];
          flashArena('miss');
          if (typeof spawnNgakakRain === 'function') spawnNgakakRain(['😤','💢','😱'], 5);
          if (miss >= 3) { endGame(); return false; }
        } else {
          score++;
          scoreEl.textContent = score;
          flashArena('catch');
          if (score % 5 === 0 && typeof burstLoveFromPhoto === 'function') burstLoveFromPhoto(8);
        }
        return false;
      }

      // Missed falling off bottom
      if (iBottom > aH + 10) {
        item.el.remove();
        if (!item.bad) {
          // missed a heart
          miss++;
          missEl.textContent = miss;
          livesEl.textContent = LIVES_MAP[Math.min(miss, 3)];
          flashArena('miss');
          if (miss >= 3) { endGame(); return false; }
        }
        return false;
      }
      return true;
    });

    rafId = requestAnimationFrame(gameLoop);
  }

  function flashArena(type) {
    const f = document.createElement('div');
    f.classList.add('catch-flash');
    if (type === 'miss') f.classList.add('miss-flash');
    arena.appendChild(f);
    setTimeout(() => f.remove(), 350);
  }

  function startGame() {
    score = 0; miss = 0; running = true;
    items = [];
    scoreEl.textContent = '0'; missEl.textContent = '0';
    livesEl.textContent = LIVES_MAP[0];
    basket.style.left = '50%'; basketX = 50;
    startMsg.style.display = 'none';
    result.style.display = 'none';
    arena.querySelectorAll('.falling-item,.catch-flash').forEach(e => e.remove());

    spawnItem();
    spawnInterval = setInterval(spawnItem, 900);
    rafId = requestAnimationFrame(gameLoop);
  }

  function endGame() {
    running = false;
    clearInterval(spawnInterval);
    cancelAnimationFrame(rafId);
    arena.querySelectorAll('.falling-item').forEach(e => e.remove());

    let msg;
    if      (score >= 30) msg = `${score} hati!! Kamu nangkep cintaku semua 😭💖`;
    else if (score >= 20) msg = `${score} hati! Hampir sempurna sayang 💕`;
    else if (score >= 10) msg = `${score} hati, lumayan! Tapi sisanya kabur 😅`;
    else                  msg = `${score} hati doang? Cintaku kebanyakan kelewat 😂💔`;

    resultTxt.textContent = msg;
    result.style.display = 'flex';
    if (typeof showToast === 'function') showToast('Tangkap ' + score + ' hati! 💖');
    if (typeof spawnNgakakRain === 'function') spawnNgakakRain(score>=20?['💖','🌸','✨']:['😭','💔','😤'], 12);
  }

  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', startGame);

  document.getElementById('gmClose3').addEventListener('click', () => {
    running = false;
    clearInterval(spawnInterval);
    cancelAnimationFrame(rafId);
    items = [];
    startMsg.style.display = 'flex';
    result.style.display = 'none';
    arena.querySelectorAll('.falling-item,.catch-flash').forEach(e => e.remove());
  });
})();

/* ══════════════════════════════════════════════════════════════
   EASTER EGGS 🥚
   6 hidden triggers:
   1. Ketik "sayang"
   2. Tap foto 10x cepet
   3. Scroll ke bawah -> atas 3x cepet
   4. Long press big heart 2s
   5. Shaking device (mobile)
   6. Idle 30s
══════════════════════════════════════════════════════════════ */
const easterOverlay = document.getElementById('easterOverlay');
const easterInner   = document.getElementById('easterInner');

const EASTER_EGGS = [
  {
    emoji: '🌸', title: 'SECRET UNLOCKED!',
    msg: 'Kamu nulis "sayang"... lagi kangen aku ya? AKU JUGA SAYANG KAMU!!! 💖💖💖'
  },
  {
    emoji: '😵', title: 'FOTO OVERLOAD!!',
    msg: 'Ngetap fotonya 10x?? Stalker mode activated! Tapi aku suka kok 😂💕'
  },
  {
    emoji: '🏄', title: 'SCROLL MASTER!',
    msg: 'Bolak-balik scroll kayak lagi nyari sinyal... atau nyari aku? 🤭'
  },
  {
    emoji: '💖', title: 'SABAR BANGET!!',
    msg: 'Nahan heart 2 detik... kamu sabar banget ya. Aku yang harusnya belajar dari kamu 🥺'
  },
  {
    emoji: '📳', title: 'GOYANG GOYANG!!',
    msg: 'HP kamu goyang-goyang kayak hati aku waktu liat kamu 😭💘'
  },
  {
    emoji: '😴', title: 'KETIDURAN YA?',
    msg: 'Udah 30 detik nganggur... lagi ngelamunin aku bukan? Ngaku aja 😏🌸'
  },
];

let easterActive = false;
function triggerEaster(idx) {
  if (easterActive) return;
  easterActive = true;
  const egg = EASTER_EGGS[idx];
  easterInner.innerHTML = `
    <div class="easter-msg">
      <span class="easter-msg-emoji">${egg.emoji}</span>
      <h3>${egg.title}</h3>
      <p>${egg.msg}</p>
      <button class="easter-dismiss" id="easterDismiss">tutup 💌</button>
    </div>`;
  easterOverlay.style.pointerEvents = 'all';
  document.getElementById('easterDismiss').addEventListener('click', () => {
    easterInner.innerHTML = '';
    easterOverlay.style.pointerEvents = 'none';
    easterActive = false;
  });
  if (typeof spawnNgakakRain === 'function') spawnNgakakRain([egg.emoji,'✨','💫'], 15);
  if (typeof burstLoveFromPhoto === 'function') burstLoveFromPhoto(12);
}

// ── EGG 1: Ketik "sayang" ──
// (sudah ada "pundung" di main.js, ini "sayang")
let typed2 = '';
document.addEventListener('keydown', (e) => {
  typed2 += e.key.toLowerCase();
  if (typed2.includes('sayang')) { typed2 = ''; triggerEaster(0); }
  if (typed2.length > 20) typed2 = typed2.slice(-20);
});

// ── EGG 2: Tap foto 10x cepet ──
let tapCount = 0, tapTimer = null;
const photoFrameEgg = document.getElementById('photoFrameOuter');
if (photoFrameEgg) {
  photoFrameEgg.addEventListener('pointerdown', () => {
    tapCount++;
    clearTimeout(tapTimer);
    if (tapCount >= 10) { tapCount = 0; triggerEaster(1); }
    tapTimer = setTimeout(() => { tapCount = 0; }, 3000);
  });
}

// ── EGG 3: Scroll down-up 3x ──
let lastScrollY = 0, scrollDir = null, scrollFlip = 0, scrollFlipTimer = null;
window.addEventListener('scroll', () => {
  const sy = window.scrollY;
  const newDir = sy > lastScrollY ? 'down' : 'up';
  if (newDir !== scrollDir) {
    scrollDir = newDir;
    scrollFlip++;
    clearTimeout(scrollFlipTimer);
    scrollFlipTimer = setTimeout(() => scrollFlip = 0, 4000);
    if (scrollFlip >= 6) { scrollFlip = 0; triggerEaster(2); }
  }
  lastScrollY = sy;
});

// ── EGG 4: Long press big heart 2s ──
const bigHeartEgg = document.getElementById('bigHeart');
let heartHoldTimer = null;
if (bigHeartEgg) {
  bigHeartEgg.addEventListener('pointerdown', () => {
    heartHoldTimer = setTimeout(() => triggerEaster(3), 2000);
  });
  bigHeartEgg.addEventListener('pointerup', () => clearTimeout(heartHoldTimer));
  bigHeartEgg.addEventListener('pointercancel', () => clearTimeout(heartHoldTimer));
}

// ── EGG 5: Shake device (mobile) ──
let lastAcc = null, shakeCount = 0, shakeTimer = null;
if (window.DeviceMotionEvent) {
  window.addEventListener('devicemotion', (e) => {
    const acc = e.accelerationIncludingGravity;
    if (!acc) return;
    if (lastAcc) {
      const dx = Math.abs(acc.x - lastAcc.x);
      const dy = Math.abs(acc.y - lastAcc.y);
      if (dx + dy > 25) {
        shakeCount++;
        clearTimeout(shakeTimer);
        shakeTimer = setTimeout(() => shakeCount = 0, 2000);
        if (shakeCount >= 4) { shakeCount = 0; triggerEaster(4); }
      }
    }
    lastAcc = { x: acc.x, y: acc.y };
  });
}

// ── EGG 6: Idle 30s ──
let idleTimer = null;
function resetIdle() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => triggerEaster(5), 30000);
}
['mousemove','keydown','touchstart','scroll','click'].forEach(ev => {
  document.addEventListener(ev, resetIdle, { passive: true });
});
resetIdle();
