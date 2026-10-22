// Are we related? Shared deck engine.
// Present mode: arrows, space or a clicker move through steps then slides.
// Read mode: every slide stacked, every step visible. R toggles, F is fullscreen.

(function () {
  const slides = [...document.querySelectorAll('.slide')];
  const params = new URLSearchParams(location.search);
  let mode = params.has('read') ? 'read'
           : params.has('present') ? 'present'
           : (window.innerWidth < 760 ? 'read' : 'present');
  let i = Math.min(Math.max(parseInt(location.hash.slice(1), 10) - 1 || 0, 0), slides.length - 1);

  // Heads-up display: slide counter, mode toggle, link back to the unit index
  const hud = document.createElement('div');
  hud.className = 'hud';
  hud.innerHTML = '<span class="count"></span><button class="toggle"></button><a href="index.html"><button>Index</button></a>';
  const bar = document.createElement('div');
  bar.className = 'bar';
  document.body.append(hud, bar);
  hud.querySelector('.toggle').onclick = () => setMode(mode === 'present' ? 'read' : 'present');

  const steps = s => [...s.querySelectorAll('.step')];

  function show() {
    slides.forEach((s, k) => s.classList.toggle('current', k === i));
    hud.querySelector('.count').textContent = mode === 'present' ? `${i + 1} / ${slides.length}` : '';
    bar.style.width = `${(100 * (i + 1)) / slides.length}%`;
    history.replaceState(null, '', `${location.search}#${i + 1}`);
  }

  function next() {
    const hidden = steps(slides[i]).find(e => !e.classList.contains('shown'));
    if (hidden) return hidden.classList.add('shown');
    if (i < slides.length - 1) { i++; show(); }
  }

  function prev() {
    const shown = steps(slides[i]).filter(e => e.classList.contains('shown'));
    if (shown.length) return shown.pop().classList.remove('shown');
    if (i > 0) {
      i--;
      steps(slides[i]).forEach(e => e.classList.add('shown')); // arrive with everything visible
      show();
    }
  }

  function fit() {
    const scale = Math.min(window.innerWidth / 1600, window.innerHeight / 900);
    document.documentElement.style.setProperty('--scale', scale);
  }

  function setMode(m) {
    mode = m;
    document.body.className = m;
    hud.querySelector('.toggle').textContent = m === 'present' ? 'Read mode' : 'Present';
    if (m === 'read') slides.forEach(s => steps(s).forEach(e => e.classList.add('shown')));
    fit();
    show();
    if (m === 'read') slides[i].scrollIntoView();
  }

  document.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (k === 'r' || k === 'R') return setMode(mode === 'present' ? 'read' : 'present');
    if (mode !== 'present') return;
    if (['ArrowRight', 'ArrowDown', ' ', 'PageDown', 'Enter'].includes(k)) { e.preventDefault(); next(); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); prev(); }
    else if (k === 'Home') { i = 0; show(); }
    else if (k === 'End') { i = slides.length - 1; show(); }
    else if (k === 'f' || k === 'F') {
      document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
    }
  });

  document.querySelector('.deck').addEventListener('click', e => {
    if (mode === 'present' && !e.target.closest('a, button')) next();
  });

  window.addEventListener('hashchange', () => {
    const n = parseInt(location.hash.slice(1), 10) - 1;
    if (n >= 0 && n < slides.length && n !== i) { i = n; show(); }
  });
  window.addEventListener('resize', fit);
  setMode(mode);
})();
