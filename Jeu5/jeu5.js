// corrigé avec chat GPT 

// Carre/carre.js — comportement de drag & drop et positionnement aléatoire
(function () {
  const box = document.querySelector('.draggable');
  const container = document.querySelector('.board');
  const target = document.querySelector('.dropzone');
  if (!box || !container || !target) return;

  // Audio de succès (joué quand le carré devient vert)
  const successAudio = new Audio('assets/oh_yeah.wav');
  successAudio.preload = 'auto';

  // Déverrouiller la lecture audio au premier geste utilisateur
  (function unlockAudioOnFirstGesture(){
    function _unlock(){
      successAudio.play().then(()=>{
        successAudio.pause();
        successAudio.currentTime = 0;
      }).catch(()=>{});
      document.removeEventListener('pointerdown', _unlock);
      document.removeEventListener('touchstart', _unlock);
    }
    document.addEventListener('pointerdown', _unlock, {once:true});
    document.addEventListener('touchstart', _unlock, {once:true});
  })();

  // State
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;
  // redirect timer id (when dropped outside)
  let redirectTimer = null;
  // countdown element & state
  let countdownEl = null;
  let countdownInterval = null;

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
  // add an explicit class name for dragging state
  box.classList.add('dragging');
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
  box.classList.remove('dragging');
    try { box.releasePointerCapture && box.releasePointerCapture(e.pointerId); } catch (err) {}

    // If released fully inside target, add class .inside
    const bR = box.getBoundingClientRect();
    const yR = target.getBoundingClientRect();
    if (isFullyInside(bR, yR)) {
      box.classList.add('inside');
      // Jouer le son de succès
      try {
        successAudio.currentTime = 0;
        const p = successAudio.play();
        if (p && p.catch) p.catch(()=>{});
      } catch (err) {}
      // cleared any pending redirect
      if (redirectTimer) { clearTimeout(redirectTimer); redirectTimer = null; }
      cancelRedirectCountdown();
    } else {
      box.classList.remove('inside');
      // Ne pas redémarrer le compte à rebours si on pose le carré en dehors
      // Le compte à rebours initial continue de tourner
    }
  }

  // --- Redirect countdown UI helpers ---
  function createCountdownEl() {
    if (countdownEl) return countdownEl;
    countdownEl = document.createElement('div');
    countdownEl.className = 'countdown hidden';
    countdownEl.setAttribute('aria-hidden', 'true');
    document.body.appendChild(countdownEl);
    return countdownEl;
  }

  function startRedirectCountdown(durationMs) {
    // clear previous timers
    if (redirectTimer) { clearTimeout(redirectTimer); redirectTimer = null; }
    if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }

    const el = createCountdownEl();
    el.classList.remove('hidden');
    const start = performance.now();
    const end = start + durationMs;

    // update display every 100ms
    function update() {
      const now = performance.now();
      const remaining = Math.max(0, end - now);
      const seconds = Math.ceil(remaining / 1000);
      el.textContent = seconds + 's';
    }

    update();
    countdownInterval = setInterval(update, 100);

    // schedule final redirect
    redirectTimer = setTimeout(() => {
      // final check before redirecting
      const finalBR = box.getBoundingClientRect();
      const finalYR = target.getBoundingClientRect();
      if (!isFullyInside(finalBR, finalYR)) {
        window.location.href = '../index.html';
      } else {
        // if it became inside just cancel countdown
        cancelRedirectCountdown();
      }
    }, durationMs);
  }

  function cancelRedirectCountdown() {
    if (redirectTimer) { clearTimeout(redirectTimer); redirectTimer = null; }
    if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }
    if (countdownEl) { countdownEl.classList.add('hidden'); }
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

  // Start a 3s countdown on page load — if the box isn't inside by then, redirect
  // This follows the user's request to launch the countdown as soon as the page is loaded
  window.addEventListener('load', () => {
    // small timeout to ensure layout measurements are stable
    setTimeout(() => startRedirectCountdown(3000), 50);
  });

  // Events
  box.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);
})();
