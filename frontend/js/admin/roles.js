import { t } from '../i18n.js';

export let listaRolesMemoria = [];

export async function cargarRoles() {
    if (listaRolesMemoria.length === 0) {
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

export function reactivarRoles(ids) {
    listaRolesMemoria.forEach(r => { if (ids.includes(String(r.id))) r.estado = 'activo'; });
}

export function desactivarRoles(ids) {
    listaRolesMemoria.forEach(r => { if (ids.includes(String(r.id))) r.estado = 'inactivo'; });
}

export function renderizarRoles(roles) {
    const tbody = document.getElementById('tabla-roles');
    if (!tbody) return;
    tbody.innerHTML = '';

    roles.forEach(rol => {
        const esActivo = rol.estado === 'activo';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center gap-2">
                    <input class="form-check-input rol-checkbox align-self-start mt-1" type="checkbox" value="${rol.id}">
                    <div>
                        <span class="fw-semibold d-block rol-nombre" data-id="${rol.id}" style="cursor:pointer;">${rol.nombre}</span>
                    </div>
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

    tbody.querySelectorAll('.rol-nombre').forEach(span => {
        span.addEventListener('click', function(e) {
            e.stopPropagation();
            if (typeof verRol === 'function') verRol(Number(this.getAttribute('data-id')), e);
        });
    });
}
