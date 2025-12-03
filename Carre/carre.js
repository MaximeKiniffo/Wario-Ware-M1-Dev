
(function(){const b = document.querySelector('.x');
  const c = document.querySelector('.c');
  if (!b || !c) return;let d = false;let oX = 0;let oY = 0;
  function rand(min, max){ return Math.floor(Math.random() * (max - min + 1)) + min; }
  function rectsOverlap(a,b){
    return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
  }function pR(el){
    const contW = c.clientWidth; const contH = c.clientHeight;
    const w = el.offsetWidth; const h = el.offsetHeight;
    const maxX = Math.max(0, contW - w);
    const maxY = Math.max(0, contH - h);
    const x = rand(0, maxX);const y = rand(0, maxY);
    el.style.position = 'absolute';
    el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.margin = '0';
  }function pBNOl(a,b){
    pR(a);let s = 0;
    while(s < 30){ pR(b);
      const aR = a.getBoundingClientRect();const bR = b.getBoundingClientRect();
      if (!rectsOverlap(aR, bR)) return; s++;
    }}setTimeout(()=>{
    const yEl = document.querySelector('.y');if (yEl) pBNOl(b, yEl);
  }, 10);
  function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
  function oPD(e){ if (e.pointerType === 'mouse' && e.button !== 0) return;
    d = true; b.classList.add('d');
    b.setPointerCapture && b.setPointerCapture(e.pointerId);
    const r = b.getBoundingClientRect();
    oX = e.clientX - r.left;oY = e.clientY - r.top;
  }function oPM(e){
    if (!d) return;const cR = c.getBoundingClientRect();const bR = b.getBoundingClientRect();
    const x = e.clientX - cR.left - oX;const y = e.clientY - cR.top - oY;
    const pX = 0;const pY = 0;const gX = cR.width - bR.width; const gY = cR.height - bR.height;
    b.style.left = clamp(x, pX, gX) + 'px'; b.style.top  = clamp(y, pY, gY) + 'px';
  }function iFI(innerRect, outerRect){
    return innerRect.left >= outerRect.left &&
           innerRect.right <= outerRect.right &&
           innerRect.top >= outerRect.top &&
           innerRect.bottom <= outerRect.bottom;
  }function oPU(e){
    if (!d) return; d = false; b.classList.remove('d');
    try{ b.releasePointerCapture && b.releasePointerCapture(e.pointerId); }catch(ex){}
    const bR = b.getBoundingClientRect();
    const yEl = document.querySelector('.y');
    if (yEl){
      const yR = yEl.getBoundingClientRect();
      if (iFI(bR, yR)){
        b.classList.add('inside');
        const z = window.getComputedStyle(b);
        if (z.backgroundColor === 'rgba(0, 0, 0, 0)' || z.backgroundColor === 'transparent' || z.backgroundColor === 'rgb(231, 76, 60)'){
          b.style.backgroundColor = 'limegreen';
        }
      } else {
        b.classList.remove('inside');
        if (b.style.backgroundColor) b.style.backgroundColor = '';
      }
    }
  }
  b.addEventListener('pointerdown', oPD);
  window.addEventListener('pointermove', oPM);
  window.addEventListener('pointerup', oPU);
  window.addEventListener('pointercancel', oPU);
  b.setAttribute('tabindex', '0');
})();
