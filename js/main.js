// ===========================================================
// AI на роботі — main.js
// ===========================================================

document.addEventListener('DOMContentLoaded', () => {
  initIcons();
  initBackgroundCanvas();
  initTerminalBoot();
  initScrollReveals();
  initCounters();
  initTimelineFill();
  initTaskPicker();
  initRiskScanner();
  initNavToggle();
  initProgressBar();
  initPromptBuilder();
  initTextChecker();
  initQuiz();
});

// ---------- Scroll progress bar ----------
function initProgressBar() {
  const fill = document.getElementById('progressFill');
  if (!fill) return;
  function update() {
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const height = h.scrollHeight - h.clientHeight;
    const pct = height > 0 ? (scrolled / height) * 100 : 0;
    fill.style.width = pct + '%';
  }
  document.addEventListener('scroll', update, { passive: true });
  update();
}

// ---------- Lucide icons ----------
function initIcons() {
  if (window.lucide) lucide.createIcons();
}

// ---------- Ambient background: subtle drifting node network ----------
function initBackgroundCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, nodes;
  const NODE_COUNT = window.innerWidth < 700 ? 26 : 55;
  const MAX_DIST = 140;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  function makeNodes() {
    nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
    }));
  }
  function step() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(70, 255, 142, 0.55)';
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          ctx.strokeStyle = `rgba(70, 255, 142, ${0.12 * (1 - dist / MAX_DIST)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }
    if (!reduceMotion) requestAnimationFrame(step);
  }

  resize();
  makeNodes();
  step();
  window.addEventListener('resize', () => { resize(); makeNodes(); });
}

// ---------- Hero terminal boot sequence ----------
function initTerminalBoot() {
  const el = document.getElementById('typedBoot');
  if (!el) return;

  const lines = [
    '> ініціалізація протоколу AI_ON_DUTY...',
    '> модуль: Корпоративний GPT ... OK',
    '> модуль: Правила безпеки ... OK',
    '> статус: ГОТОВО ДО РОБОТИ_',
  ].join('\n');

  if (window.Typed) {
    new Typed(el, {
      strings: [lines.replace(/\n/g, '<br>')],
      typeSpeed: 14,
      showCursor: false,
      onComplete: () => revealHeroText(),
      contentType: 'html',
    });
  } else {
    el.textContent = lines;
    revealHeroText();
  }
}

function revealHeroText() {
  const targets = document.querySelectorAll('.hero .reveal-up');
  if (window.gsap) {
    gsap.to(targets, {
      opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out',
    });
  } else {
    targets.forEach(t => { t.style.opacity = 1; t.style.transform = 'none'; });
  }
}

// ---------- Scroll-triggered reveals ----------
function initScrollReveals() {
  if (!window.gsap || !window.ScrollTrigger) {
    document.querySelectorAll('.reveal').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
    document.querySelectorAll('.typing-target').forEach(el => { el.textContent = el.dataset.text || ''; });
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  const groups = document.querySelectorAll(
    '.stats-grid, .benefit-grid, .tool-cards, .danger-grid, .tips-row, .timeline, .checklist, .formula-row'
  );
  groups.forEach(group => {
    const items = group.querySelectorAll('.reveal');
    if (!items.length) return;
    gsap.to(items, {
      opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
      scrollTrigger: { trigger: group, start: 'top 85%' },
    });
  });

  // standalone reveals not inside a handled group
  document.querySelectorAll('.reveal').forEach(el => {
    if (el.closest('.stats-grid, .benefit-grid, .tool-cards, .danger-grid, .tips-row, .timeline, .checklist, .formula-row')) return;
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.65, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });

  // typing effect for example chat bubbles as they enter view
  document.querySelectorAll('.typing-target').forEach(el => {
    const full = el.dataset.text || '';
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => typeText(el, full),
    });
  });
}

function typeText(el, text, speed = 16) {
  let i = 0;
  el.textContent = '';
  const iv = setInterval(() => {
    el.textContent += text[i];
    i++;
    if (i >= text.length) clearInterval(iv);
  }, speed);
}

// ---------- Animated stat counters ----------
function initCounters() {
  const counters = document.querySelectorAll('.stat-number');
  if (!counters.length) return;

  const run = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1200;
    const start = performance.now();
    function frame(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  };

  if (window.ScrollTrigger) {
    counters.forEach(el => {
      ScrollTrigger.create({
        trigger: el, start: 'top 90%', once: true,
        onEnter: () => run(el),
      });
    });
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { run(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(el => io.observe(el));
  }
}

// ---------- Timeline connecting-line fill ----------
function initTimelineFill() {
  const fill = document.getElementById('timelineFill');
  const timeline = document.getElementById('timeline');
  if (!fill || !timeline || !window.ScrollTrigger) return;

  gsap.to(fill, {
    width: '100%',
    ease: 'none',
    scrollTrigger: {
      trigger: timeline,
      start: 'top 75%',
      end: 'bottom 60%',
      scrub: 0.6,
    },
  });
}

// ---------- Task -> tool recommender ----------
function initTaskPicker() {
  const wrap = document.getElementById('taskOptions');
  const result = document.getElementById('taskResult');
  if (!wrap || !result) return;

  const messages = {
    corp: '<strong>Корпоративний GPT.</strong> Це робочий лист без конфіденційних даних — використовуйте основний інструмент за замовчуванням.',
    'claude-doc': '<strong>Claude</strong> — але лише якщо документ не конфіденційний. Найкраще справляється з довгими текстами та детальним аналізом. Якщо документ містить внутрішню чи закриту інформацію — жоден хмарний AI не підходить.',
    gemini: '<strong>Gemini.</strong> Природно інтегрований у Google Docs і Sheets — зручно для таблиць і розрахунків.',
    'chatgpt-idea': '<strong>ChatGPT.</strong> Гарний варіант для швидкого брейнстормінгу та загальних ідей.',
    'copilot-office': '<strong>Copilot.</strong> Працює прямо в Teams та Outlook — не потрібно перемикати вікна.',
    local: '<strong>Локальна LLM на власному ПК (напр. Ollama).</strong> Єдиний спосіб працювати з конфіденційними даними — розгортається самостійно, офлайн, за погодженням з IT. Хмарні AI, включно з корпоративним GPT, для цього не підходять.',
    'chatgpt-translate': '<strong>ChatGPT або Gemini.</strong> Обидва добре перекладають — якщо текст не містить конфіденційної інформації.',
    'claude-code': '<strong>Claude.</strong> Сильний у роботі з кодом і поясненні логіки — але без реального внутрішнього коду компанії в публічних сервісах.',
    'copilot-slides': '<strong>Copilot.</strong> Інтегрований у PowerPoint — допоможе зі структурою й чернеткою слайдів.',
  };

  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    wrap.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tool = btn.dataset.tool;
    result.innerHTML = messages[tool] || '';
    if (window.gsap) {
      gsap.fromTo(result, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.35 });
    }
  });
}

// ---------- Risk scanner (security section) ----------
function initRiskScanner() {
  const wrap = document.getElementById('riskOptions');
  const result = document.getElementById('riskResult');
  if (!wrap || !result) return;

  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const risk = btn.dataset.risk;
    result.classList.remove('is-safe', 'is-danger');
    if (risk === 'safe') {
      result.classList.add('is-safe');
      result.innerHTML = '🟢 МОЖНА — це не конфіденційна інформація.';
    } else {
      result.classList.add('is-danger');
      result.innerHTML = '🔴 НЕ МОЖНА — це конфіденційні чи персональні дані. Не вводьте це в жоден AI.';
    }
    if (window.gsap) {
      gsap.fromTo(result, { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.3 });
    }
  });
}

// ---------- Prompt builder ----------
function initPromptBuilder() {
  const btn = document.getElementById('bGenerate');
  const output = document.getElementById('builderOutput');
  const textEl = document.getElementById('builderText');
  const copyBtn = document.getElementById('bCopy');
  if (!btn || !output || !textEl) return;

  btn.addEventListener('click', () => {
    const role = document.getElementById('bRole').value;
    const task = document.getElementById('bTask').value;
    const tone = document.getElementById('bTone').value;
    const length = document.getElementById('bLength').value;
    const topic = document.getElementById('bTopic').value.trim() || '[опишіть тему]';

    const prompt = `Ти — ${role}. Напиши ${task} про: ${topic}. ` +
      `Обсяг — ${length}. Тон — ${tone}. ` +
      `Якщо чогось не вистачає для якісної відповіді — постав уточнююче запитання.`;

    textEl.textContent = prompt;
    output.hidden = false;
    if (window.gsap) {
      gsap.fromTo(output, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 });
    }
    output.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(textEl.textContent);
        copyBtn.classList.add('copied');
        copyBtn.innerHTML = '<i data-lucide="check"></i> Скопійовано';
        if (window.lucide) lucide.createIcons();
        setTimeout(() => {
          copyBtn.classList.remove('copied');
          copyBtn.innerHTML = '<i data-lucide="copy"></i> Копіювати';
          if (window.lucide) lucide.createIcons();
        }, 1800);
      } catch (e) {
        // clipboard API unavailable — silently ignore, text is still selectable
      }
    });
  }
}

// ---------- Text checker: scan for risky keywords ----------
function initTextChecker() {
  const btn = document.getElementById('checkerBtn');
  const input = document.getElementById('checkerInput');
  const result = document.getElementById('checkerResult');
  if (!btn || !input || !result) return;

  const flagWords = [
    'пароль', 'логін', 'api key', 'api-ключ', 'ключ доступу', 'токен доступу',
    'зарплат', 'оклад', 'паспорт', 'ІПН', 'інн', 'номер картки', 'cvv',
    'конфіденційно', 'комерційна таємниця', 'номер рахунку', 'iban',
  ];

  btn.addEventListener('click', () => {
    const text = input.value.toLowerCase();
    if (!text.trim()) {
      result.className = 'checker-result';
      result.textContent = 'Спочатку вставте текст.';
      return;
    }
    const found = flagWords.filter(w => text.includes(w));
    const cardNumberLike = /\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/.test(text);

    if (found.length || cardNumberLike) {
      result.className = 'checker-result is-danger';
      let html = '🔴 Знайдено потенційно ризиковані елементи:<ul>';
      found.forEach(w => html += `<li>слово «${w}»</li>`);
      if (cardNumberLike) html += '<li>послідовність цифр, схожа на номер картки/рахунку</li>';
      html += '</ul>Перегляньте текст перед відправкою в AI.';
      result.innerHTML = html;
    } else {
      result.className = 'checker-result is-safe';
      result.innerHTML = '🟢 Явних ризикових слів не знайдено. Втім, це проста перевірка — думайте своєю головою.';
    }
    if (window.gsap) gsap.fromTo(result, { opacity: 0 }, { opacity: 1, duration: 0.3 });
  });
}

// ---------- Quiz ----------
function initQuiz() {
  const list = document.getElementById('quizList');
  const progressEl = document.getElementById('quizProgress');
  const scoreEl = document.getElementById('quizScore');
  const summary = document.getElementById('quizSummary');
  const summaryText = document.getElementById('quizSummaryText');
  const retryBtn = document.getElementById('quizRetry');
  if (!list) return;

  const questions = Array.from(list.querySelectorAll('.quiz-question'));
  let answered = 0, score = 0;

  function reset() {
    answered = 0; score = 0;
    progressEl.textContent = '0';
    scoreEl.textContent = '0';
    summary.hidden = true;
    questions.forEach(q => {
      q.querySelectorAll('button').forEach(b => {
        b.disabled = false;
        b.classList.remove('correct', 'incorrect');
      });
    });
    list.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  questions.forEach(q => {
    const correctIndex = parseInt(q.dataset.correct, 10);
    const buttons = q.querySelectorAll('.quiz-options button');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (q.dataset.done) return;
        q.dataset.done = '1';
        const chosenIndex = parseInt(btn.dataset.index, 10);
        buttons.forEach(b => { b.disabled = true; });
        if (chosenIndex === correctIndex) {
          btn.classList.add('correct');
          score++;
        } else {
          btn.classList.add('incorrect');
          buttons[correctIndex].classList.add('correct');
        }
        answered++;
        progressEl.textContent = String(answered);
        scoreEl.textContent = String(score);

        if (answered === questions.length) {
          showSummary();
        }
      });
    });
  });

  function showSummary() {
    let msg;
    if (score >= 9) msg = `🏆 ${score}/10 — відмінно! Ви точно готові безпечно й ефективно працювати з AI.`;
    else if (score >= 6) msg = `👍 ${score}/10 — непогано. Варто ще раз глянути розділи, де були помилки.`;
    else msg = `📖 ${score}/10 — рекомендуємо переглянути сторінку ще раз, особливо розділ про безпеку.`;
    summaryText.textContent = msg;
    summary.hidden = false;
    if (window.gsap) gsap.fromTo(summary, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5 });
    summary.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  if (retryBtn) retryBtn.addEventListener('click', reset);
}
function initNavToggle() {
  const toggle = document.getElementById('navToggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    const open = links.style.display === 'flex';
    links.style.display = open ? 'none' : 'flex';
    links.style.flexDirection = 'column';
    links.style.position = 'absolute';
    links.style.top = '56px';
    links.style.right = '20px';
    links.style.background = '#0E141C';
    links.style.border = '1px solid #1D2733';
    links.style.borderRadius = '10px';
    links.style.padding = '16px 22px';
    links.style.gap = '14px';
  });
}
