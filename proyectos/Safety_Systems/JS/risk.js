/* --- Begin Risk JS --- */

// Variable global para asignar números secuenciales a cada paso
let riskStepCounter = 1;

function addNewStep(button) {
    const fieldset = button.closest('fieldset.analsis_riesgo');
    const container = fieldset.querySelector('#riskStepsContainer');
    if (!container) return;
    const template = container.querySelector('.risk-step');
    if (!template) return;
    
    // Capturar los valores de los selects antes de clonar
    const potInicial = template.querySelector('[name="potencial_inicial"]');
    const potFinal = template.querySelector('[name="potencial_final"]');
    
    // Obtener los valores y clases correspondientes
    const potInicialValue = potInicial ? potInicial.value : '';
    const potFinalValue = potFinal ? potFinal.value : '';
    
    // Determinar las clases de color basadas en los valores
    const getColorClass = (value) => {
        if (value === '1') return 'select-green';
        if (value === '2') return 'select-yellow';
        if (value === '3') return 'select-red';
        return '';
    };
    
    const potInicialClass = getColorClass(potInicialValue);
    const potFinalClass = getColorClass(potFinalValue);
    
    // Clonar el template
    const clone = template.cloneNode(true);
    
    // Convertir los elementos a texto plano
    clone.querySelectorAll('input, textarea, select').forEach(el => {
        const span = document.createElement('span');
        span.className = 'plain';
        if (el.tagName.toLowerCase() === 'select') {
            // Para los selects, usar el valor capturado
            if (el.name === 'potencial_inicial') {
                span.textContent = potInicialValue || 'N/D';
                if (potInicialClass) span.classList.add(potInicialClass);
            } else if (el.name === 'potencial_final') {
                span.textContent = potFinalValue || 'N/D';
                if (potFinalClass) span.classList.add(potFinalClass);
            }
        } else {
            span.textContent = el.value;
        }
        el.parentNode.replaceChild(span, el);
    });
    
    // Simplificar el encabezado para mostrar solo el número de paso
    const headerDiv = document.createElement('div');
    headerDiv.className = 'risk-step-header';
    headerDiv.innerHTML = `<strong>Paso ${riskStepCounter}</strong>`;
    
    // Agregar los botones de control
    const btnContainer = document.createElement('div');
    btnContainer.className = 'risk-step-buttons';
    btnContainer.innerHTML = `
        <button type="button" class="edit-step-btn" onclick="editStep(this)">Editar</button>
        <button type="button" class="delete-step-btn" onclick="deleteStep(this)">Eliminar</button>
    `;
    
    clone.prepend(headerDiv);
    clone.appendChild(btnContainer);
    
    // Almacenar los valores en el dataset para referencia futura
    clone.dataset.potencialInicial = potInicialValue;
    clone.dataset.potencialFinal = potFinalValue;
    clone.dataset.potencialInicialClass = potInicialClass;
    clone.dataset.potencialFinalClass = potFinalClass;
    
    container.appendChild(clone);
    const hr = document.createElement('hr');
    hr.className = 'risk-divider';
    container.appendChild(hr);
    
    riskStepCounter++;
}

function editStep(button) {
    const riskStep = button.closest('.risk-step');
    // Toggle: if in edit mode, then save changes; otherwise, enable editing.
    if (button.textContent.trim() === "Editar") {
        // Convert each span to an input for editing.
        riskStep.querySelectorAll('span.plain').forEach(span => {
            const input = document.createElement('input');
            input.value = span.textContent;
            span.parentNode.replaceChild(input, span);
        });
        // Change button text to "Guardar"
        button.textContent = "Guardar";
        // Optionally, disable the delete button during editing.
        const deleteBtn = riskStep.querySelector('.delete-step-btn');
        if (deleteBtn) deleteBtn.disabled = true;
    } else {
        // Already in edit mode: save changes.
        saveStep(button);
    }
}

function saveStep(button) {
    const riskStep = button.closest('.risk-step');
    // Convert inputs back to spans with updated values.
    riskStep.querySelectorAll('input').forEach(input => {
        const span = document.createElement('span');
        span.className = 'plain';
        span.textContent = input.value;
        input.parentNode.replaceChild(span, input);
    });
    // Revert the button text to "Editar" and re-enable delete button.
    button.textContent = "Editar";
    const deleteBtn = riskStep.querySelector('.delete-step-btn');
    if (deleteBtn) deleteBtn.disabled = false;
    // Optionally update the header if needed.
}

function deleteStep(button) {
    if (confirm('¿Está seguro de eliminar este paso?')) {
        const riskStep = button.closest('.risk-step');
        const hr = riskStep.nextElementSibling;
        riskStep.remove();
        if(hr && hr.classList.contains('risk-divider')) hr.remove();
        showNotification('Paso eliminado correctamente', 'warning');
    }
}

function updateSelectColor(selectEl) {
    selectEl.classList.remove('select-green', 'select-yellow', 'select-red');
    const value = selectEl.value;
    if (value === "1") {
        selectEl.classList.add('select-green');
    } else if (value === "2") {
        selectEl.classList.add('select-yellow');
    } else if (value === "3") {
        selectEl.classList.add('select-red');
    }
}

document.getElementById('riskForm').addEventListener('submit', function(e) {
    e.preventDefault();
    showNotification('Análisis de riesgo guardado exitosamente', 'success');
});

function saveFieldset(button) {
    const fieldset = button.closest('fieldset');
    fieldset.querySelectorAll('input, textarea, select').forEach(el => el.disabled = true);
    fieldset.querySelector('.save-btn').disabled = true;
    fieldset.querySelector('.edit-btn').disabled = false;
    showNotification('Sección guardada correctamente', 'success');
}

/* --- End Risk JS --- */
