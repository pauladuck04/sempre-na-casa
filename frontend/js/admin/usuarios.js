import { t } from '../i18n.js';

export let listaUsuariosMemoria = [];

export function cargarUsuarios() {
    if (listaUsuariosMemoria.length === 0) {
        listaUsuariosMemoria = [
            { id:1, nombre:'Paula Gomez',   email:'paula@ejemplo.com', rol:'inquilino', fechaRegistro:'12/03/2026', dni:'12345678A', telefono:'609 875 321', estado:'activo'   },
            { id:2, nombre:'Juan Martinez', email:'juan@ejemplo.com',  rol:'anfitrion', fechaRegistro:'10/03/2026', dni:'23456789B', telefono:'612 345 678', estado:'activo'   },
            { id:3, nombre:'Marta Soto',    email:'marta@ejemplo.com', rol:'inquilino', fechaRegistro:'08/03/2026', dni:'34567890C', telefono:'613 456 789', estado:'pendiente'},
            { id:4, nombre:'Luis Martinez', email:'luis@ejemplo.com',  rol:'inquilino', fechaRegistro:'01/02/2026', dni:'45678901D', telefono:'614 567 890', estado:'inactivo' }
        ];
    }
    renderizarUsuarios(listaUsuariosMemoria);
}

export function reactivarUsuarios(ids) {
    listaUsuariosMemoria.forEach(u => { if (ids.includes(String(u.id))) u.estado = 'activo'; });
}

export function desactivarUsuarios(ids) {
    listaUsuariosMemoria.forEach(u => { if (ids.includes(String(u.id))) u.estado = 'inactivo'; });
}

export function renderizarUsuarios(usuarios) {
    const tbody = document.getElementById('tabla-usuarios');
    if (!tbody) return;
    tbody.innerHTML = '';

    usuarios.forEach(usuario => {
        const iniciales  = usuario.nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        const colorRol   = usuario.rol === 'anfitrion' ? 'var(--color-secundario)' : 'var(--color-primario)';
        const badgeEstado = usuario.estado === 'activo'    ? 'bg-success'
                          : usuario.estado === 'inactivo' ? 'bg-secondary'
                                                          : 'bg-warning text-dark';
        const textoEstado = usuario.estado === 'activo'    ? t('admin.users.statusActive')
                          : usuario.estado === 'inactivo' ? t('admin.users.statusInactive')
                                                          : t('admin.users.statusPending');
        const rolLabel   = usuario.rol === 'anfitrion'
            ? `<span class="badge rounded-pill bg-success-subtle text-success px-3">${t('admin.users.roleAnfitrion')}</span>`
            : `<span class="badge rounded-pill bg-info-subtle text-info px-3">${t('admin.users.roleInquilino')}</span>`;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center gap-2">
                    <input class="form-check-input usuario-checkbox align-self-start mt-1" type="checkbox" value="${usuario.id}">
                    <div class="rounded-circle text-white fw-bold"
                         style="width:35px;height:35px;background-color:${colorRol};display:flex;align-items:center;justify-content:center;font-size:.9rem;">
                        ${iniciales}
                    </div>
                    <div>
                        <span class="fw-semibold d-block usuario-nombre" data-id="${usuario.id}" style="cursor:pointer;">${usuario.nombre}</span>
                        <span class="text-muted small d-block">${usuario.email}</span>
                    </div>
                </div>
            </td>
            <td>${rolLabel}</td>
            <td>${usuario.fechaRegistro}</td>
            <td>${usuario.dni}</td>
            <td>${usuario.telefono}</td>
            <td><span class="badge ${badgeEstado} rounded-pill px-3">${textoEstado}</span></td>
        `;
        tbody.appendChild(row);
    });

    tbody.querySelectorAll('.usuario-nombre').forEach(span => {
        span.addEventListener('click', function(e) {
            e.stopPropagation();
            if (typeof verUsuario === 'function') verUsuario(Number(this.getAttribute('data-id')), e);
        });
    });
}
