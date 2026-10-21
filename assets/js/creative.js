'use strict';
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const seen = new WeakSet();
  let imageOpener;
  const comparison = document.querySelector('.comparison-scroll');
  if (comparison) {
    const controls = [...document.querySelectorAll('[data-compare-scroll]')];
    const sync = () =>
      controls.forEach((button) => {
        button.disabled =
          button.dataset.compareScroll === '-1'
            ? comparison.scrollLeft < 1
            : comparison.scrollLeft + comparison.clientWidth >= comparison.scrollWidth - 1;
      });
    controls.forEach((button) =>
      button.addEventListener('click', () =>
        comparison.scrollBy({
          left: Number(button.dataset.compareScroll) * Math.max(220, comparison.clientWidth * 0.8),
          behavior: reduced.matches ? 'instant' : 'smooth'
        })
      )
    );
    comparison.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  }
  const viewer = document.getElementById('image-viewer');
  viewer?.addEventListener('close', () => imageOpener?.focus());
  let observer;
  if ('IntersectionObserver' in window && !reduced.matches) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
      },
      { rootMargin: '120px 0px', threshold: 0.04 }
    );
  }
  function initialise(root = document) {
    if (!observer) return;
    root.querySelectorAll('[data-reveal]').forEach((element) => {
      if (seen.has(element)) return;
      seen.add(element);
      if (element.getBoundingClientRect().top > window.innerHeight + 80) {
        element.classList.add('reveal-ready');
        observer.observe(element);
      }
    });
  }
  document.addEventListener('click', (event) => {
    const photoLink = event.target.closest('[data-image-zoom]');
    if (photoLink && viewer && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
      event.preventDefault();
      imageOpener = photoLink;
      const image = document.getElementById('image-viewer-photo');
      image.src = photoLink.dataset.photo;
      image.alt = photoLink.dataset.photoAlt;
      viewer.showModal();
      viewer.querySelector('[data-close]').focus();
      return;
    }
    const toggle = event.target.closest('[data-colour-toggle]');
    if (!toggle) return;
    const surface = toggle.closest('.colour-surface');
    const active = toggle.getAttribute('aria-pressed') !== 'true';
    surface?.classList.toggle('is-colour', active);
    surface?.classList.toggle('colour-rest', !active);
    toggle.setAttribute('aria-pressed', String(active));
    toggle.textContent = active ? 'Keep monochrome' : 'See in colour';
    if (toggle.dataset.colourLabel)
      toggle.setAttribute('aria-label', `${toggle.textContent}: ${toggle.dataset.colourLabel}`);
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches) {
      observer?.disconnect();
      document.querySelectorAll('.reveal-ready').forEach((el) => el.classList.add('is-visible'));
    }
  });
  document.addEventListener('htmx:after:swap', (event) =>
    initialise(event.detail?.ctx?.target || document)
  );
  document.addEventListener('submit', (event) => {
    if (event.target.method?.toLowerCase() !== 'post') return;
    event.target.setAttribute('aria-busy', 'true');
    event.submitter?.classList.add('is-processing');
    // Do not disable the submitter: its name/value is part of the native POST.
  });
  initialise();
})();
