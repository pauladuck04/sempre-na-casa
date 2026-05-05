// js/public/dashboard-anfitrion.js

import * as criterios  from '../anfitrion/criterios.js';
import * as inquilinos from '../anfitrion/inquilinos.js';

// ============================================
// CONFIGURACIÓN DE FILTROS POR SECCIÓN
// ============================================

const FILTROS_POR_SECCION = {
    criterios: [
        {
            campo: 'estado',
            opciones: [
                ['activo',   'Activos'],
                ['inactivo', 'Inactivos']
            ]
        }
    ],
    inquilinos: [
        {
            campo: 'estado',
            opciones: [
                ['activo',     'Activos'],
                ['entrevista', 'En Entrevista'],
                ['prueba',     'En Prueba'],
                ['inactivo',   'Inactivos']
            ]
        }
    ]
};

// ============================================
// CONFIGURACIÓN DE MODALES GENÉRICOS
// ============================================

const CONFIG_MODALES = {
    criterios: {
        titulo: 'Añadir Criterio',
        html: `
            <div class="mb-3">
                <label class="form-label fw-bold">Criterio</label>
                <input name="criterio" class="form-control" placeholder="Ej: Rango de edad" required>
            </div>
            <div class="mb-3">
                <label class="form-label fw-bold">Valor Preferido</label>
                <input name="valor" class="form-control" placeholder="Ej: 25-40 años" required>
            </div>`
    },
    vivienda: {
        titulo: 'Dar de Alta Vivienda',
        html: `
            <div class="mb-3"><label class="form-label fw-bold">Dirección</label><input name="direccion" class="form-control" placeholder="Ej: Calle Mayor 12, 3º B" required></div>
            <div class="mb-3"><label class="form-label fw-bold">Ciudad</label><input name="ciudad" class="form-control" placeholder="Ej: Santiago de Compostela" required></div>
            <div class="row">
                <div class="col-md-6 mb-3"><label class="form-label fw-bold">Plazas Totales</label><input type="number" name="plazas_totales" class="form-control" min="1" required></div>
                <div class="col-md-6 mb-3"><label class="form-label fw-bold">Plazas Libres</label><input type="number" name="plazas_libres" class="form-control" min="0" required></div>
            </div>
            <div class="mb-3"><label class="form-label fw-bold">Descripción <span class="text-muted fw-normal">(opcional)</span></label><textarea name="descripcion" class="form-control" rows="2" placeholder="Descripción breve de la vivienda..."></textarea></div>`
    }
};

// ============================================
// DATOS DE VIVIENDA
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

let inquilinoBajaId = null;

// ============================================
// DATOS DE USUARIO
// ============================================

const usuarioActual = {
    nombre:    'Ana García López',
    iniciales: 'AG',
    email:     'ana.garcia@semprenacasa.es',
    telefono:  '+34 600 123 456',
    ciudad:    'Santiago de Compostela',
    dni:       '12345678A',
    fechaAlta: 'enero de 2024',
};

// ============================================
// TEXTOS DE SECCIONES (scope de módulo)
// ============================================

const SECTION_TITLES = {
    general:    'Panel de Anfitrión',
    vivienda:   'Mi Vivienda',
    criterios:  'Criterios de la Vivienda',
    inquilinos: 'Inquilinos',
    perfil:     'Mi Perfil',
};

const SECTION_DESCRIPTIONS = {
    general:    'Resumen de tu vivienda e inquilinos actuales',
    vivienda:   'Gestiona los datos de tu vivienda',
    criterios:  'Define las preferencias para los inquilinos',
    inquilinos: 'Consulta perfiles y gestiona las bajas',
    perfil:     'Gestiona tu información personal y configuración de cuenta',
};

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    inquilinos.cargarInquilinos();

    const seccionActiva = document.querySelector('.section-link.active-custom')?.getAttribute('data-section');
    actualizarControlesSeccion(seccionActiva);
    cargarSeguimientoConvivencias();

    // ---- Avatar → sección perfil ----
    document.getElementById('btnPerfil')?.addEventListener('click', () => {
        navegarASeccion('perfil');
    });

    // ---- Botón Crear ----
    document.getElementById('btnCrear')?.addEventListener('click', () => {
        const seccion = document.querySelector('.section-link.active-custom')?.getAttribute('data-section');
        abrirModalGenerico(seccion);
    });

    // ---- Botón Editar ----
    document.getElementById('btnEditar')?.addEventListener('click', () => {
        const seccion = document.querySelector('.section-link.active-custom')?.getAttribute('data-section');

        if (seccion === 'criterios') {
            const seleccionado = document.querySelector('tbody .criterio-checkbox:checked');
            if (!seleccionado) return;
            const id = parseInt(seleccionado.value);
            const c = criterios.listaCriteriosMemoria.find(x => x.id === id);
            if (!c) return;
            abrirModalGenerico('criterios');
            const form = document.getElementById('formGenerico');
            form.querySelector('[name="criterio"]').value = c.criterio;
            form.querySelector('[name="valor"]').value = c.valor;
            form.insertAdjacentHTML('beforeend', `<input type="hidden" name="id_edit" value="${id}">`);
            document.getElementById('modalTitle').textContent = 'Editar Criterio: ' + c.criterio;
        } else if (seccion === 'inquilinos') {
            const seleccionado = document.querySelector('tbody .inquilino-checkbox:checked');
            if (!seleccionado) return;
            verInquilino(parseInt(seleccionado.value));
        }
    });

    // ---- Botón Eliminar / Notificar Baja ----
    document.getElementById('btnEliminar')?.addEventListener('click', () => {
        const seccion = document.querySelector('.section-link.active-custom')?.getAttribute('data-section');
        const seleccionados = obtenerIdsSeleccionados(seccion);
        if (seleccionados.length === 0) return;

        if (seccion === 'criterios') {
            if (confirm(`¿Desactivar ${seleccionados.length} criterio(s)?`)) {
                criterios.desactivarCriterios(seleccionados);
                aplicarFiltros();
                actualizarBotones();
            }
        } else if (seccion === 'inquilinos') {
            abrirModalBaja(parseInt(seleccionados[0]));
        }
    });

    // ---- Botón Reactivar ----
    document.getElementById('btnReactivar')?.addEventListener('click', () => {
        const seccion = document.querySelector('.section-link.active-custom')?.getAttribute('data-section');
        const seleccionados = obtenerIdsSeleccionadosInactivos(seccion);
        if (seleccionados.length === 0) return;

        if (seccion === 'criterios') {
            criterios.reactivarCriterios(seleccionados);
            aplicarFiltros();
            actualizarBotones();
        }
    });

    // ---- Filtros ----
    document.getElementById('filtroTexto')?.addEventListener('input', aplicarFiltros);
    document.getElementById('filtros-globales')?.addEventListener('change', (e) => {
        if (e.target.matches('[data-filtro-campo]')) aplicarFiltros();
    });

    // ---- Checkboxes ----
    document.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') actualizarBotones();
    });

    // ---- Submit modal genérico ----
    document.getElementById('formGenerico')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const seccion = document.querySelector('.section-link.active-custom')?.getAttribute('data-section');
        const data = Object.fromEntries(new FormData(this));

        if (seccion === 'criterios') {
            if (data.id_edit) {
                const c = criterios.listaCriteriosMemoria.find(x => x.id === parseInt(data.id_edit));
                if (c) { c.criterio = data.criterio; c.valor = data.valor; }
            } else {
                criterios.listaCriteriosMemoria.push({ id: Date.now(), criterio: data.criterio, valor: data.valor, estado: 'activo' });
            }
            criterios.cargarCriterios();
        } else if (seccion === 'vivienda') {
            viviendaActual = {
                id: viviendaActual?.id || Date.now(),
                direccion:      data.direccion,
                ciudad:         data.ciudad,
                plazas_totales: parseInt(data.plazas_totales),
                plazas_libres:  parseInt(data.plazas_libres),
                descripcion:    data.descripcion || '',
                estado:         parseInt(data.plazas_libres) > 0 ? 'disponible' : 'completa',
            };
            renderizarVivienda();
        }

        aplicarFiltros();
        bootstrap.Modal.getInstance(document.getElementById('modalGenerico')).hide();
    });

    // ---- Confirmar baja inquilino ----
    document.getElementById('btnConfirmarBaja')?.addEventListener('click', () => {
        if (!inquilinoBajaId) return;
        const motivo = document.getElementById('baja-motivo').value;
        const obs    = document.getElementById('baja-observaciones').value;
        const i = inquilinos.listaInquilinosMemoria.find(x => x.id === inquilinoBajaId);
        if (i) {
            i.estado = 'inactivo';
            console.log(`Baja notificada — inquilino: ${i.nombre}, motivo: ${motivo}, obs: ${obs}`);
        }
        bootstrap.Modal.getInstance(document.getElementById('modalBaja')).hide();
        inquilinoBajaId = null;
        aplicarFiltros();
        actualizarBotones();
        cargarSeguimientoConvivencias();
    });

    // ---- Botón Dar de Alta Vivienda ----
    document.getElementById('btnDarDeAlta')?.addEventListener('click', () => {
        abrirModalGenerico('vivienda');
    });

    // ---- Botón Editar Vivienda ----
    document.getElementById('btnEditarVivienda')?.addEventListener('click', () => {
        abrirModalGenerico('vivienda');
        if (viviendaActual) {
            const form = document.getElementById('modalFormContent');
            form.querySelector('[name="direccion"]').value      = viviendaActual.direccion;
            form.querySelector('[name="ciudad"]').value         = viviendaActual.ciudad;
            form.querySelector('[name="plazas_totales"]').value = viviendaActual.plazas_totales;
            form.querySelector('[name="plazas_libres"]').value  = viviendaActual.plazas_libres;
            form.querySelector('[name="descripcion"]').value    = viviendaActual.descripcion || '';
            document.getElementById('modalTitle').textContent  = 'Editar Vivienda';
            document.getElementById('formGenerico').insertAdjacentHTML('beforeend',
                `<input type="hidden" name="id_edit" value="${viviendaActual.id}">`);
        }
    });

    // ---- Navegación entre secciones ----
    document.querySelectorAll('.section-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navegarASeccion(link.getAttribute('data-section'));
        });
    });

    // ---- Perfil: toggle ojo contraseña ----
    document.querySelectorAll('[data-toggle-pwd]').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = document.getElementById(btn.dataset.togglePwd);
            const icon  = btn.querySelector('i');
            if (input.type === 'password') {
                input.type    = 'text';
                icon.className = 'bi bi-eye-slash';
            } else {
                input.type    = 'password';
                icon.className = 'bi bi-eye';
            }
        });
    });

    // ---- Perfil: indicador de fortaleza ----
    document.getElementById('pwd-nueva')?.addEventListener('input', function () {
        const wrap = document.getElementById('pwd-strength-wrap');
        const bar  = document.getElementById('pwd-strength-bar');
        const txt  = document.getElementById('pwd-strength-text');
        if (!this.value) { wrap.style.display = 'none'; return; }
        wrap.style.display = 'block';
        const cfg = { 1: [25,'#dc3545','Muy débil'], 2: [50,'#fd7e14','Débil'], 3: [75,'#ffc107','Moderada'], 4: [100,'#28a745','Fuerte'] }[calcularFortaleza(this.value)];
        bar.style.width           = cfg[0] + '%';
        bar.style.backgroundColor = cfg[1];
        txt.textContent           = cfg[2];
        txt.style.color           = cfg[1];
    });

    // ---- Perfil: editar datos personales ----
    let valoresOriginalesPerfil = {};
    const perfilInputs = () => Array.from(document.querySelectorAll('#perfil-form input'));

    document.getElementById('perfil-btnEditar')?.addEventListener('click', () => {
        valoresOriginalesPerfil = {};
        perfilInputs().forEach(inp => { valoresOriginalesPerfil[inp.id] = inp.value; inp.disabled = false; });
        document.getElementById('perfil-btnEditar').classList.add('d-none');
        const ac = document.getElementById('perfil-acciones');
        ac.classList.remove('d-none'); ac.classList.add('d-flex');
        document.getElementById('perfil-nombre').focus();
    });

    document.getElementById('perfil-btnCancelar')?.addEventListener('click', () => {
        perfilInputs().forEach(inp => { inp.value = valoresOriginalesPerfil[inp.id]; inp.disabled = true; inp.classList.remove('is-invalid'); });
        document.getElementById('perfil-btnEditar').classList.remove('d-none');
        const ac = document.getElementById('perfil-acciones');
        ac.classList.add('d-none'); ac.classList.remove('d-flex');
    });

    document.getElementById('perfil-form')?.addEventListener('submit', function (e) {
        e.preventDefault();
        const nombre = document.getElementById('perfil-nombre').value.trim();
        const email  = document.getElementById('perfil-email').value.trim();
        if (!nombre) { marcarInvalidoPerfil('perfil-nombre', 'El nombre no puede estar vacío.'); return; }
        if (!email.includes('@')) { marcarInvalidoPerfil('perfil-email', 'Introduce un correo válido.'); return; }

        usuarioActual.nombre   = nombre;
        usuarioActual.email    = email;
        usuarioActual.telefono = document.getElementById('perfil-telefono').value.trim();
        usuarioActual.ciudad   = document.getElementById('perfil-ciudad').value.trim();
        usuarioActual.dni      = document.getElementById('perfil-dni').value.trim();

        perfilInputs().forEach(inp => { inp.disabled = true; inp.classList.remove('is-invalid'); });
        document.getElementById('perfil-btnEditar').classList.remove('d-none');
        const ac = document.getElementById('perfil-acciones');
        ac.classList.add('d-none'); ac.classList.remove('d-flex');

        document.getElementById('perfil-display-nombre').textContent = usuarioActual.nombre;
        mostrarToast('Datos personales actualizados correctamente.', 'success');
    });

    // ---- Perfil: cambiar contraseña ----
    document.getElementById('perfil-form-pwd')?.addEventListener('submit', function (e) {
        e.preventDefault();
        const actual   = document.getElementById('pwd-actual').value;
        const nueva    = document.getElementById('pwd-nueva').value;
        const confirma = document.getElementById('pwd-confirmar').value;
        const feedback = document.getElementById('pwd-feedback');
        feedback.innerHTML = '';

        if (!actual) { feedback.innerHTML = pwdErrorHtml('Introduce tu contraseña actual.'); return; }
        if (nueva.length < 8) { feedback.innerHTML = pwdErrorHtml('La nueva contraseña debe tener al menos 8 caracteres.'); return; }
        if (nueva !== confirma) { feedback.innerHTML = pwdErrorHtml('Las contraseñas no coinciden.'); return; }

        this.reset();
        document.getElementById('pwd-strength-wrap').style.display = 'none';
        mostrarToast('Contraseña actualizada correctamente.', 'success');
    });

    // ---- Perfil: eliminar cuenta ----
    document.getElementById('btnEliminarCuenta')?.addEventListener('click', () => {
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEliminarCuenta')).show();
    });

    document.getElementById('btnConfirmarEliminarCuenta')?.addEventListener('click', () => {
        bootstrap.Modal.getInstance(document.getElementById('modalEliminarCuenta')).hide();
        mostrarToast('Cuenta eliminada. Redirigiendo...', 'danger');
        setTimeout(() => { window.location.href = 'public.html'; }, 2000);
    });
});

// ============================================
// NAVEGACIÓN ENTRE SECCIONES
// ============================================

function navegarASeccion(sectionName) {
    actualizarControlesSeccion(sectionName);

    document.querySelectorAll('.section-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.section-link').forEach(l => { l.classList.remove('active-custom'); l.classList.add('text-muted'); });
    actualizarBotones();

    const activeSection = document.querySelector(`.section-content[data-section="${sectionName}"]`);
    if (activeSection) activeSection.classList.add('active');

    const matchingLink = document.querySelector(`.section-link[data-section="${sectionName}"]`);
    if (matchingLink) { matchingLink.classList.add('active-custom'); matchingLink.classList.remove('text-muted'); }

    switch (sectionName) {
        case 'general':    cargarSeguimientoConvivencias(); break;
        case 'vivienda':   renderizarVivienda();            break;
        case 'criterios':  criterios.cargarCriterios();     break;
        case 'inquilinos': inquilinos.cargarInquilinos();   break;
    }

    aplicarFiltros();
    document.getElementById('section-title').textContent       = SECTION_TITLES[sectionName]       || '';
    document.getElementById('section-description').textContent = SECTION_DESCRIPTIONS[sectionName] || '';
}

// ============================================
// VISTA GENERAL
// ============================================

function cargarSeguimientoConvivencias() {
    const v = viviendaActual;
    const plazasOcupadas = v ? v.plazas_totales - v.plazas_libres : 0;
    const enEntrevista   = inquilinos.listaInquilinosMemoria.filter(i => i.estado === 'entrevista').length;

    const estadoEl = document.getElementById('estado-vivienda');
    if (estadoEl) estadoEl.textContent = v ? (v.estado === 'disponible' ? 'Disponible' : 'Completa') : 'Sin vivienda';

    const plazasEl = document.getElementById('plazas-ocupadas');
    if (plazasEl) plazasEl.textContent = v ? `${plazasOcupadas} / ${v.plazas_totales}` : '-';

    const pendientesEl = document.getElementById('solicitudes-pendientes');
    if (pendientesEl) pendientesEl.textContent = enEntrevista;

    renderizarConvivencias();
}

function renderizarConvivencias() {
    const tbody = document.getElementById('tabla-convivencias');
    if (!tbody) return;

    const visibles = inquilinos.listaInquilinosMemoria.filter(i => i.estado !== 'inactivo');

    if (visibles.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted py-3">No hay convivencias activas</td></tr>';
        return;
    }

    tbody.innerHTML = visibles.map(i => {
        let estadoBadge = '';
        switch (i.estado) {
            case 'activo':     estadoBadge = `<span class="badge rounded-pill px-3 py-2" style="background-color:#D1E7DD;color:#0F5132;">✓ Activa</span>`;           break;
            case 'entrevista': estadoBadge = `<span class="badge rounded-pill px-3 py-2" style="background-color:#FFF3CD;color:#856404;">⏳ En Entrevista</span>`;   break;
            case 'prueba':     estadoBadge = `<span class="badge rounded-pill px-3 py-2" style="background-color:#CFE2FF;color:#084298;">⚠️ Periodo de Prueba</span>`; break;
        }
        return `<tr><td class="fw-semibold">${i.nombre}</td><td>${i.fechaIngreso || '-'}</td><td>${estadoBadge}</td></tr>`;
    }).join('');
}

// ============================================
// MI VIVIENDA
// ============================================

function renderizarVivienda() {
    const sinVivienda = document.getElementById('sin-vivienda');
    const conVivienda = document.getElementById('con-vivienda');

    if (!viviendaActual) {
        sinVivienda.classList.remove('d-none');
        conVivienda.classList.add('d-none');
        return;
    }

    sinVivienda.classList.add('d-none');
    conVivienda.classList.remove('d-none');

    const badgeEstadoHtml = viviendaActual.estado === 'disponible'
        ? '<span class="badge bg-success rounded-pill px-3">Disponible</span>'
        : '<span class="badge bg-secondary rounded-pill px-3">Completa</span>';

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
                    <div>${badgeEstadoHtml}</div>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// MODAL GENÉRICO
// ============================================

function abrirModalGenerico(seccion) {
    const config = CONFIG_MODALES[seccion];
    if (!config) return;

    document.getElementById('modalTitle').textContent    = config.titulo;
    document.getElementById('modalFormContent').innerHTML = config.html;

    const form = document.getElementById('formGenerico');
    form.reset();
    form.querySelector('input[name="id_edit"]')?.remove();

    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalGenerico')).show();
}

// ============================================
// MODAL BAJA INQUILINO
// ============================================

function abrirModalBaja(id) {
    const i = inquilinos.listaInquilinosMemoria.find(x => x.id === id);
    if (!i) return;
    inquilinoBajaId = id;
    document.getElementById('baja-nombre').textContent      = i.nombre;
    document.getElementById('baja-observaciones').value = '';
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalBaja')).show();
}

// ============================================
// VER DETALLE INQUILINO
// ============================================

window.verInquilino = function(id) {
    const i = inquilinos.listaInquilinosMemoria.find(x => x.id === id);
    if (!i) return;

    const pctColor   = i.compatibilidad >= 85 ? 'success' : i.compatibilidad >= 65 ? 'warning' : 'danger';
    const estadoBadge = {
        activo:     `<span class="badge bg-success">Activo</span>`,
        entrevista: `<span class="badge bg-warning text-dark">En Entrevista</span>`,
        prueba:     `<span class="badge bg-info text-dark">Prueba</span>`,
        inactivo:   `<span class="badge bg-secondary">Inactivo</span>`,
    }[i.estado] || `<span class="badge bg-secondary">${i.estado}</span>`;

    document.getElementById('modalDetalleTitle').textContent = `Perfil del Inquilino: ${i.nombre}`;
    document.getElementById('modalDetalleContent').innerHTML = `
        <div class="text-center mb-4">
            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(i.nombre)}&background=7A99DD&color=fff"
                 width="80" class="rounded-circle shadow-sm mb-3" alt="${i.nombre}">
            <h5 class="fw-bold mb-1">${i.nombre}</h5>
            <p class="mb-0">${estadoBadge}</p>
        </div>
        <div class="row">
            <div class="col-md-6">
                <h6 class="text-muted small mb-2">Correo Electrónico</h6>
                <p class="fw-semibold">${i.email}</p>
            </div>
            <div class="col-md-6">
                <h6 class="text-muted small mb-2">Teléfono</h6>
                <p class="fw-semibold">${i.telefono}</p>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6">
                <h6 class="text-muted small mb-2">Fecha de Ingreso</h6>
                <p class="fw-semibold">${i.fechaIngreso || 'Pendiente'}</p>
            </div>
            <div class="col-md-6">
                <h6 class="text-muted small mb-2">Compatibilidad</h6>
                <div class="d-flex align-items-center gap-2 mt-1">
                    <div class="progress flex-grow-1" style="height:8px;">
                        <div class="progress-bar bg-${pctColor}" style="width:${i.compatibilidad}%;"></div>
                    </div>
                    <span class="fw-bold text-${pctColor}">${i.compatibilidad}%</span>
                </div>
            </div>
        </div>
    `;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalDetalle')).show();
};

// ============================================
// CONTROLES DE SECCIÓN (acciones + filtros)
// ============================================

function actualizarControlesSeccion(seccion) {
    const accionesGlobales   = document.getElementById('acciones-globales');
    const filtrosGlobales    = document.getElementById('filtros-globales');
    const filtrosEspecificos = document.getElementById('filtrosEspecificos');
    const filtroTexto        = document.getElementById('filtroTexto');

    if (!accionesGlobales || !filtrosGlobales) return;

    if (seccion === 'general' || seccion === 'vivienda' || seccion === 'perfil') {
        accionesGlobales.classList.remove('d-flex');
        filtrosGlobales.classList.remove('d-flex');
        accionesGlobales.classList.add('d-none');
        filtrosGlobales.classList.add('d-none');
        if (filtrosEspecificos) filtrosEspecificos.innerHTML = '';
        if (filtroTexto) filtroTexto.value = '';
        return;
    }

    accionesGlobales.classList.remove('d-none');
    filtrosGlobales.classList.remove('d-none');
    accionesGlobales.classList.add('d-flex');
    filtrosGlobales.classList.add('d-flex');

    const btnCrear     = document.getElementById('btnCrear');
    const btnEditar    = document.getElementById('btnEditar');
    const btnEliminar  = document.getElementById('btnEliminar');
    const btnReactivar = document.getElementById('btnReactivar');

    if (seccion === 'criterios') {
        if (btnCrear)     { btnCrear.classList.remove('d-none');    btnCrear.innerHTML     = '<i class="bi bi-plus-circle me-2"></i> Añadir'; }
        if (btnEditar)    { btnEditar.innerHTML    = '<i class="bi bi-pencil me-2"></i> Editar'; }
        if (btnEliminar)  { btnEliminar.innerHTML  = '<i class="bi bi-x-circle me-2"></i> Desactivar'; }
        if (btnReactivar) { btnReactivar.classList.remove('d-none'); btnReactivar.innerHTML = '<i class="bi bi-check-circle me-2"></i> Activar'; }
    } else if (seccion === 'inquilinos') {
        if (btnCrear)     { btnCrear.classList.add('d-none'); }
        if (btnEditar)    { btnEditar.innerHTML    = '<i class="bi bi-eye me-2"></i> Ver Perfil'; }
        if (btnEliminar)  { btnEliminar.innerHTML  = '<i class="bi bi-box-arrow-right me-2"></i> Notificar Baja'; }
        if (btnReactivar) { btnReactivar.classList.add('d-none'); }
    }

    configurarFiltros(seccion);
}

function configurarFiltros(seccion) {
    const contenedor = document.getElementById('filtrosEspecificos');
    const texto      = document.getElementById('filtroTexto');
    if (!contenedor) return;

    if (texto) texto.value = '';
    contenedor.innerHTML = '';

    (FILTROS_POR_SECCION[seccion] || []).forEach(filtro => {
        const select = document.createElement('select');
        select.className = 'form-select';
        select.style.width = 'auto';
        select.dataset.filtroCampo = filtro.campo;
        select.innerHTML = `
            <option value="">Todos los estados</option>
            ${filtro.opciones.map(([v, e]) => `<option value="${v}">${e}</option>`).join('')}
        `;
        contenedor.appendChild(select);
    });
}

// ============================================
// FILTROS Y SELECCIÓN
// ============================================

function aplicarFiltros() {
    const seccion = document.querySelector('.section-link.active-custom')?.getAttribute('data-section');
    const config  = obtenerConfigSeccion(seccion);
    if (!config) return;

    const texto = document.getElementById('filtroTexto')?.value.trim().toLowerCase() || '';
    const filtrosActivos = Array.from(document.querySelectorAll('#filtrosEspecificos [data-filtro-campo]'))
        .map(s => ({ campo: s.dataset.filtroCampo, valor: s.value }))
        .filter(f => f.valor);

    const filtrados = config.lista.filter(item => {
        const coincideTexto    = !texto || Object.values(item).some(v => String(v).toLowerCase().includes(texto));
        const coincidenFiltros = filtrosActivos.every(f => String(item[f.campo]) === f.valor);
        return coincideTexto && coincidenFiltros;
    });

    config.renderizar(filtrados);
    actualizarBotones();
}

function obtenerConfigSeccion(seccion) {
    const configs = {
        criterios:  { lista: criterios.listaCriteriosMemoria,  renderizar: criterios.renderizarCriterios },
        inquilinos: { lista: inquilinos.listaInquilinosMemoria, renderizar: inquilinos.renderizarInquilinos },
    };
    return configs[seccion];
}

function obtenerIdsSeleccionados(seccion) {
    const selectores = { criterios: '.criterio-checkbox', inquilinos: '.inquilino-checkbox' };
    const selector = selectores[seccion];
    if (!selector) return [];
    return Array.from(document.querySelectorAll(`tbody ${selector}:checked`)).map(cb => cb.value);
}

function obtenerIdsSeleccionadosInactivos(seccion) {
    const config = obtenerConfigSeccion(seccion);
    if (!config) return [];
    return obtenerIdsSeleccionados(seccion).filter(id => {
        const item = config.lista.find(x => String(x.id) === id);
        return item?.estado === 'inactivo';
    });
}

function actualizarBotones() {
    const seccion = document.querySelector('.section-link.active-custom')?.getAttribute('data-section');
    let seleccionados = 0;

    if (seccion === 'criterios')  seleccionados = document.querySelectorAll('tbody .criterio-checkbox:checked').length;
    if (seccion === 'inquilinos') seleccionados = document.querySelectorAll('tbody .inquilino-checkbox:checked').length;

    const btnEditar    = document.getElementById('btnEditar');
    const btnEliminar  = document.getElementById('btnEliminar');
    const btnReactivar = document.getElementById('btnReactivar');

    if (btnEditar)   btnEditar.disabled   = (seleccionados !== 1);
    if (btnEliminar) btnEliminar.disabled = (seleccionados === 0);

    if (seccion === 'criterios') {
        if (btnReactivar) btnReactivar.disabled = (obtenerIdsSeleccionadosInactivos(seccion).length === 0);
    } else if (seccion === 'inquilinos') {
        if (btnEliminar) {
            const puedeBaja = obtenerIdsSeleccionados(seccion).filter(id => {
                const i = inquilinos.listaInquilinosMemoria.find(x => String(x.id) === id);
                return i?.estado === 'activo' || i?.estado === 'prueba';
            }).length;
            btnEliminar.disabled = (puedeBaja === 0);
        }
    }
}

// ============================================
// UTILIDADES PERFIL
// ============================================

function calcularFortaleza(pwd) {
    let p = 0;
    if (pwd.length >= 8)           p++;
    if (/[A-Z]/.test(pwd))         p++;
    if (/[0-9]/.test(pwd))         p++;
    if (/[^A-Za-z0-9]/.test(pwd))  p++;
    return Math.max(1, p);
}

function marcarInvalidoPerfil(id, mensaje) {
    const el = document.getElementById(id);
    el.classList.add('is-invalid');
    let fb = el.nextElementSibling;
    if (!fb || !fb.classList.contains('invalid-feedback')) {
        fb = document.createElement('div');
        fb.className = 'invalid-feedback';
        el.after(fb);
    }
    fb.textContent = mensaje;
}

function pwdErrorHtml(texto) {
    return `<p class="text-danger small mb-0"><i class="bi bi-x-circle me-1"></i>${texto}</p>`;
}

function mostrarToast(mensaje, tipo = 'success') {
    const toast = document.getElementById('toastDashboard');
    if (!toast) return;
    toast.className = `toast align-items-center border-0 text-bg-${tipo}`;
    document.getElementById('toastDashboardMsg').textContent = mensaje;
    bootstrap.Toast.getOrCreateInstance(toast, { delay: 3000 }).show();
}
