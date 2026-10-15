(() => {
  'use strict';
  const KEY = 'plli-hyperdrive-voting-v2';
  const TICKET_KEY = 'plli-hyperdrive-tickets-v1';
  const ticketBoxes = [...document.querySelectorAll('[data-ticket-id]')];
  let ticketChecked = {};
  const IDS = ['inkigayo-pre', 'inkigayo-live', 'mama', 'mma'];
  const checkboxes = [...document.querySelectorAll('.mission-check input[data-vote-id]')];
  const completedCount = document.getElementById('completedCount');
  const totalCount = document.getElementById('totalCount');
  const gaugeValue = document.getElementById('gaugeValue');
  const gaugeFill = document.getElementById('gaugeFill');
  const needle = document.getElementById('needle');
  const clock = document.getElementById('kstClock');
  const ticks = document.getElementById('gaugeTicks');
  let currentDay = '';
  let checked = {};

  const dateFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit'
  });
  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });
  const kstDay = () => dateFormatter.format(new Date());

  function load() {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || '{}');
      return value.date === currentDay && value.checked && typeof value.checked === 'object'
        ? value.checked : {};
    } catch { return {}; }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify({date: currentDay, checked})); }
    catch { /* Private browsing or storage restrictions */ }
  }
  function loadTickets() {
    try {
      const value = JSON.parse(localStorage.getItem(TICKET_KEY) || '{}');
      return value.date === currentDay && value.checked && typeof value.checked === 'object'
        ? value.checked : {};
    } catch { return {}; }
  }
  function saveTickets() {
    try { localStorage.setItem(TICKET_KEY, JSON.stringify({date: currentDay, checked: ticketChecked})); }
    catch { /* Storage unavailable */ }
  }
  function renderTickets() {
    let completed = 0;
    ticketBoxes.forEach(input => {
      const isDone = Boolean(ticketChecked[input.dataset.ticketId]);
      input.checked = isDone;
      if (isDone) completed++;
      input.closest('.ticket-item').querySelector('.ticket-state').textContent = isDone ? '已完成' : '待完成';
    });
    document.getElementById('ticketDoneCount').textContent = String(completed);
  }
  function render() {
    const done = IDS.filter(id => Boolean(checked[id])).length;
    const percent = Math.round(done / IDS.length * 100);
    completedCount.textContent = String(done);
    totalCount.textContent = String(IDS.length);
    gaugeValue.textContent = percent + '%';
    gaugeFill.style.strokeDasharray = `${percent} ${100 - percent}`;
    needle.setAttribute('transform', `rotate(${-90 + percent * 1.8} 180 183)`);
    checkboxes.forEach(input => { input.checked = Boolean(checked[input.dataset.voteId]); });
    renderTickets();
  }
  function checkDay() {
    const day = kstDay();
    if (day !== currentDay) {
      currentDay = day;
      checked = load();
      ticketChecked = loadTickets();
      render();
    }
    clock.textContent = 'KST ' + timeFormatter.format(new Date());
  }

  // Gauge scale marks: 0 to 100, from left to right.
  for (let i = 0; i <= 10; i++) {
    const angle = Math.PI - i * Math.PI / 10;
    const x1 = 180 + 119 * Math.cos(angle);
    const y1 = 183 - 119 * Math.sin(angle);
    const x2 = 180 + (i % 5 === 0 ? 131 : 126) * Math.cos(angle);
    const y2 = 183 - (i % 5 === 0 ? 131 : 126) * Math.sin(angle);
    const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    for (const [name, value] of Object.entries({x1,y1,x2,y2})) tick.setAttribute(name, String(value));
    tick.setAttribute('stroke', i % 5 === 0 ? '#cde8ff' : '#627487');
    tick.setAttribute('stroke-width', i % 5 === 0 ? '3' : '2');
    ticks.appendChild(tick);
  }

  checkboxes.forEach(input => input.addEventListener('change', () => {
    checkDay();
    checked[input.dataset.voteId] = input.checked;
    save();
    render();
  }));
  ticketBoxes.forEach(input => input.addEventListener('change', () => {
    checkDay();
    ticketChecked[input.dataset.ticketId] = input.checked;
    saveTickets();
    renderTickets();
  }));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) checkDay(); });
  window.addEventListener('pageshow', checkDay);
  window.addEventListener('focus', checkDay);
  window.addEventListener('storage', event => {
    if (event.key === KEY) { checked = load(); render(); }
    if (event.key === TICKET_KEY) { ticketChecked = loadTickets(); renderTickets(); }
  });
  // Independent memo page: persistent notes, never reset at KST midnight.
  const MEMO_KEY = 'plli-hyperdrive-memos-v1';
  const memoForm = document.getElementById('memoForm');
  const memoList = document.getElementById('memoList');
  const memoEmpty = document.getElementById('memoEmpty');
  const memoCount = document.getElementById('memoCount');
  const memoError = document.getElementById('memoError');
  let memos = [];

  function readMemos() {
    try {
      const data = JSON.parse(localStorage.getItem(MEMO_KEY) || '[]');
      return Array.isArray(data) ? data.filter(item =>
        item && typeof item.id === 'string' && typeof item.title === 'string' &&
        typeof item.url === 'string' && /^https?:\/\//i.test(item.url)
      ) : [];
    } catch { return []; }
  }
  function saveMemos() {
    try { localStorage.setItem(MEMO_KEY, JSON.stringify(memos)); }
    catch { showMemoError('無法儲存：請確認瀏覽器允許儲存網站資料。'); }
  }
  function showMemoError(message) {
    memoError.textContent = message;
    memoError.hidden = !message;
  }
  function renderMemos() {
    memoList.replaceChildren();
    memoCount.textContent = String(memos.length);
    memoEmpty.hidden = memos.length > 0;
    memos.forEach((item, index) => {
      const card = document.createElement('article');
      card.className = 'memo-card';
      const top = document.createElement('div');
      top.className = 'memo-card-top';
      const number = document.createElement('span');
      number.className = 'memo-index';
      number.textContent = `LINK ${String(index + 1).padStart(2, '0')}`;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'memo-delete';
      remove.textContent = '刪除 ×';
      remove.setAttribute('aria-label', `刪除 ${item.title}`);
      remove.addEventListener('click', () => {
        if (!confirm(`確定刪除「${item.title}」？`)) return;
        memos = memos.filter(memo => memo.id !== item.id);
        saveMemos();
        renderMemos();
      });
      top.append(number, remove);
      const title = document.createElement('h3');
      title.textContent = item.title;
      const url = document.createElement('p');
      url.className = 'memo-url';
      url.textContent = item.url;
      const link = document.createElement('a');
      link.className = 'memo-open';
      link.href = item.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = '開啟連結 ↗';
      card.append(top, title, url, link);
      memoList.appendChild(card);
    });
  }
  memos = readMemos();
  renderMemos();
  memoForm.addEventListener('submit', event => {
    event.preventDefault();
    showMemoError('');
    const title = document.getElementById('memoTitleInput').value.trim();
    const rawUrl = document.getElementById('memoUrlInput').value.trim();
    let url;
    try {
      url = new URL(rawUrl);
      if (!['https:', 'http:'].includes(url.protocol)) throw new Error('invalid protocol');
    } catch {
      showMemoError('請輸入有效的 https:// 或 http:// 網址。');
      return;
    }
    if (!title) { showMemoError('請填寫標題。'); return; }
    memos.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, title, url: url.href });
    saveMemos();
    renderMemos();
    memoForm.reset();
    document.getElementById('memoTitleInput').focus();
  });
  document.querySelectorAll('[data-page]').forEach(button => {
    button.addEventListener('click', () => {
      const showMemo = button.dataset.page === 'memo';
      document.getElementById('missionsPage').hidden = showMemo;
      document.getElementById('memoPage').hidden = !showMemo;
      document.querySelectorAll('[data-page]').forEach(tab => {
        const active = tab === button;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', String(active));
      });
    });
  });
  window.addEventListener('storage', event => {
    if (event.key === MEMO_KEY) { memos = readMemos(); renderMemos(); }
  });

  checkDay();
  setInterval(checkDay, 1000);
})();
