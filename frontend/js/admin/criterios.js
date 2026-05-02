// js/admin/criterios.js
// Script para la página de gestión de criterios

export let listaCriteriosMemoria = [];

/**
 * Cargar lista de criterios
 */
export function cargarCriterios() {
    const criterios = [
        {
            id: 1,
            criterio: 'Nivel de Ruido',
            opcion: 'Silencio Absoluto',
            valor: 1,
            estado: 'activo'
        },
        {
            id: 2,
            criterio: 'Hábito de Tabaco',
            opcion: 'Prohibido Totalmente',
            valor: 1,
            estado: 'activo'
        },
        {
            id: 3,
            criterio: 'Frecuencia de Visitas',
            opcion: 'Sin Visitas',
            valor: 1,
            estado: 'activo'
        },
        {
            id: 4,
            criterio: 'Mascotas',
            opcion: 'NO Acepto Mascotas',
            valor: 1,
            estado: 'activo'
        },
        {
            id: 5,
            criterio: 'Limpieza y Orden',
            opcion: 'Muy Meticuloso (Diario)',
            valor: 1,
            estado: 'activo'
        }
    ];
    
    listaCriteriosMemoria = criterios;
    renderizarCriterios(criterios);
}

/**
 * Renderizar tabla de criterios
 */
export function renderizarCriterios(criterios) {
    const tbody = document.getElementById('tabla-criterios');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    criterios.forEach((criterio, index) => {
        const iniciales = criterio.criterio.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center gap-2">
                    <input class="form-check-input criterio-checkbox align-self-start mt-1" type="checkbox" value="${criterio.id}">
                    <div>
                        <span class="fw-semibold d-block criterio-nombre" data-id="${criterio.id}" style="cursor:pointer;">${criterio.criterio}</span>
                    </div>
                </div>
            </td>
            <td>
                <div class="d-flex align-items-center gap-2">
                    <div>
                        <span class="fw-semibold d-block criterio-nombre" data-id="${criterio.id}" style="cursor:pointer;">${criterio.opcion}</span>
                    </div>
                </div>
            </td>
            <td>
                <div class="d-flex align-items-center gap-2">
                    <div>
                        <span class="fw-semibold d-block criterio-nombre" data-id="${criterio.id}" style="cursor:pointer;">${criterio.valor}</span>
                    </div>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Doble clic en nombre para ver detalles
    tbody.querySelectorAll('.criterio-nombre').forEach(span => {
        span.addEventListener('dblclick', function(e) {
            const id = this.getAttribute('data-id');
            verCriterio(Number(id), e);
        });
    });
}