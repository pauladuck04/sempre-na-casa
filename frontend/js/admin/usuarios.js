import { t } from '../i18n.js';
import { listaRolesMemoria } from './roles.js';
import { aplicarPaginacion } from './paginacion.js';

export let listaUsuariosMemoria = [];

export async function cargarUsuarios() {
    if (listaUsuariosMemoria.length === 0) {
        const res = await apiPost('usuario', 'getAll');
        if (res.ok && Array.isArray(res.resource)) {
            listaUsuariosMemoria = res.resource.map((u) => {
                const rolObj = listaRolesMemoria.find(r => r.id == u.id_rol);
                return {
                    id: u.id_usuario,
                    nombre: `${u.nombre_usuario} ${u.apellidos}`.trim(),
                    nombre_usuario: u.nombre_usuario,
                    apellidos: u.apellidos,
                    email: u.mail,
                    id_rol: u.id_rol,
                    rol: rolObj ? rolObj.nombre : `Rol ${u.id_rol}`,
                    fechaRegistro: u.fecha_alta_usuario ? u.fecha_alta_usuario.split(' ')[0] : '-',
                    dni: u.dni,
                    telefono: u.telefono,
                    estado: u.activo_usuario == 1 ? 'activo' : 'inactivo'
                };
            });
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
        const rolNombre = usuario.rol;
        const badgeEstado = usuario.estado === 'activo'   ? 'bg-success'
                          : usuario.estado === 'inactivo' ? 'bg-secondary'
                                                          : 'bg-warning text-dark';
        const textoEstado = usuario.estado === 'activo'   ? t('admin.users.statusActive')
                          : usuario.estado === 'inactivo' ? t('admin.users.statusInactive')
                                                          : t('admin.users.statusPending');

        const rolLabel = usuario.id_rol == 3
            ? `<span class="badge rounded-pill bg-success-subtle text-success px-3">${rolNombre}</span>`
            : `<span class="badge rounded-pill bg-info-subtle text-info px-3">${rolNombre}</span>`;

        const row = document.createElement('tr');
        row.className = 'usuario-row';
        row.style.cursor = 'pointer';
        row.innerHTML = `
            <input class="form-check-input usuario-checkbox" type="checkbox" value="${usuario.id}" style="display: none;">
            <td data-label="Usuario">
                <div class="d-flex align-items-center gap-2">
                    <div>
                        <span class="fw-semibold d-block usuario-nombre" data-id="${usuario.id}" style="cursor:pointer;">${usuario.nombre}</span>
                        <span class="text-muted small d-block">${usuario.email.replace('@', '@<wbr>')}</span>
                    </div>
                </div>
            </td>
            <td data-label="Rol">${rolLabel}</td>
            <td data-label="Fecha Reg">${usuario.fechaRegistro}</td>
            <td data-label="DNI">${usuario.dni}</td>
            <td data-label="Teléfono">${usuario.telefono}</td>
            <td data-label="Estado"><span class="badge ${badgeEstado} rounded-pill px-3">${textoEstado}</span></td>
        `;
        tbody.appendChild(row);
    });

    // Click en la fila para seleccionar
    tbody.querySelectorAll('.usuario-row').forEach(row => {
        row.addEventListener('click', function(e) {
            if (e.target.closest('.usuario-nombre')) {
                e.stopPropagation();
                if (typeof verUsuario === 'function') verUsuario(this.querySelector('.usuario-nombre').getAttribute('data-id'), e);
                return;
            }
            const checkbox = this.querySelector('.usuario-checkbox');
            checkbox.checked = !checkbox.checked;
            this.classList.toggle('row-selected');
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        });
    });

    tbody.querySelectorAll('.usuario-nombre').forEach(span => {
        span.addEventListener('click', function(e) {
            e.stopPropagation();
            if (typeof verUsuario === 'function') verUsuario(this.getAttribute('data-id'), e);
        });
    });
}
