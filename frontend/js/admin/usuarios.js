import { t } from '../i18n.js';
import { listaRolesMemoria } from './roles.js';
import { aplicarPaginacion } from './paginacion.js';

export let listaUsuariosMemoria = [];

export async function cargarUsuarios() {
    if (listaUsuariosMemoria.length === 0) {
        const res = await apiPost('usuario', 'getAll');
        if (res.ok && Array.isArray(res.resource)) {
            listaUsuariosMemoria = res.resource.map((u) => ({
                id: u.id_usuario,
                nombre: `${u.nombre_usuario} ${u.apellidos}`.trim(),
                nombre_usuario: u.nombre_usuario,
                apellidos: u.apellidos,
                email: u.mail,
                id_rol: u.id_rol,
                fechaRegistro: u.fecha_alta_usuario ? u.fecha_alta_usuario.split(' ')[0] : '-',
                dni: u.dni,
                telefono: u.telefono,
                estado: u.activo_usuario == 1 ? 'activo' : 'inactivo'
            }));
        }
    }
    renderizarUsuarios(listaUsuariosMemoria);
}

export async function reactivarUsuarios(ids) {
    for (const id of ids) {
        const res = await apiPost('usuario', 'REACTIVAR', { id_usuario: id });
        if (res.ok) {
            const u = listaUsuariosMemoria.find(u => String(u.id) === String(id));
            if (u) u.estado = 'activo';
        }
    }
}

export async function desactivarUsuarios(ids) {
    for (const id of ids) {
        const res = await apiPost('usuario', 'DELETE', { id_usuario: id });
        if (res.ok) {
            const u = listaUsuariosMemoria.find(u => String(u.id) === String(id));
            if (u) u.estado = 'inactivo';
        }
    }
}

export function renderizarUsuarios(usuarios) {
    aplicarPaginacion('tabla-usuarios', usuarios, _renderFilasUsuarios);
}

function _renderFilasUsuarios(pagina) {
    const tbody = document.getElementById('tabla-usuarios');
    if (!tbody) return;
    tbody.innerHTML = '';

    pagina.forEach(usuario => {
        const rolObj    = listaRolesMemoria.find(r => r.id == usuario.id_rol);
        const rolNombre = rolObj ? rolObj.nombre : `Rol ${usuario.id_rol}`;
        const iniciales = usuario.nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        const colorAvatar = usuario.id_rol == 2 ? 'var(--color-secundario)' : 'var(--color-primario)';
        const badgeEstado = usuario.estado === 'activo'   ? 'bg-success'
                          : usuario.estado === 'inactivo' ? 'bg-secondary'
                                                          : 'bg-warning text-dark';
        const textoEstado = usuario.estado === 'activo'   ? t('admin.users.statusActive')
                          : usuario.estado === 'inactivo' ? t('admin.users.statusInactive')
                                                          : t('admin.users.statusPending');
        const rolLabel = usuario.id_rol == 2
            ? `<span class="badge rounded-pill bg-success-subtle text-success px-3">${rolNombre}</span>`
            : `<span class="badge rounded-pill bg-info-subtle text-info px-3">${rolNombre}</span>`;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center gap-2">
                    <input class="form-check-input usuario-checkbox align-self-start mt-1" type="checkbox" value="${usuario.id}">
                    <div class="rounded-circle text-white fw-bold"
                         style="width:35px;height:35px;background-color:${colorAvatar};display:flex;align-items:center;justify-content:center;font-size:.9rem;">
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
            if (typeof verUsuario === 'function') verUsuario(this.getAttribute('data-id'), e);
        });
    });
}
