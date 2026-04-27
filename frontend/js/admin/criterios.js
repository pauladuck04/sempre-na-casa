// js/admin/criterios.js
// Script para la página de gestión de criterios

document.addEventListener('DOMContentLoaded', function() {
    console.log('Gestión de criterios cargada');
    
    verificarAutenticacion();
    cargarCriterios();
    configurarEventListeners();
});

/**
 * Verificar autenticación
 */
function verificarAutenticacion() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!user.id || user.rol !== 'admin') {
        window.location.href = '../../index.html';
        return;
    }
}

/**
 * Cargar lista de criterios
 */
function cargarCriterios() {
    const criterios = [
        {
            id: 1,
            criterio: 'Nivel de Ruido',
            opcion: 'Silencio Absoluto',
            valor: 1,
            tipo: 'Escala',
            estado: 'activo'
        },
        {
            id: 2,
            criterio: 'Hábito de Tabaco',
            opcion: 'Prohibido Totalmente',
            valor: 1,
            tipo: 'Escala',
            estado: 'activo'
        },
        {
            id: 3,
            criterio: 'Frecuencia de Visitas',
            opcion: 'Sin Visitas',
            valor: 1,
            tipo: 'Escala',
            estado: 'activo'
        },
        {
            id: 4,
            criterio: 'Mascotas',
            opcion: 'NO Acepto Mascotas',
            valor: 1,
            tipo: 'Escala',
            estado: 'activo'
        },
        {
            id: 5,
            criterio: 'Limpieza y Orden',
            opcion: 'Muy Meticuloso (Diario)',
            valor: 1,
            tipo: 'Escala',
            estado: 'activo'
        }
    ];
    
    renderizarCriterios(criterios);
}

/**
 * Renderizar tabla de criterios
 */
function renderizarCriterios(criterios) {
    const tbody = document.querySelector('table tbody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    criterios.forEach(criterio => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <input class="form-check-input criterio-checkbox" type="checkbox" value="${criterio.id}">
            </td>
            <td>
                <span class="fw-semibold">${criterio.criterio}</span>
            </td>
            <td>${criterio.opcion}</td>
            <td>
                <code>${criterio.valor}</code>
            </td>
            <td>
                <span class="badge rounded-pill bg-light text-dark px-3">${criterio.tipo}</span>
            </td>
            <td>
                <span class="badge bg-success rounded-pill px-3">Activo</span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary rounded-pill px-3" onclick="verCriterio(${criterio.id}, event)">
                    <i class="bi bi-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    actualizarBotones();
}

/**
 * Configurar event listeners
 */
function configurarEventListeners() {
    // Checkbox maestro
    const masterCheckbox = document.querySelector('th input[type="checkbox"]');
    if (masterCheckbox) {
        masterCheckbox.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
            checkboxes.forEach(cb => cb.checked = this.checked);
            actualizarBotones();
        });
    }
    
    // Checkboxes individuales
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('criterio-checkbox')) {
            actualizarBotones();
        }
    });
    
    // Botón Añadir
    const btnAnadir = document.querySelector('button[data-bs-toggle="modal"]');
    if (btnAnadir) {
        btnAnadir.addEventListener('click', abrirModalNuevoCriterio);
    }
    
    // Formulario
    const form = document.getElementById('formNuevoCriterio');
    if (form) {
        form.addEventListener('submit', guardarNuevoCriterio);
    }
}

/**
 * Actualizar estado de botones
 */
function actualizarBotones() {
    const seleccionados = document.querySelectorAll('tbody input[type="checkbox"]:checked').length;
    const botones = document.querySelectorAll('.card-header button');
    
    if (botones.length >= 3) {
        botones[1].disabled = seleccionados === 0; // Editar
        botones[2].disabled = seleccionados === 0; // Eliminar
    }
}

/**
 * Abrir modal para nuevo criterio
 */
function abrirModalNuevoCriterio() {
    const modal = new bootstrap.Modal(document.getElementById('modalNuevoCriterio'));
    modal.show();
}

/**
 * Guardar nuevo criterio
 */
function guardarNuevoCriterio(e) {
    e.preventDefault();
    
    const form = e.target;
    const inputs = form.querySelectorAll('input[type="text"], input[type="number"], select, textarea');
    
    const nuevoCriterio = {
        nombre: inputs[0].value,
        opcion: inputs[1].value,
        valor: inputs[2].value,
        tipo: inputs[3].value,
        activoPorDefecto: form.querySelector('input[type="checkbox"]').checked
    };
    
    console.log('Guardando nuevo criterio:', nuevoCriterio);
    
    alert('Criterio creado correctamente');
    cargarCriterios();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalNuevoCriterio'));
    modal.hide();
    form.reset();
}

/**
 * Ver detalles del criterio
 */
function verCriterio(criterioId, event) {
    event.preventDefault();
    console.log('Ver criterio:', criterioId);
    alert('Abriendo detalles del criterio ID: ' + criterioId);
}

/**
 * Editar criterio
 */
function editarCriterio() {
    const seleccionados = Array.from(document.querySelectorAll('tbody input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    
    if (seleccionados.length === 0) {
        alert('Selecciona un criterio para editar');
        return;
    }
    
    if (seleccionados.length > 1) {
        alert('Solo puedes editar un criterio a la vez');
        return;
    }
    
    console.log('Editando criterio:', seleccionados[0]);
    alert('Abriendo formulario de edición para criterio ID: ' + seleccionados[0]);
}

/**
 * Eliminar criterio
 */
function eliminarCriterio() {
    const seleccionados = Array.from(document.querySelectorAll('tbody input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    
    if (seleccionados.length === 0) {
        alert('Selecciona un criterio para eliminar');
        return;
    }
    
    if (confirm(`¿Estás seguro de que deseas eliminar ${seleccionados.length} criterio(s)?`)) {
        console.log('Eliminando criterios:', seleccionados);
        alert('Criterio(s) eliminado(s) correctamente');
        cargarCriterios();
    }
}