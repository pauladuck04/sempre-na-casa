// js/admin/viviendas.js
// Script para la página de gestión de viviendas

document.addEventListener('DOMContentLoaded', function() {
    console.log('Gestión de viviendas cargada');
    
    verificarAutenticacion();
    cargarViviendas();
    configurarEventListeners();
});

/**
 * Cargar lista de viviendas
 */
export function cargarViviendas() {
    const viviendas = [
        {
            id: 1,
            direccion: 'Rúa da Paz, 45',
            apt: '2B',
            ciudad: 'Ourense',
            anfitrion: 'Mercedes Rosas',
            plazas: 2,
            ocupadas: 2,
            estado: 'ocupada'
        },
        {
            id: 2,
            direccion: 'Avenida Santa Clara, 78',
            apt: '3A',
            ciudad: 'Ourense',
            anfitrion: 'Ramón Vázquez',
            plazas: 3,
            ocupadas: 1,
            estado: 'disponible'
        },
        {
            id: 3,
            direccion: 'Rúa Leopoldo Alas Clarín, 25',
            apt: 'Casa',
            ciudad: 'Ourense',
            anfitrion: 'Carmen Cid',
            plazas: 4,
            ocupadas: 2,
            estado: 'disponible'
        }
    ];
    
    renderizarViviendas(viviendas);
}

/**
 * Renderizar tabla de viviendas
 */
function renderizarViviendas(viviendas) {
    const tbody = document.querySelector('table tbody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    viviendas.forEach(vivienda => {
        const row = document.createElement('tr');
        const porcentajeOcupacion = Math.round((vivienda.ocupadas / vivienda.plazas) * 100);
        const colorBarra = porcentajeOcupacion === 100 ? 'bg-success' : 
                          porcentajeOcupacion >= 50 ? 'bg-warning' : 'bg-danger';
        
        row.innerHTML = `
            <td>
                <input class="form-check-input vivienda-checkbox" type="checkbox" value="${vivienda.id}">
            </td>
            <td>
                <div>
                    <p class="mb-0 fw-semibold">${vivienda.direccion}</p>
                    <small class="text-muted">${vivienda.apt}</small>
                </div>
            </td>
            <td>${vivienda.ciudad}</td>
            <td>${vivienda.anfitrion}</td>
            <td>
                <span class="badge bg-light text-dark rounded-pill px-3">${vivienda.plazas}</span>
            </td>
            <td>
                <div class="progress" style="height: 20px; width: 120px;">
                    <div class="progress-bar ${colorBarra}" role="progressbar" style="width: ${porcentajeOcupacion}%">
                        <small class="text-white fw-bold">${vivienda.ocupadas}/${vivienda.plazas}</small>
                    </div>
                </div>
            </td>
            <td>
                <span class="badge ${vivienda.estado === 'ocupada' ? 'bg-success' : 'bg-info'} rounded-pill px-3">
                    ${vivienda.estado === 'ocupada' ? 'Ocupada' : 'Disponible'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary rounded-pill px-3" onclick="verVivienda(${vivienda.id}, event)">
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
        if (e.target.classList.contains('vivienda-checkbox')) {
            actualizarBotones();
        }
    });
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
 * Ver detalles de vivienda
 */
function verVivienda(viviendaId, event) {
    event.preventDefault();
    console.log('Ver vivienda:', viviendaId);
    alert('Abriendo detalles de la vivienda ID: ' + viviendaId);
}

/**
 * Agregar nueva vivienda
 */
function agregarVivienda() {
    alert('Abriendo formulario para crear nueva vivienda');
}

/**
 * Editar vivienda
 */
function editarVivienda() {
    const seleccionados = Array.from(document.querySelectorAll('tbody input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    
    if (seleccionados.length === 0) {
        alert('Selecciona una vivienda para editar');
        return;
    }
    
    if (seleccionados.length > 1) {
        alert('Solo puedes editar una vivienda a la vez');
        return;
    }
    
    console.log('Editando vivienda:', seleccionados[0]);
    alert('Abriendo formulario de edición para vivienda ID: ' + seleccionados[0]);
}

/**
 * Eliminar vivienda
 */
function eliminarVivienda() {
    const seleccionados = Array.from(document.querySelectorAll('tbody input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    
    if (seleccionados.length === 0) {
        alert('Selecciona una vivienda para eliminar');
        return;
    }
    
    if (confirm(`¿Estás seguro de que deseas eliminar ${seleccionados.length} vivienda(s)?`)) {
        console.log('Eliminando viviendas:', seleccionados);
        alert('Vivienda(s) eliminada(s) correctamente');
        cargarViviendas();
    }
}