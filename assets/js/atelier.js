'use strict';
(() => {
  const form = document.getElementById('studio-form');
  if (!form) return;
  const selects = [...form.querySelectorAll('.studio-select')];
  const board = document.getElementById('board-preview');
  const inspector = document.getElementById('atelier-inspector');
  const variantPicker = document.getElementById('active-studio-variant');
  const live = document.getElementById('live-status');
  let activeSelect;
  function category(name, focus = false) {
    document.querySelectorAll('[data-studio-category]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.studioCategory === name));
    });
    document.querySelectorAll('[data-pick-product]').forEach((tile) => {
      tile.hidden = tile.dataset.category !== name;
    });
    if (focus) document.querySelector(`[data-pick-product]:not([hidden]):not(:disabled)`)?.focus();
  }
  function choose(id) {
    activeSelect = selects.find((select) =>
      [...select.options].some((option) => option.dataset.product === id)
    );
    if (!activeSelect) return;
    const choices = [...activeSelect.options].filter((option) => option.dataset.product === id);
    const current = activeSelect.value;
    variantPicker.replaceChildren(...choices.map((option) => option.cloneNode(true)));
    variantPicker.value = choices.some((option) => option.value === current)
      ? current
      : choices[0].value;
    document.getElementById('inspector-title').textContent = choices[0].dataset.name;
    document.getElementById('inspector-price').textContent =
      `$${(Number(choices[0].dataset.price) / 100).toFixed(2)} USD / sample piece`;
    document.getElementById('inspector-product').href =
      `/products/${encodeURIComponent(choices[0].dataset.slug)}`;
    inspector.hidden = false;
    document.getElementById('place-studio-piece').textContent = activeSelect.value
      ? 'Replace this category'
      : 'Place in composition';
    variantPicker.focus({ preventScroll: true });
    if (inspector.getBoundingClientRect().bottom > innerHeight)
      inspector.scrollIntoView({
        block: 'nearest',
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
      });
  }
  function render() {
    const selected = selects
      .filter((select) => select.value)
      .map((select) => ({ select, option: select.selectedOptions[0] }));
    board.replaceChildren();
    for (const { select, option } of selected) {
      const figure = document.createElement('figure');
      const image = document.createElement('img');
      image.src = option.dataset.image;
      image.alt = `Editorial reference for ${option.dataset.name}`;
      image.width = Number(option.dataset.width);
      image.height = Number(option.dataset.height);
      image.decoding = 'async';
      const caption = document.createElement('figcaption');
      caption.textContent = option.dataset.name;
      const detail = document.createElement('small');
      detail.textContent = `${option.dataset.size} / ${option.dataset.colour}`;
      caption.append(detail);
      const actions = document.createElement('div');
      actions.className = 'board-piece-actions';
      for (const action of ['Replace', 'Remove']) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = action;
        button.setAttribute('aria-label', `${action} ${option.dataset.name}`);
        button.addEventListener('click', () => {
          if (action === 'Replace') {
            category(select.dataset.category);
            choose(option.dataset.product);
          } else {
            select.value = '';
            render();
            document.querySelector(`[data-studio-category="${select.dataset.category}"]`)?.focus();
          }
        });
        actions.append(button);
      }
      figure.append(image, caption, actions);
      board.append(figure);
    }
    if (!selected.length) {
      const message = document.createElement('p');
      message.className = 'board-empty';
      message.textContent = 'Begin with one piece. Let the rest find its place.';
      board.append(message);
    }
    const inspiration = document.getElementById('studio-inspiration');
    if (inspiration) inspiration.hidden = selected.length > 0;
    document.getElementById('board-count').textContent = `${selected.length} / 6 pieces`;
    const sum = selected.reduce((total, { option }) => total + Number(option.dataset.price), 0);
    document.getElementById('studio-total').textContent = selected.length
      ? `Preview total: $${(sum / 100).toFixed(2)} USD. Recalculated by the server on save.`
      : 'Choose pieces to build a look.';
    document
      .querySelectorAll('[data-pick-product]')
      .forEach((tile) =>
        tile.setAttribute(
          'aria-pressed',
          String(selected.some(({ option }) => option.dataset.product === tile.dataset.pickProduct))
        )
      );
    live.textContent = `${selected.length} pieces in your composition.`;
  }
  document
    .querySelectorAll('[data-studio-category]')
    .forEach((button) =>
      button.addEventListener('click', () => category(button.dataset.studioCategory))
    );
  document
    .querySelectorAll('[data-pick-product]')
    .forEach((tile) => tile.addEventListener('click', () => choose(tile.dataset.pickProduct)));
  document.getElementById('place-studio-piece').addEventListener('click', () => {
    if (!activeSelect || !variantPicker.value || variantPicker.selectedOptions[0].disabled) return;
    activeSelect.value = variantPicker.value;
    render();
    inspector.hidden = true;
    board.querySelector('figure:last-child button')?.focus({ preventScroll: true });
  });
  selects.forEach((select) => select.addEventListener('change', render));
  category('Jackets');
  render();
})();
