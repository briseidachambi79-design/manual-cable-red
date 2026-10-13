// ===== DATOS DE ESTÁNDARES =====
const STANDARDS = {
  a: {
    name: 'T568A',
    pins: [
      { pin: 1, color: 'Blanco/Verde',  hex: '#a8d5a2', signal100: 'RX+', signalGb: 'BiDi', pair: 'Verde' },
      { pin: 2, color: 'Verde',         hex: '#2e9e3f', signal100: 'RX-', signalGb: 'BiDi', pair: 'Verde' },
      { pin: 3, color: 'Blanco/Naranja',hex: '#ffd2a8', signal100: 'TX+', signalGb: 'BiDi', pair: 'Naranja' },
      { pin: 4, color: 'Azul',          hex: '#4a90e2', signal100: '—',   signalGb: 'BiDi', pair: 'Azul' },
      { pin: 5, color: 'Blanco/Azul',   hex: '#b6d4f5', signal100: '—',   signalGb: 'BiDi', pair: 'Azul' },
      { pin: 6, color: 'Naranja',       hex: '#e8741e', signal100: 'TX-', signalGb: 'BiDi', pair: 'Naranja' },
      { pin: 7, color: 'Blanco/Marrón', hex: '#d9b89c', signal100: '—',   signalGb: 'BiDi', pair: 'Marrón' },
      { pin: 8, color: 'Marrón',        hex: '#7a4b2a', signal100: '—',   signalGb: 'BiDi', pair: 'Marrón' },
    ]
  },
  b: {
    name: 'T568B',
    pins: [
      { pin: 1, color: 'Blanco/Naranja',hex: '#ffd2a8', signal100: 'TX+', signalGb: 'BiDi', pair: 'Naranja' },
      { pin: 2, color: 'Naranja',       hex: '#e8741e', signal100: 'TX-', signalGb: 'BiDi', pair: 'Naranja' },
      { pin: 3, color: 'Blanco/Verde',  hex: '#a8d5a2', signal100: 'RX+', signalGb: 'BiDi', pair: 'Verde' },
      { pin: 4, color: 'Azul',          hex: '#4a90e2', signal100: '—',   signalGb: 'BiDi', pair: 'Azul' },
      { pin: 5, color: 'Blanco/Azul',   hex: '#b6d4f5', signal100: '—',   signalGb: 'BiDi', pair: 'Azul' },
      { pin: 6, color: 'Verde',         hex: '#2e9e3f', signal100: 'RX-', signalGb: 'BiDi', pair: 'Verde' },
      { pin: 7, color: 'Blanco/Marrón', hex: '#d9b89c', signal100: '—',   signalGb: 'BiDi', pair: 'Marrón' },
      { pin: 8, color: 'Marrón',        hex: '#7a4b2a', signal100: '—',   signalGb: 'BiDi', pair: 'Marrón' },
    ]
  }
};

const PAIRS = [
  { name: 'Naranja', solid: '#e8741e', striped: '#ffd2a8', pins: '1,2 (B) / 3,6 (A)', desc: 'TX en 10/100 (lado B)' },
  { name: 'Verde',   solid: '#2e9e3f', striped: '#a8d5a2', pins: '3,6 (B) / 1,2 (A)', desc: 'RX en 10/100' },
  { name: 'Azul',    solid: '#4a90e2', striped: '#b6d4f5', pins: '4,5', desc: 'Voz / PoE' },
  { name: 'Marrón',  solid: '#7a4b2a', striped: '#d9b89c', pins: '7,8', desc: 'Voz / PoE' },
];

// ===== REFERENCIAS DOM =====
const colorTableBody = document.getElementById('colorTableBody');
const rj45Visual = document.getElementById('rj45Visual');
const pairsLegend = document.getElementById('pairsLegend');
const visTitle = document.getElementById('visTitle');
const cableTypeSelect = document.getElementById('cableType');
const endsPreview = document.getElementById('endsPreview');
const cableTypeInfo = document.getElementById('cableTypeInfo');
const quizQuestion = document.getElementById('quizQuestion');
const quizOptions = document.getElementById('quizOptions');
const quizFeedback = document.getElementById('quizFeedback');
const quizScore = document.getElementById('quizScore');
const nextBtn = document.getElementById('nextBtn');
const restartBtn = document.getElementById('restartQuiz');
const themeToggle = document.getElementById('themeToggle');

let currentStd = 'b';

// ===== RENDER TABLA =====
function renderTable(std) {
  const data = STANDARDS[std].pins;
  colorTableBody.innerHTML = data.map(p => `
    <tr>
      <td><span class="pin-num">${p.pin}</span></td>
      <td>
        <span class="swatch" style="background:${p.hex};"></span>
        <span class="color-name">${p.color}</span>
      </td>
      <td>${p.pair}</td>
      <td>${p.signal100}</td>
      <td>${p.signalGb}</td>
    </tr>
  `).join('');
}

// ===== RENDER VISUAL =====
function renderVisual(std) {
  const data = STANDARDS[std].pins;
  visTitle.textContent = `Conector RJ45 — ${STANDARDS[std].name}`;
  rj45Visual.innerHTML = `
    <div class="rj-body">
      ${data.map(p => `
        <div class="rj-pin">
          <span class="rj-num">${p.pin}</span>
          <span class="rj-wire" style="background:${p.hex};" title="${p.color}"></span>
          <span class="rj-color">${p.color}</span>
        </div>
      `).join('')}
    </div>
  `;
}

// ===== RENDER PARES =====
function renderPairs() {
  pairsLegend.innerHTML = PAIRS.map(p => `
    <div class="pair-row">
      <div class="pair-colors">
        <span class="swatch big" style="background:${p.solid};"></span>
        <span class="swatch big stripe" style="background:${p.striped};"></span>
      </div>
      <div class="pair-info">
        <strong>${p.name}</strong>
        <span class="muted">Pines: ${p.pins} · ${p.desc}</span>
      </div>
    </div>
  `).join('');
}

// ===== CAMBIO DE ESTÁNDAR =====
function setStd(std) {
  currentStd = std;
  document.querySelectorAll('.std-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.std === std);
  });
  renderTable(std);
  renderVisual(std);
}
document.querySelectorAll('.std-btn').forEach(b => {
  b.addEventListener('click', () => setStd(b.dataset.std));
});

// ===== SELECTOR DE TIPO DE CABLE =====
function updateEnds() {
  const v = cableTypeSelect.value;
  let left, right, label, info;
  if (v === 'directo') {
    left = 'B'; right = 'B'; label = 'Directo (B–B)';
    info = 'Uso habitual PC↔Switch o Switch↔Router. El orden es idéntico en ambos extremos.';
  } else if (v === 'cruzado') {
    left = 'B'; right = 'A'; label = 'Cruzado (B–A)';
    info = 'Interconecta equipos similares (PC↔PC, Switch↔Switch) en equipos antiguos sin Auto-MDIX.';
  } else {
    left = 'B'; right = 'B (PoE)'; label = 'PoE (B–B)';
    info = 'Para alimentar dispositivos (cámaras, APs). El par Azul (4,5) y Marrón (7,8) transportan energía; usa cable de buena calidad.';
  }
  const clsLeft = left.toLowerCase().replace(/[^a-z]/g, '');
  const clsRight = right.toLowerCase().replace(/[^a-z]/g, '');
  endsPreview.innerHTML = `
    <div class="end-chip big ${clsLeft}">${left}</div>
    <span class="cable-line"></span>
    <div class="end-chip big ${clsRight}">${right}</div>
    <div class="label-pill">${label}</div>
  `;
  cableTypeInfo.textContent = info;
}
cableTypeSelect.addEventListener('change', updateEnds);

// ===== QUIZ =====
const quizData = [
  {
    q: 'En T568B, ¿qué color corresponde al pin 1?',
    options: ['Blanco/Naranja', 'Blanco/Verde', 'Azul', 'Blanco/Marrón'],
    answer: 0,
    hint: 'T568B inicia con el par Naranja (TX+).'
  },
  {
    q: '¿Qué pares son idénticos en T568A y T568B?',
    options: ['Naranja y Verde', 'Azul y Marrón', 'Verde y Azul', 'Naranja y Marrón'],
    answer: 1,
    hint: 'Solo se intercambian Naranja y Verde; Azul y Marrón no cambian.'
  },
  {
    q: '¿Qué tipo de cable tiene el mismo estándar en ambos extremos?',
    options: ['Cruzado', 'Directo', 'PoE', 'Consola'],
    answer: 1,
    hint: 'El directo (straight-through) usa B–B (o A–A).'
  },
  {
    q: 'En un cable de 10/100 Mbps, ¿qué pines llevan datos (TX/RX)?',
    options: ['1, 2, 3 y 6', '4, 5, 7 y 8', '1, 2, 4 y 5', '3, 6, 7 y 8'],
    answer: 0,
    hint: 'Pines 1,2 (TX) y 3,6 (RX). El resto puede usarse para voz o PoE.'
  },
  {
    q: '¿Qué herramienta prepara la punta del cable antes de crimpar?',
    options: ['Pelacables (stripper)', 'Ponchadora', 'Crimpadora', 'Tester'],
    answer: 0,
    hint: 'Se retira la funda exterior unos 12–15 mm con el pelacables.'
  }
];

let currentQ = 0;
let score = 0;
let answered = false;

function renderQuiz() {
  answered = false;
  quizFeedback.textContent = '';
  quizFeedback.className = 'quiz-feedback';
  nextBtn.style.display = 'none';
  const q = quizData[currentQ];
  quizQuestion.textContent = `Pregunta ${currentQ + 1}/${quizData.length}: ${q.q}`;
  quizOptions.innerHTML = q.options.map((opt, i) =>
    `<button class="opt-btn" data-i="${i}">${opt}</button>`
  ).join('');
  quizOptions.querySelectorAll('.opt-btn').forEach(btn => {
    btn.addEventListener('click', () => checkAnswer(parseInt(btn.dataset.i)));
  });
  quizScore.textContent = `Puntaje: ${score}/${currentQ}`;
}

function checkAnswer(i) {
  if (answered) return;
  answered = true;
  const q = quizData[currentQ];
  const btns = quizOptions.querySelectorAll('.opt-btn');
  btns.forEach((b, idx) => {
    b.disabled = true;
    if (idx === q.answer) b.classList.add('correct');
    if (idx === i && i !== q.answer) b.classList.add('wrong');
  });
  if (i === q.answer) {
    score++;
    quizFeedback.textContent = '✅ ¡Correcto!';
    quizFeedback.classList.add('ok');
  } else {
    quizFeedback.textContent = `❌ Incorrecto. Pista: ${q.hint}`;
    quizFeedback.classList.add('bad');
  }
  nextBtn.style.display = 'inline-flex';
  quizScore.textContent = `Puntaje: ${score}/${currentQ + 1}`;
}

nextBtn.addEventListener('click', () => {
  currentQ++;
  if (currentQ >= quizData.length) {
    quizQuestion.textContent = `¡Quiz terminado! Resultado: ${score}/${quizData.length}`;
    quizOptions.innerHTML = '';
    quizFeedback.textContent = score === quizData.length
      ? '🏆 Perfecto. ¡Eres un experto en cableado!'
      : '💡 Repasa la sección de colores y vuelve a intentarlo.';
    quizFeedback.className = 'quiz-feedback ' + (score === quizData.length ? 'ok' : 'bad');
    nextBtn.style.display = 'none';
    return;
  }
  renderQuiz();
});

restartBtn.addEventListener('click', () => {
  currentQ = 0;
  score = 0;
  renderQuiz();
});

// ===== TEMA =====
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  themeToggle.textContent = t === 'dark' ? '☀️' : '🌙';
  try { localStorage.setItem('theme', t); } catch (e) {}
}
let saved = 'light';
try { saved = localStorage.getItem('theme') || 'light'; } catch (e) {}
applyTheme(saved);
themeToggle.addEventListener('click', () => {
  applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

// ===== INIT =====
renderPairs();
setStd('b');
updateEnds();
renderQuiz();
