import { t } from '../i18n.js';

export let listaViviendasMemoria = [];

export async function cargarViviendas() {
    if (listaViviendasMemoria.length === 0) {
        const [resV, resU] = await Promise.all([
            apiPost('vivienda', 'getAll'),
            apiPost('usuario', 'getAll')
        ]);
        const usuariosData = (resU.ok && Array.isArray(resU.resource)) ? resU.resource : [];
        if (resV.ok && Array.isArray(resV.resource)) {
            listaViviendasMemoria = resV.resource.map(v => {
                const u = usuariosData.find(u => u.id_usuario == v.id_anfitrion);
                return {
                    id: v.id_vivienda,
                    descripcion: v.descripcion,
                    direccion: v.direccion,
                    ciudad: v.ciudad,
                    plazas_libres: v.plazas_libres,
                    plazas_totales: v.plazas_totales,
                    anfitrion: v.id_anfitrion,
                    anfitrionNombre: u ? `${u.nombre_usuario} ${u.apellidos}`.trim() : String(v.id_anfitrion),
                    estado: v.activo_vivienda == 1 ? 'disponible' : 'inactivo'
                };
            });
        }
    }
    renderizarViviendas(listaViviendasMemoria);
}

export async function reactivarViviendas(ids) {
    for (const id of ids) {
        const res = await apiPost('vivienda', 'REACTIVAR', { id_vivienda: id });
        if (res.ok) {
            const v = listaViviendasMemoria.find(v => String(v.id) === String(id));
            if (v) v.estado = 'disponible';
        }
    }
}

export async function desactivarViviendas(ids) {
    for (const id of ids) {
        const res = await apiPost('vivienda', 'DELETE', { id_vivienda: id });
        if (res.ok) {
            const v = listaViviendasMemoria.find(v => String(v.id) === String(id));
            if (v) v.estado = 'inactivo';
        }
    }
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
            <td>${vivienda.anfitrionNombre || vivienda.anfitrion}</td>
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
