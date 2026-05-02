// js/admin/roles.js
// Script para la pagina de gestion de roles

export let listaRolesMemoria = [];

export function cargarRoles() {
    if (listaRolesMemoria.length === 0) {
        listaRolesMemoria = [
            {
                id: 1,
                nombre: 'Administrador',
                estado: 'activo'
            },
            {
                id: 2,
                nombre: 'Anfitrion',
                estado: 'activo'
            },
            {
                id: 3,
                nombre: 'Inquilino',
                estado: 'activo'
            },
            {
                id: 4,
                nombre: 'Voluntario',
                estado: 'inactivo'
            }
        ];
    }

    renderizarRoles(listaRolesMemoria);
}

export function reactivarRoles(ids) {
    listaRolesMemoria.forEach(rol => {
        if (ids.includes(String(rol.id))) rol.estado = 'activo';
    });
}

export function desactivarRoles(ids) {
    listaRolesMemoria.forEach(rol => {
        if (ids.includes(String(rol.id))) rol.estado = 'inactivo';
    });
}

export function renderizarRoles(roles) {
    const tbody = document.getElementById('tabla-roles');

    if (!tbody) return;

    tbody.innerHTML = '';

    roles.forEach(rol => {
        const row = document.createElement('tr');
        const esActivo = rol.estado === 'activo';

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
                    ${esActivo ? 'Activo' : 'Inactivo'}
                </span>
            </td>
        `;
        tbody.appendChild(row);
    });

    tbody.querySelectorAll('.rol-nombre').forEach(span => {
        span.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = this.getAttribute('data-id');
            if (typeof verRol === 'function') {
                verRol(Number(id), e);
            }
        });
    });
}
