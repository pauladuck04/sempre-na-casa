// js/public/dashboard-anfitrion.js

// ============================================
// MOCK DATA
// ============================================

let viviendaActual = {
    id: 1,
    direccion: 'Calle Mayor 12, 3º B',
    ciudad: 'Santiago de Compostela',
    plazas_totales: 3,
    plazas_libres: 1,
    descripcion: 'Piso amplio en el centro histórico, con jardín comunitario.',
    estado: 'disponible'
};

let criteriosVivienda = [
    { id: 1, criterio: 'Rango de edad', valor: '25-40 años', estado: 'activo' },
    { id: 2, criterio: 'Fumador', valor: 'No fumador', estado: 'activo' },
    { id: 3, criterio: 'Mascotas', valor: 'Sin mascotas', estado: 'inactivo' },
];

let inquilinosAsignados = [
    { id: 1, nombre: 'Luis Martínez', compatibilidad: 92, estado: 'activo', email: 'luis.m@email.com', telefono: '666 111 222', fechaIngreso: '01/02/2026' },
    { id: 2, nombre: 'Marta Soto', compatibilidad: 85, estado: 'entrevista', email: 'marta.s@email.com', telefono: '666 333 444', fechaIngreso: null },
];

// ============================================
// INIT
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    cargarVistaPrincipal();
    inicializarNavegacion();
    inicializarBotones();
});

// ============================================
// VISTA GENERAL
// ============================================

function cargarVistaPrincipal() {
    cargarResumen();
    cargarConvivencias();
}

function cargarResumen() {
    const plazasOcupadas = viviendaActual
        ? viviendaActual.plazas_totales - viviendaActual.plazas_libres
        : 0;
    const enEntrevista = inquilinosAsignados.filter(i => i.estado === 'entrevista').length;

    const estadoEl = document.getElementById('estado-vivienda');
    if (estadoEl) {
        if (!viviendaActual) {
            estadoEl.textContent = 'Sin vivienda';
        } else {
            estadoEl.textContent = viviendaActual.estado === 'disponible' ? 'Disponible' : 'Completa';
            estadoEl.style.color = viviendaActual.estado === 'disponible'
                ? 'var(--color-success)'
                : 'var(--color-primario)';
        }
    }

    const plazasEl = document.getElementById('plazas-ocupadas');
    if (plazasEl) {
        plazasEl.textContent = viviendaActual
            ? `${plazasOcupadas} / ${viviendaActual.plazas_totales}`
            : '-';
    }

    const pendientesEl = document.getElementById('solicitudes-pendientes');
    if (pendientesEl) pendientesEl.textContent = enEntrevista;
}

function cargarConvivencias() {
    const tbody = document.getElementById('tabla-convivencias');
    if (!tbody) return;

    const visibles = inquilinosAsignados.filter(i => i.estado !== 'inactivo');

    if (visibles.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-3">No hay convivencias activas</td></tr>';
        return;
    }

    tbody.innerHTML = visibles.map(i => `
        <tr>
            <td class="fw-semibold">${i.nombre}</td>
            <td>${i.fechaIngreso || '-'}</td>
            <td>${badgeEstado(i.estado)}</td>
            <td>
                <button class="btn btn-sm btn-primary rounded-pill px-3" onclick="verInquilino(${i.id})">
                    <i class="bi bi-eye me-1"></i> Ver perfil
                </button>
            </td>
        </tr>
    `).join('');
}

// ============================================
// MI VIVIENDA
// ============================================

function cargarVivienda() {
    const sinVivienda = document.getElementById('sin-vivienda');
    const conVivienda = document.getElementById('con-vivienda');

    if (!viviendaActual) {
        sinVivienda.classList.remove('d-none');
        conVivienda.classList.add('d-none');
        return;
    }

    sinVivienda.classList.add('d-none');
    conVivienda.classList.remove('d-none');

    const badgeEstadoVivienda = viviendaActual.estado === 'disponible'
        ? '<span class="badge bg-success-subtle text-success px-3 py-2">Disponible</span>'
        : '<span class="badge bg-secondary-subtle text-secondary px-3 py-2">Completa</span>';

    document.getElementById('ficha-vivienda').innerHTML = `
        <div class="row g-4">
            <div class="col-md-8">
                <h6 class="text-muted small mb-1">Dirección</h6>
                <p class="fw-semibold mb-3">${viviendaActual.direccion}</p>
                <h6 class="text-muted small mb-1">Ciudad</h6>
                <p class="fw-semibold mb-3">${viviendaActual.ciudad}</p>
                <h6 class="text-muted small mb-1">Descripción</h6>
                <p class="mb-0">${viviendaActual.descripcion || '-'}</p>
            </div>
            <div class="col-md-4">
                <div class="card border-0 bg-light rounded-3 p-3 mb-3">
                    <p class="text-muted small mb-1">Plazas Totales</p>
                    <h4 class="fw-bold mb-0">${viviendaActual.plazas_totales}</h4>
                </div>
                <div class="card border-0 bg-light rounded-3 p-3 mb-3">
                    <p class="text-muted small mb-1">Plazas Libres</p>
                    <h4 class="fw-bold mb-0 text-success">${viviendaActual.plazas_libres}</h4>
                </div>
                <div class="card border-0 bg-light rounded-3 p-3">
                    <p class="text-muted small mb-1">Estado</p>
                    <div>${badgeEstadoVivienda}</div>
                </div>
            </div>
        </div>
    `;
}

function abrirModalVivienda(editando = false) {
    const v = editando ? viviendaActual : null;
    document.getElementById('modalTitle').textContent = editando ? 'Editar Vivienda' : 'Dar de Alta Vivienda';
    document.getElementById('modalFormContent').innerHTML = `
        <div class="mb-3">
            <label class="form-label fw-bold">Dirección</label>
            <input name="direccion" class="form-control" placeholder="Ej: Calle Mayor 12, 3º B" required>
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Ciudad</label>
            <input name="ciudad" class="form-control" placeholder="Ej: Santiago de Compostela" required>
        </div>
        <div class="row">
            <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">Plazas Totales</label>
                <input type="number" name="plazas_totales" class="form-control" min="1" required>
            </div>
            <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">Plazas Libres</label>
                <input type="number" name="plazas_libres" class="form-control" min="0" required>
            </div>
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Descripción <span class="text-muted fw-normal">(opcional)</span></label>
            <textarea name="descripcion" class="form-control" rows="2" placeholder="Descripción breve de la vivienda..."></textarea>
        </div>
        <input type="hidden" name="modo" value="vivienda">
    `;

    if (v) {
        const form = document.getElementById('modalFormContent');
        form.querySelector('[name="direccion"]').value = v.direccion;
        form.querySelector('[name="ciudad"]').value = v.ciudad;
        form.querySelector('[name="plazas_totales"]').value = v.plazas_totales;
        form.querySelector('[name="plazas_libres"]').value = v.plazas_libres;
        form.querySelector('[name="descripcion"]').value = v.descripcion || '';
    }

    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalGenerico')).show();
}

// ============================================
// CRITERIOS
// ============================================

function cargarCriterios() {
    const tbody = document.getElementById('tabla-criterios');
    if (!tbody) return;

    if (criteriosVivienda.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-3">No hay criterios configurados</td></tr>';
        return;
    }

    tbody.innerHTML = criteriosVivienda.map(c => {
        const badge = c.estado === 'activo'
            ? '<span class="badge bg-success-subtle text-success">Activo</span>'
            : '<span class="badge bg-secondary-subtle text-secondary">Inactivo</span>';
        const iconoToggle = c.estado === 'activo' ? 'x-circle' : 'check-circle';
        const titleToggle = c.estado === 'activo' ? 'Desactivar' : 'Activar';
        return `
            <tr>
                <td class="fw-semibold">${c.criterio}</td>
                <td>${c.valor}</td>
                <td>${badge}</td>
                <td>
                    <button class="btn btn-sm btn-outline-secondary rounded-pill px-3 me-1"
                            title="Editar" onclick="editarCriterio(${c.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger rounded-pill px-3"
                            title="${titleToggle}" onclick="toggleCriterio(${c.id})">
                        <i class="bi bi-${iconoToggle}"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function abrirModalCriterio(criterio = null) {
    document.getElementById('modalTitle').textContent = criterio ? 'Editar Criterio' : 'Añadir Criterio';
    document.getElementById('modalFormContent').innerHTML = `
        <div class="mb-3">
            <label class="form-label fw-bold">Criterio</label>
            <input name="criterio" class="form-control" placeholder="Ej: Rango de edad" value="${criterio?.criterio || ''}" required>
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Valor Preferido</label>
            <input name="valor" class="form-control" placeholder="Ej: 25-40 años" value="${criterio?.valor || ''}" required>
        </div>
        <input type="hidden" name="modo" value="criterio">
        <input type="hidden" name="criterio_id" value="${criterio?.id || ''}">
    `;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalGenerico')).show();
}

window.editarCriterio = function(id) {
    const criterio = criteriosVivienda.find(c => c.id === id);
    if (criterio) abrirModalCriterio(criterio);
};

window.toggleCriterio = function(id) {
    const criterio = criteriosVivienda.find(c => c.id === id);
    if (!criterio) return;
    criterio.estado = criterio.estado === 'activo' ? 'inactivo' : 'activo';
    cargarCriterios();
};

// ============================================
// INQUILINOS
// ============================================

function cargarInquilinos() {
    const tbody = document.getElementById('tabla-inquilinos');
    if (!tbody) return;

    if (inquilinosAsignados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-3">No hay inquilinos asignados</td></tr>';
        return;
    }

    tbody.innerHTML = inquilinosAsignados.map(i => {
        const pctColor = i.compatibilidad >= 85 ? 'success' : i.compatibilidad >= 65 ? 'warning' : 'danger';
        const puedeDarBaja = i.estado === 'activo' || i.estado === 'prueba';
        return `
            <tr>
                <td class="fw-semibold">${i.nombre}</td>
                <td style="min-width: 140px;">
                    <div class="d-flex align-items-center gap-2">
                        <div class="progress flex-grow-1" style="height: 6px;">
                            <div class="progress-bar bg-${pctColor}" style="width: ${i.compatibilidad}%;"></div>
                        </div>
                        <small class="fw-bold text-${pctColor}">${i.compatibilidad}%</small>
                    </div>
                </td>
                <td>${badgeEstado(i.estado)}</td>
                <td>
                    <div class="d-flex gap-1 flex-wrap">
                        <button class="btn btn-sm btn-outline-primary rounded-pill px-3"
                                onclick="verInquilino(${i.id})">
                            <i class="bi bi-eye me-1"></i> Perfil
                        </button>
                        ${puedeDarBaja ? `
                        <button class="btn btn-sm btn-outline-danger rounded-pill px-3"
                                onclick="abrirModalBaja(${i.id})">
                            <i class="bi bi-box-arrow-right me-1"></i> Baja
                        </button>` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

window.verInquilino = function(id) {
    const i = inquilinosAsignados.find(x => x.id === id);
    if (!i) return;

    const pctColor = i.compatibilidad >= 85 ? 'success' : i.compatibilidad >= 65 ? 'warning' : 'danger';

    document.getElementById('modalDetalleTitle').textContent = `Perfil: ${i.nombre}`;
    document.getElementById('modalDetalleContent').innerHTML = `
        <div class="text-center mb-4">
            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(i.nombre)}&background=7A99DD&color=fff"
                 width="80" class="rounded-circle shadow-sm mb-3" alt="${i.nombre}">
            <h5 class="fw-bold mb-1">${i.nombre}</h5>
            <p class="mb-0">${badgeEstado(i.estado)}</p>
        </div>
        <div class="row">
            <div class="col-md-6 mb-3">
                <h6 class="text-muted small mb-1">Correo Electrónico</h6>
                <p class="fw-semibold mb-0">${i.email}</p>
            </div>
            <div class="col-md-6 mb-3">
                <h6 class="text-muted small mb-1">Teléfono</h6>
                <p class="fw-semibold mb-0">${i.telefono}</p>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6 mb-3">
                <h6 class="text-muted small mb-1">Fecha de Ingreso</h6>
                <p class="fw-semibold mb-0">${i.fechaIngreso || 'Pendiente'}</p>
            </div>
            <div class="col-md-6 mb-3">
                <h6 class="text-muted small mb-1">Compatibilidad</h6>
                <div class="d-flex align-items-center gap-2 mt-1">
                    <div class="progress flex-grow-1" style="height: 8px;">
                        <div class="progress-bar bg-${pctColor}" style="width: ${i.compatibilidad}%;"></div>
                    </div>
                    <span class="fw-bold text-${pctColor}">${i.compatibilidad}%</span>
                </div>
            </div>
        </div>
    `;

    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalDetalle')).show();
};

let inquilinoBajaId = null;

window.abrirModalBaja = function(id) {
    const i = inquilinosAsignados.find(x => x.id === id);
    if (!i) return;
    inquilinoBajaId = id;
    document.getElementById('baja-nombre').textContent = i.nombre;
    document.getElementById('baja-observaciones').value = '';
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalBaja')).show();
};

// ============================================
// HELPERS
// ============================================

function badgeEstado(estado) {
    const badges = {
        activo:      `<span class="badge rounded-pill px-3 py-2" style="background-color:#D1E7DD;color:#0F5132;">✓ Activo</span>`,
        entrevista:  `<span class="badge rounded-pill px-3 py-2" style="background-color:#FFF3CD;color:#856404;">⏳ En Entrevista</span>`,
        prueba:      `<span class="badge rounded-pill px-3 py-2" style="background-color:#CFE2FF;color:#084298;">⚠️ Periodo de Prueba</span>`,
        inactivo:    `<span class="badge rounded-pill px-3 py-2" style="background-color:#F8D7DA;color:#842029;">✕ Inactivo</span>`,
    };
    return badges[estado] || `<span class="badge bg-secondary rounded-pill">${estado}</span>`;
}

// ============================================
// NAVEGACIÓN
// ============================================

function inicializarNavegacion() {
    const sectionLinks = document.querySelectorAll('.section-link');
    const sectionContents = document.querySelectorAll('.section-content');

    const titulos = {
        general:    'Panel de Anfitrión',
        vivienda:   'Mi Vivienda',
        criterios:  'Criterios de la Vivienda',
        inquilinos: 'Inquilinos',
    };

    const descripciones = {
        general:    'Resumen de tu vivienda e inquilinos actuales',
        vivienda:   'Gestiona los datos de tu vivienda',
        criterios:  'Define las preferencias para los inquilinos',
        inquilinos: 'Consulta perfiles y gestiona las bajas',
    };

    sectionLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const seccion = link.getAttribute('data-section');

            sectionContents.forEach(c => c.classList.remove('active'));
            sectionLinks.forEach(l => { l.classList.remove('active-custom'); l.classList.add('text-muted'); });

            document.querySelector(`.section-content[data-section="${seccion}"]`)?.classList.add('active');
            link.classList.add('active-custom');
            link.classList.remove('text-muted');

            document.getElementById('section-title').textContent = titulos[seccion] || '';
            document.getElementById('section-description').textContent = descripciones[seccion] || '';

            switch (seccion) {
                case 'general':    cargarVistaPrincipal(); break;
                case 'vivienda':   cargarVivienda();       break;
                case 'criterios':  cargarCriterios();      break;
                case 'inquilinos': cargarInquilinos();     break;
            }
        });
    });
}

// ============================================
// BOTONES Y FORMULARIOS
// ============================================

function inicializarBotones() {
    document.getElementById('btnDarDeAlta')?.addEventListener('click', () => abrirModalVivienda(false));
    document.getElementById('btnEditarVivienda')?.addEventListener('click', () => abrirModalVivienda(true));
    document.getElementById('btnNuevoCriterio')?.addEventListener('click', () => abrirModalCriterio());

    document.getElementById('btnConfirmarBaja')?.addEventListener('click', () => {
        if (!inquilinoBajaId) return;
        const motivo = document.getElementById('baja-motivo').value;
        const obs = document.getElementById('baja-observaciones').value;
        const i = inquilinosAsignados.find(x => x.id === inquilinoBajaId);
        if (i) {
            i.estado = 'inactivo';
            console.log(`Baja notificada — inquilino: ${i.nombre}, motivo: ${motivo}, obs: ${obs}`);
        }
        bootstrap.Modal.getInstance(document.getElementById('modalBaja')).hide();
        inquilinoBajaId = null;
        cargarInquilinos();
        cargarResumen();
        cargarConvivencias();
    });

    document.getElementById('formGenerico')?.addEventListener('submit', e => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target));

        if (data.modo === 'vivienda') {
            viviendaActual = {
                id: viviendaActual?.id || Date.now(),
                direccion: data.direccion,
                ciudad: data.ciudad,
                plazas_totales: parseInt(data.plazas_totales),
                plazas_libres: parseInt(data.plazas_libres),
                descripcion: data.descripcion || '',
                estado: parseInt(data.plazas_libres) > 0 ? 'disponible' : 'completa',
            };
            bootstrap.Modal.getInstance(document.getElementById('modalGenerico')).hide();
            cargarVivienda();
            cargarResumen();
        } else if (data.modo === 'criterio') {
            if (data.criterio_id) {
                const c = criteriosVivienda.find(x => x.id === parseInt(data.criterio_id));
                if (c) { c.criterio = data.criterio; c.valor = data.valor; }
            } else {
                criteriosVivienda.push({ id: Date.now(), criterio: data.criterio, valor: data.valor, estado: 'activo' });
            }
            bootstrap.Modal.getInstance(document.getElementById('modalGenerico')).hide();
            cargarCriterios();
        }
    });
}
