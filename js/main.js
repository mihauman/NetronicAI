// ===========================================================
// AI на роботі — main.js
// ===========================================================

// TODO(feedback-form): paste the URL of your deployed Google Apps Script Web App here.
// See README.md → "Форма фідбеку" for the deployment steps and the ready-to-use script.
const FEEDBACK_ENDPOINT = 'PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';

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
  initFeedbackForm();
  initRolePrompts();
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
    '> ініціалізація протоколу Netronic_AI...',
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
// ---------- Feedback form (modal + Google Sheets via Apps Script) ----------
function initFeedbackForm() {
  const trigger = document.getElementById('feedbackTrigger');
  const modal = document.getElementById('feedbackModal');
  const closeBtn = document.getElementById('feedbackClose');
  const doneBtn = document.getElementById('feedbackDone');
  const form = document.getElementById('feedbackForm');
  const errorEl = document.getElementById('feedbackError');
  const successEl = document.getElementById('feedbackSuccess');
  const submitBtn = document.getElementById('feedbackSubmit');
  const nameInput = document.getElementById('fbName');
  const commentInput = document.getElementById('fbComment');
  const ratingInput = document.getElementById('fbRating');
  const stars = document.querySelectorAll('.rating-star');
  if (!trigger || !modal || !form) return;

  function openModal() {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    nameInput.focus();
  }
  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
  }
  function resetForm() {
    form.reset();
    form.hidden = false;
    successEl.hidden = true;
    errorEl.hidden = true;
    ratingInput.value = '';
    stars.forEach(s => { s.classList.remove('is-active'); s.setAttribute('aria-pressed', 'false'); });
    [nameInput, commentInput].forEach(el => el.classList.remove('field-invalid'));
    submitBtn.disabled = false;
    submitBtn.textContent = '';
    submitBtn.innerHTML = 'Надіслати <i data-lucide="send"></i>';
    if (window.lucide) lucide.createIcons();
  }

  trigger.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  if (doneBtn) doneBtn.addEventListener('click', () => { closeModal(); resetForm(); });
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

  // star rating
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const value = parseInt(star.dataset.value, 10);
      ratingInput.value = String(value);
      stars.forEach(s => {
        const active = parseInt(s.dataset.value, 10) <= value;
        s.classList.toggle('is-active', active);
        s.setAttribute('aria-pressed', String(active));
      });
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.hidden = true;
    [nameInput, commentInput].forEach(el => el.classList.remove('field-invalid'));

    const name = nameInput.value.trim();
    const comment = commentInput.value.trim();
    const rating = ratingInput.value;

    const problems = [];
    if (!name) { problems.push('вкажіть ім\'я'); nameInput.classList.add('field-invalid'); }
    if (!rating) { problems.push('оберіть оцінку'); }
    if (!comment || comment.length < 3) { problems.push('додайте короткий коментар'); commentInput.classList.add('field-invalid'); }

    if (problems.length) {
      errorEl.hidden = false;
      errorEl.textContent = 'Будь ласка, заповніть форму: ' + problems.join(', ') + '.';
      return;
    }

    if (!FEEDBACK_ENDPOINT || FEEDBACK_ENDPOINT.startsWith('PASTE_')) {
      errorEl.hidden = false;
      errorEl.textContent = 'Форма ще не підключена до Google Sheets — див. README, розділ "Форма фідбеку".';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Надсилаємо...';

    const payload = {
      name, rating, comment,
      page: location.href,
      timestamp: new Date().toISOString(),
    };

    try {
      // Apps Script Web Apps don't send CORS headers, so the response is opaque
      // in 'no-cors' mode — we can't read it, only tell whether the request itself
      // was sent. text/plain avoids a CORS preflight request.
      await fetch(FEEDBACK_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });
      form.hidden = true;
      successEl.hidden = false;
      if (window.lucide) lucide.createIcons();
    } catch (err) {
      errorEl.hidden = false;
      errorEl.textContent = 'Не вдалося надіслати фідбек — перевірте з\'єднання й спробуйте ще раз.';
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Надіслати <i data-lucide="send"></i>';
      if (window.lucide) lucide.createIcons();
    }
  });
}

// ---------- Prompts by role / department ----------
// Grouped by the company's real department structure (17 groups).
const ROLE_PROMPTS = {
  hr: {
    label: 'Відділ персоналу (HR)',
    prompts: [
      { icon: 'file-text', title: 'Опис вакансії', desc: '«Напиши опис вакансії на посаду [назва]: обов’язки, вимоги, умови. Тон діловий, 6-8 речень»' },
      { icon: 'message-circle-question', title: 'Питання для співбесіди', desc: '«Склади 8 питань для співбесіди на позицію [посада] — і на хардскіли, і на м’які навички»' },
      { icon: 'mail', title: 'Лист-відмова кандидату', desc: '«Напиши ввічливий лист-відмову кандидату після співбесіди на [посада], 3-4 речення, без канцеляризмів»' },
      { icon: 'clipboard-list', title: 'План онбордингу', desc: '«Склади чек-лист адаптації нового співробітника на перші два тижні для посади [посада]»' },
    ],
  },
  office: {
    label: 'Відділ комунікації та забезпечення офісу',
    prompts: [
      { icon: 'building-2', title: 'Внутрішнє повідомлення', desc: '«Напиши коротке повідомлення про новий порядок замовлення канцелярії в офісі, 3-4 речення»' },
      { icon: 'mail', title: 'Лист постачальнику', desc: '«Напиши лист постачальнику клінінгових послуг із запитом комерційної пропозиції на прибирання офісу 500 м²»' },
      { icon: 'list-tree', title: 'Інструкція для новачків', desc: '«Склади коротку інструкцію: як забронювати переговорну кімнату і замовити перепустку для гостя»' },
    ],
  },
  marketing: {
    label: 'Відділ маркетингу',
    prompts: [
      { icon: 'megaphone', title: 'Заголовки для лендінгу', desc: '«Напиши 3 варіанти заголовка для лендінгу продукту [назва], акцент на головну перевагу, до 8 слів»' },
      { icon: 'calendar', title: 'План контенту на місяць', desc: '«Згенеруй план публікацій на місяць для Instagram: 12 тем + короткий опис кожної»' },
      { icon: 'split', title: 'A/B варіанти реклами', desc: '«Напиши 4 короткі варіанти реклами (до 90 символів) для Facebook Ads, що просуває [продукт]»' },
    ],
  },
  content: {
    label: 'Відділ розкриття цінності (контент і бренд)',
    prompts: [
      { icon: 'clapperboard', title: 'Сценарій відео', desc: '«Напиши сценарій 60-секундного відео про [продукт]: гачок, 3 переваги, заклик до дії»' },
      { icon: 'pen-tool', title: 'Структура статті', desc: '«Побудуй структуру статті на тему [тема]: вступ, 4 підрозділи з тезами, висновок»' },
      { icon: 'sparkles', title: 'Пост у фірмовому тоні', desc: '«Перепиши текст [вставити] у теплому, людяному тоні бренду, коротко, з легким гумором»' },
    ],
  },
  sales_commerce: {
    label: 'Відділ продажів (Комерція)',
    prompts: [
      { icon: 'handshake', title: 'Комерційна пропозиція', desc: '«Напиши коротку КП для клієнта [компанія] на [продукт], з акцентом на вигоду, 6-8 речень»' },
      { icon: 'send', title: 'Follow-up лист', desc: '«Напиши ввічливий follow-up клієнту, який не відповідав два тижні після демо, з конкретним наступним кроком»' },
      { icon: 'message-square', title: 'Відповідь на заперечення', desc: '«Дай 3 варіанти відповіді на заперечення "це дорого" для [продукт], аргументовано, без тиску»' },
    ],
  },
  sales_military: {
    label: 'Відділ продажів (Мілітарі)',
    prompts: [
      { icon: 'shield', title: 'Опис для тендеру', desc: '«Структуруй технічний опис виробу [назва] для тендерної документації: характеристики, стандарти, переваги»' },
      { icon: 'mail', title: 'Лист партнеру англійською', desc: '«Напиши офіційний лист партнеру англійською з пропозицією співпраці щодо постачання [продукт]»' },
      { icon: 'list-checks', title: 'Підготовка до перемовин', desc: '«Склади 5 імовірних питань замовника щодо [продукт] і короткі тези відповіді на кожне»' },
    ],
  },
  finance: {
    label: 'Відділ витрат (фінанси)',
    prompts: [
      { icon: 'wallet', title: 'Пояснення бюджету', desc: '«Поясни простими словами відхилення факту від бюджету по статті [стаття] за [період], для нефінансиста»' },
      { icon: 'mail', title: 'Лист про прострочену оплату', desc: '«Напиши ввічливий, але чіткий лист контрагенту про прострочену оплату рахунку №[номер] до [дата]»' },
      { icon: 'table', title: 'Порівняння варіантів витрат', desc: '«Зроби порівняльну таблицю трьох варіантів [постачальник] за ціною, умовами й ризиками»' },
    ],
  },
  accounting: {
    label: 'Відділ обліку (бухгалтерія)',
    prompts: [
      { icon: 'calculator', title: 'Пояснення проведення', desc: '«Поясни просто, що означає бухгалтерське проведення [вставити] і навіщо воно потрібне»' },
      { icon: 'clipboard-list', title: 'Чек-лист закриття місяця', desc: '«Склади чек-лист кроків для закриття місяця в обліку виробничого підприємства»' },
      { icon: 'mail', title: 'Нагадування про документи', desc: '«Напиши нагадування контрагенту про необхідність надати акт виконаних робіт за [період]»' },
    ],
  },
  production: {
    label: 'Виробничий департамент',
    prompts: [
      { icon: 'factory', title: 'Пам’ятка з техніки безпеки', desc: '«Напиши коротку пам’ятку з техніки безпеки для дільниці [назва], 5 пунктів, простою мовою»' },
      { icon: 'list-tree', title: 'Опис техпроцесу', desc: '«Структуруй опис етапів виготовлення [виріб] для внутрішньої документації, покроково»' },
      { icon: 'file-text', title: 'Звіт про простій', desc: '«Допоможи структурувати короткий звіт про причину й наслідки простою лінії [назва] за [дата]»' },
    ],
  },
  support_service: {
    label: 'Відділ технічної підтримки та сервісу',
    prompts: [
      { icon: 'life-buoy', title: 'Відповідь на скаргу', desc: '«Напиши ввічливу відповідь клієнту, який скаржиться на [проблема], з вибаченням і планом вирішення»' },
      { icon: 'book-open', title: 'Інструкція для користувача', desc: '«Спрости технічний текст [вставити] у покрокову інструкцію для нетехнічного користувача»' },
      { icon: 'help-circle', title: 'База типових питань', desc: '«Згенеруй 5 типових питань клієнтів про [продукт] з короткими відповідями для бази знань»' },
    ],
  },
  quality: {
    label: 'Відділ якості',
    prompts: [
      { icon: 'badge-check', title: 'Звіт про невідповідність', desc: '«Структуруй опис невідповідності [опис]: причина, вплив, коригувальна дія»' },
      { icon: 'clipboard-list', title: 'Чек-лист вхідного контролю', desc: '«Склади чек-лист перевірки якості для партії [матеріал], 6-8 пунктів»' },
      { icon: 'book-open', title: 'Пояснення стандарту', desc: '«Поясни простими словами вимогу стандарту [назва/пункт] для співробітників цеху»' },
    ],
  },
  pr_partnerships: {
    label: 'PR, розвиток і партнерства',
    prompts: [
      { icon: 'newspaper', title: 'Прес-реліз', desc: '«Напиши короткий прес-реліз про [подія компанії], 5-6 речень, офіційний тон»' },
      { icon: 'handshake', title: 'Лист потенційному партнеру', desc: '«Напиши лист-пропозицію партнерства компанії [назва], з описом взаємної вигоди»' },
      { icon: 'linkedin', title: 'Пост для LinkedIn', desc: '«Напиши пост для LinkedIn про [досягнення компанії], професійний тон, до 100 слів»' },
    ],
  },
  legal: {
    label: 'Юридичний департамент',
    prompts: [
      { icon: 'scale', title: 'Пояснення пункту договору', desc: '«Поясни простими словами, що означає пункт договору [вставити] і які ризики він несе»' },
      { icon: 'file-lock-2', title: 'Чернетка застереження', desc: '«Запропонуй формулювання пункту про конфіденційність для договору з підрядником»' },
      { icon: 'triangle-alert', title: 'Ризики угоди', desc: '«Виділи потенційні юридичні ризики в описі угоди [вставити] у вигляді короткого списку»' },
    ],
  },
  product_management: {
    label: 'Product Management',
    prompts: [
      { icon: 'box', title: 'User story', desc: '«Напиши user story для фічі [назва]: як [роль], я хочу [дія], щоб [мета]»' },
      { icon: 'layout-template', title: 'Бриф фічі', desc: '«Структуруй короткий бриф фічі [назва]: проблема, рішення, критерії успіху»' },
      { icon: 'message-circle-question', title: 'Питання для дискавері', desc: '«Склади 6 відкритих питань для інтерв’ю з користувачем щодо проблеми [опис]»' },
    ],
  },
  rnd: {
    label: 'R&D / розробка продуктів',
    prompts: [
      { icon: 'cpu', title: 'Пояснення рішення нетехнічним', desc: '«Поясни простими словами, як працює [технічне рішення], для нетехнічної команди»' },
      { icon: 'file-text', title: 'Технічне завдання', desc: '«Структуруй ТЗ на розробку [функціонал]: вимоги, обмеження, критерії приймання»' },
      { icon: 'bug', title: 'Опис бага', desc: '«Оформи опис дефекту [опис]: кроки відтворення, очікуваний і фактичний результат»' },
    ],
  },
  project_management: {
    label: 'Управління проєктами (PM)',
    prompts: [
      { icon: 'kanban-square', title: 'Статус-репорт', desc: '«Склади статус-звіт по проєкту [назва] за тиждень: зроблено, ризики, наступні кроки»' },
      { icon: 'list-checks', title: 'Протокол зустрічі', desc: '«Структуруй нотатки зустрічі [вставити] у протокол: рішення, відповідальні, дедлайни»' },
      { icon: 'triangle-alert', title: 'Ризик-реєстр', desc: '«Виділи ризики проєкту [опис] і запропонуй по одному варіанту мітигації для кожного»' },
    ],
  },
  executive_office: {
    label: 'Виконавчий офіс / адміністрація',
    prompts: [
      { icon: 'briefcase', title: 'Порядок денний наради', desc: '«Структуруй порядок денний наради на тему [тема]: 4-5 пунктів з орієнтовним часом»' },
      { icon: 'file-text', title: 'Резюме для керівника', desc: '«Стисни звіт [вставити] у 5 речень для швидкого ознайомлення керівника»' },
      { icon: 'megaphone', title: 'Оголошення від керівництва', desc: '«Напиши коротке оголошення співробітникам від імені керівництва про [подія], тон офіційний, але людяний»' },
    ],
  },
};

function initRolePrompts() {
  const select = document.getElementById('roleSelect');
  const cardsWrap = document.getElementById('rolePromptCards');
  const hint = document.getElementById('rolePromptHint');
  if (!select || !cardsWrap) return;

  Object.entries(ROLE_PROMPTS).forEach(([key, dept]) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = dept.label;
    select.appendChild(opt);
  });

  select.addEventListener('change', () => {
    const dept = ROLE_PROMPTS[select.value];
    if (!dept) {
      cardsWrap.hidden = true;
      cardsWrap.innerHTML = '';
      if (hint) hint.hidden = false;
      return;
    }
    cardsWrap.innerHTML = dept.prompts.map(p => `
      <div class="tip-card">
        <i data-lucide="${p.icon}"></i>
        <h4>${p.title}</h4>
        <p>${p.desc}</p>
      </div>
    `).join('');
    cardsWrap.hidden = false;
    if (hint) hint.hidden = true;
    if (window.lucide) lucide.createIcons();
    if (window.gsap) {
      gsap.fromTo(cardsWrap.children, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.06 });
    }
  });
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
