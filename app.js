(() => {
  'use strict';

  const root = document.documentElement;
  const toggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav]');

  const closeMenu = () => {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
    document.body.classList.remove('menu-is-open');
  };

  const openMenu = () => {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', 'true');
    nav.classList.add('is-open');
    document.body.classList.add('menu-is-open');
    nav.querySelector('a')?.focus();
  };

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) closeMenu();
      else openMenu();
    });

    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

    document.addEventListener('keydown', (event) => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      if (!isOpen) return;

      if (event.key === 'Escape') {
        closeMenu();
        toggle.focus();
        return;
      }

      if (event.key !== 'Tab') return;
      const focusable = [toggle, ...nav.querySelectorAll('a[href]')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  document.querySelector('[data-year]').textContent = new Date().getFullYear();

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const revealItems = document.querySelectorAll('.reveal');

  root.classList.add('js');

  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            currentObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealItems.forEach((item) => observer.observe(item));
  }

  if (!reduceMotion.matches && window.matchMedia('(pointer: fine)').matches) {
    const root = document.documentElement;
    window.addEventListener('pointermove', (event) => {
      root.style.setProperty('--cursor-x', `${event.clientX}px`);
      root.style.setProperty('--cursor-y', `${event.clientY}px`);
    }, { passive: true });
  }
})();
