import { t } from '../i18n.js';

export let listaViviendasMemoria = [];

export async function cargarViviendas() {
    if (listaViviendasMemoria.length === 0) {
        const res = await apiPost('vivienda', 'getAll');
        if (res.ok && Array.isArray(res.resource)) {
            listaViviendasMemoria = res.resource.map(v => ({
                id: v.id_vivienda,
                descripcion: v.descripcion,
                direccion: v.direccion,
                ciudad: v.ciudad,
                plazas_libres: v.plazas_libres,
                plazas_totales: v.plazas_totales,
                anfitrion: v.id_anfitrion,
                estado: v.activo_vivienda == 1 ? 'disponible' : 'inactivo'
            }));
        }
    }
    renderizarViviendas(listaViviendasMemoria);
}

export function reactivarViviendas(ids) {
    listaViviendasMemoria.forEach(v => { if (ids.includes(String(v.id))) v.estado = 'disponible'; });
}

export function desactivarViviendas(ids) {
    listaViviendasMemoria.forEach(v => { if (ids.includes(String(v.id))) v.estado = 'inactivo'; });
}

export function renderizarViviendas(viviendas) {
    const tbody = document.getElementById('tabla-viviendas');
    if (!tbody) return;
    tbody.innerHTML = '';

    viviendas.forEach(vivienda => {
        const badgeEstado  = vivienda.estado === 'ocupada'   ? 'bg-success'
                           : vivienda.estado === 'inactivo' ? 'bg-secondary'
                                                            : 'bg-info';
        const textoEstado  = vivienda.estado === 'ocupada'   ? t('admin.homes.statusOccupied')
                           : vivienda.estado === 'inactivo' ? t('admin.homes.statusInactive')
                                                            : t('admin.homes.statusAvailable');

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
            <td><span class="badge ${badgeEstado} rounded-pill px-3">${textoEstado}</span></td>
        `;
        tbody.appendChild(row);
    });

    tbody.querySelectorAll('.vivienda-direccion').forEach(span => {
        span.addEventListener('click', function(e) {
            e.stopPropagation();
            if (typeof verVivienda === 'function') verVivienda(Number(this.getAttribute('data-id')), e);
        });
    });
}
