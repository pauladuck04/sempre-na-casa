import { t } from '../i18n.js';

export let listaCriteriosMemoria = [
    { id:1, nombre:'Nivel de Ruido',        estado:'activo'   },
    { id:2, nombre:'Habito de Tabaco',       estado:'activo'   },
    { id:3, nombre:'Frecuencia de Visitas',  estado:'activo'   },
    { id:4, nombre:'Mascotas',               estado:'inactivo' },
    { id:5, nombre:'Limpieza y Orden',       estado:'activo'   }
];

export let listaOpcionesMemoria = [
    { id:1, criterio_id:1, criterio:'Nivel de Ruido',       opcion:'Silencio Absoluto',    valor:1, estado:'activo'   },
    { id:2, criterio_id:2, criterio:'Habito de Tabaco',      opcion:'Prohibido Totalmente', valor:1, estado:'activo'   },
    { id:3, criterio_id:3, criterio:'Frecuencia de Visitas', opcion:'Sin Visitas',          valor:1, estado:'activo'   },
    { id:4, criterio_id:4, criterio:'Mascotas',              opcion:'No acepto mascotas',   valor:1, estado:'inactivo' },
    { id:5, criterio_id:5, criterio:'Limpieza y Orden',      opcion:'Muy meticuloso',       valor:1, estado:'activo'   }
];

export function cargarCriterios() {
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
