import { t } from '../i18n.js';

export let listaCriteriosMemoria = [];

export function cargarCriterios() {
    if (listaCriteriosMemoria.length === 0) {
        listaCriteriosMemoria = [
            { id:1, criterio:'Rango de edad', valor:'25-40 años',  estado:'activo'   },
            { id:2, criterio:'Fumador',        valor:'No fumador',  estado:'activo'   },
            { id:3, criterio:'Mascotas',       valor:'Sin mascotas', estado:'inactivo' }
        ];
    }
    renderizarCriterios(listaCriteriosMemoria);
}

export function reactivarCriterios(ids) {
    listaCriteriosMemoria.forEach(c => { if (ids.includes(String(c.id))) c.estado = 'activo'; });
}

export function desactivarCriterios(ids) {
    listaCriteriosMemoria.forEach(c => { if (ids.includes(String(c.id))) c.estado = 'inactivo'; });
}

export function renderizarCriterios(lista) {
    const tbody = document.getElementById('tabla-criterios');
    if (!tbody) return;
    tbody.innerHTML = '';

    lista.forEach(c => {
        const esActivo = c.estado === 'activo';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center gap-2">
                    <input class="form-check-input criterio-checkbox align-self-start mt-1" type="checkbox" value="${c.id}">
                    <div>
                        <span class="fw-semibold d-block criterio-nombre" data-id="${c.id}" style="cursor:pointer;">${c.criterio}</span>
                    </div>
                </div>
            </td>
            <td>${c.valor}</td>
            <td>
                <span class="badge ${esActivo ? 'bg-success' : 'bg-secondary'} rounded-pill px-3">
                    ${esActivo ? t('anfitrion.criteria.active') : t('anfitrion.criteria.inactive')}
                </span>
            </td>
        `;
        tbody.appendChild(row);
    });
}
