/* ── GearUp Landing Page — script.js ────────────────────────── */

/* ── NAV: scroll-shadow + mobile menu ─────────────────────────── */
const nav       = document.getElementById('nav');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

hamburger.addEventListener('click', () => {
  const open = hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', open);
});

// Close mobile menu on link click
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
  });
});

/* ── SCROLL REVEAL ─────────────────────────────────────────────── */
function buildObserver(extraDelay = 0) {
  return new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const delay = parseInt(el.dataset.delay || '0', 10) + extraDelay;
      setTimeout(() => el.classList.add('visible'), delay);
      observer.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
}

const observer = buildObserver();

document.querySelectorAll('.reveal, .reveal-right').forEach(el => {
  observer.observe(el);
});

/* ── SMOOTH ACTIVE NAV LINK HIGHLIGHTING ─────────────────────── */
const sections  = document.querySelectorAll('section[id], div[id]');
const navLinks  = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.getAttribute('id');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === `#${id}`);
    });
  });
}, { threshold: 0.3, rootMargin: '-64px 0px 0px 0px' });

sections.forEach(s => sectionObserver.observe(s));

/* ── SPEC CHIPS: staggered entrance ─────────────────────────── */
const specChips = document.querySelectorAll('.spec-chip');
const chipObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    specChips.forEach((chip, i) => {
      setTimeout(() => {
        chip.style.opacity    = '1';
        chip.style.transform  = 'translateY(0)';
      }, i * 60);
    });
    chipObserver.disconnect();
  });
}, { threshold: 0.3 });

specChips.forEach(chip => {
  chip.style.opacity   = '0';
  chip.style.transform = 'translateY(16px)';
  chip.style.transition = 'opacity .4s ease, transform .4s ease';
});

if (specChips.length) chipObserver.observe(specChips[0].closest('.specs-grid') || specChips[0]);

/* ── STEP NUMBERS: count-up on enter ────────────────────────── */
const stepNumbers = document.querySelectorAll('.step-number');
const stepObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    stepNumbers.forEach((el, i) => {
      setTimeout(() => {
        el.style.transform = 'scale(1.15)';
        setTimeout(() => el.style.transform = 'scale(1)', 200);
      }, i * 120);
    });
    stepObserver.disconnect();
  });
}, { threshold: 0.5 });

if (stepNumbers.length) stepObserver.observe(stepNumbers[0]);
stepNumbers.forEach(el => {
  el.style.transition = 'transform .2s cubic-bezier(.34,1.56,.64,1)';
});

/* ── HERO PHONE: subtle float animation ─────────────────────── */
const heroPhoone = document.querySelector('.hero-phone .phone-mockup');
if (heroPhoone) {
  heroPhoone.style.animation = 'phoneFloat 5s ease-in-out infinite';
}

/* Inject the keyframes dynamically so they live alongside the JS */
const floatStyle = document.createElement('style');
floatStyle.textContent = `
  @keyframes phoneFloat {
    0%, 100% { transform: translateY(0px);  }
    50%       { transform: translateY(-10px); }
  }
`;
document.head.appendChild(floatStyle);

/* ── FEATURE CARDS: tilt on hover (desktop only) ────────────── */
if (window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect  = card.getBoundingClientRect();
      const x     = (e.clientX - rect.left) / rect.width  - 0.5;
      const y     = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 4}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ── STATS: count-up animation ──────────────────────────────── */
function animateCount(el, target, suffix, duration = 1200) {
  const start     = performance.now();
  const isDecimal = target % 1 !== 0;
  const update    = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const ease     = 1 - Math.pow(1 - progress, 3); // cubic ease-out
    const current  = isDecimal
      ? (target * ease).toFixed(1)
      : Math.round(target * ease);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const stats = [
      { selector: '.stat-number',                 target: 500,  suffix: '+',   label: 'Verified Mechanics' },
      { selector: '.stat:nth-child(3) .stat-number', target: 4.8,  suffix: '★',  label: 'Average Rating' },
    ];
    document.querySelectorAll('.stat-number').forEach((el, i) => {
      const raw = el.textContent.trim();
      if (raw.includes('500')) animateCount(el, 500, '+');
      else if (raw.includes('4.8')) animateCount(el, 4.8, '★');
    });
    statsObserver.disconnect();
  });
}, { threshold: 0.8 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);

/* ── SOS BUTTON: pulse glow ─────────────────────────────────── */
const sosPulseStyle = document.createElement('style');
sosPulseStyle.textContent = `
  .mock-sos-btn {
    animation: sosGlow 2.5s ease-in-out infinite;
  }
  @keyframes sosGlow {
    0%, 100% { box-shadow: 0 4px 12px rgba(220,38,38,.4); }
    50%       { box-shadow: 0 4px 28px rgba(220,38,38,.75); }
  }
`;
document.head.appendChild(sosPulseStyle);


/* ── SCREENSHOTS: scroll-driven horizontal panels ────────────── */
(function () {
  const outer   = document.getElementById('screenshots');
  const track   = document.getElementById('ss-track');
  const dots    = Array.from(document.querySelectorAll('.ss-dot'));
  const label   = document.getElementById('ss-label');
  const counter = document.getElementById('ss-counter');
  const PANELS  = 5;

  const LABELS = [
    'Getting Started',
    'Find a Mechanic',
    'SOS Emergency',
    'Jobs & Chat',
    'Wallet & Profile',
  ];

  if (!outer || !track) return;

  function update() {
    const outerRect  = outer.getBoundingClientRect();
    const outerH     = outer.offsetHeight;
    const stickyH    = window.innerHeight;

    // How far we've scrolled into the outer container (0 → outerH - stickyH)
    const scrolled   = Math.max(0, -outerRect.top);
    const maxScroll  = outerH - stickyH;
    const progress   = Math.min(1, scrolled / maxScroll); // 0–1

    // Map progress → panel index (0–4)
    const rawIndex   = progress * (PANELS - 1);
    const index      = Math.round(rawIndex);

    // Slide track
    track.style.transform = `translateX(${-rawIndex * 100}vw)`;

    // Dots + label
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
    if (label)   label.textContent   = LABELS[index];
    if (counter) counter.textContent = `${index + 1} / ${PANELS}`;
  }

  // Dot clicks: scroll to the matching position inside ss-outer
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      const outerTop  = outer.getBoundingClientRect().top + window.scrollY;
      const outerH    = outer.offsetHeight;
      const stickyH   = window.innerHeight;
      const maxScroll = outerH - stickyH;
      const target    = outerTop + (i / (PANELS - 1)) * maxScroll;
      window.scrollTo({ top: target, behavior: 'smooth' });
    });
  });

  window.addEventListener('scroll', update, { passive: true });
  update(); // run once on load
  lucide.createIcons();
})();

/* ── SCREENSHOTS: scroll-driven horizontal panels ────────────── */
(function () {
  const outer   = document.getElementById('screenshots');
  const track   = document.getElementById('ss-track');
  const dots    = Array.from(document.querySelectorAll('.ss-dot'));
  const label   = document.getElementById('ss-label');
  const counter = document.getElementById('ss-counter');
  const btnPrev = document.getElementById('ss-prev');
  const btnNext = document.getElementById('ss-next');
  const PANELS  = 5;

  const LABELS = [
    'Getting Started',
    'Find a Mechanic',
    'SOS Emergency',
    'Jobs & Chat',
    'Wallet & Profile',
  ];

  if (!outer || !track) return;

  function scrollToPanel(index) {
    index = Math.max(0, Math.min(index, PANELS - 1));
    const outerTop  = outer.getBoundingClientRect().top + window.scrollY;
    const outerH    = outer.offsetHeight;
    const stickyH   = window.innerHeight;
    const maxScroll = outerH - stickyH;
    const target    = outerTop + (index / (PANELS - 1)) * maxScroll;
    window.scrollTo({ top: target, behavior: 'smooth' });
  }

  function getCurrentIndex() {
    const outerRect = outer.getBoundingClientRect();
    const outerH    = outer.offsetHeight;
    const stickyH   = window.innerHeight;
    const scrolled  = Math.max(0, -outerRect.top);
    const maxScroll = outerH - stickyH;
    const progress  = Math.min(1, scrolled / maxScroll);
    return Math.round(progress * (PANELS - 1));
  }

  function update() {
    const outerRect = outer.getBoundingClientRect();
    const outerH    = outer.offsetHeight;
    const stickyH   = window.innerHeight;
    const scrolled  = Math.max(0, -outerRect.top);
    const maxScroll = outerH - stickyH;
    const progress  = Math.min(1, scrolled / maxScroll);
    const rawIndex  = progress * (PANELS - 1);
    const index     = Math.round(rawIndex);

    track.style.transform = `translateX(${-rawIndex * 100}vw)`;

    dots.forEach((d, i) => d.classList.toggle('active', i === index));
    if (label)   label.textContent   = LABELS[index];
    if (counter) counter.textContent = `${index + 1} / ${PANELS}`;

    if (btnPrev) btnPrev.disabled = index === 0;
    if (btnNext) btnNext.disabled = index === PANELS - 1;
  }

  // Dot clicks
  dots.forEach((dot, i) => dot.addEventListener('click', () => scrollToPanel(i)));

  // Arrow buttons
  if (btnPrev) btnPrev.addEventListener('click', () => scrollToPanel(getCurrentIndex() - 1));
  if (btnNext) btnNext.addEventListener('click', () => scrollToPanel(getCurrentIndex() + 1));

  window.addEventListener('scroll', update, { passive: true });
  update();
  lucide.createIcons();
})();
