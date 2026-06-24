import { t } from '../i18n.js';
import { aplicarPaginacion, resetPagina } from '../admin/paginacion.js';

export let listaRespuestasMemoria = []; // { id_criterio, nombre_criterio, id_opcion, nombre_opcion }

export async function cargarPreferencias(idUsuario) {
    if (!idUsuario) return;

    const res = await apiPost('usuario_criterio_opcion', 'getResumenByUsuario', { id_usuario: idUsuario });

    listaRespuestasMemoria = (res.ok && Array.isArray(res.resource))
        ? res.resource.map(r => ({
            id_criterio:     r.id_criterio,
            nombre_criterio: r.nombre_criterio,
            id_opcion:       r.id_opcion   ?? null,
            nombre_opcion:   r.nombre_opcion ?? null
        }))
        : [];

    resetPagina('tabla-preferencias');
    renderizarPreferencias(listaRespuestasMemoria);
}

export function renderizarPreferencias(lista) {
    const datos = lista ?? listaRespuestasMemoria;
    aplicarPaginacion('tabla-preferencias', datos, _renderFilasPreferencias);
}

function _renderFilasPreferencias(pagina) {
    const tbody = document.getElementById('tabla-preferencias');
    if (!tbody) return;
    tbody.innerHTML = '';
    pagina.forEach(r => {
        const row = document.createElement('tr');
        const respuesta = r.nombre_opcion
            ? `<span class="fw-semibold">${r.nombre_opcion}</span>`
            : `<span class="text-muted fst-italic">${t('huesped.preferences.noAnswer') || 'Sin respuesta'}</span>`;
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center gap-2">
                    <input class="form-check-input preferencia-checkbox align-self-start mt-1"
                           type="checkbox" value="${r.id_criterio}">
                    <span class="fw-semibold">${r.nombre_criterio}</span>
                </div>
            </td>
            <td>${respuesta}</td>
        `;
        tbody.appendChild(row);
    });
}
