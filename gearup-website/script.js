/* ── GearUp Landing — script.js ─────────────────────────────── */

/* ── NAV: scroll shadow + hamburger ──────────────────────────── */
const nav        = document.getElementById('nav');
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

hamburger.addEventListener('click', () => {
  const open = hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', open);
});
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

/* ── SCROLL REVEAL ────────────────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const delay = parseInt(el.dataset.delay || '0', 10);
    setTimeout(() => el.classList.add('visible'), delay);
    revealObserver.unobserve(el);
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .reveal-right').forEach(el => revealObserver.observe(el));

/* ── NAV ACTIVE LINK ─────────────────────────────────────────── */
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id], div[id]');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
  });
}, { threshold: 0.3, rootMargin: '-64px 0px 0px 0px' });
sections.forEach(s => sectionObserver.observe(s));

/* ── SPEC CHIPS staggered entrance ──────────────────────────── */
const chips = document.querySelectorAll('.spec-chip');
chips.forEach(c => { c.style.opacity = '0'; c.style.transform = 'translateY(16px)'; c.style.transition = 'opacity .4s ease, transform .4s ease'; });
const chipObs = new IntersectionObserver(entries => {
  if (!entries[0].isIntersecting) return;
  chips.forEach((c, i) => setTimeout(() => { c.style.opacity = '1'; c.style.transform = 'translateY(0)'; }, i * 60));
  chipObs.disconnect();
}, { threshold: 0.3 });
if (chips.length) chipObs.observe(chips[0].closest('.specs-grid') || chips[0]);

/* ── HERO PHONE float ────────────────────────────────────────── */
const heroPhone = document.querySelector('.hero-phone .phone-mockup');
if (heroPhone) {
  const s = document.createElement('style');
  s.textContent = '@keyframes phoneFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}';
  document.head.appendChild(s);
  heroPhone.style.animation = 'phoneFloat 5s ease-in-out infinite';
}

/* ── FEATURE CARD tilt ───────────────────────────────────────── */
if (window.matchMedia('(hover:hover)').matches) {
  document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `perspective(600px) rotateY(${x*6}deg) rotateX(${-y*4}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

/* ── STAT count-up ───────────────────────────────────────────── */
function countUp(el, target, suffix, dur = 1200) {
  const start = performance.now();
  const dec = target % 1 !== 0;
  (function tick(now) {
    const p = Math.min((now - start) / dur, 1);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = (dec ? (target * e).toFixed(1) : Math.round(target * e)) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  })(start);
}
const statsObs = new IntersectionObserver(entries => {
  if (!entries[0].isIntersecting) return;
  document.querySelectorAll('.stat-number').forEach(el => {
    const t = el.textContent.trim();
    if (t.includes('500')) countUp(el, 500, '+');
    else if (t.includes('4.8')) countUp(el, 4.8, '★');
  });
  statsObs.disconnect();
}, { threshold: 0.8 });
const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObs.observe(heroStats);

/* ══════════════════════════════════════════════════════════════
   SCREENSHOTS — Owner / Mechanic toggle + scroll-driven panels
   + autoplay that cycles through both sides
   ══════════════════════════════════════════════════════════════ */
(function () {
  /* ── Config ──────────────────────────────────────────────── */
  const SIDES = {
    owner: {
      panels : 7,
      labels : ['Login','Register','Home','Find a Mechanic','SOS Emergency','Jobs & Chat','Wallet & Profile'],
      title  : 'The owner experience',
      desc   : 'Everything a car owner needs, in one clean app. Scroll through each screen below.',
    },
    mechanic: {
      panels : 6,
      labels : ['Home','Jobs','Chat','Parts Market','Wallet & Earnings','Profile'],
      title  : 'The mechanic experience',
      desc   : 'Every tool a mechanic needs to find work, manage jobs, and grow their business.',
    },
  };

  const AUTOPLAY_INTERVAL = 4500; // ms per panel

  /* ── DOM refs ─────────────────────────────────────────────── */
  const outer        = document.getElementById('screenshots');
  const track        = document.getElementById('ss-track');
  const dotsEl       = document.getElementById('ss-dots');
  const labelEl      = document.getElementById('ss-label');
  const ctrEl        = document.getElementById('ss-counter');
  const btnPrev      = document.getElementById('ss-prev');
  const btnNext      = document.getElementById('ss-next');
  const playBtn      = document.getElementById('ss-slideshow-btn');
  const playIcon     = document.getElementById('ss-play-icon');
  const btnLabel     = document.getElementById('ss-btn-label');
  const mainTitle    = document.getElementById('ss-main-title');
  const mainDesc     = document.getElementById('ss-main-desc');
  const toggleOwner  = document.getElementById('ss-toggle-owner');
  const toggleMech   = document.getElementById('ss-toggle-mechanic');

  if (!outer || !track) return;

  /* ── State ────────────────────────────────────────────────── */
  let activeSide  = 'owner';   // 'owner' | 'mechanic'
  let playing     = false;
  let timer       = null;

  /* ── Helpers ──────────────────────────────────────────────── */
  function cfg() { return SIDES[activeSide]; }

  function panelScrollTop(index) {
    const n = cfg().panels;
    index = Math.max(0, Math.min(index, n - 1));
    const outerTop  = outer.getBoundingClientRect().top + window.scrollY;
    const maxScroll = outer.offsetHeight - window.innerHeight;
    return outerTop + (index / (n - 1)) * maxScroll;
  }

  function currentIndex() {
    const n = cfg().panels;
    const rect      = outer.getBoundingClientRect();
    const maxScroll = outer.offsetHeight - window.innerHeight;
    const scrolled  = Math.max(0, Math.min(-rect.top, maxScroll));
    return Math.round((scrolled / maxScroll) * (n - 1));
  }

  /* ── Apply active side ────────────────────────────────────── */
  function applySide(side, scrollToTop) {
    activeSide = side;
    mobileIndex = 0;
    const c = cfg();

    /* On mobile the section is a single viewport — no scroll-through */
    if (isMobile()) {
      outer.style.height = 'calc(100vh - 56px)';
    } else {
      outer.style.height = (c.panels * 100) + 'vh';
    }

    /* Header text */
    if (mainTitle) mainTitle.textContent = c.title;
    if (mainDesc)  mainDesc.textContent  = c.desc;

    /* Toggle button active state */
    toggleOwner.classList.toggle('active', side === 'owner');
    toggleMech.classList.toggle('active',  side === 'mechanic');

    /* Show / hide panels */
    track.querySelectorAll('.ss-panel-mechanic').forEach(p => p.classList.toggle('ss-side-active', side === 'mechanic'));

    /* Show / hide dots */
    dotsEl.querySelectorAll('.ss-dot').forEach(d => {
      const dSide = d.dataset.side;
      if (dSide === 'mechanic') {
        d.classList.toggle('ss-dot-visible', side === 'mechanic');
      }
      if (dSide === 'owner') {
        d.style.display = side === 'owner' ? '' : 'none';
      }
    });

    /* Re-bind dot click listeners for the active side */
    dotsEl.querySelectorAll(`.ss-dot[data-side="${side}"]`).forEach(dot => {
      dot.onclick = () => {
        const idx = parseInt(dot.dataset.index, 10);
        if (isMobile()) {
          setMobileIndex(idx);
        } else {
          window.scrollTo({ top: panelScrollTop(idx), behavior: 'smooth' });
        }
      };
    });

    if (!isMobile() && scrollToTop) {
      const target = outer.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: target, behavior: 'smooth' });
    }

    updateUI(0);
  }

  /* ── Track offset calculation ─────────────────────────────── */
  // Owner panels occupy positions 0-6 in the flex track.
  // Mechanic panels occupy positions 7-19.
  // When mechanic is active, translateX must skip past the owner block.
  function trackOffset(logicalIndex) {
    const ownerPanels = SIDES.owner.panels;
    const physicalIndex = activeSide === 'mechanic'
      ? ownerPanels + logicalIndex
      : logicalIndex;
    return physicalIndex * 100;  // in vw units
  }

  /* ── Update UI ────────────────────────────────────────────── */
  function updateUI(index) {
    const c = cfg();
    /* Slide track */
    track.style.transform = `translateX(-${trackOffset(index)}vw)`;
    /* Dots */
    dotsEl.querySelectorAll(`.ss-dot[data-side="${activeSide}"]`).forEach(d => {
      d.classList.toggle('active', parseInt(d.dataset.index, 10) === index);
    });
    /* Label / counter */
    if (labelEl) labelEl.textContent = c.labels[index] || '';
    if (ctrEl)   ctrEl.textContent   = `${index + 1} / ${c.panels}`;
    /* Arrow states */
    if (btnPrev) btnPrev.disabled = index === 0;
    if (btnNext) btnNext.disabled = index === c.panels - 1;
  }

  /* ── Scroll handler (desktop only) ───────────────────────── */
  function onScroll() {
    if (isMobile()) return;
    const n = cfg().panels;
    const rect      = outer.getBoundingClientRect();
    const maxScroll = outer.offsetHeight - window.innerHeight;
    const scrolled  = Math.max(0, Math.min(-rect.top, maxScroll));
    const progress  = maxScroll > 0 ? scrolled / maxScroll : 0;
    const rawIndex  = progress * (n - 1);
    const index     = Math.round(rawIndex);

    /* Smooth real-time slide */
    const ownerPanels = SIDES.owner.panels;
    const physicalRaw = activeSide === 'mechanic' ? ownerPanels + rawIndex : rawIndex;
    track.style.transform = `translateX(-${physicalRaw * 100}vw)`;

    /* Dots / label / counter / arrows */
    dotsEl.querySelectorAll(`.ss-dot[data-side="${activeSide}"]`).forEach(d => {
      d.classList.toggle('active', parseInt(d.dataset.index, 10) === index);
    });
    if (labelEl) labelEl.textContent = cfg().labels[index] || '';
    if (ctrEl)   ctrEl.textContent   = `${index + 1} / ${n}`;
    if (btnPrev) btnPrev.disabled = index === 0;
    if (btnNext) btnNext.disabled = index === n - 1;
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Arrow buttons ────────────────────────────────────────── */
  if (btnPrev) btnPrev.addEventListener('click', () => window.scrollTo({ top: panelScrollTop(currentIndex() - 1), behavior: 'smooth' }));
  if (btnNext) btnNext.addEventListener('click', () => window.scrollTo({ top: panelScrollTop(currentIndex() + 1), behavior: 'smooth' }));

  /* ── Toggle buttons ───────────────────────────────────────── */
  if (toggleOwner)  toggleOwner.addEventListener('click',  () => { stopPlay(); applySide('owner',    true); });
  if (toggleMech)   toggleMech.addEventListener('click',   () => { stopPlay(); applySide('mechanic', true); });

  /* ── Autoplay ─────────────────────────────────────────────── */
  function fadeToPanel(side, index) {
    track.style.transition = 'opacity .4s ease';
    track.style.opacity = '0';
    setTimeout(() => {
      applySide(side, false);
      if (!isMobile()) {
        window.scrollTo({ top: panelScrollTop(index), behavior: 'instant' });
      }
      track.style.opacity = '1';
      setTimeout(() => { track.style.transition = ''; }, 450);
    }, 380);
  }

  function activeIndex() {
    return isMobile() ? mobileIndex : currentIndex();
  }

  function advance() {
    const n    = cfg().panels;
    const next = activeIndex() + 1;

    if (next < n) {
      if (isMobile()) {
        setMobileIndex(next);
      } else {
        window.scrollTo({ top: panelScrollTop(next), behavior: 'smooth' });
      }
    } else if (activeSide === 'owner') {
      fadeToPanel('mechanic', 0);
    } else {
      fadeToPanel('owner', 0);
    }
  }

  function startPlay() {
    playing = true;
    playBtn.classList.add('playing');
    playBtn.setAttribute('aria-pressed', 'true');
    playBtn.setAttribute('aria-label', 'Pause autoplay');
    playIcon.setAttribute('data-lucide', 'pause');
    lucide.createIcons();
    btnLabel.textContent = 'Pause';
    timer = setInterval(advance, AUTOPLAY_INTERVAL);
  }

  function stopPlay() {
    playing = false;
    clearInterval(timer);
    timer = null;
    if (!playBtn) return;
    playBtn.classList.remove('playing');
    playBtn.setAttribute('aria-pressed', 'false');
    playBtn.setAttribute('aria-label', 'Start autoplay');
    playIcon.setAttribute('data-lucide', 'play');
    lucide.createIcons();
    btnLabel.textContent = 'Autoplay';
  }

  if (playBtn) {
    playBtn.addEventListener('click', () => { if (playing) stopPlay(); else startPlay(); });
  }

  /* Stop autoplay when user scrolls away from the section entirely */
  window.addEventListener('scroll', () => {
    if (!playing) return;
    const rect = outer.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) stopPlay();
  }, { passive: true });

  /* ── Mobile detection ────────────────────────────────────── */
  function isMobile() { return window.innerWidth <= 768; }

  /* ── Mobile panel state (index driven, not scroll driven) ── */
  let mobileIndex = 0;

  function setMobileIndex(idx) {
    const n = cfg().panels;
    mobileIndex = Math.max(0, Math.min(idx, n - 1));
    updateUI(mobileIndex);
  }

  /* ── Touch swipe ──────────────────────────────────────────── */
  let touchStartX  = 0;
  let touchStartY  = 0;
  let touchDeltaX  = 0;
  let touchLocked  = null; // 'h' = horizontal, 'v' = vertical, null = undecided

  const sticky = document.querySelector('.ss-sticky');

  sticky.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchDeltaX = 0;
    touchLocked = null;
  }, { passive: true });

  sticky.addEventListener('touchmove', e => {
    if (!isMobile()) return;
    const dx = e.touches[0].clientX - touchStartX;
    const dy = e.touches[0].clientY - touchStartY;

    /* Decide lock direction once we have enough movement */
    if (touchLocked === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      touchLocked = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
    }

    if (touchLocked === 'h') {
      /* Horizontal swipe — block vertical scroll and show live drag on track */
      e.preventDefault();
      touchDeltaX = dx;
      const ownerPanels = SIDES.owner.panels;
      const physicalBase = activeSide === 'mechanic'
        ? (ownerPanels + mobileIndex) * 100
        : mobileIndex * 100;
      /* Clamp drag to ±60vw so it feels tethered */
      const dragVw = Math.max(-60, Math.min(60, (dx / window.innerWidth) * 100));
      track.style.transition = 'none';
      track.style.transform  = `translateX(calc(-${physicalBase}vw + ${dragVw}vw))`;
    }
    /* If vertical — do nothing, let browser scroll normally */
  }, { passive: false });

  sticky.addEventListener('touchend', e => {
    if (!isMobile() || touchLocked !== 'h') return;

    const dx = e.changedTouches[0].clientX - touchStartX;
    const threshold = window.innerWidth * 0.25; // 25% of screen width

    /* Snap to next/prev or back to current */
    track.style.transition = '';
    if (dx < -threshold && mobileIndex < cfg().panels - 1) {
      setMobileIndex(mobileIndex + 1);
    } else if (dx > threshold && mobileIndex > 0) {
      setMobileIndex(mobileIndex - 1);
    } else {
      updateUI(mobileIndex); // snap back
    }
    touchDeltaX = 0;
    touchLocked = null;
  }, { passive: true });

  /* ── On resize — recalculate height and re-render ─────────── */
  window.addEventListener('resize', () => {
    applySide(activeSide, false);
    if (isMobile()) {
      updateUI(mobileIndex);
    } else {
      onScroll();
    }
  }, { passive: true });

  /* ── Init ─────────────────────────────────────────────────── */
  applySide('owner', false);
  onScroll();
})();

/* ── Final icon render ───────────────────────────────────────── */
lucide.createIcons();
