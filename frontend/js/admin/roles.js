import { t } from '../i18n.js';

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
