// js/admin/usuarios.js
// Script para la página de gestión de usuarios

export let listaUsuariosMemoria = [];

/**
 * Cargar lista de usuarios
 */
export function cargarUsuarios() {
    // Datos simulados
    const usuarios = [
        {
            id: 1,
            nombre: 'Paula Gómez',
            email: 'paula@ejemplo.com',
            rol: 'inquilino',
            fechaRegistro: '12/03/2026',
            dni: '12345678A',
            telefono: '609 875 321',
            estado: 'activo',
        },
        {
            id: 2,
            nombre: 'Juan Martínez',
            email: 'juan@ejemplo.com',
            rol: 'anfitrion',
            fechaRegistro: '10/03/2026',
            dni: '23456789B',
            telefono: '612 345 678',
            estado: 'activo',
        },
        {
            id: 3,
            nombre: 'Marta Soto',
            email: 'marta@ejemplo.com',
            rol: 'inquilino',
            fechaRegistro: '08/03/2026',
            dni: '34567890C',
            telefono: '613 456 789',
            estado: 'pendiente',
        }
    ];
    listaUsuariosMemoria = usuarios;
    renderizarUsuarios(usuarios);
}

/**
 * Renderizar tabla de usuarios
 */
export function renderizarUsuarios(usuarios) {
    const tbody = document.getElementById('tabla-usuarios');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    usuarios.forEach((usuario, index) => {
        const iniciales = usuario.nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        const colorRol = usuario.rol === 'anfitrion' ? 'var(--color-secundario)' : 'var(--color-primario)';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center gap-2">
                    <input class="form-check-input usuario-checkbox align-self-start mt-1" type="checkbox" value="${usuario.id}">
                    <div class="rounded-circle text-white fw-bold" 
                         style="width: 35px; height: 35px; background-color: ${colorRol}; display: flex; align-items: center; justify-content: center; font-size: 0.9rem;">
                        ${iniciales}
                    </div>
                    <div>
                        <span class="fw-semibold d-block usuario-nombre" data-id="${usuario.id}" style="cursor:pointer;">${usuario.nombre}</span>
                        <span class="text-muted small d-block">${usuario.email}</span>
                    </div>
                </div>
            </td>
            <td>
                <span class="badge rounded-pill ${usuario.rol === 'anfitrion' ? 'bg-success-subtle text-success' : 'bg-info-subtle text-info'} px-3">
                    ${usuario.rol === 'anfitrion' ? 'Anfitrión' : 'Inquilino'}
                </span>
            </td>
            <td>${usuario.fechaRegistro}</td>
            <td>${usuario.dni}</td>
            <td>${usuario.telefono}</td>
            <td>
                <span class="badge ${usuario.estado === 'activo' ? 'bg-success' : 'bg-warning text-dark'} rounded-pill px-3">
                    ${usuario.estado === 'activo' ? 'Activo' : 'Pendiente'}
                </span>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Doble clic en nombre para ver detalles
    tbody.querySelectorAll('.usuario-nombre').forEach(span => {
        span.addEventListener('dblclick', function(e) {
            const id = this.getAttribute('data-id');
            verUsuario(Number(id), e);
        });
    });
}