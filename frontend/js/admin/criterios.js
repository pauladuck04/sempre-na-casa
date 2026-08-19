import { t } from '../i18n.js';
import { aplicarPaginacion } from './paginacion.js';

export let listaCriteriosMemoria = [];
export let listaOpcionesMemoria = [];

export async function cargarCriterios() {
    if (listaCriteriosMemoria.length === 0) {
        const resCriterios = await apiPost('criterio', 'getAll');
        if (resCriterios.ok && Array.isArray(resCriterios.resource)) {
            listaCriteriosMemoria = resCriterios.resource.map(c => ({
                id: c.id_criterio,
                nombre: c.nombre_criterio,
                estado: c.activo_criterio == 1 ? 'activo' : 'inactivo'
            }));
        }
    }
    if (listaOpcionesMemoria.length === 0) {
        const resOpciones = await apiPost('opcion', 'getAll');
        if (resOpciones.ok && Array.isArray(resOpciones.resource)) {
            listaOpcionesMemoria = resOpciones.resource.map(o => {
                const criterio = listaCriteriosMemoria.find(c => c.id == o.id_criterio);
                return {
                    id: o.id_opcion,
                    criterio_id: o.id_criterio,
                    criterio: criterio ? criterio.nombre : o.id_criterio,
                    opcion: o.nombre_opcion,
                    valor: o.valor,
                    estado: o.activo_opcion == 1 ? 'activo' : 'inactivo'
                };
            });
        }
    }
    renderizarCriterios(listaCriteriosMemoria);
    renderizarOpciones(listaOpcionesMemoria);
}

// --- CRITERIOS ---
export async function reactivarCriterios(ids) {
    for (const id of ids) {
        const res = await apiPost('criterio', 'REACTIVAR', { id_criterio: id });
        if (res.ok) {
            const c = listaCriteriosMemoria.find(c => String(c.id) === String(id));
            if (c) c.estado = 'activo';
        }
    }
}
export async function desactivarCriterios(ids) {
    for (const id of ids) {
        const res = await apiPost('criterio', 'DELETE', { id_criterio: id });
        if (res.ok) {
            const c = listaCriteriosMemoria.find(c => String(c.id) === String(id));
            if (c) c.estado = 'inactivo';
        }
    }
}
export function renderizarCriterios(lista) {
    aplicarPaginacion('tabla-criterios', lista, _renderFilasCriterios);
}

function _renderFilasCriterios(pagina) {
    const tbody = document.getElementById('tabla-criterios');
    if (!tbody) return;
    tbody.innerHTML = '';
    pagina.forEach(c => {
        const esActivo = c.estado === 'activo';
        const row = document.createElement('tr');
        row.className = 'criterio-row';
        row.style.cursor = 'pointer';
        row.innerHTML = `
            <input class="form-check-input criterio-checkbox" type="checkbox" value="${c.id}" style="display: none;">
            <td data-label="Criterio">
                <div class="d-flex align-items-center gap-2">
                    <span class="fw-semibold criterio-nombre" data-id="${c.id}" style="cursor:pointer;">${c.nombre}</span>
                </div>
            </td>
            <td data-label="Estado">
                <span class="badge ${esActivo ? 'bg-success' : 'bg-secondary'} rounded-pill px-3">
                    ${esActivo ? t('common.active') : t('common.inactive')}
                </span>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Click en la fila para seleccionar
    tbody.querySelectorAll('.criterio-row').forEach(row => {
        row.addEventListener('click', function(e) {
            if (e.target.closest('.criterio-nombre')) {
                e.stopPropagation();
                if (typeof verCriterio === 'function') verCriterio(this.querySelector('.criterio-nombre').getAttribute('data-id'), e);
                return;
            }
            const checkbox = this.querySelector('.criterio-checkbox');
            checkbox.checked = !checkbox.checked;
            this.classList.toggle('row-selected');
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        });
    });

    tbody.querySelectorAll('.criterio-nombre').forEach(span => {
        span.addEventListener('click', function(e) {
            e.stopPropagation();
            if (typeof verCriterio === 'function') verCriterio(this.getAttribute('data-id'), e);
        });
    });
}

// --- OPCIONES ---
export async function reactivarOpciones(ids) {
    for (const id of ids) {
        const res = await apiPost('opcion', 'REACTIVAR', { id_opcion: id });
        if (res.ok) {
            const o = listaOpcionesMemoria.find(o => String(o.id) === String(id));
            if (o) o.estado = 'activo';
        }
    }
}
export async function desactivarOpciones(ids) {
    for (const id of ids) {
        const res = await apiPost('opcion', 'DELETE', { id_opcion: id });
        if (res.ok) {
            const o = listaOpcionesMemoria.find(o => String(o.id) === String(id));
            if (o) o.estado = 'inactivo';
        }
    }
}
export function renderizarOpciones(lista) {
    aplicarPaginacion('tabla-opciones', lista, _renderFilasOpciones);
}

function _renderFilasOpciones(pagina) {
    const tbody = document.getElementById('tabla-opciones');
    if (!tbody) return;
    tbody.innerHTML = '';
    pagina.forEach(o => {
        const esActivo = o.estado === 'activo';
        const row = document.createElement('tr');
        row.className = 'opcion-row';
        row.style.cursor = 'pointer';
        row.innerHTML = `
            <input class="form-check-input opcion-checkbox" type="checkbox" value="${o.id}" style="display: none;">
            <td data-label="Opción">
                <div class="d-flex align-items-center gap-2">
                    <span class="fw-semibold">${o.opcion}</span>
                </div>
            </td>
            <td data-label="Criterio">${o.criterio}</td>
            <td data-label="Valor">${o.valor}</td>
            <td data-label="Estado">
                <span class="badge ${esActivo ? 'bg-success' : 'bg-secondary'} rounded-pill px-3">
                    ${esActivo ? t('common.active') : t('common.inactive')}
                </span>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Click en la fila para seleccionar
    tbody.querySelectorAll('.opcion-row').forEach(row => {
        row.addEventListener('click', function(e) {
            const checkbox = this.querySelector('.opcion-checkbox');
            checkbox.checked = !checkbox.checked;
            this.classList.toggle('row-selected');
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        });
    });
}
