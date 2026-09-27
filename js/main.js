/* ==========================================================================
   COLEGIO MIGUEL GRAU SEMINARIO — Interacciones
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- Header: estado al hacer scroll ---------- */
  const header = document.getElementById('siteHeader');
  const toTop = document.getElementById('toTop');

  function onScroll() {
    const scrolled = window.scrollY > 12;
    header.classList.toggle('is-scrolled', scrolled);
    if (toTop) toTop.classList.toggle('is-visible', window.scrollY > 640);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menú móvil ---------- */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  function closeMenu() {
    mainNav.classList.remove('is-open');
    navToggle.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const open = mainNav.classList.toggle('is-open');
      navToggle.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
    });
    // Cerrar al pulsar un enlace o al hacer clic fuera
    mainNav.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
    document.addEventListener('click', (e) => {
      if (mainNav.classList.contains('is-open') && !mainNav.contains(e.target) && !navToggle.contains(e.target)) {
        closeMenu();
      }
    });
  }

  /* ---------- Volver arriba ---------- */
  if (toTop) {
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ---------- Aparición al hacer scroll (IntersectionObserver) ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Contadores animados ---------- */
  const counters = document.querySelectorAll('.count');
  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          counterObserver.unobserve(el);
          animateCount(el);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => counterObserver.observe(el));
  } else {
    counters.forEach((el) => (el.textContent = el.dataset.target));
  }

  function animateCount(el) {
    const target = parseInt(el.dataset.target, 10) || 0;
    const duration = 1400;
    const start = performance.now();

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      // Easing suave (easeOutCubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- Pestañas de niveles ('Primaria' / 'Secundaria') ---------- */
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.levels-panel');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const panelId = tab.dataset.panel;
      if (!panelId) return;

      tabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', String(active));
      });

      panels.forEach((panel) => {
        panel.classList.toggle('is-active', panel.id === panelId);
      });
    });
  });

  /* ---------- Museo de Fotos: visor ampliado (lightbox) ---------- */
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbCaption = document.getElementById('lbCaption');
  const lbCounter = document.getElementById('lbCounter');
  const lbClose = document.getElementById('lbClose');
  const lbPrev = document.getElementById('lbPrev');
  const lbNext = document.getElementById('lbNext');
  const museoBtns = Array.prototype.slice.call(document.querySelectorAll('.museo-btn'));

  if (lb && lbImg && museoBtns.length) {
    // Colección de fotos del museo (src, alt, título y pie de foto de cada una)
    const collection = museoBtns.map(function (btn) {
      const img = btn.querySelector('img');
      const fig = btn.closest('.museo-item');
      const cap = fig ? fig.querySelector('figcaption') : null;
      const tit = cap ? cap.querySelector('.museo-titulo') : null;
      const txt = cap ? cap.querySelector('.museo-texto') : null;
      return {
        src: img ? img.getAttribute('src') : '',
        alt: img ? img.getAttribute('alt') || '' : '',
        titulo: tit ? tit.textContent.trim() : (cap ? cap.textContent.trim() : ''),
        texto: txt ? txt.textContent.trim() : ''
      };
    });

    let current = 0;
    let lastFocused = null;

    function render() {
      const item = collection[current];
      if (!item) return;
      lbImg.setAttribute('src', item.src);
      lbImg.setAttribute('alt', item.alt);
      lbCounter.textContent = (current + 1) + ' / ' + collection.length;

      // Título y descripción van en nodos aparte para poder estilizarlos
      lbCaption.textContent = '';
      const strong = document.createElement('strong');
      strong.className = 'lb-titulo';
      strong.textContent = item.titulo;
      lbCaption.appendChild(strong);
      if (item.texto) {
        const span = document.createElement('span');
        span.className = 'lb-texto';
        span.textContent = item.texto;
        lbCaption.appendChild(span);
      }

      // En relieves o pantallas pequeñas se ve una sola foto a la vez
      const soloUna = window.matchMedia('(max-width: 620px)').matches;
      lbPrev.hidden = soloUna;
      lbNext.hidden = soloUna;
    }

    function open(index) {
      current = (index + collection.length) % collection.length;
      lastFocused = document.activeElement;
      render();
      lb.classList.add('is-open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      lbClose.focus();
    }

    function close() {
      lb.classList.remove('is-open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    function step(delta) {
      current = (current + delta + collection.length) % collection.length;
      render();
    }

    museoBtns.forEach(function (btn, i) {
      btn.addEventListener('click', function () { open(i); });
    });

    lbClose.addEventListener('click', close);
    lbPrev.addEventListener('click', function () { step(-1); });
    lbNext.addEventListener('click', function () { step(1); });

    // Clic en el fondo oscuro (fuera de la foto) cierra el visor
    lb.addEventListener('click', function (e) {
      if (e.target === lb) close();
    });

    // Teclado: Esc cierra, flechas navegan
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    });
  }

  /* ---------- Año actual en el pie ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /*
   * Respaldo de imágenes de la galería.
   * - La galería busca el archivo real en  img/galeria-N.jpg
   * - Si aún no existe (Google bloquea la descarga automática de las fotos de
   *   tu página de Google Sites), mostramos un marcador SVG elegante:
   *   img/galeria-N.svg
   * - Para ver la foto real: guarda la imagen desde tu página de Google Sites
   *   (clic derecho -> "Guardar imagen como...") en la carpeta img/ con el
   *   nombre galeria-N.jpg. Se mostrará automáticamente.
   */
  window.imgFallback = function (img, fallbackSrc) {
    if (!img) return;
    if (fallbackSrc) {
      img.onerror = null;
      img.src = fallbackSrc;
      return;
    }
    var fig = img.closest('.gallery-item');
    if (fig) {
      fig.classList.add('fallback');
      fig.setAttribute('data-mono', 'MG');
    }
    img.remove();
  };
})();