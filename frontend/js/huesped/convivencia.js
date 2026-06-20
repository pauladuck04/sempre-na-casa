import { t } from '../i18n.js';

export let convivenciaMemoria = null;

export const candidatosMemoria = [
    { id:1, anfitrion:'Ana García López',  direccion:'Calle Mayor 12, 3º B',       ciudad:'Santiago de Compostela', plazasLibres:2, compatibilidad:92 },
    { id:2, anfitrion:'Carlos Fernández',  direccion:'Rúa do Franco 8, 1º A',      ciudad:'Santiago de Compostela', plazasLibres:1, compatibilidad:78 },
    { id:3, anfitrion:'Rosa Méndez Vidal', direccion:'Avenida de Lugo 34, 2º C',   ciudad:'Santiago de Compostela', plazasLibres:3, compatibilidad:65 },
    { id:4, anfitrion:'Manuel Losada',     direccion:'Praza de Galicia 5, Ático',  ciudad:'Santiago de Compostela', plazasLibres:1, compatibilidad:54 }
];

export function cargarConvivencia() {
    renderizarConvivencia();
}

export function renderizarConvivencia() {
    const sinConvivencia = document.getElementById('sin-convivencia');
    const conConvivencia = document.getElementById('con-convivencia');
    if (!sinConvivencia || !conConvivencia) return;

    if (!convivenciaMemoria) {
        sinConvivencia.classList.remove('d-none');
        conConvivencia.classList.add('d-none');
        return;
    }

    sinConvivencia.classList.add('d-none');
    conConvivencia.classList.remove('d-none');

    const c        = convivenciaMemoria;
    const pctColor = c.compatibilidad >= 85 ? 'success' : c.compatibilidad >= 65 ? 'warning' : 'danger';
    const badgeHtml = badgeEstadoHtml(c.estado);
    const companerosHtml = companerosList(c.companeros);

    document.getElementById('ficha-convivencia').innerHTML = `
        <div class="row g-4">
            <div class="col-md-7">
                <h6 class="text-muted small mb-1">${t('huesped.convivencia.host')}</h6>
                <p class="fw-semibold mb-3">${c.anfitrion}</p>
                <h6 class="text-muted small mb-1">${t('huesped.convivencia.address')}</h6>
                <p class="fw-semibold mb-3">${c.direccion}</p>
                <h6 class="text-muted small mb-1">${t('huesped.convivencia.city')}</h6>
                <p class="fw-semibold mb-3">${c.ciudad}</p>
                <div class="row g-3">
                    <div class="col-md-6">
                        <h6 class="text-muted small mb-1">${t('huesped.convivencia.hostEmail')}</h6>
                        <p class="fw-semibold mb-0">${c.emailAnfitrion}</p>
                    </div>
                    <div class="col-md-6">
                        <h6 class="text-muted small mb-1">${t('huesped.convivencia.hostPhone')}</h6>
                        <p class="fw-semibold mb-0">${c.telefonoAnfitrion}</p>
                    </div>
                </div>
            </div>
            <div class="col-md-5">
                <div class="card border-0 bg-light rounded-3 p-3 mb-3">
                    <p class="text-muted small mb-1">${t('huesped.convivencia.status')}</p>
                    <div>${badgeHtml}</div>
                </div>
                <div class="card border-0 bg-light rounded-3 p-3 mb-3">
                    <p class="text-muted small mb-1">${t('huesped.convivencia.compatibility')}</p>
                    <div class="d-flex align-items-center gap-2 mt-1">
                        <div class="progress flex-grow-1" style="height:8px;">
                            <div class="progress-bar bg-${pctColor}" style="width:${c.compatibilidad}%;"></div>
                        </div>
                        <span class="fw-bold text-${pctColor}">${c.compatibilidad}%</span>
                    </div>
                </div>
                <div class="card border-0 bg-light rounded-3 p-3 mb-3">
                    <p class="text-muted small mb-1">${t('huesped.convivencia.totalSlots')}</p>
                    <h4 class="fw-bold mb-0">${c.plazasTotales}</h4>
                </div>
                <div class="card border-0 bg-light rounded-3 p-3">
                    <p class="text-muted small mb-1">${t('huesped.convivencia.startDate')}</p>
                    <h5 class="fw-bold mb-0">${c.fechaInicio}</h5>
                </div>
            </div>
        </div>
        <hr class="my-4">
        <h6 class="fw-bold mb-3">
            <i class="bi bi-people me-2 text-primary"></i>${t('huesped.convivencia.roommates')}
        </h6>
        ${companerosHtml}
    `;
}

function companerosList(companeros) {
    if (!companeros || companeros.length === 0) {
        return `<p class="text-muted small mb-0">${t('huesped.convivencia.noRoommates')}</p>`;
    }
    const items = companeros.map(p => `
        <div class="d-flex align-items-center gap-3 py-2 border-bottom">
            <div class="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                 style="width:38px;height:38px;background-color:#EBF0FF;color:var(--color-primario);font-weight:600;font-size:.85rem;">
                ${iniciales(p.nombre)}
            </div>
            <div>
                <span class="fw-semibold d-block">${p.nombre}</span>
                <span class="text-muted small">${t('huesped.convivencia.since')} ${p.fechaIngreso}</span>
            </div>
        </div>
    `).join('');
    return `<div class="card border-0 bg-light rounded-3 p-3">${items}</div>`;
}

function iniciales(nombre) {
    return nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

function badgeEstadoHtml(estado) {
    const badges = {
        activo:     `<span class="badge rounded-pill px-3" style="background-color:#D1E7DD;color:#0F5132;">${t('huesped.convivencia.statusActive')}</span>`,
        entrevista: `<span class="badge rounded-pill px-3" style="background-color:#FFF3CD;color:#856404;">${t('huesped.convivencia.statusInterview')}</span>`,
        prueba:     `<span class="badge rounded-pill px-3" style="background-color:#CFE2FF;color:#084298;">${t('huesped.convivencia.statusTrial')}</span>`,
        inactivo:   `<span class="badge rounded-pill px-3" style="background-color:#F8D7DA;color:#842029;">${t('huesped.convivencia.statusFinished')}</span>`
    };
    return badges[estado] || `<span class="badge bg-secondary rounded-pill px-3">${estado}</span>`;
}
