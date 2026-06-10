import { t } from '../i18n.js';

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
                    <span class="fw-semibold criterio-nombre" data-id="${c.id}" style="cursor:pointer;">${c.nombre}</span>
                </div>
            </td>
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
            if (typeof verCriterio === 'function') verCriterio(Number(this.getAttribute('data-id')), e);
        });
    });
}

// --- OPCIONES ---
export function reactivarOpciones(ids) {
    listaOpcionesMemoria.forEach(o => { if (ids.includes(String(o.id))) o.estado = 'activo'; });
}
export function desactivarOpciones(ids) {
    listaOpcionesMemoria.forEach(o => { if (ids.includes(String(o.id))) o.estado = 'inactivo'; });
}
export function renderizarOpciones(lista) {
    const tbody = document.getElementById('tabla-opciones');
    if (!tbody) return;
    tbody.innerHTML = '';
    lista.forEach(o => {
        const esActivo = o.estado === 'activo';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center gap-2">
                    <input class="form-check-input opcion-checkbox align-self-start mt-1" type="checkbox" value="${o.id}">
                    <span class="fw-semibold">${o.opcion}</span>
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
