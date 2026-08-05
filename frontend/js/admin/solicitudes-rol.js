import { t } from '../i18n.js';
import { aplicarPaginacion } from './paginacion.js';
import { mostrarToast } from '../perfil-comun.js';
import * as usuarios from './usuarios.js';

export let listaSolicitudesRolMemoria = [];

export async function cargarSolicitudesRol() {
    const res = await apiPost('usuario', 'getSolicitudesCambioRol');

    listaSolicitudesRolMemoria = (res.ok && Array.isArray(res.resource))
        ? res.resource.map(r => ({
            id_usuario:     r.id_usuario,
            usuario:        `${r.nombre_usuario || ''} ${r.apellidos || ''}`.trim(),
            mail:           r.mail || '',
            rolActual:      r.rol_actual,
            rolSolicitado:  r.rol_solicitado,
            fechaSolicitud: r.fecha_solicitud_rol ? r.fecha_solicitud_rol.split(' ')[0] : '-'
          }))
        : [];

    renderizarSolicitudesRol(listaSolicitudesRolMemoria);
}

export function renderizarSolicitudesRol(lista) {
    aplicarPaginacion('tabla-solicitudes-rol', lista, _renderFilasSolicitudesRol);
}

function _renderFilasSolicitudesRol(pagina) {
    const tbody = document.getElementById('tabla-solicitudes-rol');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!pagina || pagina.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-3">${t('admin.roleRequests.noRequests')}</td></tr>`;
        return;
    }

    pagina.forEach(s => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="fw-semibold">${s.usuario}<br><span class="text-muted small">${s.mail.replace('@', '@<wbr>')}</span></td>
            <td>${s.rolActual}</td>
            <td>${s.rolSolicitado}</td>
            <td>${s.fechaSolicitud}</td>
            <td>
                <div class="d-flex flex-wrap gap-1">
                    <button type="button" class="btn btn-sm btn-success rounded-pill btn-aceptar-cambio-rol" data-id-usuario="${s.id_usuario}">
                        <i class="bi bi-check-lg"></i> ${t('buttons.accept')}
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-danger rounded-pill btn-rechazar-cambio-rol" data-id-usuario="${s.id_usuario}">
                        <i class="bi bi-x-lg"></i> ${t('buttons.reject')}
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });

    tbody.querySelectorAll('.btn-aceptar-cambio-rol').forEach(btn => {
        btn.addEventListener('click', () => resolverCambioRol(btn, 'ACEPTAR_CAMBIO_ROL'));
    });
    tbody.querySelectorAll('.btn-rechazar-cambio-rol').forEach(btn => {
        btn.addEventListener('click', () => resolverCambioRol(btn, 'RECHAZAR_CAMBIO_ROL'));
    });
}

async function resolverCambioRol(btn, accion) {
    const idUsuario = btn.getAttribute('data-id-usuario');
    btn.disabled = true;

    const res = await apiPost('usuario', accion, { id_usuario: idUsuario });

    if (res.ok) {
        mostrarToast(
            accion === 'ACEPTAR_CAMBIO_ROL' ? t('admin.roleRequests.acceptSuccess') : t('admin.roleRequests.rejectSuccess'),
            'success'
        );
        await cargarSolicitudesRol();
        if (accion === 'ACEPTAR_CAMBIO_ROL') {
            // el rol del usuario ha cambiado: forzar recarga de la tabla de usuarios
            usuarios.listaUsuariosMemoria.splice(0);
            await usuarios.cargarUsuarios();
        }
    } else {
        mostrarToast(`${t('admin.roleRequests.actionError')}: ${res.code || 'desconocido'}`, 'danger');
        btn.disabled = false;
    }
}
