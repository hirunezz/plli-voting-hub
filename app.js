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
  checkDay();
  setInterval(checkDay, 1000);
})();
