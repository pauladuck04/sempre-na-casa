import { t } from '../i18n.js';

export let listaCriteriosMemoria = [];

export function cargarCriterios() {
    if (listaCriteriosMemoria.length === 0) {
        listaCriteriosMemoria = [
            { id:1, criterio:'Nivel de Ruido',        opcion:'Silencio Absoluto',    valor:1, estado:'activo'   },
            { id:2, criterio:'Habito de Tabaco',       opcion:'Prohibido Totalmente', valor:1, estado:'activo'   },
            { id:3, criterio:'Frecuencia de Visitas',  opcion:'Sin Visitas',          valor:1, estado:'activo'   },
            { id:4, criterio:'Mascotas',               opcion:'No acepto mascotas',   valor:1, estado:'inactivo' },
            { id:5, criterio:'Limpieza y Orden',       opcion:'Muy meticuloso',       valor:1, estado:'activo'   }
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

export function renderizarCriterios(criterios) {
    const tbody = document.getElementById('tabla-criterios');
    if (!tbody) return;
    tbody.innerHTML = '';

    criterios.forEach(criterio => {
        const esActivo = criterio.estado === 'activo';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center gap-2">
                    <input class="form-check-input criterio-checkbox align-self-start mt-1" type="checkbox" value="${criterio.id}">
                    <div>
                        <span class="fw-semibold d-block criterio-nombre" data-id="${criterio.id}" style="cursor:pointer;">${criterio.criterio}</span>
                    </div>
                </div>
            </td>
            <td>${criterio.opcion}</td>
            <td>${criterio.valor}</td>
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
