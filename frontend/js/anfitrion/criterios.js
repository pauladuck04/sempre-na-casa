import { t } from '../i18n.js';
import { aplicarPaginacion, resetPagina } from '../admin/paginacion.js';

export let listaCriteriosMemoria = [];
export let listaOpcionesMemoria  = [];

export async function cargarCriterios(idVivienda) {
    const tbody = document.getElementById('tabla-criterios');
    if (!tbody) return;

    if (!idVivienda) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted py-3">${t('anfitrion.criteria.noVivienda')}</td></tr>`;
        document.getElementById('paginacion-tabla-criterios')?.replaceChildren();
        return;
    }

    tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted py-3"><span class="spinner-border spinner-border-sm me-2"></span></td></tr>`;

    const [resC, resO] = await Promise.all([
        apiPost('vivienda_criterio_opcion', 'getByVivienda', { id_vivienda: idVivienda }),
        apiPost('opcion', 'getAll')
    ]);

    listaCriteriosMemoria = (resC.ok && Array.isArray(resC.resource))
        ? resC.resource.map(r => ({
            id:          String(r.id_criterio),
            id_vivienda: r.id_vivienda,
            id_criterio: r.id_criterio,
            id_opcion:   r.id_opcion,
            criterio:    r.nombre_criterio,
            valor:       r.nombre_opcion
          }))
        : [];

    listaOpcionesMemoria = (resO.ok && Array.isArray(resO.resource)) ? resO.resource : [];

    resetPagina('tabla-criterios');
    aplicarPaginacion('tabla-criterios', listaCriteriosMemoria, renderizarCriterios);
}

export function renderizarConPaginacion(lista) {
    resetPagina('tabla-criterios');
    aplicarPaginacion('tabla-criterios', lista, renderizarCriterios);
}

export function renderizarCriterios(lista) {
    const tbody = document.getElementById('tabla-criterios');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!lista || lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted py-3">${t('anfitrion.criteria.noData')}</td></tr>`;
        return;
    }

    lista.forEach(c => {
        const row = document.createElement('tr');
        row.className = 'criterio-row';
        row.style.cursor = 'pointer';
        row.innerHTML = `
            <input class="form-check-input criterio-checkbox" type="checkbox" value="${c.id}" style="display: none;">
            <td data-label="${t('anfitrion.table.criteria')}">
                <div class="d-flex align-items-center gap-2">
                    <span class="fw-semibold">${c.criterio}</span>
                </div>
            </td>
            <td data-label="${t('anfitrion.table.preferredValue')}">${c.valor}</td>
            <td data-label="${t('anfitrion.table.status')}"><span class="badge bg-success rounded-pill px-3">${t('anfitrion.criteria.active')}</span></td>
        `;
        tbody.appendChild(row);
    });

    // Click en la fila para seleccionar (mismo patrón que las tablas del panel admin:
    // checkbox oculto + borde azul .row-selected, ver components.css).
    tbody.querySelectorAll('.criterio-row').forEach(row => {
        row.addEventListener('click', function() {
            const checkbox = this.querySelector('.criterio-checkbox');
            checkbox.checked = !checkbox.checked;
            this.classList.toggle('row-selected');
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        });
    });
}
