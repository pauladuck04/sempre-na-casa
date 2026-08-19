import { t } from '../i18n.js';
import { aplicarPaginacion, resetPagina } from '../admin/paginacion.js';

export let listaRespuestasMemoria = [];

export async function cargarPreferencias(idUsuario) {
    if (!idUsuario) return;

    const res = await apiPost('usuario_criterio_opcion', 'getResumenByUsuario', { id_usuario: idUsuario });

    listaRespuestasMemoria = (res.ok && Array.isArray(res.resource))
        ? res.resource.map(r => ({
            id_criterio:     r.id_criterio,
            nombre_criterio: r.nombre_criterio,
            id_opcion:       r.id_opcion   ?? null,
            nombre_opcion:   r.nombre_opcion ?? null,
            peso:                r.peso        ?? 3,
            restrictivo:         r.restrictivo ?? 0,
            id_opcion_excluyente: r.id_opcion_excluyente ?? null
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
        row.className = 'preferencia-row';
        row.style.cursor = 'pointer';
        const respuesta = r.nombre_opcion
            ? `<span class="fw-semibold">${r.nombre_opcion}</span>`
            : `<span class="text-muted fst-italic">${t('huesped.preferences.noAnswer') || 'Sin respuesta'}</span>`;
        row.innerHTML = `
            <input class="form-check-input preferencia-checkbox" type="checkbox" value="${r.id_criterio}" style="display: none;">
            <td data-label="${t('huesped.table.preference')}">
                <div class="d-flex align-items-center gap-2">
                    <span class="fw-semibold">${r.nombre_criterio}</span>
                </div>
            </td>
            <td data-label="${t('huesped.table.myValue')}">${respuesta}</td>
        `;
        tbody.appendChild(row);
    });

    // Click en la fila para seleccionar (mismo patrón que usuarios/roles/viviendas/criterios
    // del panel admin: checkbox oculto + borde azul .row-selected, ver components.css).
    tbody.querySelectorAll('.preferencia-row').forEach(row => {
        row.addEventListener('click', function() {
            const checkbox = this.querySelector('.preferencia-checkbox');
            checkbox.checked = !checkbox.checked;
            this.classList.toggle('row-selected');
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        });
    });
}
