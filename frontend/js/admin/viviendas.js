// js/admin/viviendas.js
// Script para la página de gestión de viviendas

export let listaViviendasMemoria = [];

/**
 * Cargar lista de viviendas
 */
export function cargarViviendas() {
    const viviendas = [
        {
            id: 1,
            direccion: 'Rúa da Paz, 45',
            ciudad: 'Ourense',
            plazas_libres: 0,
            plazas_totales: 2,
            anfitrion: 'Mercedes Rosas',
            estado: 'ocupada'
        },
        {
            id: 2,
            direccion: 'Avenida Santa Clara, 78',
            ciudad: 'Ourense',
            plazas_libres: 3,
            plazas_totales: 4,
            anfitrion: 'Ramón Vázquez',
            estado: 'disponible'
        },
        {
            id: 3,
            direccion: 'Rúa Leopoldo Alas Clarín, 25',
            ciudad: 'Ourense',
            plazas_libres: 2,
            plazas_totales: 4,
            anfitrion: 'Carmen Cid',
            estado: 'disponible'
        }
    ];
    
    listaViviendasMemoria = viviendas;
    renderizarViviendas(viviendas);
}

/**
 * Renderizar tabla de viviendas
 */
export function renderizarViviendas(viviendas) {
    const tbody = document.getElementById('tabla-viviendas');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    viviendas.forEach(vivienda => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center gap-2">
                    <input class="form-check-input vivienda-checkbox align-self-start mt-1" type="checkbox" value="${vivienda.id}">
                    <div>
                        <span class="fw-semibold d-block vivienda-direccion" data-id="${vivienda.id}" style="cursor:pointer;">${vivienda.direccion}</span>
                        <span class="text-muted small d-block">${vivienda.ciudad}</span>
                    </div>
                </div>
            </td>
            <td>${vivienda.plazas_libres}</td>
            <td>${vivienda.plazas_totales}</td>
            <td>${vivienda.anfitrion}</td>
            <td>
                <span class="badge ${vivienda.estado === 'ocupada' ? 'bg-success' : 'bg-info'} rounded-pill px-3">
                    ${vivienda.estado === 'ocupada' ? 'Ocupada' : 'Disponible'}
                </span>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Doble clic en nombre para ver detalles
    tbody.querySelectorAll('.vivienda-direccion').forEach(span => {
        span.addEventListener('dblclick', function(e) {
            const id = this.getAttribute('data-id');
            if (typeof verVivienda === 'function') {
                verVivienda(Number(id), e);
            }
        });
    });
}
