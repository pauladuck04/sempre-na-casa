import { t } from '../i18n.js';
import { aplicarPaginacion } from './paginacion.js';
import { mostrarToast } from '../perfil-comun.js';

export let listaSolicitudesMemoria = [];

export async function cargarSolicitudes() {
    const res = await apiPost('usuario_vivienda', 'getSolicitudes');

    listaSolicitudesMemoria = (res.ok && Array.isArray(res.resource))
        ? res.resource.map(r => ({
            id_usuario:     r.id_usuario,
            id_vivienda:    r.id_vivienda,
            huesped:        `${r.nombre_usuario || ''} ${r.apellidos || ''}`.trim(),
            mail:           r.mail || '',
            vivienda:       `${r.direccion || ''}, ${r.ciudad || ''}`,
            anfitrion:      `${r.anfitrion_nombre || ''} ${r.anfitrion_apellidos || ''}`.trim(),
            estado:         r.estado_usuario_vivienda,
            fechaSolicitud: r.fecha_solicitud ? r.fecha_solicitud.split(' ')[0] : '-',
            fechaInicio:    r.fecha_inicio ? r.fecha_inicio.split(' ')[0] : '-',
            fechaFin:       r.fecha_fin ? r.fecha_fin.split(' ')[0] : null
          }))
        : [];

    renderizarSolicitudes(listaSolicitudesMemoria);
}

export function renderizarSolicitudes(lista) {
    aplicarPaginacion('tabla-solicitudes', lista, _renderFilasSolicitudes);
}

function _renderFilasSolicitudes(pagina) {
    const tbody = document.getElementById('tabla-solicitudes');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!pagina || pagina.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-3">${t('admin.requests.noRequests') || 'No hay solicitudes'}</td></tr>`;
        return;
    }

    pagina.forEach(s => {
        const row = document.createElement('tr');
        const acciones = s.estado === 'PENDIENTE' ? `
            <button type="button" class="btn btn-sm btn-success rounded-pill me-1 btn-aceptar-solicitud" data-id-usuario="${s.id_usuario}" data-id-vivienda="${s.id_vivienda}">
                <i class="bi bi-check-lg"></i> ${t('buttons.accept') || 'Aceptar'}
            </button>
            <button type="button" class="btn btn-sm btn-outline-danger rounded-pill btn-rechazar-solicitud" data-id-usuario="${s.id_usuario}" data-id-vivienda="${s.id_vivienda}">
                <i class="bi bi-x-lg"></i> ${t('buttons.reject') || 'Rechazar'}
            </button>` : '-';

        const fechasPropuestas = `${s.fechaInicio} ${t('admin.requests.dateRangeTo') || 'a'} ${s.fechaFin || (t('admin.requests.openEnded') || '-')}`;

        row.innerHTML = `
            <td class="fw-semibold">${s.huesped}<br><span class="text-muted small">${s.mail}</span></td>
            <td>${s.vivienda}</td>
            <td>${s.anfitrion}</td>
            <td>${s.fechaSolicitud}</td>
            <td>${fechasPropuestas}</td>
            <td>${badgeEstado(s.estado)}</td>
            <td>${acciones}</td>
        `;
        tbody.appendChild(row);
    });

    tbody.querySelectorAll('.btn-aceptar-solicitud').forEach(btn => {
        btn.addEventListener('click', () => resolverSolicitud(btn, 'ACEPTAR'));
    });
    tbody.querySelectorAll('.btn-rechazar-solicitud').forEach(btn => {
        btn.addEventListener('click', () => resolverSolicitud(btn, 'RECHAZAR'));
    });
}

async function resolverSolicitud(btn, accion) {
    const idUsuario  = btn.getAttribute('data-id-usuario');
    const idVivienda = btn.getAttribute('data-id-vivienda');
    btn.disabled = true;

    const res = await apiPost('usuario_vivienda', accion, { id_usuario: idUsuario, id_vivienda: idVivienda });

    if (res.ok) {
        mostrarToast(
            accion === 'ACEPTAR' ? (t('admin.requests.acceptSuccess') || 'Solicitud aceptada.') : (t('admin.requests.rejectSuccess') || 'Solicitud rechazada.'),
            'success'
        );
        await cargarSolicitudes();
    } else {
        mostrarToast(`${t('admin.requests.actionError') || 'No se pudo completar la accion'}: ${res.code || 'desconocido'}`, 'danger');
        btn.disabled = false;
    }
}

function badgeEstado(estado) {
    const labels = {
        PENDIENTE: t('admin.requests.statusPending')  || 'Pendiente',
        ACEPTADA:  t('admin.requests.statusAccepted') || 'Aceptada',
        RECHAZADA: t('admin.requests.statusRejected') || 'Rechazada'
    };
    const colors = {
        PENDIENTE: ['#FFF3CD', '#856404'],
        ACEPTADA:  ['#D1E7DD', '#0F5132'],
        RECHAZADA: ['#F8D7DA', '#842029']
    };
    const [bg, fg] = colors[estado] || ['#e2e3e5', '#383d41'];
    return `<span class="badge rounded-pill px-3" style="background-color:${bg};color:${fg};">${labels[estado] || estado}</span>`;
}
