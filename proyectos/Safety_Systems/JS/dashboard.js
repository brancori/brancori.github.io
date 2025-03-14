document.addEventListener('DOMContentLoaded', () => {
    const session = JSON.parse(localStorage.getItem('userSession') || '{}');
    document.getElementById('userName').textContent = session.username?.toUpperCase() || '';
    document.getElementById('userRole').textContent = session.role || '';
    
    initializeButtons();
    updateDateTime();
    populateCalendarHeader(); // Poblar el encabezado
    populateCalendarGrid();   // Poblar la rejilla de días
    populateMonthNavigator(); // Poblar el navegador de mes

    const markSafeBtn = document.getElementById('markSafeDay');
    if (markSafeBtn) {
        markSafeBtn.addEventListener('click', markSafeDay);
    }
    updateAccidentFreeDays();
});

const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const WEEKDAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDay = null;
let safeDays = JSON.parse(localStorage.getItem('safeDays') || '[]');

function updateDateTime() {
    const dateElement = document.getElementById('date');
    
    function updateTime() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        
        dateElement.textContent = now.toLocaleDateString('es-ES', options)
            .replace(/^./, str => str.toUpperCase());
    }

    // Actualizar inmediatamente
    updateTime();
    // Actualizar cada segundo
    setInterval(updateTime, 1000);
}

// Modificar populateCalendarHeader para mostrar días de lunes a domingo
function populateCalendarHeader() {
    const calendarHeader = document.querySelector('.calendar-header');
    if (calendarHeader) {
        const weekdaysAbbr = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        calendarHeader.innerHTML = weekdaysAbbr
            .map((day, index) => `<span data-index="${index}">${day}</span>`)
            .join('');
    }
}

// Función utilitaria para formatear números a dos dígitos
function pad2(n) {
    return n.toString().padStart(2, '0');
}

// Ajustar la función de resaltar la cabecera según el día seleccionado (adaptar para lunes como primer día)
function updateCalendarHeaderHighlight(dayDate) {
    // Forzar la creación de la fecha en hora local añadiendo "T00:00"
    const d = new Date(dayDate + "T00:00");
    const rawDay = d.getDay(); // 0 = domingo, 1 = lunes, …, 6 = sábado
    const dayIndex = rawDay === 0 ? 6 : rawDay - 1; // Ajuste para semana que inicia en lunes
    const headerSpans = document.querySelectorAll('.calendar-header span');
    headerSpans.forEach(span => span.classList.remove('selected-header'));
    const targetSpan = document.querySelector(`.calendar-header span[data-index="${dayIndex}"]`);
    if (targetSpan) targetSpan.classList.add('selected-header');
}

// En populateCalendarGrid, usar el offset ajustado para la semana que inicia en lunes
function populateCalendarGrid() {
    const grid = document.querySelector('.safety-grid');
    if (!grid) return;
    grid.innerHTML = ''; // Limpiar la rejilla

    // Calcular el primer día del mes actual (ajustado para lunes como inicio de semana)
    const firstOfMonth = new Date(currentYear, currentMonth, 1);
    const firstDayRaw = firstOfMonth.getDay(); // 0=domingo, 1=lunes, etc.
    const adjustedFirstDay = firstDayRaw === 0 ? 6 : firstDayRaw - 1;

    // Número total de días en el mes actual
    const totalDaysCurrent = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Se usará un grid de 6 semanas (42 celdas)
    const totalCells = 42;

    // Calcular días del mes anterior a mostrar
    const prevMonth = (currentMonth === 0) ? 11 : currentMonth - 1;
    const prevYear = (currentMonth === 0) ? currentYear - 1 : currentYear;
    const totalDaysPrev = new Date(prevYear, prevMonth + 1, 0).getDate();
    const prevDaysCount = adjustedFirstDay; // Número de celdas que se rellenan con días previos

    // Rellenar con días del mes anterior
    for (let i = prevDaysCount; i > 0; i--) {
         const day = totalDaysPrev - i + 1;
         grid.innerHTML += `<div class="day prev-month" data-day="${day}" data-date="${prevYear}-${pad2(prevMonth+1)}-${pad2(day)}">${day}</div>`;
    }
    
    // Rellenar con los días del mes actual
    for (let d = 1; d <= totalDaysCurrent; d++) {
         const dayStr = `${currentYear}-${pad2(currentMonth+1)}-${pad2(d)}`;
         const today = new Date();
         const isToday = (today.getFullYear() === currentYear && today.getMonth() === currentMonth && today.getDate() === d);
         const safeClass = safeDays.includes(dayStr) ? 'safe' : '';
         const currentClass = isToday ? 'current' : '';
         grid.innerHTML += `<div class="day ${safeClass} ${currentClass}" data-day="${d}" data-date="${dayStr}">${d}</div>`;
    }
    
    // Rellenar con días del siguiente mes hasta completar 42 celdas
    const cellsFilled = prevDaysCount + totalDaysCurrent;
    const nextDaysCount = totalCells - cellsFilled;
    const nextMonth = (currentMonth === 11) ? 0 : currentMonth + 1;
    const nextYear = (currentMonth === 11) ? currentYear + 1 : currentYear;
    for (let d = 1; d <= nextDaysCount; d++) {
         grid.innerHTML += `<div class="day next-month" data-day="${d}" data-date="${nextYear}-${pad2(nextMonth+1)}-${pad2(d)}">${d}</div>`;
    }
    
    // Agregar eventos de click solo a los días del mes actual
    const dayCells = grid.querySelectorAll('.day:not(.prev-month):not(.next-month)');
    dayCells.forEach(cell => {
        cell.addEventListener('click', () => {
            dayCells.forEach(c => c.classList.remove('selected'));
            cell.classList.add('selected');
            selectedDay = cell.getAttribute('data-day');
            updateCalendarHeaderHighlight(cell.getAttribute('data-date'));
        });
    });
    
    updateAccidentFreeDays();
}

// Variable global para detectar triple clic en markSafeDay
let markSafeDayClickCounter = 0;
let markSafeDayClickTimer;

// Nueva función para actualizar el contador de días sin accidentes
function updateAccidentFreeDays() {
    const counterEl = document.getElementById('accident-free-days');
    if (counterEl) {
        counterEl.textContent = safeDays.length;
    }
}

// Función para mostrar notificaciones
function showNotification(message, type = 'success', duration = 3000) {
    // Remover notificaciones anteriores
    const existingNotification = document.querySelector('.notification-popup');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Crear nueva notificación
    const notification = document.createElement('div');
    notification.className = `notification-popup ${type}`;
    notification.textContent = message;

    // Agregar al documento
    document.body.appendChild(notification);

    // Mostrar con animación
    setTimeout(() => notification.classList.add('show'), 10);

    // Ocultar y remover después del tiempo especificado
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// Actualizar la función markSafeDay para usar notificaciones en lugar de alerts
function markSafeDay() {
    markSafeDayClickCounter++;
    clearTimeout(markSafeDayClickTimer);
    markSafeDayClickTimer = setTimeout(() => {
        markSafeDayClickCounter = 0;
    }, 2000);

    if (markSafeDayClickCounter >= 3) {
        markSafeDayClickCounter = 0;
        safeDays = [];
        localStorage.removeItem('safeDays');
        showNotification("Se han borrado globalmente todos los días seguros. Esta acción no se puede revertir.", 'warning');
        populateCalendarGrid();
        updateAccidentFreeDays();
        return;
    }
    
    if (!selectedDay) {
        showNotification("Por favor seleccione un día primero", 'error');
        return;
    }

    // Mostrar confirmación personalizada
    if (confirm("¿Estás seguro de marcar este día como seguro? Esta acción no se puede revertir.")) {
        const grid = document.querySelector('.safety-grid');
        const cell = grid.querySelector(`.day[data-day="${selectedDay}"]`);
        if (!cell) return;
        
        const dayDate = cell.getAttribute('data-date');
        if (!safeDays.includes(dayDate)) {
            safeDays.push(dayDate);
            localStorage.setItem('safeDays', JSON.stringify(safeDays));
            showNotification("Día marcado como seguro exitosamente", 'success');
        }
        
        cell.classList.add('safe');
        cell.classList.remove('selected');
        selectedDay = null;
        updateAccidentFreeDays();
    }
}

// Nueva función para poblar el navegador de mes
function populateMonthNavigator() {
    const navigatorEl = document.querySelector('.month-navigator');
    if (!navigatorEl) return;
    const monthName = MONTHS[currentMonth];
    navigatorEl.innerHTML = `
        <button class="prev-month" onclick="changeMonth(-1)">&#9664;</button>
        <span class="month-display">${monthName} ${currentYear}</span>
        <button class="next-month" onclick="changeMonth(1)">&#9654;</button>
    `;
}

// Función para cambiar de mes y actualizar la vista
function changeMonth(delta) {
    currentMonth += delta;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    populateCalendarGrid();
    populateMonthNavigator();
}

function initializeButtons() {
    const blocks = document.getElementById('blocks');
    
    // Crear flechas de navegación
    const navLeft = document.createElement('button');
    navLeft.className = 'nav-arrow left';
    navLeft.innerHTML = '&#9664;';
    navLeft.addEventListener('click', () => scrollBlocks(-100));
    
    const navRight = document.createElement('button');
    navRight.className = 'nav-arrow right';
    navRight.innerHTML = '&#9654;';
    navRight.addEventListener('click', () => scrollBlocks(100));
    
    // Insertar flechas
    blocks.parentNode.insertBefore(navLeft, blocks);
    blocks.parentNode.insertBefore(navRight, blocks.nextSibling);
}

function scrollBlocks(amount) {
    const blocks = document.getElementById('blocks');
    blocks.scrollLeft += amount;
}

// Función para mostrar/ocultar el formulario modal
function toggleRecordForm() {
    const modal = document.getElementById('recordFormModal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

// Agregar el manejador del formulario
document.getElementById('recordForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Crear objeto con los datos del formulario
    const formData = {
        type: document.getElementById('eventType').value,
        date: document.getElementById('eventDate').value,
        time: document.getElementById('eventTime').value,
        location: document.getElementById('location').value,
        description: document.getElementById('description').value,
        immediateActions: document.getElementById('immediateActions').value,
        preventiveActions: document.getElementById('preventiveActions').value
    };
    
    // Aquí puedes agregar la lógica para guardar los datos
    console.log('Registro guardado:', formData);
    
    // Cerrar el modal y limpiar el formulario
    toggleRecordForm();
    this.reset();
});

// Cerrar el modal si se hace clic fuera del contenido
window.onclick = function(event) {
    const modal = document.getElementById('recordFormModal');
    if (event.target === modal) {
        toggleRecordForm();
    }
}

function editStep(button) {
    const stepCell = button.closest('.step-cell');
    const colorInput = stepCell.querySelector('.color-picker');
    
    // Asegurarse de que el input de color esté visible
    colorInput.style.display = 'block';
    
    // Manejar el cambio de color
    colorInput.addEventListener('input', function() {
        stepCell.style.backgroundColor = this.value;
    });

    // Manejar cuando se complete la selección
    colorInput.addEventListener('change', function() {
        stepCell.style.backgroundColor = this.value;
        // Guardar el color en el dataset del elemento
        stepCell.dataset.selectedColor = this.value;
        // Ocultar el selector después de seleccionar
        this.style.display = 'none';
    });
    
    // Forzar clic en el input de color
    colorInput.click();
}
