// corrigé avec chat GPT 

// Carre/carre.js — comportement de drag & drop et positionnement aléatoire
(function () {
  const box = document.querySelector('.x');
  const container = document.querySelector('.c');
  const target = document.querySelector('.y');
  if (!box || !container || !target) return;

  // State
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  // Helpers
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  function rectsOverlap(a, b) {
    return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
  }

  function isFullyInside(innerRect, outerRect) {
    return (
      innerRect.left >= outerRect.left &&
      innerRect.right <= outerRect.right &&
      innerRect.top >= outerRect.top &&
      innerRect.bottom <= outerRect.bottom
    );
  }

  // Place an element at a random position inside the container (absolute coords)
  function placeRandomly(el) {
    const contW = container.clientWidth;
    const contH = container.clientHeight;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const maxX = Math.max(0, contW - w);
    const maxY = Math.max(0, contH - h);
    const x = rand(0, maxX);
    const y = rand(0, maxY);
    el.style.position = 'absolute';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.margin = '0';
  }

  // Try to place two elements without overlapping (best-effort)
  function placeBothNonOverlapping(a, b) {
    placeRandomly(a);
    let attempts = 0;
    while (attempts < 30) {
      placeRandomly(b);
      const aR = a.getBoundingClientRect();
      const bR = b.getBoundingClientRect();
      if (!rectsOverlap(aR, bR)) return;
      attempts++;
    }
    // fallback: accept current placement
  }

  // Drag handlers
  function onPointerDown(e) {
    // only primary button for mouse
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    isDragging = true;
    box.classList.add('d');
    try { box.setPointerCapture && box.setPointerCapture(e.pointerId); } catch (err) {}

    const r = box.getBoundingClientRect();
    offsetX = e.clientX - r.left;
    offsetY = e.clientY - r.top;
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const contR = container.getBoundingClientRect();
    const boxR = box.getBoundingClientRect();
    const x = e.clientX - contR.left - offsetX;
    const y = e.clientY - contR.top - offsetY;
    const minX = 0;
    const minY = 0;
    const maxX = contR.width - boxR.width;
    const maxY = contR.height - boxR.height;
    box.style.left = clamp(x, minX, maxX) + 'px';
    box.style.top = clamp(y, minY, maxY) + 'px';
  }

  function onPointerUp(e) {
    if (!isDragging) return;
    isDragging = false;
    box.classList.remove('d');
    try { box.releasePointerCapture && box.releasePointerCapture(e.pointerId); } catch (err) {}

    // If released fully inside target, add class .inside
    const bR = box.getBoundingClientRect();
    const yR = target.getBoundingClientRect();
    if (isFullyInside(bR, yR)) {
      box.classList.add('inside');
    } else {
      box.classList.remove('inside');
    }
  }

  // keyboard nudging for accessibility
  box.setAttribute('tabindex', '0');
  box.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 10 : 4;
    const left = parseFloat(getComputedStyle(box).left) || 0;
    const top = parseFloat(getComputedStyle(box).top) || 0;
    if (e.key === 'ArrowLeft') { box.style.left = Math.max(0, left - step) + 'px'; e.preventDefault(); }
    if (e.key === 'ArrowRight') { box.style.left = Math.max(0, left + step) + 'px'; e.preventDefault(); }
    if (e.key === 'ArrowUp') { box.style.top = Math.max(0, top - step) + 'px'; e.preventDefault(); }
    if (e.key === 'ArrowDown') { box.style.top = Math.max(0, top + step) + 'px'; e.preventDefault(); }
  });

  // Init: random placement (after layout)
  setTimeout(() => placeBothNonOverlapping(box, target), 10);

  // Events
  box.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);
})();
