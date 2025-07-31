/* ========= Helpers ========= */
const $ = (q, ctx = document) => ctx.querySelector(q);
const $$ = (q, ctx = document) => Array.from(ctx.querySelectorAll(q));

/* ========= Smooth scroll for in-page nav ========= */
$$('header nav a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const target = id && $(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', id);
  });
});

/* ========= Active section highlight (IntersectionObserver) ========= */
const sections = $$('main section, footer');
const navLinks = new Map($$('header nav a[href^="#"]').map(a => [a.getAttribute('href'), a]));
const sectionObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      const id = '#' + entry.target.id;
      const link = navLinks.get(id);
      if (!link) return;
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  },
  { rootMargin: '-30% 0px -60% 0px', threshold: 0.01 }
);
sections.forEach(sec => sec.id && sectionObserver.observe(sec));

/* ========= Reveal-on-scroll for cards ========= */
const revealTargets = $$('.project-card, .cert-card');
const revealIO = new IntersectionObserver(
  entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view'); // CSS animation already present
        revealIO.unobserve(e.target);
      }
    });
  },
  { threshold: 0.1 }
);
revealTargets.forEach(el => revealIO.observe(el));

/* ========= Lazy-load images + safe external links ========= */
$$('img').forEach(img => {
  if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
});
$$('a[target="_blank"]').forEach(a => {
  const rel = (a.getAttribute('rel') || '').split(/\s+/);
  if (!rel.includes('noopener')) rel.push('noopener');
  if (!rel.includes('noreferrer')) rel.push('noreferrer');
  a.setAttribute('rel', rel.join(' ').trim());
});

/* ========= Theme toggle (Dark/Light) — no CSS edits required ========= */
/* We override CSS variables at :root so it works with your current styles */
const themePalettes = {
  dark: {
    '--bg': '#0f1226',
    '--surface': '#161a39',
    '--card': '#1b2047',
    '--text': '#eef1ff',
    '--muted': '#b8bce0',
    '--accent': '#7c5cff',
    '--accent-2': '#34d399',
    '--ring': 'rgba(124, 92, 255, 0.5)',
    '--shadow': '0 10px 30px rgba(0,0,0,0.25)'
  },
  light: {
    '--bg': '#f7f7fb',
    '--surface': '#ffffff',
    '--card': '#ffffff',
    '--text': '#15172b',
    '--muted': '#4b4f70',
    '--accent': '#5b4bff',
    '--accent-2': '#0ea5e9',
    '--ring': 'rgba(91, 75, 255, 0.35)',
    '--shadow': '0 10px 25px rgba(17, 24, 39, 0.08)'
  }
};

function applyTheme(name) {
  const root = document.documentElement;
  const palette = themePalettes[name] || themePalettes.dark;
  Object.entries(palette).forEach(([k, v]) => root.style.setProperty(k, v));
  localStorage.setItem('theme', name);
  themeBtn.textContent = name === 'dark' ? '☀️ Light' : '🌙 Dark';
  themeBtn.setAttribute('aria-label', `Switch to ${name === 'dark' ? 'light' : 'dark'} theme`);
}

// Create a small toggle button inside the nav
const nav = $('header nav');
const themeBtn = document.createElement('button');
themeBtn.type = 'button';
themeBtn.className = 'btn';
themeBtn.style.marginLeft = '.25rem';
themeBtn.style.cursor = 'pointer';
themeBtn.style.borderRadius = '999px';
nav && nav.appendChild(themeBtn);

// Initial theme: saved preference, else system preference
const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
const savedTheme = localStorage.getItem('theme');
applyTheme(savedTheme || (prefersLight ? 'light' : 'dark'));

themeBtn.addEventListener('click', () => {
  const current = localStorage.getItem('theme') || (prefersLight ? 'light' : 'dark');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});
// Keyboard shortcut: press "t" to toggle theme
document.addEventListener('keydown', e => {
  if (e.key.toLowerCase() === 't' && !/input|textarea|select/.test((e.target.tagName || '').toLowerCase())) {
    themeBtn.click();
  }
});

/* ========= Back-to-top button (auto-injected) ========= */
const toTop = document.createElement('button');
toTop.type = 'button';
toTop.textContent = '↑';
toTop.setAttribute('aria-label', 'Back to top');
toTop.style.position = 'fixed';
toTop.style.right = '16px';
toTop.style.bottom = '16px';
toTop.style.padding = '.6rem .8rem';
toTop.style.borderRadius = '12px';
toTop.style.border = '1px solid rgba(255,255,255,0.2)';
toTop.style.background = 'rgba(0,0,0,0.25)';
toTop.style.backdropFilter = 'blur(8px)';
toTop.style.color = 'white';
toTop.style.fontWeight = '700';
toTop.style.cursor = 'pointer';
toTop.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
toTop.style.opacity = '0';
toTop.style.transform = 'translateY(8px)';
toTop.style.pointerEvents = 'none';
toTop.style.transition = 'opacity .2s ease, transform .2s ease';
document.body.appendChild(toTop);

toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

function toggleToTop() {
  const show = window.scrollY > 600;
  toTop.style.opacity = show ? '1' : '0';
  toTop.style.transform = show ? 'translateY(0)' : 'translateY(8px)';
  toTop.style.pointerEvents = show ? 'auto' : 'none';
}
window.addEventListener('scroll', toggleToTop, { passive: true });
toggleToTop();

/* ========= Click-to-zoom modal for project images ========= */
const modal = document.createElement('div');
modal.setAttribute('role', 'dialog');
modal.setAttribute('aria-modal', 'true');
modal.style.position = 'fixed';
modal.style.inset = '0';
modal.style.background = 'rgba(0,0,0,0.65)';
modal.style.display = 'none';
modal.style.alignItems = 'center';
modal.style.justifyContent = 'center';
modal.style.padding = '24px';
modal.style.zIndex = '9999';

const modalImg = document.createElement('img');
modalImg.alt = 'Project preview';
modalImg.style.maxWidth = 'min(100%, 1200px)';
modalImg.style.maxHeight = '90vh';
modalImg.style.borderRadius = '16px';
modalImg.style.boxShadow = '0 20px 60px rgba(0,0,0,0.35)';
modal.appendChild(modalImg);
document.body.appendChild(modal);

function openModal(src, alt) {
  modalImg.src = src;
  modalImg.alt = alt || 'Project preview';
  modal.style.display = 'flex';
  document.documentElement.style.overflow = 'hidden'; // prevent background scroll
}
function closeModal() {
  modal.style.display = 'none';
  modalImg.src = '';
  document.documentElement.style.overflow = '';
}
modal.addEventListener('click', e => {
  if (e.target === modal) closeModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.style.display === 'flex') closeModal();
});

$$('.project-card img').forEach(img => {
  img.style.cursor = 'zoom-in';
  img.addEventListener('click', () => openModal(img.src, img.alt));
});

/* ========= (Optional) Copy email button support ========= */
// If you add: <button class="btn" id="copy-email" data-email="you@example.com">Copy email</button>
const copyBtn = $('#copy-email');
if (copyBtn && navigator.clipboard) {
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(copyBtn.dataset.email || '');
      const old = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      setTimeout(() => (copyBtn.textContent = old), 1500);
    } catch {}
  });
}

