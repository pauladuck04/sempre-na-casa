import { t } from '../i18n.js';
import { aplicarPaginacion } from './paginacion.js';

export let listaRolesMemoria = [];

export async function cargarRoles(forzarRecarga = false) {
    if (forzarRecarga || listaRolesMemoria.length === 0) {
        const res = await apiPost('rol', 'getAll');
        if (res.ok && Array.isArray(res.resource)) {
            listaRolesMemoria = res.resource.map(r => ({
                id: r.id_rol,
                nombre: r.nombre_rol,
                estado: r.activo_rol == 1 ? 'activo' : 'inactivo'
            }));
        }
    }
    renderizarRoles(listaRolesMemoria);
}

export async function reactivarRoles(ids) {
    for (const id of ids) {
        const res = await apiPost('rol', 'REACTIVAR', { id_rol: id });
        if (res.ok) {
            const r = listaRolesMemoria.find(r => String(r.id) === String(id));
            if (r) r.estado = 'activo';
        }
    }
}

export async function desactivarRoles(ids) {
    for (const id of ids) {
        const res = await apiPost('rol', 'DELETE', { id_rol: id });
        if (res.ok) {
            const r = listaRolesMemoria.find(r => String(r.id) === String(id));
            if (r) r.estado = 'inactivo';
        }
    }
}

export function renderizarRoles(roles) {
    aplicarPaginacion('tabla-roles', roles, _renderFilasRoles);
}

function _renderFilasRoles(pagina) {
    const tbody = document.getElementById('tabla-roles');
    if (!tbody) return;
    tbody.innerHTML = '';

    pagina.forEach(rol => {
        const esActivo = rol.estado === 'activo';
        const row = document.createElement('tr');
        row.className = 'rol-row';
        row.style.cursor = 'pointer';
        row.innerHTML = `
            <input class="form-check-input rol-checkbox" type="checkbox" value="${rol.id}" style="display: none;">
            <td data-label="Rol">
                <div class="d-flex align-items-center gap-2">
                    <div>
                        <span class="fw-semibold d-block rol-nombre" data-id="${rol.id}" style="cursor:pointer;">${rol.nombre}</span>
                    </div>
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
    tbody.querySelectorAll('.rol-row').forEach(row => {
        row.addEventListener('click', function(e) {
            if (e.target.closest('.rol-nombre')) {
                e.stopPropagation();
                if (typeof verRol === 'function') verRol(this.querySelector('.rol-nombre').getAttribute('data-id'), e);
                return;
            }
            const checkbox = this.querySelector('.rol-checkbox');
            checkbox.checked = !checkbox.checked;
            this.classList.toggle('row-selected');
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        });
    });

    tbody.querySelectorAll('.rol-nombre').forEach(span => {
        span.addEventListener('click', function(e) {
            e.stopPropagation();
            if (typeof verRol === 'function') verRol(this.getAttribute('data-id'), e);
        });
    });
}
