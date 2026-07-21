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
                peso: c.peso_criterio,
                restrictivo: c.restrictivo,
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
                    excluyente: o.excluyente,
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
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center gap-2">
                    <input class="form-check-input criterio-checkbox align-self-start mt-1" type="checkbox" value="${c.id}">
                    <span class="fw-semibold criterio-nombre" data-id="${c.id}" style="cursor:pointer;">${c.nombre}</span>
                    ${c.restrictivo == 1 ? `<span class="badge bg-danger rounded-pill" title="${t('admin.criteria.restrictive') || 'Restrictivo'}">R</span>` : ''}
                </div>
            </td>
            <td>${c.peso}</td>
            <td>
                <span class="badge ${esActivo ? 'bg-success' : 'bg-secondary'} rounded-pill px-3">
                    ${esActivo ? t('common.active') : t('common.inactive')}
                </span>
            </td>
        `;
        tbody.appendChild(row);
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
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center gap-2">
                    <input class="form-check-input opcion-checkbox align-self-start mt-1" type="checkbox" value="${o.id}">
                    <span class="fw-semibold">${o.opcion}</span>
                    ${o.excluyente == 1 ? `<span class="badge bg-danger rounded-pill" title="${t('admin.criteria.excluding') || 'Excluyente'}">X</span>` : ''}
                </div>
            </td>
            <td>${o.criterio}</td>
            <td>${o.valor}</td>
            <td>
                <span class="badge ${esActivo ? 'bg-success' : 'bg-secondary'} rounded-pill px-3">
                    ${esActivo ? t('common.active') : t('common.inactive')}
                </span>
            </td>
        `;
        tbody.appendChild(row);
    });
}
