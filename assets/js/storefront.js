'use strict';
(() => {
  document.documentElement.classList.add('has-js');
  // Let the initial style/font/image layout finish before moving route focus.
  // Immediate focus here forced layout on the critical rendering path.
  window.addEventListener(
    'load',
    () => {
      window.requestAnimationFrame(() =>
        window.requestAnimationFrame(() => {
          if (document.activeElement === document.body)
            document.getElementById('main-content')?.focus({ preventScroll: true });
        })
      );
    },
    { once: true }
  );
  let quickOpener = null;
  const openers = new WeakMap();
  let dirty = false;
  const announce = (message) => {
    const live = document.getElementById('live-status');
    if (live) live.textContent = message;
  };
  const openDialog = (dialog, source) => {
    if (!dialog || dialog.open) return;
    openers.set(dialog, source);
    dialog.showModal();
    dialog.querySelector('[data-close], button, input, a')?.focus();
  };
  document.addEventListener('click', (event) => {
    const target = event.target.closest('[data-open],[data-close],[data-print]');
    if (!target) return;
    if (target.hasAttribute('data-open'))
      openDialog(document.getElementById(target.dataset.open), target);
    if (target.hasAttribute('data-close')) target.closest('dialog')?.close();
    if (target.hasAttribute('data-print')) window.print();
  });
  document.addEventListener(
    'close',
    (event) => {
      const source = openers.get(event.target);
      if (source?.isConnected) source.focus();
    },
    true
  );
  document.addEventListener('click', (event) => {
    if (event.target.tagName !== 'DIALOG') return;
    const dialog = event.target;
    const rect = dialog.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      dialog.close();
  });
  document.addEventListener('htmx:before:request', (event) => {
    if (event.detail?.ctx?.sourceElement?.matches('[data-quick]'))
      quickOpener = event.detail.ctx.sourceElement;
    announce('Loading the collection.');
  });
  document.addEventListener('htmx:after:swap', (event) => {
    const target = event.detail?.ctx?.target;
    if (target?.id === 'quick-content')
      openDialog(document.getElementById('quick-shop'), quickOpener);
    const results = document.getElementById('shop-results');
    if (results && target?.id === 'shop-results') {
      document
        .querySelectorAll('.choice-filter[open]')
        .forEach((filter) => filter.removeAttribute('open'));
      results.focus({ preventScroll: true });
      announce(results.querySelector('[role=status]')?.textContent || 'Collection updated.');
    }
  });
  document.addEventListener('htmx:error', () =>
    announce('The request did not finish. Try the link again or reload the page.')
  );
  const board = document.getElementById('board-preview');
  const renderBoard = () => {
    if (!board) return;
    const selected = Array.from(document.querySelectorAll('.studio-select'))
      .map((select) => select.selectedOptions[0])
      .filter((option) => option?.value);
    board.replaceChildren();
    let sum = 0;
    for (const option of selected) {
      const figure = document.createElement('figure');
      const img = document.createElement('img');
      img.src = option.dataset.image;
      img.alt = `Editorial reference for ${option.dataset.name}`;
      img.width = 480;
      img.height = 640;
      const caption = document.createElement('figcaption');
      caption.textContent = option.textContent;
      figure.append(img, caption);
      board.append(figure);
      sum += Number(option.dataset.price);
    }
    if (!selected.length) {
      const p = document.createElement('p');
      p.textContent = 'Choose sample variants in the panel to see your composition here.';
      board.append(p);
    }
    document.getElementById('studio-total').textContent = selected.length
      ? `Preview total: $${(sum / 100).toFixed(2)} USD. Recalculated by the server on save.`
      : 'Choose pieces to build a look.';
    announce(`${selected.length} pieces in your composition.`);
  };
  document.addEventListener('change', (event) => {
    if (event.target.matches('.studio-select')) renderBoard();
  });
  document.addEventListener(
    'error',
    (event) => {
      if (event.target.tagName === 'IMG') {
        const img = event.target;
        if (!img.dataset.failed) {
          img.dataset.failed = 'true';
          img.removeAttribute('srcset');
          img.src = '/assets/image-unavailable.svg';
        }
      }
    },
    true
  );
  try {
    const channel = new window.BroadcastChannel('style-ease-guest');
    if (
      document.querySelector('.notice') &&
      window.performance.getEntriesByType('navigation')[0]?.type !== 'reload'
    )
      channel.postMessage('changed');
    channel.onmessage = () => {
      dirty = true;
    };
    document.addEventListener('submit', (event) => {
      if (event.target.method.toLowerCase() === 'post') channel.postMessage('changed');
    });
    window.addEventListener('focus', () => {
      if (
        dirty &&
        !document.querySelector('dialog[open]') &&
        !document.activeElement?.matches('input,textarea,select')
      )
        window.location.reload();
    });
  } catch {
    /* Ordinary navigation always refreshes authoritative server state. */
  }
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) window.location.reload();
  });
})();
