import { initI18n, t, applyTranslations } from '../i18n.js';
import * as criterios  from '../anfitrion/criterios.js';
import * as huespedes from '../anfitrion/huespedes.js';

const FILTROS_POR_SECCION = {
    criterios:  [{ campo: 'estado', opciones: [['activo','filterActive'],['inactivo','filterInactive']] }],
    huespedes: [{ campo: 'estado', opciones: [['activo','filterActive'],['entrevista','filterInterview'],['prueba','filterTrial'],['inactivo','filterInactive']] }]
};

const CONFIG_MODALES = {
    criterios: {
        getTitulo: () => t('anfitrion.criteria.add'),
        getHtml: () => `
            <div class="mb-3"><label class="form-label fw-bold">${t('anfitrion.criteria.criteriaLabel')}</label>
            <input name="criterio" class="form-control" placeholder="Ej: Rango de edad" required></div>
            <div class="mb-3"><label class="form-label fw-bold">${t('anfitrion.criteria.preferredValue')}</label>
            <input name="valor" class="form-control" placeholder="Ej: 25-40 años" required></div>`
    },
    vivienda: {
        getTitulo: () => t('anfitrion.home.registerHome'),
        getHtml: () => `
            <div class="mb-3"><label class="form-label fw-bold">${t('anfitrion.home.address')}</label><input name="direccion" class="form-control" required></div>
            <div class="mb-3"><label class="form-label fw-bold">${t('anfitrion.home.city')}</label><input name="ciudad" class="form-control" required></div>
            <div class="row">
                <div class="col-md-6 mb-3"><label class="form-label fw-bold">${t('anfitrion.home.totalSlots')}</label><input type="number" name="plazas_totales" class="form-control" min="1" required></div>
                <div class="col-md-6 mb-3"><label class="form-label fw-bold">${t('anfitrion.home.freeSlots')}</label><input type="number" name="plazas_libres" class="form-control" min="0" required></div>
            </div>
            <div class="mb-3"><label class="form-label fw-bold">${t('anfitrion.home.descriptionOptional')}</label><textarea name="descripcion" class="form-control" rows="2"></textarea></div>`
    }
};

const SECTION_TITLES = {
    general:    () => t('anfitrion.sections.general.title'),
    vivienda:   () => t('anfitrion.sections.home.title'),
    criterios:  () => t('anfitrion.sections.criteria.title'),
    huespedes: () => t('anfitrion.sections.tenants.title'),
    perfil:     () => t('anfitrion.sections.profile.title')
};

const SECTION_DESCRIPTIONS = {
    general:    () => t('anfitrion.sections.general.description'),
    vivienda:   () => t('anfitrion.sections.home.description'),
    criterios:  () => t('anfitrion.sections.criteria.description'),
    huespedes: () => t('anfitrion.sections.tenants.description'),
    perfil:     () => t('anfitrion.sections.profile.description')
};

let viviendaActual = {
    id: 1,
    direccion: 'Calle Mayor 12, 3º B',
    ciudad: 'Santiago de Compostela',
    plazas_totales: 3,
    plazas_libres: 1,
    descripcion: 'Piso amplio en el centro histórico, con jardín comunitario.',
    estado: 'disponible'
};

let huespedBajaId = null;

const usuarioActual = {
    nombre: 'Ana García López', iniciales: 'AG',
    email: 'ana.garcia@semprenacasa.es', telefono: '+34 600 123 456',
    ciudad: 'Santiago de Compostela', dni: '12345678A', fechaAlta: 'enero de 2024'
};

document.addEventListener('DOMContentLoaded', async function() {
    await initI18n();
    applyTranslations();

    huespedes.cargarHuespedes();
    const seccionActiva = document.querySelector('.section-link.active-custom')?.getAttribute('data-section');
    actualizarControlesSeccion(seccionActiva);
    cargarSeguimientoConvivencias();

    document.getElementById('btnPerfil')?.addEventListener('click', () => navegarASeccion('perfil'));

    document.getElementById('btnCrear')?.addEventListener('click', () => {
        const seccion = document.querySelector('.section-link.active-custom')?.getAttribute('data-section');
        abrirModalGenerico(seccion);
    });

    document.getElementById('btnEditar')?.addEventListener('click', () => {
        const seccion = document.querySelector('.section-link.active-custom')?.getAttribute('data-section');
        if (seccion === 'criterios') {
            const seleccionado = document.querySelector('tbody .criterio-checkbox:checked');
            if (!seleccionado) return;
            const id = parseInt(seleccionado.value);
            const c  = criterios.listaCriteriosMemoria.find(x => x.id === id);
            if (!c) return;
            abrirModalGenerico('criterios');
            const form = document.getElementById('formGenerico');
            form.querySelector('[name="criterio"]').value = c.criterio;
            form.querySelector('[name="valor"]').value    = c.valor;
            form.insertAdjacentHTML('beforeend', `<input type="hidden" name="id_edit" value="${id}">`);
            document.getElementById('modalTitle').textContent = `${t('anfitrion.criteria.add')}: ${c.criterio}`;
        } else if (seccion === 'huespedes') {
            const seleccionado = document.querySelector('tbody .huesped-checkbox:checked');
            if (!seleccionado) return;
            huespedes.verHuesped(parseInt(seleccionado.value));
        }
    });

    document.getElementById('btnEliminar')?.addEventListener('click', () => {
        const seccion = document.querySelector('.section-link.active-custom')?.getAttribute('data-section');
        const seleccionados = obtenerIdsSeleccionados(seccion);
        if (seleccionados.length === 0) return;
        if (seccion === 'criterios') {
            if (confirm(`¿${t('common.deactivate')} ${seleccionados.length} criterio(s)?`)) {
                criterios.desactivarCriterios(seleccionados);
                aplicarFiltros(); actualizarBotones();
            }
        } else if (seccion === 'huespedes') {
            abrirModalBaja(parseInt(seleccionados[0]));
        }
    });

    document.getElementById('btnReactivar')?.addEventListener('click', () => {
        const seccion = document.querySelector('.section-link.active-custom')?.getAttribute('data-section');
        const seleccionados = obtenerIdsSeleccionadosInactivos(seccion);
        if (seleccionados.length === 0) return;
        if (seccion === 'criterios') {
            criterios.reactivarCriterios(seleccionados);
            aplicarFiltros(); actualizarBotones();
        }
    });

    document.getElementById('filtroTexto')?.addEventListener('input', aplicarFiltros);
    document.getElementById('filtros-globales')?.addEventListener('change', (e) => {
        if (e.target.matches('[data-filtro-campo]')) aplicarFiltros();
    });
    document.addEventListener('change', (e) => { if (e.target.type === 'checkbox') actualizarBotones(); });

    document.getElementById('formGenerico')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const seccion = document.querySelector('.section-link.active-custom')?.getAttribute('data-section');
        const data    = Object.fromEntries(new FormData(this));

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
                direccion: data.direccion, ciudad: data.ciudad,
                plazas_totales: parseInt(data.plazas_totales),
                plazas_libres:  parseInt(data.plazas_libres),
                descripcion:    data.descripcion || '',
                estado:         parseInt(data.plazas_libres) > 0 ? 'disponible' : 'completa'
            };
            renderizarVivienda();
        }

        aplicarFiltros();
        bootstrap.Modal.getInstance(document.getElementById('modalGenerico')).hide();
    });

    document.getElementById('btnConfirmarBaja')?.addEventListener('click', () => {
        if (!huespedBajaId) return;
        const i = huespedes.listaHuespedesMemoria.find(x => x.id === huespedBajaId);
        if (i) { i.estado = 'inactivo'; }
        bootstrap.Modal.getInstance(document.getElementById('modalBaja')).hide();
        huespedBajaId = null;
        aplicarFiltros(); actualizarBotones(); cargarSeguimientoConvivencias();
    });

    document.getElementById('btnDarDeAlta')?.addEventListener('click', () => abrirModalGenerico('vivienda'));

    document.getElementById('btnEditarVivienda')?.addEventListener('click', () => {
        abrirModalGenerico('vivienda');
        if (viviendaActual) {
            const form = document.getElementById('modalFormContent');
            form.querySelector('[name="direccion"]').value      = viviendaActual.direccion;
            form.querySelector('[name="ciudad"]').value         = viviendaActual.ciudad;
            form.querySelector('[name="plazas_totales"]').value = viviendaActual.plazas_totales;
            form.querySelector('[name="plazas_libres"]').value  = viviendaActual.plazas_libres;
            form.querySelector('[name="descripcion"]').value    = viviendaActual.descripcion || '';
            document.getElementById('modalTitle').textContent   = t('anfitrion.home.editHome');
            document.getElementById('formGenerico').insertAdjacentHTML('beforeend',
                `<input type="hidden" name="id_edit" value="${viviendaActual.id}">`);
        }
    });

    document.querySelectorAll('.section-link').forEach(link => {
        link.addEventListener('click', (e) => { e.preventDefault(); navegarASeccion(link.getAttribute('data-section')); });
    });

    // Perfil
    document.querySelectorAll('[data-toggle-pwd]').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = document.getElementById(btn.dataset.togglePwd);
            const icon  = btn.querySelector('i');
            input.type     = input.type === 'password' ? 'text' : 'password';
            icon.className = input.type === 'password' ? 'bi bi-eye' : 'bi bi-eye-slash';
        });
    });

    document.getElementById('pwd-nueva')?.addEventListener('input', function() {
        const wrap = document.getElementById('pwd-strength-wrap');
        const bar  = document.getElementById('pwd-strength-bar');
        const txt  = document.getElementById('pwd-strength-text');
        if (!this.value) { wrap.style.display = 'none'; return; }
        wrap.style.display = 'block';
        const cfg = {
            1: [25,'#dc3545', t('profile.strengthVeryWeak')],
            2: [50,'#fd7e14', t('profile.strengthWeak')],
            3: [75,'#ffc107', t('profile.strengthModerate')],
            4: [100,'#28a745', t('profile.strengthStrong')]
        }[calcularFortaleza(this.value)];
        bar.style.width = cfg[0] + '%'; bar.style.backgroundColor = cfg[1];
        txt.textContent = cfg[2]; txt.style.color = cfg[1];
    });

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

    document.getElementById('perfil-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const nombre = document.getElementById('perfil-nombre').value.trim();
        const email  = document.getElementById('perfil-email').value.trim();
        if (!nombre) { marcarInvalidoPerfil('perfil-nombre', t('profile.nameRequired')); return; }
        if (!email.includes('@')) { marcarInvalidoPerfil('perfil-email', t('profile.emailInvalid')); return; }
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
        mostrarToast(t('profile.savedSuccess'), 'success');
    });

    document.getElementById('perfil-form-pwd')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const actual   = document.getElementById('pwd-actual').value;
        const nueva    = document.getElementById('pwd-nueva').value;
        const confirma = document.getElementById('pwd-confirmar').value;
        const feedback = document.getElementById('pwd-feedback');
        feedback.innerHTML = '';
        if (!actual) { feedback.innerHTML = pwdErrorHtml(t('profile.passwordRequired')); return; }
        if (nueva.length < 8) { feedback.innerHTML = pwdErrorHtml(t('profile.passwordTooShort')); return; }
        if (nueva !== confirma) { feedback.innerHTML = pwdErrorHtml(t('profile.passwordMismatch')); return; }
        this.reset();
        document.getElementById('pwd-strength-wrap').style.display = 'none';
        mostrarToast(t('profile.passwordUpdated'), 'success');
    });

    document.getElementById('btnEliminarCuenta')?.addEventListener('click', () => {
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEliminarCuenta')).show();
    });

    document.getElementById('btnConfirmarEliminarCuenta')?.addEventListener('click', () => {
        bootstrap.Modal.getInstance(document.getElementById('modalEliminarCuenta')).hide();
        mostrarToast(t('profile.deleteSuccess'), 'danger');
        setTimeout(() => { window.location.href = 'public.html'; }, 2000);
    });
});

function navegarASeccion(sectionName) {
    actualizarControlesSeccion(sectionName);
    document.querySelectorAll('.section-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.section-link').forEach(l => { l.classList.remove('active-custom'); l.classList.add('text-muted'); });
    actualizarBotones();
    document.querySelector(`.section-content[data-section="${sectionName}"]`)?.classList.add('active');
    const matchingLink = document.querySelector(`.section-link[data-section="${sectionName}"]`);
    if (matchingLink) { matchingLink.classList.add('active-custom'); matchingLink.classList.remove('text-muted'); }

    switch(sectionName) {
        case 'general':    cargarSeguimientoConvivencias(); break;
        case 'vivienda':   renderizarVivienda();            break;
        case 'criterios':  criterios.cargarCriterios();     break;
        case 'huespedes': huespedes.cargarHuespedes();   break;
    }

    aplicarFiltros();
    document.getElementById('section-title').textContent       = SECTION_TITLES[sectionName]?.()       || '';
    document.getElementById('section-description').textContent = SECTION_DESCRIPTIONS[sectionName]?.() || '';
}

function cargarSeguimientoConvivencias() {
    const v = viviendaActual;
    const plazasOcupadas = v ? v.plazas_totales - v.plazas_libres : 0;
    const enEntrevista   = huespedes.listaHuespedesMemoria.filter(i => i.estado === 'entrevista').length;

    const estadoEl = document.getElementById('estado-vivienda');
    if (estadoEl) estadoEl.textContent = v
        ? (v.estado === 'disponible' ? t('anfitrion.home.available') : t('anfitrion.home.complete'))
        : t('anfitrion.home.noHome');

    const plazasEl = document.getElementById('plazas-ocupadas');
    if (plazasEl) plazasEl.textContent = v ? `${plazasOcupadas} / ${v.plazas_totales}` : '-';

    const pendientesEl = document.getElementById('solicitudes-pendientes');
    if (pendientesEl) pendientesEl.textContent = enEntrevista;

    renderizarConvivencias();
}

function renderizarConvivencias() {
    const tbody = document.getElementById('tabla-convivencias');
    if (!tbody) return;

    const visibles = huespedes.listaHuespedesMemoria.filter(i => i.estado !== 'inactivo');
    if (visibles.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted py-3">${t('anfitrion.convivencias.noActive')}</td></tr>`;
        return;
    }

    tbody.innerHTML = visibles.map(i => {
        const badges = {
            activo:     `<span class="badge rounded-pill px-3 py-2" style="background-color:#D1E7DD;color:#0F5132;">${t('anfitrion.convivencias.statusActive')}</span>`,
            entrevista: `<span class="badge rounded-pill px-3 py-2" style="background-color:#FFF3CD;color:#856404;">${t('anfitrion.convivencias.statusInterview')}</span>`,
            prueba:     `<span class="badge rounded-pill px-3 py-2" style="background-color:#CFE2FF;color:#084298;">${t('anfitrion.convivencias.statusTrial')}</span>`
        };
        return `<tr><td class="fw-semibold">${i.nombre}</td><td>${i.fechaIngreso || '-'}</td><td>${badges[i.estado] || i.estado}</td></tr>`;
    }).join('');
}

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

    const badgeHtml = viviendaActual.estado === 'disponible'
        ? `<span class="badge bg-success rounded-pill px-3">${t('anfitrion.home.available')}</span>`
        : `<span class="badge bg-secondary rounded-pill px-3">${t('anfitrion.home.complete')}</span>`;

    document.getElementById('ficha-vivienda').innerHTML = `
        <div class="row g-4">
            <div class="col-md-8">
                <h6 class="text-muted small mb-1">${t('anfitrion.home.address')}</h6>
                <p class="fw-semibold mb-3">${viviendaActual.direccion}</p>
                <h6 class="text-muted small mb-1">${t('anfitrion.home.city')}</h6>
                <p class="fw-semibold mb-3">${viviendaActual.ciudad}</p>
                <h6 class="text-muted small mb-1">${t('anfitrion.home.description')}</h6>
                <p class="mb-0">${viviendaActual.descripcion || '-'}</p>
            </div>
            <div class="col-md-4">
                <div class="card border-0 bg-light rounded-3 p-3 mb-3">
                    <p class="text-muted small mb-1">${t('anfitrion.home.totalSlots')}</p>
                    <h4 class="fw-bold mb-0">${viviendaActual.plazas_totales}</h4>
                </div>
                <div class="card border-0 bg-light rounded-3 p-3 mb-3">
                    <p class="text-muted small mb-1">${t('anfitrion.home.freeSlots')}</p>
                    <h4 class="fw-bold mb-0 text-success">${viviendaActual.plazas_libres}</h4>
                </div>
                <div class="card border-0 bg-light rounded-3 p-3">
                    <p class="text-muted small mb-1">${t('anfitrion.home.status')}</p>
                    <div>${badgeHtml}</div>
                </div>
            </div>
        </div>
    `;
}

function abrirModalGenerico(seccion) {
    const config = CONFIG_MODALES[seccion];
    if (!config) return;
    document.getElementById('modalTitle').textContent     = config.getTitulo();
    document.getElementById('modalFormContent').innerHTML  = config.getHtml();
    const form = document.getElementById('formGenerico');
    form.reset();
    form.querySelector('input[name="id_edit"]')?.remove();
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalGenerico')).show();
}

function abrirModalBaja(id) {
    const i = huespedes.listaHuespedesMemoria.find(x => x.id === id);
    if (!i) return;
    huespedBajaId = id;
    document.getElementById('baja-nombre').textContent  = i.nombre;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalBaja')).show();
}

window.verHuesped = function(id) {
    const i = huespedes.listaHuespedesMemoria.find(x => x.id === id);
    if (!i) return;

    const pctColor   = i.compatibilidad >= 85 ? 'success' : i.compatibilidad >= 65 ? 'warning' : 'danger';
    const estadoBadge = {
        activo:     `<span class="badge bg-success">${t('anfitrion.tenants.statusActive')}</span>`,
        entrevista: `<span class="badge bg-warning text-dark">${t('anfitrion.tenants.statusInterview')}</span>`,
        prueba:     `<span class="badge bg-info text-dark">${t('anfitrion.tenants.statusTrial')}</span>`,
        inactivo:   `<span class="badge bg-secondary">${t('anfitrion.tenants.statusInactive')}</span>`
    }[i.estado] || `<span class="badge bg-secondary">${i.estado}</span>`;

    document.getElementById('modalDetalleTitle').textContent = `${t('anfitrion.tenants.profileTitle')}: ${i.nombre}`;
    document.getElementById('modalDetalleContent').innerHTML = `
        <div class="d-flex align-items-center gap-3 mb-4">
            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(i.nombre)}&background=7A99DD&color=fff"
                 width="72" class="rounded-circle shadow-sm flex-shrink-0">
            <div>
                <h5 class="fw-bold mb-1">${i.nombre}</h5>
                <p class="mb-0">${estadoBadge}</p>
            </div>
        </div>
        <div class="row mb-3">
            <div class="col-md-6"><h6 class="text-muted small mb-1">${t('anfitrion.tenants.email')}</h6><p class="fw-semibold mb-0">${i.email}</p></div>
            <div class="col-md-6"><h6 class="text-muted small mb-1">${t('anfitrion.tenants.phone')}</h6><p class="fw-semibold mb-0">${i.telefono}</p></div>
        </div>
        <div class="row">
            <div class="col-md-6"><h6 class="text-muted small mb-1">${t('anfitrion.tenants.joinDate')}</h6><p class="fw-semibold mb-0">${i.fechaIngreso || t('anfitrion.tenants.pending')}</p></div>
            <div class="col-md-6"><h6 class="text-muted small mb-1">${t('anfitrion.tenants.compatibility')}</h6>
                <div class="d-flex align-items-center gap-2 mt-1">
                    <div class="progress flex-grow-1" style="height:8px;"><div class="progress-bar bg-${pctColor}" style="width:${i.compatibilidad}%;"></div></div>
                    <span class="fw-bold text-${pctColor}">${i.compatibilidad}%</span>
                </div>
            </div>
        </div>
    `;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalDetalle')).show();
};

function actualizarControlesSeccion(seccion) {
    const accionesGlobales   = document.getElementById('acciones-globales');
    const filtrosGlobales    = document.getElementById('filtros-globales');
    const filtrosEspecificos = document.getElementById('filtrosEspecificos');
    const filtroTexto        = document.getElementById('filtroTexto');
    if (!accionesGlobales || !filtrosGlobales) return;

    if (['general','vivienda','perfil'].includes(seccion)) {
        accionesGlobales.classList.replace('d-flex','d-none');
        filtrosGlobales.classList.replace('d-flex','d-none');
        if (filtrosEspecificos) filtrosEspecificos.innerHTML = '';
        if (filtroTexto) filtroTexto.value = '';
        return;
    }

    accionesGlobales.classList.replace('d-none','d-flex');
    filtrosGlobales.classList.replace('d-none','d-flex');

    const btnCrear = document.getElementById('btnCrear');
    const btnEditar= document.getElementById('btnEditar');
    const btnEliminar  = document.getElementById('btnEliminar');
    const btnReactivar = document.getElementById('btnReactivar');

    if (seccion === 'criterios') {
        btnCrear?.classList.remove('d-none');
        if (btnCrear)    btnCrear.innerHTML    = `<i class="bi bi-plus-circle me-2"></i> ${t('buttons.add')}`;
        if (btnEditar)   btnEditar.innerHTML   = `<i class="bi bi-pencil me-2"></i> ${t('buttons.edit')}`;
        if (btnEliminar) btnEliminar.innerHTML = `<i class="bi bi-x-circle me-2"></i> ${t('buttons.deactivate')}`;
        btnReactivar?.classList.remove('d-none');
        if (btnReactivar) btnReactivar.innerHTML = `<i class="bi bi-check-circle me-2"></i> ${t('buttons.activate')}`;
    } else if (seccion === 'huespedes') {
        btnCrear?.classList.add('d-none');
        btnEditar?.classList.add('d-none');
        if (btnEliminar) btnEliminar.innerHTML = `<i class="bi bi-box-arrow-right me-2"></i> ${t('common.notifyLeave')}`;
        btnReactivar?.classList.add('d-none');
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
        const secKey = seccion === 'criterios' ? 'anfitrion.criteria' : 'anfitrion.tenants';
        const select = document.createElement('select');
        select.className = 'form-select'; select.style.width = 'auto';
        select.dataset.filtroCampo = filtro.campo;
        select.innerHTML = `
            <option value="">${t('common.allStatuses')}</option>
            ${filtro.opciones.map(([val, key]) => `<option value="${val}">${t(`${secKey}.${key}`)}</option>`).join('')}
        `;
        contenedor.appendChild(select);
    });
}

function aplicarFiltros() {
    const seccion = document.querySelector('.section-link.active-custom')?.getAttribute('data-section');
    const config  = obtenerConfigSeccion(seccion);
    if (!config) return;

    const texto = document.getElementById('filtroTexto')?.value.trim().toLowerCase() || '';
    const filtrosActivos = Array.from(document.querySelectorAll('#filtrosEspecificos [data-filtro-campo]'))
        .map(s => ({ campo: s.dataset.filtroCampo, valor: s.value })).filter(f => f.valor);

    config.renderizar(config.lista.filter(item => {
        const coincideTexto    = !texto || Object.values(item).some(v => String(v).toLowerCase().includes(texto));
        const coincidenFiltros = filtrosActivos.every(f => String(item[f.campo]) === f.valor);
        return coincideTexto && coincidenFiltros;
    }));
    actualizarBotones();
}

function obtenerConfigSeccion(seccion) {
    return {
        criterios:  { lista: criterios.listaCriteriosMemoria,  renderizar: criterios.renderizarCriterios },
        huespedes: { lista: huespedes.listaHuespedesMemoria, renderizar: huespedes.renderizarHuespedes }
    }[seccion];
}

function obtenerIdsSeleccionados(seccion) {
    const s = { criterios: '.criterio-checkbox', huespedes: '.huesped-checkbox' }[seccion];
    if (!s) return [];
    return Array.from(document.querySelectorAll(`tbody ${s}:checked`)).map(cb => cb.value);
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
    const s = { criterios: '.criterio-checkbox', huespedes: '.huesped-checkbox' }[seccion];
    const seleccionados = s ? document.querySelectorAll(`tbody ${s}:checked`).length : 0;

    const btnEditar    = document.getElementById('btnEditar');
    const btnEliminar  = document.getElementById('btnEliminar');
    const btnReactivar = document.getElementById('btnReactivar');

    if (btnEditar)   btnEditar.disabled   = (seleccionados !== 1);
    if (btnEliminar) btnEliminar.disabled = (seleccionados === 0);
    if (seccion === 'criterios' && btnReactivar) {
        btnReactivar.disabled = (obtenerIdsSeleccionadosInactivos(seccion).length === 0);
    } else if (seccion === 'huespedes' && btnEliminar) {
        const puedeBaja = obtenerIdsSeleccionados(seccion).filter(id => {
            const i = huespedes.listaHuespedesMemoria.find(x => String(x.id) === id);
            return i?.estado === 'activo' || i?.estado === 'prueba';
        }).length;
        btnEliminar.disabled = (puedeBaja === 0);
    }
}

function calcularFortaleza(pwd) {
    let p = 0;
    if (pwd.length >= 8)          p++;
    if (/[A-Z]/.test(pwd))        p++;
    if (/[0-9]/.test(pwd))        p++;
    if (/[^A-Za-z0-9]/.test(pwd)) p++;
    return Math.max(1, p);
}

function marcarInvalidoPerfil(id, mensaje) {
    const el = document.getElementById(id);
    el.classList.add('is-invalid');
    let fb = el.nextElementSibling;
    if (!fb || !fb.classList.contains('invalid-feedback')) {
        fb = document.createElement('div'); fb.className = 'invalid-feedback'; el.after(fb);
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
