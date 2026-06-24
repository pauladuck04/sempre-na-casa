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
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center gap-2">
                    <input class="form-check-input criterio-checkbox align-self-start mt-1" type="checkbox" value="${c.id}">
                    <span class="fw-semibold">${c.criterio}</span>
                </div>
            </td>
            <td>${c.valor}</td>
            <td><span class="badge bg-success rounded-pill px-3">${t('anfitrion.criteria.active')}</span></td>
        `;
        tbody.appendChild(row);
    });
}
