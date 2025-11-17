/* global document, window */
(function () {
  'use strict';

  // Mobile menu toggle with aria updates
  const menuBtn = document.getElementById('mobile-menu-button');
  const menu = document.getElementById('mobile-menu');
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', () => {
      const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', String(!expanded));
      menu.classList.toggle('hidden');
      menu.setAttribute('aria-hidden', String(expanded));
    });
  }

  // Slider
  const slider = document.getElementById('hero-slider');
  if (!slider) return;

  const track = slider.querySelector('.track');
  const slides = Array.from(slider.querySelectorAll('.slide'));
  if (!track || slides.length === 0) return;

  const prevBtn = document.getElementById('slider-prev');
  const nextBtn = document.getElementById('slider-next');
  const dotsContainer = slider.querySelector('.dots');
  const announcer = document.getElementById('slider-announcer');

  let current = 0;
  const delay = 4500;
  let timer = null;

  // initialize slide state
  slides.forEach((s, i) => {
    s.style.transition = 'transform 700ms ease';
    s.style.transform = i === 0 ? 'translateX(0%)' : 'translateX(100%)';
    s.style.zIndex = i === 0 ? '5' : '1';
  });

  // build dots
  const dots = [];
  if (dotsContainer) {
    slides.forEach((slide, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'w-2 h-2 rounded-full bg-gray-300 focus-ring';
      btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
      btn.setAttribute('role', 'tab');
      btn.addEventListener('click', () => {
        stop();
        goTo(i);
        start();
      });
      dotsContainer.appendChild(btn);
      dots.push(btn);
    });
  }

  function updateDots() {
    dots.forEach((d, i) => {
      d.classList.toggle('bg-gray-700', i === current);
      d.classList.toggle('bg-gray-300', i !== current);
      d.setAttribute('aria-selected', String(i === current));
    });
  }

  function announce(index) {
    if (!announcer) return;
    const slide = slides[index];
    const img = slide.querySelector('img');
    const text = img && img.alt ? img.alt : `Slide ${index + 1}`;
    announcer.textContent = `${index + 1} of ${slides.length}: ${text}`;
  }

  function goTo(index) {
    if (index === current) return;
    const direction = index > current ? 1 : -1;
    const outgoing = slides[current];
    const incoming = slides[index];

    incoming.style.transition = 'none';
    incoming.style.transform = `translateX(${direction * 100}%)`;
    incoming.style.zIndex = '10';

    // force reflow
    // eslint-disable-next-line no-unused-expressions
    incoming.offsetWidth;

    outgoing.style.transition = 'transform 700ms ease';
    outgoing.style.transform = `translateX(${-direction * 100}%)`;
    outgoing.style.zIndex = '5';
    incoming.style.transition = 'transform 700ms ease';
    incoming.style.transform = 'translateX(0%)';

    setTimeout(() => {
      slides.forEach((s, i) => { s.style.zIndex = i === index ? '5' : '1'; });
    }, 750);

    current = index;
    updateDots();
    announce(current);
  }

  function next() { goTo((current + 1) % slides.length); }
  function prev() { goTo((current - 1 + slides.length) % slides.length); }

  function start() { stop(); timer = setInterval(next, delay); }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }

  // attach arrows
  if (nextBtn) nextBtn.addEventListener('click', () => { stop(); next(); start(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { stop(); prev(); start(); });

  // pause on hover/focus
  track.addEventListener('mouseenter', stop);
  track.addEventListener('mouseleave', start);
  track.addEventListener('focusin', stop);
  track.addEventListener('focusout', start);

  // touch (swipe)
  let startX = 0;
  let deltaX = 0;
  track.addEventListener('touchstart', (e) => { stop(); startX = e.touches[0].clientX; deltaX = 0; }, { passive: true });
  track.addEventListener('touchmove', (e) => { deltaX = e.touches[0].clientX - startX; }, { passive: true });
  track.addEventListener('touchend', () => { if (Math.abs(deltaX) > 50) { if (deltaX < 0) next(); else prev(); } start(); });

  // keyboard navigation on the track
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { stop(); next(); start(); }
    if (e.key === 'ArrowLeft') { stop(); prev(); start(); }
  });

  // init
  updateDots();
  goTo(0);
  start();

}());
