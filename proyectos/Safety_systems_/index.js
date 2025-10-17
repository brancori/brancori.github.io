document.addEventListener('DOMContentLoaded', () => {
  const session = JSON.parse(localStorage.getItem('userSession') || '{}');

  const userNameEl = document.getElementById('userName');
  const userRoleEl = document.getElementById('userRole');

  if (userNameEl) userNameEl.textContent = session.username?.toUpperCase() || '';
  if (userRoleEl) userRoleEl.textContent = session.role || '';

  initializeButtons();
  updateDateTime();
  populateCalendarHeader();
  populateCalendarGrid();
  populateMonthNavigator();

  const markSafeBtn = document.getElementById('markSafeDay');
  if (markSafeBtn) markSafeBtn.addEventListener('click', markSafeDay);

  updateAccidentFreeDays();
});


const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];
const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDay = null;
let safeDays = JSON.parse(localStorage.getItem('safeDays') || '[]');

function updateDateTime() {
  const dateElement = document.getElementById('date');
  if (!dateElement) return;

  const updateTime = () => {
    const now = new Date();
    const options = {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    };
    dateElement.textContent = now
      .toLocaleDateString('es-ES', options)
      .replace(/^./, str => str.toUpperCase());
  };

  updateTime();
  setInterval(updateTime, 1000);
}

function populateCalendarHeader() {
  const calendarHeader = document.querySelector('.calendar-header');
  if (!calendarHeader) return;
  calendarHeader.innerHTML = WEEKDAYS
    .map((d, i) => `<span data-index="${i}">${d}</span>`)
    .join('');
}

const pad2 = n => n.toString().padStart(2, '0');

function updateCalendarHeaderHighlight(dayDate) {
  const date = new Date(`${dayDate}T00:00`);
  const rawDay = date.getDay();
  const dayIndex = rawDay === 0 ? 6 : rawDay - 1;
  document
    .querySelectorAll('.calendar-header span')
    .forEach(span => span.classList.toggle('selected-header', +span.dataset.index === dayIndex));
}

function populateCalendarGrid() {
  const grid = document.querySelector('.safety-grid');
  if (!grid) return;

  grid.innerHTML = '';
  const firstOfMonth = new Date(currentYear, currentMonth, 1);
  const adjustedFirstDay = (firstOfMonth.getDay() + 6) % 7;
  const totalDaysCurrent = new Date(currentYear, currentMonth + 1, 0).getDate();
  const totalDaysPrev = new Date(currentYear, currentMonth, 0).getDate();
  const totalCells = 42;

  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

  // Días del mes anterior
  for (let i = adjustedFirstDay; i > 0; i--) {
    const day = totalDaysPrev - i + 1;
    grid.insertAdjacentHTML('beforeend', `
      <div class="day prev-month" data-date="${prevYear}-${pad2(prevMonth + 1)}-${pad2(day)}">${day}</div>
    `);
  }

  // Días del mes actual
  const today = new Date();
  for (let d = 1; d <= totalDaysCurrent; d++) {
    const dateStr = `${currentYear}-${pad2(currentMonth + 1)}-${pad2(d)}`;
    const isToday = today.getFullYear() === currentYear && today.getMonth() === currentMonth && today.getDate() === d;
    const classes = [
      'day',
      safeDays.includes(dateStr) ? 'safe' : '',
      isToday ? 'current' : ''
    ].join(' ').trim();

    grid.insertAdjacentHTML('beforeend', `
      <div class="${classes}" data-day="${d}" data-date="${dateStr}">${d}</div>
    `);
  }

  // Días del mes siguiente
  const filled = adjustedFirstDay + totalDaysCurrent;
  const nextDays = totalCells - filled;
  for (let d = 1; d <= nextDays; d++) {
    grid.insertAdjacentHTML('beforeend', `
      <div class="day next-month" data-date="${nextYear}-${pad2(nextMonth + 1)}-${pad2(d)}">${d}</div>
    `);
  }

  const dayCells = grid.querySelectorAll('.day:not(.prev-month):not(.next-month)');
  dayCells.forEach(cell =>
    cell.addEventListener('click', () => {
      dayCells.forEach(c => c.classList.remove('selected'));
      cell.classList.add('selected');
      selectedDay = cell.dataset.day;
      updateCalendarHeaderHighlight(cell.dataset.date);
    })
  );

  updateAccidentFreeDays();
}

let clickCounter = 0;
let clickTimer;

function markSafeDay() {
  clickCounter++;
  clearTimeout(clickTimer);
  clickTimer = setTimeout(() => (clickCounter = 0), 2000);

  if (clickCounter >= 3) {
    clickCounter = 0;
    safeDays = [];
    localStorage.removeItem('safeDays');
    showNotification('Se han borrado globalmente todos los días seguros.', 'warning');
    populateCalendarGrid();
    updateAccidentFreeDays();
    return;
  }

  if (!selectedDay) return showNotification('Selecciona un día primero', 'error');

  if (confirm('¿Marcar este día como seguro? Esta acción no se puede revertir.')) {
    const grid = document.querySelector('.safety-grid');
    const cell = grid.querySelector(`.day[data-day="${selectedDay}"]`);
    if (!cell) return;

    const dateStr = cell.dataset.date;
    if (!safeDays.includes(dateStr)) {
      safeDays.push(dateStr);
      localStorage.setItem('safeDays', JSON.stringify(safeDays));
      showNotification('Día marcado como seguro', 'success');
    }

    cell.classList.add('safe');
    cell.classList.remove('selected');
    selectedDay = null;
    updateAccidentFreeDays();
  }
}

function updateAccidentFreeDays() {
  const el = document.getElementById('accident-free-days');
  if (el) el.textContent = safeDays.length;
}

function showNotification(message, type = 'success', duration = 3000) {
  const existing = document.querySelector('.notification-popup');
  if (existing) existing.remove();

  const n = document.createElement('div');
  n.className = `notification-popup ${type}`;
  n.textContent = message;
  document.body.appendChild(n);

  requestAnimationFrame(() => n.classList.add('show'));
  setTimeout(() => n.classList.remove('show'), duration - 300);
  setTimeout(() => n.remove(), duration);
}

function populateMonthNavigator() {
  const el = document.querySelector('.month-navigator');
  if (!el) return;

  el.innerHTML = `
    <button class="prev-month" onclick="changeMonth(-1)">&#9664;</button>
    <span class="month-display">${MONTHS[currentMonth]} ${currentYear}</span>
    <button class="next-month" onclick="changeMonth(1)">&#9654;</button>
  `;
}

function changeMonth(delta) {
  currentMonth += delta;
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  else if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  populateCalendarGrid();
  populateMonthNavigator();
}

function initializeButtons() {
  const blocks = document.getElementById('blocks');
  if (!blocks) return;

  const createArrow = (dir, offset) => {
    const btn = document.createElement('button');
    btn.className = `nav-arrow ${dir}`;
    btn.innerHTML = dir === 'left' ? '&#9664;' : '&#9654;';
    btn.addEventListener('click', () => blocks.scrollLeft += offset);
    return btn;
  };

  blocks.parentNode.insertBefore(createArrow('left', -100), blocks);
  blocks.parentNode.insertBefore(createArrow('right', 100), blocks.nextSibling);
}

// Modal
function toggleRecordForm() {
  const modal = document.getElementById('recordFormModal');
  if (modal) modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

document.getElementById('recordForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  console.log('Registro guardado:', data);
  toggleRecordForm();
  e.target.reset();
});

window.addEventListener('click', e => {
  const modal = document.getElementById('recordFormModal');
  if (e.target === modal) toggleRecordForm();
});

function editStep(button) {
  const stepCell = button.closest('.step-cell');
  const colorInput = stepCell.querySelector('.color-picker');
  colorInput.style.display = 'block';
  colorInput.click();

  colorInput.addEventListener('input', () => {
    stepCell.style.backgroundColor = colorInput.value;
  }, { once: false });

  colorInput.addEventListener('change', () => {
    stepCell.dataset.selectedColor = colorInput.value;
    colorInput.style.display = 'none';
  }, { once: true });
}
document.addEventListener('click', e => {
  const cross = document.querySelector('.safety-cross');
  if (!cross) return;

  // Si se hace clic dentro del componente
  if (cross.contains(e.target)) {
    cross.classList.toggle('expanded');
  } 
  // Si se hace clic fuera y está expandido, se colapsa
  else if (cross.classList.contains('expanded')) {
    cross.classList.remove('expanded');
  }
});
