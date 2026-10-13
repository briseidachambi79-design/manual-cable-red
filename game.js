// ===== DATOS =====
const STANDARDS = {
  a: {
    name: 'T568A',
    pins: [
      { pin:1, color:'Blanco/Verde',   hex:'#a8d5a2' },
      { pin:2, color:'Verde',          hex:'#2e9e3f' },
      { pin:3, color:'Blanco/Naranja', hex:'#ffd2a8' },
      { pin:4, color:'Azul',           hex:'#4a90e2' },
      { pin:5, color:'Blanco/Azul',    hex:'#b6d4f5' },
      { pin:6, color:'Naranja',        hex:'#e8741e' },
      { pin:7, color:'Blanco/Marrón',  hex:'#d9b89c' },
      { pin:8, color:'Marrón',         hex:'#7a4b2a' },
    ]
  },
  b: {
    name: 'T568B',
    pins: [
      { pin:1, color:'Blanco/Naranja', hex:'#ffd2a8' },
      { pin:2, color:'Naranja',        hex:'#e8741e' },
      { pin:3, color:'Blanco/Verde',   hex:'#a8d5a2' },
      { pin:4, color:'Azul',           hex:'#4a90e2' },
      { pin:5, color:'Blanco/Azul',    hex:'#b6d4f5' },
      { pin:6, color:'Verde',          hex:'#2e9e3f' },
      { pin:7, color:'Blanco/Marrón',  hex:'#d9b89c' },
      { pin:8, color:'Marrón',         hex:'#7a4b2a' },
    ]
  }
};

// ===== ESTADO =====
let selectedStd = 'b';
let mode = 'practice';
let score = 0;
let round = 0;
let lives = 3;
let timeLeft = 0;
let timerId = null;
let locked = true;
let selectedToken = null;
let draggingId = null;
let tokenCounter = 0;
let initialOrder = [];
let lastQuickPin = null;
let streak = 0;
let bestStreak = 0;

const stdSelect = document.getElementById('stdSelect');
const modeSelect = document.getElementById('modeSelect');
const startBtn = document.getElementById('startBtn');
const checkBtn = document.getElementById('checkBtn');
const resetBtn = document.getElementById('resetBtn');
const pool = document.getElementById('pool');
const slots = document.getElementById('slots');
const timeVal = document.getElementById('timeVal');
const roundVal = document.getElementById('roundVal');
const scoreVal = document.getElementById('scoreVal');
const livesVal = document.getElementById('livesVal');
const bestVal = document.getElementById('bestVal');
const feedback = document.getElementById('feedback');
const themeToggle = document.getElementById('themeToggle');
const countdownEl = document.getElementById('countdown');

const quickColor = document.getElementById('quickColor');
const quickInput = document.getElementById('quickInput');
const quickSubmit = document.getElementById('quickSubmit');
const quickNext = document.getElementById('quickNext');
const quickFeedback = document.getElementById('quickFeedback');
const streakVal = document.getElementById('streakVal');
const bestStreakVal = document.getElementById('bestStreakVal');

// ===== UTILIDADES =====
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function setFeedback(msg, type) {
  feedback.textContent = msg;
  feedback.className = 'feedback ' + (type || 'info');
}

function maxLives(m) {
  if (m === 'extreme') return 2;
  if (m === 'challenge') return 3;
  return 999;
}

function roundBaseTime() {
  return mode === 'timed' ? 45 : mode === 'challenge' ? 35 : mode === 'extreme' ? 20 : 0;
}
function roundTime() {
  const base = roundBaseTime();
  if (base === 0) return 0;
  return Math.max(15, base - round * 2);
}

function getBest() { try { return parseInt(localStorage.getItem('ethGameBest') || '0', 10); } catch (e) { return 0; } }
function setBest(v) { try { localStorage.setItem('ethGameBest', String(v)); } catch (e) {} }
function getBestStreak() { try { return parseInt(localStorage.getItem('ethBestStreak') || '0', 10); } catch (e) { return 0; } }
function setBestStreak(v) { try { localStorage.setItem('ethBestStreak', String(v)); } catch (e) {} }

function clearTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }

// ---- Audio ----
let audioCtx = null;
function ensureAudio() {
  if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { audioCtx = null; } }
  return audioCtx;
}
function beep(freq, dur, type) {
  const ctx = ensureAudio(); if (!ctx) return;
  try {
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.type = type || 'square'; osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + dur);
  } catch (e) {}
}
function shakeBoard() {
  const board = document.querySelector('.board'); if (!board) return;
  board.classList.remove('shake'); void board.offsetWidth; board.classList.add('shake');
  setTimeout(() => board.classList.remove('shake'), 450);
}

function runCountdown(cb) {
  countdownEl.style.display = 'flex';
  let n = 3; countdownEl.textContent = n;
  beep(660, 0.12, 'square');
  const intv = setInterval(() => {
    n--;
    if (n <= 0) {
      clearInterval(intv); countdownEl.style.display = 'none'; beep(990, 0.22, 'square'); if (cb) cb();
    } else { countdownEl.textContent = n; beep(660, 0.12, 'square'); }
  }, 700);
}

function updateStats() {
  scoreVal.textContent = score;
  roundVal.textContent = round;
  if (mode === 'practice') timeVal.textContent = '∞';
  else if (locked) timeVal.textContent = '—';
  else timeVal.textContent = timeLeft;
  if (mode === 'challenge') livesVal.textContent = '❤️'.repeat(Math.max(0, lives));
  else if (mode === 'extreme') livesVal.textContent = '⚡'.repeat(Math.max(0, lives)) || '💀';
  else livesVal.textContent = '∞';
  bestVal.textContent = getBest();
  streakVal.textContent = streak;
  bestStreakVal.textContent = bestStreak;
}

// ===== CONSTRUCCIÓN =====
function createToken(wire) {
  const id = 'tok-' + (++tokenCounter);
  const el = document.createElement('div');
  el.className = 'wire'; el.id = id; el.draggable = true;
  el.dataset.correct = wire.pin;
  el.innerHTML = `<span class="dot" style="background:${wire.hex}"></span><span>${wire.color}</span>`;

  el.addEventListener('dragstart', e => {
    if (locked) { e.preventDefault(); return; }
    draggingId = id; el.classList.add('dragging');
    try { e.dataTransfer.setData('text/plain', id); } catch (err) {}
  });
  el.addEventListener('dragend', () => el.classList.remove('dragging'));
  el.addEventListener('click', e => {
    e.stopPropagation(); if (locked) return;
    if (selectedToken === el) { el.classList.remove('selected'); selectedToken = null; }
    else {
      if (selectedToken) selectedToken.classList.remove('selected');
      selectedToken = el; el.classList.add('selected');
    }
  });
  return el;
}

function buildSlots() {
  slots.innerHTML = '';
  for (let i = 0; i < 8; i++) {
    const slot = document.createElement('div');
    slot.className = 'slot'; slot.dataset.index = i;
    slot.innerHTML = `<div class="slot-num">${i + 1}</div><div class="slot-content"></div>`;

    slot.addEventListener('dragover', e => { if (locked) return; e.preventDefault(); slot.classList.add('drag-over'); });
    slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));
    slot.addEventListener('drop', e => {
      if (locked) return; e.preventDefault(); slot.classList.remove('drag-over');
      const tid = draggingId || (e.dataTransfer ? e.dataTransfer.getData('text/plain') : null);
      const token = tid ? document.getElementById(tid) : null; if (!token) return;
      const content = slot.querySelector('.slot-content');
      const existing = content.firstChild;
      if (existing && existing !== token) pool.appendChild(existing);
      if (token.parentNode) token.parentNode.removeChild(token);
      content.appendChild(token);
      token.classList.remove('selected');
      if (selectedToken === token) selectedToken = null;
    });

    slot.addEventListener('click', e => {
      if (locked) return; if (e.target.closest('.wire')) return;
      const content = slot.querySelector('.slot-content');
      const existing = content.firstChild;
      if (selectedToken) {
        if (existing && existing !== selectedToken) pool.appendChild(existing);
        if (selectedToken.parentNode) selectedToken.parentNode.removeChild(selectedToken);
        content.appendChild(selectedToken);
        selectedToken.classList.remove('selected'); selectedToken = null;
      } else if (existing) {
        selectedToken = existing; selectedToken.classList.add('selected');
      }
    });
    slots.appendChild(slot);
  }
}

function timeExpired() {
  clearTimer(); locked = true; shakeBoard(); beep(220, 0.4, 'sawtooth');
  setFeedback('⏰ ¡Tiempo agotado! ' + STANDARDS[selectedStd].pins.map(p=>p.color).join(', ') + '.', 'bad');
  if (mode === 'challenge' || mode === 'extreme') {
    lives--; updateStats();
    if (lives <= 0) {
      setFeedback('💀 Sin vidas. Fin. Puntaje: ' + score + '. ' + STANDARDS[selectedStd].pins.map(p=>p.color).join(', ') + '.', 'bad');
      if (score > getBest()) setBest(score);
      score = 0; round = 0;
    }
  }
  disableBoard();
  startBtn.disabled = false; startBtn.textContent = 'Reintentar';
  timeVal.classList.remove('time-danger');
}

function disableBoard() {
  locked = true;
  document.querySelectorAll('.wire').forEach(w => w.classList.add('locked'));
  checkBtn.disabled = true; resetBtn.disabled = true;
}

function resetRound() {
  if (locked) return;
  const tokenMap = {};
  document.querySelectorAll('.wire').forEach(t => { tokenMap[t.id] = t; });
  pool.innerHTML = '';
  slots.querySelectorAll('.slot').forEach(s => {
    s.classList.remove('correct', 'wrong');
    const c = s.querySelector('.slot-content');
    if (c.firstChild) pool.appendChild(c.firstChild);
  });
  const ordered = initialOrder.map(id => tokenMap[id]).filter(Boolean);
  pool.innerHTML = '';
  ordered.forEach(t => { t.classList.remove('selected', 'locked'); pool.appendChild(t); });
  selectedToken = null;
  setFeedback('Ronda reiniciada.', 'info');
}

function startRound() {
  if ((mode === 'challenge' || mode === 'extreme') && lives <= 0) {
    lives = maxLives(mode); score = 0; round = 0;
    setFeedback('💀 Sin vidas. ¡Nuevo juego!', 'info');
  }

  locked = true; selectedToken = null;
  buildSlots(); pool.innerHTML = ''; pool.classList.remove('drag-over');

  const wires = STANDARDS[selectedStd].pins.map(p => ({ pin: p.pin, color: p.color, hex: p.hex }));
  shuffle(wires);
  const tokens = wires.map(w => createToken(w));
  tokens.forEach(t => pool.appendChild(t));
  initialOrder = tokens.map(t => t.id);

  checkBtn.disabled = true; resetBtn.disabled = true;
  startBtn.textContent = 'En juego…'; startBtn.disabled = true;

  clearTimer();
  timeLeft = roundTime();
  timeVal.classList.remove('time-danger');
  setFeedback(`Prepárate… ronda ${round + 1} (${STANDARDS[selectedStd].name})`, 'info');
  updateStats();

  runCountdown(() => {
    locked = false; checkBtn.disabled = false; resetBtn.disabled = false;
    if (timeLeft > 0) {
      timerId = setInterval(() => {
        timeLeft--;
        updateStats();
        if (timeLeft <= 10 && timeLeft > 0) {
          timeVal.classList.add('time-danger');
          beep(440 + (10 - timeLeft) * 40, 0.08, 'square');
        }
        if (timeLeft <= 0) { clearTimer(); timeExpired(); }
      }, 1000);
    }
    setFeedback(`¡Ya! Ordena los 8 hilos según ${STANDARDS[selectedStd].name}.`, 'info');
  });
}

function verify() {
  if (locked) return;
  const slotEls = slots.querySelectorAll('.slot');
  let correctCount = 0; let emptyCount = 0;
  slotEls.forEach((slot, i) => {
    slot.classList.remove('correct', 'wrong');
    const token = slot.querySelector('.slot-content .wire');
    if (!token) { emptyCount++; slot.classList.add('wrong'); return; }
    const cPin = parseInt(token.dataset.correct, 10);
    if (cPin === i + 1) { slot.classList.add('correct'); correctCount++; }
    else slot.classList.add('wrong');
  });
  if (emptyCount > 0) { setFeedback(`Faltan ${emptyCount} hilo(s) por colocar.`, 'info'); shakeBoard(); return; }

  if (correctCount === 8) {
    clearTimer(); timeVal.classList.remove('time-danger');
    let bonus = mode !== 'practice' ? Math.max(0, timeLeft) * 2 : 0;
    let speedBonus = (mode !== 'practice' && timeLeft > roundTime() * 0.6) ? 25 : 0;
    let pts = 50 + bonus + speedBonus;
    if (mode === 'extreme') pts = Math.round(pts * 1.5);
    score += pts; round++;
    if (score > getBest()) setBest(score);
    updateStats();
    let extra = '';
    if (speedBonus) extra += ' ⚡¡Veloz! +25';
    if (bonus) extra += ' (+' + bonus + ' tiempo)';
    if (mode === 'extreme') extra += ' ×1.5 extremo';
    setFeedback(`✅ ¡Perfecto! +${pts} puntos.${extra}`, 'ok');
    beep(784, 0.15, 'triangle'); setTimeout(()=>beep(988,0.2,'triangle'),150);
    disableBoard(); startBtn.disabled = false; startBtn.textContent = 'Siguiente ronda';
  } else {
    setFeedback(`❌ ${correctCount}/8 correctos. Revisa los marcados.`, 'bad');
    shakeBoard(); beep(330, 0.15, 'sawtooth');
    if (mode === 'challenge' || mode === 'extreme') {
      lives--; updateStats();
      if (lives <= 0) {
        clearTimer(); timeVal.classList.remove('time-danger');
        setFeedback('💀 Sin vidas. Fin. Puntaje: ' + score + '. ' + STANDARDS[selectedStd].pins.map(p=>p.color).join(', ') + '.', 'bad');
        if (score > getBest()) setBest(score);
        score = 0; round = 0; disableBoard();
        startBtn.disabled = false; startBtn.textContent = 'Reintentar';
      }
    }
  }
}

// ===== QUICK MODE =====
function initQuick() {
  const std = STANDARDS[selectedStd];
  let pinObj; let idx;
  do {
    idx = Math.floor(Math.random() * std.pins.length);
    pinObj = std.pins[idx];
  } while (lastQuickPin === idx);
  lastQuickPin = idx;
  quickColor.innerHTML = `<span class="dot" style="background:${pinObj.hex}"></span> ${pinObj.color}`;
  quickColor.dataset.pin = pinObj.pin;
  quickInput.value = '';
  quickFeedback.textContent = ''; quickFeedback.className = 'quiz-feedback';
}

quickSubmit.addEventListener('click', () => {
  const guess = parseInt(quickInput.value, 10);
  const correct = parseInt(quickColor.dataset.pin, 10);
  if (isNaN(guess) || guess < 1 || guess > 8) {
    quickFeedback.textContent = 'Ingresa un número entre 1 y 8.';
    quickFeedback.className = 'quiz-feedback bad'; return;
  }
  if (guess === correct) {
    streak++; if (streak > bestStreak) { bestStreak = streak; setBestStreak(bestStreak); }
    score += 5; if (score > getBest()) setBest(score);
    quickFeedback.textContent = `✅ ¡Correcto! Pin ${correct}. +5 pts`;
    quickFeedback.className = 'quiz-feedback ok';
    beep(784, 0.1, 'triangle');
  } else {
    streak = 0;
    quickFeedback.textContent = `❌ Incorrecto. Era el pin ${correct}.`;
    quickFeedback.className = 'quiz-feedback bad';
    shakeBoard(); beep(260, 0.12, 'sawtooth');
  }
  updateStats();
});
quickNext.addEventListener('click', initQuick);

// ===== EVENTOS =====
stdSelect.addEventListener('change', () => { selectedStd = stdSelect.value; if (!locked) startRound(); initQuick(); });
modeSelect.addEventListener('change', () => {
  mode = modeSelect.value; lives = maxLives(mode); score = 0; round = 0; clearTimer();
  locked = true; checkBtn.disabled = true; resetBtn.disabled = true;
  startBtn.disabled = false; startBtn.textContent = '▶ Empezar ronda';
  timeLeft = 0; timeVal.classList.remove('time-danger'); updateStats();
  setFeedback(`Modo ${modeSelect.options[modeSelect.selectedIndex].text}. Pulsa empezar.`, 'info');
});
startBtn.addEventListener('click', startRound);
checkBtn.addEventListener('click', verify);
resetBtn.addEventListener('click', resetRound);

pool.addEventListener('dragover', e => { if (locked) return; e.preventDefault(); pool.classList.add('drag-over'); });
pool.addEventListener('dragleave', () => pool.classList.remove('drag-over'));
pool.addEventListener('drop', e => {
  if (locked) return; e.preventDefault(); pool.classList.remove('drag-over');
  const tid = draggingId || (e.dataTransfer ? e.dataTransfer.getData('text/plain') : null);
  const token = tid ? document.getElementById(tid) : null; if (!token) return;
  if (token.parentNode) token.parentNode.removeChild(token);
  pool.appendChild(token); token.classList.remove('selected');
  if (selectedToken === token) selectedToken = null;
});
pool.addEventListener('click', e => {
  if (locked) return; if (e.target !== pool) return;
  if (selectedToken) { if (selectedToken.parentNode) selectedToken.parentNode.removeChild(selectedToken); pool.appendChild(selectedToken); selectedToken.classList.remove('selected'); selectedToken = null; }
});

// ===== TEMA =====
function applyTheme(t) { document.documentElement.setAttribute('data-theme', t); themeToggle.textContent = t === 'dark' ? '☀️' : '🌙'; try { localStorage.setItem('theme', t); } catch (e) {} }
let savedTheme = 'light'; try { savedTheme = localStorage.getItem('theme') || 'light'; } catch (e) {}
applyTheme(savedTheme);
themeToggle.addEventListener('click', () => applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));

// ===== INIT =====
bestStreak = getBestStreak(); score = 0;
lives = maxLives(mode); locked = true;
startBtn.textContent = '▶ Empezar ronda';
updateStats(); initQuick();
setFeedback('Elige estándar y modo, luego pulsa "Empezar ronda".', 'info');
buildSlots(); pool.innerHTML = '';
checkBtn.disabled = true; resetBtn.disabled = true;
