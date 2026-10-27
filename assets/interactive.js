/* =========================================================
   WAIE STUDIO • INTERACTIVE & MOTION ENGINE (interactive.js)
   Powers:
   1. Scroll Reveal (.reveal-on-scroll)
   2. Interactive Background Canvas (#bg-canvas)
   3. Interactive W▲!Ξ Studio Glyphs + Particle Bursts + Web Audio
   4. Gutzy 3D Coin Ritual Widget (#demo-ritueel)
   5. 3D Card Tilt (.tilt-card)
   6. Screenshot Carousel Controls, Drag Scroll & Lightbox Modal
   ========================================================= */

(function () {
  'use strict';

  const isEN = (document.documentElement.lang || '').toLowerCase().startsWith('en');

  /* ---------------------------------------------------------
     1. WEB AUDIO SYNTH (SUBTLE RETRO POP SFX)
  --------------------------------------------------------- */
  let audioCtx = null;
  let soundEnabled = true;

  function getAudioCtx() {
    if (!soundEnabled) return null;
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playTone(freq, type, duration, delay = 0, gainVal = 0.06) {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + delay;

      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(gainVal, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.02);
    } catch (_) {
      // Ignore audio errors when blocked by browser policy
    }
  }

  function playCoinFlipSound() {
    // Metallic coin ring sequence
    playTone(987.77, 'triangle', 0.12, 0.0, 0.07);  // B5
    playTone(1318.51, 'sine', 0.25, 0.06, 0.08);    // E6
    playTone(1975.53, 'sine', 0.35, 0.12, 0.05);    // B6
  }

  function playCoinLandSound(isHeads) {
    if (isHeads) {
      playTone(523.25, 'triangle', 0.14, 0.0, 0.07); // C5
      playTone(659.25, 'triangle', 0.16, 0.08, 0.07); // E5
      playTone(783.99, 'sine', 0.28, 0.16, 0.08);     // G5
    } else {
      playTone(440.0, 'triangle', 0.14, 0.0, 0.07);  // A4
      playTone(554.37, 'triangle', 0.16, 0.08, 0.07); // C#5
      playTone(659.25, 'sine', 0.28, 0.16, 0.08);     // E5
    }
  }

  /* ---------------------------------------------------------
     2. PARTICLE BURST HELPER
  --------------------------------------------------------- */
  function spawnParticleBurst(x, y, colors) {
    const palette = colors || ['#FFD13B', '#4F46E5', '#10B981', '#FF6584', '#38BDF8'];
    const container = document.createElement('div');
    container.className = 'particle-burst';
    container.style.left = x + 'px';
    container.style.top = y + 'px';
    document.body.appendChild(container);

    const count = 16;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('div');
      dot.className = 'particle-burst-dot';
      const size = 6 + Math.random() * 6;
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const dist = 36 + Math.random() * 54;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;

      dot.style.width = size + 'px';
      dot.style.height = size + 'px';
      dot.style.background = palette[i % palette.length];
      dot.style.setProperty('--tx', tx.toFixed(1) + 'px');
      dot.style.setProperty('--ty', ty.toFixed(1) + 'px');
      container.appendChild(dot);
    }

    setTimeout(() => {
      if (container.parentNode) container.parentNode.removeChild(container);
    }, 800);
  }

  /* ---------------------------------------------------------
     3. SCROLL REVEAL (.reveal-on-scroll)
  --------------------------------------------------------- */
  function initScrollReveal() {
    const revealEls = document.querySelectorAll('.reveal-on-scroll');
    if (!revealEls.length) return;

    if (!('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach((el) => observer.observe(el));
  }

  /* ---------------------------------------------------------
     4. INTERACTIVE STUDIO GLYPHS (W ▲ ! Ξ)
  --------------------------------------------------------- */
  function initInteractiveGlyphs() {
    const glyphs = document.querySelectorAll('.interactive-glyph');
    glyphs.forEach((glyph, idx) => {
      glyph.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const rect = glyph.getBoundingClientRect();
        const cx = rect.left + rect.width / 2 + window.scrollX;
        const cy = rect.top + rect.height / 2 + window.scrollY;

        const tones = [523.25, 659.25, 783.99, 1046.5];
        playTone(tones[idx % tones.length], 'triangle', 0.18, 0, 0.07);
        spawnParticleBurst(cx, cy);

        glyph.style.transform = 'scale(1.35) rotate(8deg)';
        setTimeout(() => {
          glyph.style.transform = '';
        }, 260);
      });
    });
  }

  /* ---------------------------------------------------------
     5. GUTZY 3D COIN DECISION RITUAL WIDGET
  --------------------------------------------------------- */
  function initDecisionWidget() {
    const coinWrap = document.getElementById('coin-3d');
    const flipBtn = document.getElementById('btn-flip-coin');
    const inputA = document.getElementById('choice-a-input');
    const inputB = document.getElementById('choice-b-input');
    const resultCard = document.getElementById('gut-result-card');
    const resultChoice = document.getElementById('gut-result-choice');
    const resultText = document.getElementById('gut-result-text');
    const presetPills = document.querySelectorAll('.preset-pill');

    if (!coinWrap || !flipBtn || !inputA || !inputB) return;

    const coinStage = coinWrap.closest('.coin-stage');
    let isFlipping = false;

    presetPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const valA = pill.getAttribute('data-a');
        const valB = pill.getAttribute('data-b');
        if (valA) inputA.value = valA;
        if (valB) inputB.value = valB;

        playTone(587.33, 'sine', 0.1, 0, 0.04);
        if (resultCard) resultCard.classList.remove('is-visible');
      });
    });

    function triggerFlip() {
      if (isFlipping) return;
      isFlipping = true;

      const optionA = (inputA.value || '').trim() || (isEN ? 'Option A' : 'Optie A');
      const optionB = (inputB.value || '').trim() || (isEN ? 'Option B' : 'Optie B');

      if (resultCard) resultCard.classList.remove('is-visible');

      // Pick random outcome: true = Heads (Option A), false = Tails (Option B)
      const isHeads = Math.random() < 0.5;
      const targetDeg = isHeads ? '1800deg' : '1980deg';

      coinWrap.classList.remove('is-flipping');
      if (coinStage) coinStage.classList.remove('is-flipping');
      coinWrap.style.transform = '';

      // Force reflow so animation restarts cleanly
      void coinWrap.offsetWidth;

      coinWrap.style.setProperty('--target-rotation', targetDeg);
      coinWrap.classList.add('is-flipping');
      if (coinStage) coinStage.classList.add('is-flipping');

      playCoinFlipSound();

      setTimeout(() => {
        coinWrap.classList.remove('is-flipping');
        if (coinStage) coinStage.classList.remove('is-flipping');
        coinWrap.style.transform = isHeads ? 'rotateY(0deg)' : 'rotateY(180deg)';

        playCoinLandSound(isHeads);

        const rect = coinWrap.getBoundingClientRect();
        spawnParticleBurst(
          rect.left + rect.width / 2 + window.scrollX,
          rect.top + rect.height / 2 + window.scrollY,
          isHeads ? ['#FFD13B', '#F59E0B', '#4F46E5'] : ['#FF6584', '#EC4899', '#10B981']
        );

        if (resultChoice && resultText && resultCard) {
          const chosenLabel = isHeads
            ? (isEN ? `HEADS (A): ${optionA}` : `KOP (A): ${optionA}`)
            : (isEN ? `TAILS (B): ${optionB}` : `MUNT (B): ${optionB}`);
          const otherOption = isHeads ? optionB : optionA;

          resultChoice.textContent = chosenLabel;
          resultText.textContent = isEN
            ? `Notice your instant gut reaction! Did you feel a wave of relief that "${isHeads ? optionA : optionB}" won, or a split-second of disappointment wishing it landed on "${otherOption}"? That feeling is your true answer.`
            : `Let op je eerste buikreactie! Voelde je direct opluchting dat "${isHeads ? optionA : optionB}" won, of een fractie van teleurstelling omdat je stiekem op "${otherOption}" hoopte? Dat gevoel is je échte antwoord.`;

          resultCard.classList.add('is-visible');
        }

        isFlipping = false;
      }, 1500);
    }

    flipBtn.addEventListener('click', triggerFlip);
    coinWrap.addEventListener('click', triggerFlip);
  }

  /* ---------------------------------------------------------
     6. 3D CARD TILT EFFECT (.tilt-card)
  --------------------------------------------------------- */
  function initTiltCards() {
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;

    const cards = document.querySelectorAll('.tilt-card');
    cards.forEach((card) => {
      // Keep large interactive containers subtle so inputs/buttons stay steady
      const isLargeBox =
        card.classList.contains('decision-widget-box') ||
        card.classList.contains('featured-card') ||
        card.classList.contains('company-box') ||
        card.classList.contains('receipt-highlight');

      const maxTilt = isLargeBox ? 1.8 : 5;

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -maxTilt;
        const rotateY = ((x - centerX) / centerX) * maxTilt;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ---------------------------------------------------------
     7. SCREENSHOTS CAROUSEL & LIGHTBOX MODAL
  --------------------------------------------------------- */
  function initScreenshotsAndLightbox() {
    const wrappers = document.querySelectorAll('.screenshots-wrapper');
    const allCards = Array.from(document.querySelectorAll('.screenshot-card'));

    wrappers.forEach((wrapper) => {
      const scroller = wrapper.querySelector('.screenshots-scroll');
      const prevBtn = wrapper.querySelector('.screenshots-nav-prev');
      const nextBtn = wrapper.querySelector('.screenshots-nav-next');

      if (!scroller) return;

      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          scroller.scrollBy({ left: -260, behavior: 'smooth' });
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          scroller.scrollBy({ left: 260, behavior: 'smooth' });
        });
      }
    });

    if (!allCards.length) return;

    // Build Lightbox Modal
    const modal = document.createElement('div');
    modal.className = 'lightbox-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `
      <button type="button" class="lightbox-arrow lightbox-arrow-prev" aria-label="Previous">‹</button>
      <div class="lightbox-content">
        <button type="button" class="lightbox-close-btn" aria-label="Close">✕</button>
        <img class="lightbox-img" src="" alt="">
        <div class="lightbox-caption"></div>
      </div>
      <button type="button" class="lightbox-arrow lightbox-arrow-next" aria-label="Next">›</button>
    `;
    document.body.appendChild(modal);

    const modalImg = modal.querySelector('.lightbox-img');
    const modalCaption = modal.querySelector('.lightbox-caption');
    const closeBtn = modal.querySelector('.lightbox-close-btn');
    const prevArrow = modal.querySelector('.lightbox-arrow-prev');
    const nextArrow = modal.querySelector('.lightbox-arrow-next');

    let currentIndex = 0;

    function showSlide(index) {
      currentIndex = (index + allCards.length) % allCards.length;
      const card = allCards[currentIndex];
      const img = card.querySelector('img');
      const caption = card.querySelector('.screenshot-caption');

      if (img) {
        modalImg.src = img.getAttribute('src');
        modalImg.alt = img.getAttribute('alt') || '';
      }
      if (caption) {
        modalCaption.textContent = caption.textContent;
      }
    }

    function openLightbox(index) {
      showSlide(index);
      modal.classList.add('is-active');
    }

    function closeLightbox() {
      modal.classList.remove('is-active');
    }

    allCards.forEach((card, idx) => {
      card.addEventListener('click', () => openLightbox(idx));
    });

    closeBtn.addEventListener('click', closeLightbox);
    prevArrow.addEventListener('click', (e) => {
      e.stopPropagation();
      showSlide(currentIndex - 1);
    });
    nextArrow.addEventListener('click', (e) => {
      e.stopPropagation();
      showSlide(currentIndex + 1);
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('is-active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showSlide(currentIndex - 1);
      if (e.key === 'ArrowRight') showSlide(currentIndex + 1);
    });
  }

  /* ---------------------------------------------------------
     8. SUBTLE INTERACTIVE BACKGROUND CANVAS (#bg-canvas)
  --------------------------------------------------------- */
  function initBackgroundCanvas() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let canvas = document.getElementById('bg-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'bg-canvas';
      document.body.prepend(canvas);
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const symbols = ['W', '▲', '!', 'Ξ', '•'];
    const colors = [
      'rgba(79, 70, 229, 0.10)',
      'rgba(234, 179, 8, 0.14)',
      'rgba(16, 185, 129, 0.10)',
      'rgba(255, 101, 132, 0.10)',
      'rgba(15, 23, 42, 0.06)'
    ];

    const particles = Array.from({ length: 18 }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      size: 12 + Math.random() * 10,
      symbol: symbols[i % symbols.length],
      color: colors[i % colors.length],
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.004
    }));

    function render() {
      ctx.clearRect(0, 0, width, height);
      ctx.font = '800 14px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;

        if (p.x < -30) p.x = width + 30;
        if (p.x > width + 30) p.x = -30;
        if (p.y < -30) p.y = height + 30;
        if (p.y > height + 30) p.y = -30;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.font = `800 ${p.size.toFixed(0)}px "Space Grotesk", sans-serif`;
        ctx.fillText(p.symbol, 0, 0);
        ctx.restore();
      }

      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  }

  /* ---------------------------------------------------------
     9. PLINKZY LIVE 90s NEON COIN-DROP ARCADE (#plinkzy-mini-canvas)
  --------------------------------------------------------- */
  function initPlinkzyMiniArcade() {
    const canvas =
      document.getElementById('plinkzy-mini-canvas') ||
      document.getElementById('dropzy-mini-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scoreEl =
      document.getElementById('plinkzy-live-score') ||
      document.getElementById('dropzy-live-score');
    const leftFlipBtn = document.getElementById('plinkzy-btn-left');
    const rightFlipBtn = document.getElementById('plinkzy-btn-right');
    const dropCoinBtn = document.getElementById('plinkzy-btn-drop');
    const modeBtns = document.querySelectorAll('.plinkzy-mode-btn');

    let score = 2450;
    let currentMode = 'classic'; // 'safe' | 'classic' | 'extreme'
    let aimAngleDeg = 0; // -32 to +32 degrees
    let autoSweepTime = 0;
    let userAiming = false;
    let userAimTimeout = null;
    let leftFlipperTimer = 0;
    let rightFlipperTimer = 0;

    const modeSlots = {
      safe: [
        { label: '2.5x', mult: 2.5, bg: '#064E3B', border: '#10B981', text: '#6EE7B7' },
        { label: '2x', mult: 2.0, bg: '#0F172A', border: '#38BDF8', text: '#38BDF8' },
        { label: '1.6x', mult: 1.6, bg: '#0F172A', border: '#00F0FF', text: '#00F0FF' },
        { label: '1.4x', mult: 1.4, bg: '#1E1B4B', border: '#818CF8', text: '#C7D2FE' },
        { label: '1.6x', mult: 1.6, bg: '#0F172A', border: '#00F0FF', text: '#00F0FF' },
        { label: '2x', mult: 2.0, bg: '#0F172A', border: '#38BDF8', text: '#38BDF8' },
        { label: '★ 3x ★', mult: 3.0, bg: '#422006', border: '#FFD13B', text: '#FFD13B', jackpot: true }
      ],
      classic: [
        { label: '4x', mult: 4.0, bg: '#3B0764', border: '#F472B6', text: '#F472B6' },
        { label: '2.5x', mult: 2.5, bg: '#311042', border: '#FB7185', text: '#FDA4AF' },
        { label: '1.8x', mult: 1.8, bg: '#0F172A', border: '#00F0FF', text: '#00F0FF' },
        { label: '1x', mult: 1.0, bg: '#064E3B', border: '#10B981', text: '#34D399' },
        { label: '2x', mult: 2.0, bg: '#0F172A', border: '#00F0FF', text: '#00F0FF' },
        { label: '3.5x', mult: 3.5, bg: '#311042', border: '#FB7185', text: '#FDA4AF' },
        { label: '★ 8x ★', mult: 8.0, bg: '#451A03', border: '#FFD13B', text: '#FFD13B', jackpot: true }
      ],
      extreme: [
        { label: '15x', mult: 15.0, bg: '#4C0519', border: '#FF007F', text: '#FF4DA6' },
        { label: '4x', mult: 4.0, bg: '#311042', border: '#C084FC', text: '#E9D5FF' },
        { label: '1.2x', mult: 1.2, bg: '#0F172A', border: '#38BDF8', text: '#38BDF8' },
        { label: '0.5x', mult: 0.5, bg: '#1E293B', border: '#64748B', text: '#94A3B8' },
        { label: '1.5x', mult: 1.5, bg: '#0F172A', border: '#38BDF8', text: '#38BDF8' },
        { label: '6x', mult: 6.0, bg: '#311042', border: '#F472B6', text: '#F9A8D4' },
        { label: '★ 60x ★', mult: 60.0, bg: '#451A03', border: '#FFD13B', text: '#FFD13B', jackpot: true }
      ]
    };

    modeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const m = btn.getAttribute('data-mode');
        if (!m || !modeSlots[m]) return;
        currentMode = m;
        modeBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
        playTone(783.99, 'triangle', 0.12, 0, 0.06);
      });
    });

    function resize() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width || 460;
      canvas.height = rect.height || 360;
    }
    resize();
    window.addEventListener('resize', resize);

    // Classic Pyramid Pegs (6 rows)
    const pegs = [];
    const rows = [
      { ry: 0.25, count: 3, spacing: 0.13 },
      { ry: 0.35, count: 4, spacing: 0.13 },
      { ry: 0.45, count: 5, spacing: 0.125 },
      { ry: 0.55, count: 6, spacing: 0.12 },
      { ry: 0.65, count: 7, spacing: 0.115 }
    ];
    rows.forEach((row, rIdx) => {
      const startX = 0.5 - ((row.count - 1) * row.spacing) / 2;
      for (let i = 0; i < row.count; i++) {
        const isStar = (rIdx === 1 && i === 1) || (rIdx === 3 && i === 4);
        pegs.push({
          rx: startX + i * row.spacing,
          ry: row.ry,
          isStar,
          pulse: 0
        });
      }
    });

    // Plinkzy Bumpers matching screenshot_1_gameplay.png
    const bumpers = [
      { rx: 0.24, ry: 0.44, r: 19, color: '#FF007F', label: '3x', pulse: 0, points: 150 },
      { rx: 0.76, ry: 0.44, r: 19, color: '#FF007F', label: '3x', pulse: 0, points: 150 },
      { rx: 0.50, ry: 0.51, r: 16, color: '#00F0FF', label: '⚡', pulse: 0, points: 200 }
    ];

    const coins = [];
    const shockwaves = [];
    const floatingTexts = [];
    const slotPulses = [0, 0, 0, 0, 0, 0, 0];

    function dropCoinFromCannon(customAngleDeg) {
      const deg = typeof customAngleDeg === 'number' ? customAngleDeg : aimAngleDeg;
      const rad = (deg * Math.PI) / 180;
      const speed = 3.8;
      const startX = canvas.width * 0.5 + Math.sin(rad) * 28;
      const startY = canvas.height * 0.11 + Math.cos(rad) * 24;

      const palette = ['#FFD13B', '#00F0FF', '#FF007F', '#34D399'];
      coins.push({
        x: startX,
        y: startY,
        vx: Math.sin(rad) * speed + (Math.random() - 0.5) * 0.45,
        vy: Math.cos(rad) * speed,
        r: 9.5,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.18,
        color: palette[Math.floor(Math.random() * palette.length)]
      });
      if (coins.length > 22) coins.shift();

      shockwaves.push({
        x: startX,
        y: startY,
        r: 4,
        maxR: 28,
        alpha: 0.9,
        color: '#FFD13B'
      });
      playTone(880, 'triangle', 0.1, 0, 0.05);
      playTone(1318.5, 'sine', 0.14, 0.04, 0.05);
    }

    function triggerLeftFlipper() {
      leftFlipperTimer = 1.0;
      playTone(587.33, 'sawtooth', 0.09, 0, 0.05);
      const fx = canvas.width * 0.23;
      const fy = canvas.height * 0.78;
      coins.forEach((c) => {
        if (Math.hypot(c.x - fx, c.y - fy) < 68) {
          c.vy = -5.8 - Math.random() * 1.5;
          c.vx = 2.2 + Math.random() * 2.0;
          score += 75;
          if (scoreEl) scoreEl.textContent = score.toLocaleString();
          floatingTexts.push({ x: fx, y: fy - 16, text: 'FLIP! +75', color: '#00F0FF', alpha: 1 });
        }
      });
    }

    function triggerRightFlipper() {
      rightFlipperTimer = 1.0;
      playTone(659.25, 'sawtooth', 0.09, 0, 0.05);
      const fx = canvas.width * 0.77;
      const fy = canvas.height * 0.78;
      coins.forEach((c) => {
        if (Math.hypot(c.x - fx, c.y - fy) < 68) {
          c.vy = -5.8 - Math.random() * 1.5;
          c.vx = -2.2 - Math.random() * 2.0;
          score += 75;
          if (scoreEl) scoreEl.textContent = score.toLocaleString();
          floatingTexts.push({ x: fx, y: fy - 16, text: 'FLIP! +75', color: '#FF007F', alpha: 1 });
        }
      });
    }

    if (leftFlipBtn) leftFlipBtn.addEventListener('click', triggerLeftFlipper);
    if (rightFlipBtn) rightFlipBtn.addEventListener('click', triggerRightFlipper);
    if (dropCoinBtn) {
      dropCoinBtn.addEventListener('click', () => {
        dropCoinFromCannon();
      });
    }

    // Mouse / Touch aiming on canvas
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const dx = mx - canvas.width * 0.5;
      const dy = Math.max(25, my - canvas.height * 0.09);
      const angle = (Math.atan2(dx, dy) * 180) / Math.PI;
      aimAngleDeg = Math.max(-34, Math.min(34, angle));
      userAiming = true;
      if (userAimTimeout) clearTimeout(userAimTimeout);
      userAimTimeout = setTimeout(() => {
        userAiming = false;
      }, 2600);
    });

    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      // Check if user clicked directly on left or right flipper zone
      if (my > canvas.height * 0.68 && my < canvas.height * 0.86) {
        if (mx < canvas.width * 0.36) {
          triggerLeftFlipper();
          return;
        }
        if (mx > canvas.width * 0.64) {
          triggerRightFlipper();
          return;
        }
      }

      const dx = mx - canvas.width * 0.5;
      const dy = Math.max(25, my - canvas.height * 0.09);
      const angle = Math.max(-34, Math.min(34, (Math.atan2(dx, dy) * 180) / Math.PI));
      aimAngleDeg = angle;
      dropCoinFromCannon(angle);
    });

    // Keyboard shortcuts when canvas is in viewport
    document.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const rect = canvas.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        triggerLeftFlipper();
      } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        triggerRightFlipper();
      }
    });

    // Seed initial coins
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        dropCoinFromCannon((i - 1.5) * 14);
      }, i * 320);
    }

    // Auto-drop a coin periodically so the board stays alive
    setInterval(() => {
      if (document.hidden) return;
      if (coins.length < 3) {
        dropCoinFromCannon();
      }
    }, 2400);

    function step() {
      const w = canvas.width;
      const h = canvas.height;

      if (!userAiming) {
        autoSweepTime += 0.022;
        aimAngleDeg = Math.sin(autoSweepTime) * 26;
      }

      if (leftFlipperTimer > 0) leftFlipperTimer = Math.max(0, leftFlipperTimer - 0.12);
      if (rightFlipperTimer > 0) rightFlipperTimer = Math.max(0, rightFlipperTimer - 0.12);

      // 1. Deep 90s Cyber Arcade Background
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#070414');
      grad.addColorStop(0.55, '#120A2A');
      grad.addColorStop(1, '#1B0B36');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Subtle perspective grid
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.07)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < w; gx += 36) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, h);
        ctx.stroke();
      }
      for (let gy = 0; gy < h; gy += 36) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
      }

      // Inner neon cabinet frame border
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
      ctx.lineWidth = 2;
      ctx.strokeRect(8, 8, w - 16, h - 16);

      // 2. Top Aiming Cannon & Laser Trajectory Line
      const cannonX = w * 0.5;
      const cannonY = h * 0.09;
      const aimRad = (aimAngleDeg * Math.PI) / 180;
      const reticleDist = h * 0.16;
      const reticleX = cannonX + Math.sin(aimRad) * reticleDist;
      const reticleY = cannonY + Math.cos(aimRad) * reticleDist;

      // Dashed trajectory line
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(cannonX, cannonY + 10);
      ctx.lineTo(reticleX, reticleY);
      ctx.strokeStyle = '#FFD13B';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);

      // Target reticle circle
      ctx.beginPath();
      ctx.arc(reticleX, reticleY, 9, 0, Math.PI * 2);
      ctx.strokeStyle = '#FFD13B';
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(reticleX, reticleY, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#FFD13B';
      ctx.fill();

      // Cannon nozzle (rotated)
      ctx.save();
      ctx.translate(cannonX, cannonY);
      ctx.rotate(-aimRad);
      ctx.fillStyle = '#F59E0B';
      ctx.strokeStyle = '#FFD13B';
      ctx.lineWidth = 2;
      ctx.fillRect(-9, 0, 18, 22);
      ctx.strokeRect(-9, 0, 18, 22);
      ctx.restore();

      // Cannon AIM pill badge
      ctx.fillStyle = '#1E1B4B';
      ctx.strokeStyle = '#FFD13B';
      ctx.lineWidth = 1.8;
      const pillW = 74;
      const pillH = 20;
      ctx.beginPath();
      ctx.roundRect(cannonX - pillW / 2, cannonY - 14, pillW, pillH, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FFD13B';
      ctx.font = '900 10px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const sign = aimAngleDeg > 0.5 ? '+' : '';
      ctx.fillText(`AIM: ${sign}${aimAngleDeg.toFixed(0)}°`, cannonX, cannonY - 4);
      ctx.restore();

      // 3. Draw Classic Pyramid Pegs & Star Mission Pegs
      pegs.forEach((p) => {
        const px = p.rx * w;
        const py = p.ry * h;
        if (p.pulse > 0) p.pulse = Math.max(0, p.pulse - 0.07);

        ctx.save();
        if (p.isStar) {
          ctx.beginPath();
          ctx.arc(px, py, 9 + p.pulse * 4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 209, 59, 0.2)';
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#FFD13B';
          ctx.stroke();
          ctx.fillStyle = '#FFD13B';
          ctx.font = '900 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('★', px, py + 0.5);
        } else {
          ctx.beginPath();
          ctx.arc(px, py, 5 + p.pulse * 3, 0, Math.PI * 2);
          ctx.fillStyle = p.pulse > 0.1 ? '#00F0FF' : '#38BDF8';
          ctx.shadowColor = '#00F0FF';
          ctx.shadowBlur = 6 + p.pulse * 8;
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = '#E0F2FE';
          ctx.stroke();
        }
        ctx.restore();
      });

      // 4. Draw & Update Bumpers
      bumpers.forEach((b) => {
        const bx = b.rx * w;
        const by = b.ry * h;
        if (b.pulse > 0) b.pulse = Math.max(0, b.pulse - 0.06);
        const rad = b.r + b.pulse * 6;

        ctx.save();
        ctx.beginPath();
        ctx.arc(bx, by, rad, 0, Math.PI * 2);
        ctx.fillStyle = '#130924';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 12 + b.pulse * 12;
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 10.5px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.label, bx, by);
        ctx.restore();
      });

      // 5. Draw Left & Right 3D Pinball Flippers (▲ FLIP / FLIP ▲)
      const leftPivotX = w * 0.14;
      const leftPivotY = h * 0.76;
      const leftAngle = 0.25 - leftFlipperTimer * 0.65;
      const flipperLen = Math.min(64, w * 0.16);

      ctx.save();
      ctx.translate(leftPivotX, leftPivotY);
      ctx.rotate(leftAngle);
      ctx.fillStyle = '#083344';
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 2.2;
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 8 + leftFlipperTimer * 10;
      ctx.beginPath();
      ctx.roundRect(0, -8, flipperLen, 16, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#00F0FF';
      ctx.font = '900 8.5px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('▲ FLIP', flipperLen * 0.52, 0);
      ctx.restore();

      const rightPivotX = w * 0.86;
      const rightPivotY = h * 0.76;
      const rightAngle = -0.25 + rightFlipperTimer * 0.65;

      ctx.save();
      ctx.translate(rightPivotX, rightPivotY);
      ctx.rotate(rightAngle);
      ctx.fillStyle = '#4C0519';
      ctx.strokeStyle = '#FF007F';
      ctx.lineWidth = 2.2;
      ctx.shadowColor = '#FF007F';
      ctx.shadowBlur = 8 + rightFlipperTimer * 10;
      ctx.beginPath();
      ctx.roundRect(-flipperLen, -8, flipperLen, 16, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#FF80BF';
      ctx.font = '900 8.5px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('FLIP ▲', -flipperLen * 0.52, 0);
      ctx.restore();

      // 6. Draw Bottom 7 Multiplier Slots
      const slots = modeSlots[currentMode] || modeSlots.classic;
      const slotCount = slots.length;
      const marginX = 12;
      const totalSlotW = w - marginX * 2;
      const slotGap = 4;
      const eachW = (totalSlotW - slotGap * (slotCount - 1)) / slotCount;
      const slotY = h - 36;
      const slotH = 26;

      slots.forEach((s, idx) => {
        const sx = marginX + idx * (eachW + slotGap);
        if (slotPulses[idx] > 0) slotPulses[idx] = Math.max(0, slotPulses[idx] - 0.06);
        const lift = slotPulses[idx] * 4;

        ctx.save();
        ctx.fillStyle = s.bg;
        ctx.strokeStyle = s.border;
        ctx.lineWidth = s.jackpot ? 2.2 : 1.5;
        if (slotPulses[idx] > 0 || s.jackpot) {
          ctx.shadowColor = s.border;
          ctx.shadowBlur = 6 + slotPulses[idx] * 12;
        }
        ctx.beginPath();
        ctx.roundRect(sx, slotY - lift, eachW, slotH, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = s.text;
        ctx.font = s.jackpot
          ? '900 9.5px "Space Grotesk", sans-serif'
          : '800 10px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(s.label, sx + eachW / 2, slotY - lift + slotH / 2 + 0.5);
        ctx.restore();
      });

      // 7. Update & Draw Falling Coins
      for (let cIdx = coins.length - 1; cIdx >= 0; cIdx--) {
        const c = coins[cIdx];
        c.vy += 0.14;
        c.x += c.vx;
        c.y += c.vy;
        c.rot += c.vRot;

        if (c.x < 14 + c.r) {
          c.x = 14 + c.r;
          c.vx = Math.abs(c.vx) * 0.82;
        }
        if (c.x > w - 14 - c.r) {
          c.x = w - 14 - c.r;
          c.vx = -Math.abs(c.vx) * 0.82;
        }

        // Peg collisions
        pegs.forEach((p) => {
          const px = p.rx * w;
          const py = p.ry * h;
          const dx = c.x - px;
          const dy = c.y - py;
          const dist = Math.hypot(dx, dy);
          const minDist = c.r + (p.isStar ? 8 : 5);
          if (dist < minDist && dist > 0.01) {
            const nx = dx / dist;
            const ny = dy / dist;
            c.x = px + nx * minDist;
            c.y = py + ny * minDist;
            c.vx = nx * 2.3 + (Math.random() - 0.5) * 0.9;
            c.vy = ny * 2.3;
            p.pulse = 1;
            if (p.isStar) {
              score += 100;
              if (scoreEl) scoreEl.textContent = score.toLocaleString();
              floatingTexts.push({ x: px, y: py - 10, text: '★ +100', color: '#FFD13B', alpha: 1 });
            }
          }
        });

        // Bumper collisions
        bumpers.forEach((b) => {
          const bx = b.rx * w;
          const by = b.ry * h;
          const dx = c.x - bx;
          const dy = c.y - by;
          const dist = Math.hypot(dx, dy);
          if (dist < c.r + b.r && dist > 0.01) {
            const nx = dx / dist;
            const ny = dy / dist;
            c.x = bx + nx * (c.r + b.r + 1);
            c.y = by + ny * (c.r + b.r + 1);
            c.vx = nx * 3.8 + (Math.random() - 0.5);
            c.vy = -Math.abs(ny * 3.8) - 1.0;
            b.pulse = 1;
            score += b.points;
            if (scoreEl) scoreEl.textContent = score.toLocaleString();
            shockwaves.push({ x: bx, y: by, r: b.r, maxR: b.r + 26, alpha: 0.9, color: b.color });
            floatingTexts.push({ x: bx, y: by - 12, text: '+' + b.points, color: b.color, alpha: 1 });
          }
        });

        // Passive flipper bounce
        const leftEndX = leftPivotX + Math.cos(leftAngle) * flipperLen * 0.65;
        const leftEndY = leftPivotY + Math.sin(leftAngle) * flipperLen * 0.65;
        if (Math.hypot(c.x - leftEndX, c.y - leftEndY) < c.r + 11 && c.vy > 0) {
          c.vy = -Math.abs(c.vy) * 0.85 - (leftFlipperTimer > 0 ? 3.5 : 0.6);
          c.vx += 1.4;
        }

        const rightEndX = rightPivotX - Math.cos(rightAngle) * flipperLen * 0.65;
        const rightEndY = rightPivotY - Math.sin(rightAngle) * flipperLen * 0.65;
        if (Math.hypot(c.x - rightEndX, c.y - rightEndY) < c.r + 11 && c.vy > 0) {
          c.vy = -Math.abs(c.vy) * 0.85 - (rightFlipperTimer > 0 ? 3.5 : 0.6);
          c.vx -= 1.4;
        }

        // Check landing in bottom multiplier baskets
        if (c.y >= slotY - 4) {
          const slotIdx = Math.max(
            0,
            Math.min(slotCount - 1, Math.floor(((c.x - marginX) / totalSlotW) * slotCount))
          );
          const landedSlot = slots[slotIdx];
          slotPulses[slotIdx] = 1;
          const pts = Math.round(100 * landedSlot.mult);
          score += pts;
          if (scoreEl) scoreEl.textContent = score.toLocaleString();

          shockwaves.push({
            x: c.x,
            y: slotY,
            r: 6,
            maxR: landedSlot.jackpot ? 44 : 26,
            alpha: 1,
            color: landedSlot.border
          });
          floatingTexts.push({
            x: c.x,
            y: slotY - 10,
            text: `${landedSlot.label} +${pts}`,
            color: landedSlot.text,
            alpha: 1
          });
          if (landedSlot.jackpot) {
            playCoinLandSound(true);
          }
          coins.splice(cIdx, 1);
          continue;
        }

        // Draw 3D Gold/Neon Star Coin
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rot);
        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.fillStyle = c.color;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#0F172A';
        ctx.stroke();

        ctx.fillStyle = '#0F172A';
        ctx.font = '900 9.5px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', 0, 0.5);
        ctx.restore();
      }

      // 8. Draw Shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.r += 1.8;
        sw.alpha -= 0.045;
        if (sw.alpha <= 0) {
          shockwaves.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = sw.alpha;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      // 9. Draw Floating Score Popups
      for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.y -= 0.85;
        ft.alpha -= 0.028;
        if (ft.alpha <= 0) {
          floatingTexts.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = ft.alpha;
        ctx.font = '900 11.5px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  /* ---------------------------------------------------------
     INIT ON DOM READY
  --------------------------------------------------------- */
  function initAll() {
    initScrollReveal();
    initInteractiveGlyphs();
    initDecisionWidget();
    initTiltCards();
    initScreenshotsAndLightbox();
    initBackgroundCanvas();
    initPlinkzyMiniArcade();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
