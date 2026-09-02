/**
 * ANANTHU S // PORTFOLIO ENGINE
 * LN4 HIGH-OCTANE CYBER-CARBON INTERACTIVE SYSTEM
 * Modules: Lenis Scroll, 3D Canvas Morph, Telemetry HUD, WebAudio SFX, Magnetic Cursor, 3D Tilt, Text Scrambler
 */

(() => {
  'use strict';

  // State
  const state = {
    audioEnabled: false,
    currentSectionIndex: 0,
    fps: 60,
    scrollProgress: 0,
    mouseX: window.innerWidth / 2,
    mouseY: window.innerHeight / 2,
    cursorX: window.innerWidth / 2,
    cursorY: window.innerHeight / 2,
    ringX: window.innerWidth / 2,
    ringY: window.innerHeight / 2,
    isHovering: false,
    activeBadge: '',
  };

  /* ==========================================================================
     1. LENIS SMOOTH SCROLL INITIALIZATION
     ========================================================================== */
  let lenis = null;
  const initSmoothScroll = () => {
    if (typeof window.Lenis !== 'undefined') {
      lenis = new window.Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 2.0,
      });

      lenis.on('scroll', ({ progress }) => {
        state.scrollProgress = Math.round(progress * 100);
      });

      // Integrate with internal RAF
      const raf = (time) => {
        lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    } else {
      window.addEventListener('scroll', () => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        state.scrollProgress = totalHeight > 0 ? Math.round((window.scrollY / totalHeight) * 100) : 0;
      }, { passive: true });
    }
  };

  /* ==========================================================================
     2. WEB AUDIO API SYNTHESIZER (CYBER SFX)
     ========================================================================== */
  let audioCtx = null;

  const initAudioContext = () => {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  };

  const playHoverTone = () => {
    if (!state.audioEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(780, audioCtx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.018, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.06);
    } catch {
      // Ignore audio policy errors
    }
  };

  const playClickTone = () => {
    if (!state.audioEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, audioCtx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch {}
  };

  const playPulseTone = () => {
    if (!state.audioEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.16);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.16);
    } catch {}
  };

  const setupAudioToggle = () => {
    const audioBtn = document.getElementById('audio-toggle');
    const soundState = document.getElementById('sound-state');
    if (!audioBtn) return;

    audioBtn.addEventListener('click', () => {
      initAudioContext();
      state.audioEnabled = !state.audioEnabled;

      if (state.audioEnabled) {
        audioBtn.classList.add('is-active');
        if (soundState) soundState.textContent = 'ON';
        playClickTone();
      } else {
        audioBtn.classList.remove('is-active');
        if (soundState) soundState.textContent = 'OFF';
      }
    });
  };

  /* ==========================================================================
     3. 3D MORPHING CANVAS & PARTICLE MESH ENGINE
     ========================================================================== */
  const initCyberCanvas = () => {
    const canvas = document.getElementById('cyber-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }, { passive: true });

    const particleCount = window.innerWidth < 768 ? 40 : 85;
    const particles = [];

    // Particle constructor
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        originX: Math.random() * width,
        originY: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 2 + 1,
        color: Math.random() > 0.6 ? '#d8ff00' : Math.random() > 0.4 ? '#ff5900' : '#00f0ff',
        alpha: Math.random() * 0.5 + 0.2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Section-specific morphing influence
      const scrollRatio = window.scrollY / (document.documentElement.scrollHeight || 1);
      const morphFactor = Math.sin(scrollRatio * Math.PI * 2) * 1.5;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Movement with inertia
        p.x += p.vx + morphFactor * 0.2;
        p.y += p.vy;

        // Wrap edges
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Mouse interaction (repel / gravitate)
        const dx = state.mouseX - p.x;
        const dy = state.mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 140) {
          const force = (140 - dist) / 140;
          p.x -= (dx / dist) * force * 3;
          p.y -= (dy / dist) * force * 3;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist2 = Math.hypot(p.x - p2.x, p.y - p2.y);

          if (dist2 < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = '#d8ff00';
            ctx.globalAlpha = (1 - dist2 / 110) * 0.15;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    };

    requestAnimationFrame(draw);
  };

  /* ==========================================================================
     4. TELEMETRY HUD LIVE UPDATER
     ========================================================================== */
  const initTelemetryHUD = () => {
    const fpsEl = document.getElementById('hud-fps');
    const scrollEl = document.getElementById('hud-scroll');
    const timeEl = document.getElementById('hud-time');
    const coordsEl = document.getElementById('hud-coords');

    let lastTime = performance.now();
    let frameCount = 0;

    const updateMetrics = () => {
      const now = performance.now();
      frameCount++;

      if (now - lastTime >= 500) {
        state.fps = Math.round((frameCount * 1000) / (now - lastTime));
        frameCount = 0;
        lastTime = now;

        if (fpsEl) fpsEl.textContent = state.fps.toString();
      }

      // Scroll Depth %
      if (scrollEl) {
        scrollEl.textContent = `${state.scrollProgress}%`;
      }

      // Live IST Clock
      if (timeEl) {
        const istDate = new Date();
        timeEl.textContent = istDate.toLocaleTimeString('en-GB', {
          timeZone: 'Asia/Kolkata',
          hour12: false,
        });
      }

      // Mouse Coordinates
      if (coordsEl) {
        coordsEl.textContent = `X:${Math.round(state.mouseX)} Y:${Math.round(state.mouseY)}`;
      }

      requestAnimationFrame(updateMetrics);
    };

    requestAnimationFrame(updateMetrics);
  };

  /* ==========================================================================
     5. MAGNETIC & MORPHING CUSTOM CURSOR
     ========================================================================== */
  const initCustomCursor = () => {
    const cursor = document.getElementById('custom-cursor');
    const badge = document.getElementById('cursor-badge');
    if (!cursor) return;

    window.addEventListener('pointermove', (e) => {
      state.mouseX = e.clientX;
      state.mouseY = e.clientY;
    }, { passive: true });

    // Smooth Lerp Animation Loop
    const renderCursor = () => {
      // Faster lerp for dot
      state.cursorX += (state.mouseX - state.cursorX) * 0.65;
      state.cursorY += (state.mouseY - state.cursorY) * 0.65;

      // Elastic trailing lerp for ring
      state.ringX += (state.mouseX - state.ringX) * 0.22;
      state.ringY += (state.mouseY - state.ringY) * 0.22;

      cursor.style.transform = `translate3d(${state.cursorX}px, ${state.cursorY}px, 0)`;

      const ring = cursor.querySelector('.cursor-ring');
      if (ring) {
        const deltaX = state.ringX - state.cursorX;
        const deltaY = state.ringY - state.cursorY;
        ring.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
      }

      requestAnimationFrame(renderCursor);
    };
    requestAnimationFrame(renderCursor);

    // Mouse Down States
    window.addEventListener('mousedown', () => cursor.classList.add('is-down'));
    window.addEventListener('mouseup', () => cursor.classList.remove('is-down'));

    // Interactive Hover Elements
    const interactiveElements = document.querySelectorAll(
      'a, button, [data-cursor], .tilt-card, input, textarea'
    );

    interactiveElements.forEach((el) => {
      el.addEventListener('pointerenter', () => {
        cursor.classList.add('is-hovering');
        playHoverTone();

        const cursorType = el.getAttribute('data-cursor');
        if (cursorType && badge) {
          cursor.classList.add('is-badge-active');
          badge.textContent = cursorType.toUpperCase();
        }
      });

      el.addEventListener('pointerleave', () => {
        cursor.classList.remove('is-hovering', 'is-badge-active');
        if (badge) badge.textContent = '';
      });

      el.addEventListener('click', () => {
        playClickTone();
      });
    });
  };

  /* ==========================================================================
     6. 3D CARD TILT & HOLOGRAPHIC SPECULAR HIGHLIGHT
     ========================================================================== */
  const init3DTilt = () => {
    const cards = document.querySelectorAll('[data-tilt]');

    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -9;
        const rotateY = ((x - centerX) / centerX) * 9;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        card.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
      });

      card.addEventListener('mouseenter', () => {
        card.style.transition = 'none';
      });
    });
  };

  /* ==========================================================================
     7. TEXT MATRIX SCRAMBLER EFFECT
     ========================================================================== */
  const initTextScrambler = () => {
    const scrambleElements = document.querySelectorAll('[data-scramble]');
    const glyphs = '_/\\*#+=-~[]{}0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    const scramble = (element) => {
      const originalText = element.getAttribute('data-original-text') || element.textContent.trim();
      element.setAttribute('data-original-text', originalText);

      let iteration = 0;
      const maxIterations = originalText.length;
      clearInterval(element.scrambleInterval);

      element.scrambleInterval = setInterval(() => {
        element.textContent = originalText
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) return originalText[index];
            return glyphs[Math.floor(Math.random() * glyphs.length)];
          })
          .join('');

        if (iteration >= maxIterations) {
          clearInterval(element.scrambleInterval);
          element.textContent = originalText;
        }

        iteration += 1 / 2;
      }, 30);
    };

    // Scramble on Scroll Trigger
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            scramble(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    scrambleElements.forEach((el) => {
      el.setAttribute('data-original-text', el.textContent.trim());
      observer.observe(el);
      el.addEventListener('mouseenter', () => scramble(el));
    });
  };

  /* ==========================================================================
     8. INTERACTIVE PROJECT DEMO SIMULATOR
     ========================================================================== */
  const initProjectSimulator = () => {
    const simBtn = document.getElementById('simulate-metric-btn');
    const focusVal = document.getElementById('demo-focus-val');
    const chartBars = document.querySelectorAll('#phone-chart .chart-bar i');

    if (!simBtn || !focusVal) return;

    simBtn.addEventListener('click', () => {
      playPulseTone();

      // Randomize focus score
      const newScore = Math.floor(Math.random() * 28) + 72;
      focusVal.textContent = newScore.toString();

      // Animate chart bars
      chartBars.forEach((bar) => {
        const randH = Math.floor(Math.random() * 70) + 25;
        bar.style.height = `${randH}%`;
      });

      simBtn.style.transform = 'scale(0.96)';
      setTimeout(() => {
        simBtn.style.transform = 'scale(1)';
      }, 150);
    });
  };

  /* ==========================================================================
     9. SCROLL REVEAL OBSERVER
     ========================================================================== */
  const initScrollReveals = () => {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    reveals.forEach((el) => observer.observe(el));
  };

  /* ==========================================================================
     10. MOBILE NAVIGATION CONTROLLER
     ========================================================================== */
  const initMobileNav = () => {
    const toggle = document.querySelector('[data-menu-toggle]');
    const nav = document.querySelector('[data-nav]');
    if (!toggle || !nav) return;

    const toggleMenu = () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', (!isOpen).toString());
      nav.classList.toggle('is-open', !isOpen);
      document.body.classList.toggle('menu-is-open', !isOpen);
    };

    toggle.addEventListener('click', toggleMenu);

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
        document.body.classList.remove('menu-is-open');
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        toggleMenu();
        toggle.focus();
      }
    });
  };

  /* ==========================================================================
     11. FOOTER DYNAMIC YEAR
     ========================================================================== */
  const updateYear = () => {
    const yearNodes = document.querySelectorAll('[data-year]');
    const currentYear = new Date().getFullYear();
    yearNodes.forEach((node) => {
      node.textContent = currentYear.toString();
    });
  };

  /* ==========================================================================
     INITIALIZE ALL ENGINES
     ========================================================================== */
  const init = () => {
    document.documentElement.classList.remove('no-js');
    document.documentElement.classList.add('js');

    initSmoothScroll();
    initAudioContext();
    setupAudioToggle();
    initCyberCanvas();
    initTelemetryHUD();
    initCustomCursor();
    init3DTilt();
    initTextScrambler();
    initProjectSimulator();
    initScrollReveals();
    initMobileNav();
    updateYear();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
