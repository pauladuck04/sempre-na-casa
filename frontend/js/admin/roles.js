// js/admin/roles.js
// Script para la página de gestión de roles

export let listaRolesMemoria = [];

/**
 * Cargar lista de roles
 */
export function cargarRoles() {
    const roles = [
        {
            id: 1,
            nombre: 'Administrador',
            estado: 'activo'
        },
        {
            id: 2,
            nombre: 'Anfitrión',
            estado: 'activo'
        },
        {
            id: 3,
            nombre: 'Inquilino',
            estado: 'activo'
        }
    ];
    
    listaRolesMemoria = roles;
    renderizarRoles(roles);
}

/**
 * Renderizar tabla de roles
 */
export function renderizarRoles(roles) {
    const tbody = document.getElementById('tabla-roles');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    roles.forEach((rol, index) => {
        const iniciales = rol.nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

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
                <span class="badge ${rol.estado === 'activo' ? 'bg-success' : 'bg-warning text-dark'} rounded-pill px-3">
                    ${rol.estado === 'activo' ? 'Activo' : 'Pendiente'}
                </span>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Doble clic en nombre para ver detalles
    tbody.querySelectorAll('.rol-nombre').forEach(span => {
        span.addEventListener('dblclick', function(e) {
            const id = this.getAttribute('data-id');
            verRol(Number(id), e);
        });
    });
}