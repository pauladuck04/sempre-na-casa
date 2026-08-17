import { initI18n, t, applyTranslations } from '../i18n.js';
import * as convivencia  from './convivencia.js';
import * as preferencias from './preferencias.js';
import { aplicarPaginacion, resetPagina } from '../admin/paginacion.js';
import { mostrarErrorFormulario, ocultarErrorFormulario, mostrarErrorCampo, ocultarErrorCampo } from '../form-errors.js';
import { cargarPartials } from '../partials.js';
import { mostrarToast, cargarPerfilPorMail, inicializarMedidorFortaleza, inicializarTogglePassword, inicializarCambioPassword } from '../perfil-comun.js';

const FILTROS_POR_SECCION = {};

const CONFIG_MODALES = {};

const SECTION_TITLES = {
    general:      () => t('huesped.sections.general.title'),
    convivencia:  () => t('huesped.sections.convivencia.title'),
    recomendadas: () => t('huesped.sections.recommended.title'),
    preferencias: () => t('huesped.sections.preferences.title'),
    perfil:       () => t('huesped.sections.profile.title')
};

const usuarioActual = {
    nombre: 'Luis Martínez', iniciales: 'LM',
    email: 'luis.m@email.com', telefono: '666 111 222',
    ciudad: 'Santiago de Compostela', dni: '87654321B', fechaAlta: 'febrero de 2026'
};

document.addEventListener('DOMContentLoaded', async function() {
    await cargarPartials();
    await initI18n();
    applyTranslations();

    convivencia.cargarConvivencia();

    // Cargar perfil del usuario logueado por email
    cargarPerfilPorMail({
        onDatos: async (u) => {
            usuarioActual.id = u.id;
            usuarioActual.nombre = u.nombre;
            usuarioActual.email = u.email;
            usuarioActual.dni = u.dni;
            usuarioActual.telefono = u.telefono;
            usuarioActual.ciudad = u.ciudad;
            usuarioActual.fechaAlta = u.fechaRegistro;

            await convivencia.cargarMiConvivencia(usuarioActual.id);
            if (!convivencia.convivenciaMemoria) {
                await convivencia.cargarCandidatos(usuarioActual.id);
            }

            const navConvivencia = document.getElementById('nav-convivencia');
            if (navConvivencia) {
                navConvivencia.classList.toggle('d-none', !convivencia.convivenciaMemoria);
            }

            convivencia.renderizarConvivencia();
            cargarResumenGeneral();
        }
    });

    const seccionActiva = document.querySelector('.section-link.active-custom')?.getAttribute('data-section');
    actualizarControlesSeccion(seccionActiva);
    cargarResumenGeneral();

    document.getElementById('btnPerfil')?.addEventListener('click', () => navegarASeccion('perfil'));

    document.getElementById('btnCrear')?.addEventListener('click', () => {
        const seccion = document.querySelector('.section-link.active-custom')?.getAttribute('data-section');
        abrirModalGenerico(seccion);
    });

    document.getElementById('btnEditar')?.addEventListener('click', async () => {
        const seccion = document.querySelector('.section-link.active-custom')?.getAttribute('data-section');
        if (seccion !== 'preferencias') return;
        const seleccionado = document.querySelector('tbody .preferencia-checkbox:checked');
        if (!seleccionado) return;

        const criterioId = seleccionado.value;
        const respActual = preferencias.listaRespuestasMemoria.find(r => String(r.id_criterio) === String(criterioId));

        const resOpciones = await apiPost('opcion', 'getByCriterio', { id_criterio: criterioId });
        const opciones = (resOpciones.ok && Array.isArray(resOpciones.resource)) ? resOpciones.resource : [];

        const optsHtml = opciones.map(o =>
            `<option value="${o.id_opcion}" ${respActual && String(respActual.id_opcion) === String(o.id_opcion) ? 'selected' : ''}>${o.nombre_opcion}</option>`
        ).join('');

        document.getElementById('modalTitle').textContent    = t('huesped.modal.editPreference') || 'Editar respuesta';
        document.getElementById('modalFormContent').innerHTML = `
            <p class="fw-semibold mb-3">${respActual?.nombre_criterio || ''}</p>
            <div class="mb-3">
                <label class="form-label fw-bold">${t('huesped.table.myValue') || 'Mi respuesta'}</label>
                <select name="id_opcion" class="form-select" required>
                    <option value="">-- Selecciona una opción --</option>
                    ${optsHtml}
                </select>
            </div>
            <input type="hidden" name="id_criterio" value="${criterioId}">
        `;
        ocultarErrorFormulario(document.getElementById('formGenerico-error'));
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalGenerico')).show();
    });


    document.getElementById('filtroTexto')?.addEventListener('input', aplicarFiltros);
    document.getElementById('filtros-globales')?.addEventListener('change', (e) => {
        if (e.target.matches('[data-filtro-campo]')) aplicarFiltros();
    });
    document.addEventListener('change', (e) => { if (e.target.type === 'checkbox') actualizarBotones(); });

    document.getElementById('formGenerico')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const seccion = document.querySelector('.section-link.active-custom')?.getAttribute('data-section');
        const data    = Object.fromEntries(new FormData(this));
        const errorEl = document.getElementById('formGenerico-error');
        ocultarErrorFormulario(errorEl);

        if (seccion === 'preferencias') {
            const idUsuario = usuarioActual.id || getCookie('user_id');
            if (!idUsuario) { mostrarErrorFormulario(errorEl, 'Error: usuario no identificado.'); return; }
            const res = await apiPost('usuario_criterio_opcion', 'UPSERT_RESPUESTA', {
                id_usuario:  idUsuario,
                id_criterio: data.id_criterio,
                id_opcion:   data.id_opcion
            });
            if (!res.ok) { mostrarErrorFormulario(errorEl, 'Error al guardar la respuesta.'); return; }
            bootstrap.Modal.getInstance(document.getElementById('modalGenerico')).hide();
            await preferencias.cargarPreferencias(idUsuario);
            actualizarBotones();
            mostrarToast('Respuesta actualizada correctamente.', 'success');
            return;
        }

        aplicarFiltros();
        bootstrap.Modal.getInstance(document.getElementById('modalGenerico')).hide();
    });

    document.querySelectorAll('.section-link').forEach(link => {
        link.addEventListener('click', (e) => { e.preventDefault(); navegarASeccion(link.getAttribute('data-section')); });
    });

    // Perfil
    inicializarTogglePassword();
    inicializarMedidorFortaleza();

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
        perfilInputs().forEach(inp => { inp.value = valoresOriginalesPerfil[inp.id]; inp.disabled = true; ocultarErrorCampo(inp); });
        document.getElementById('perfil-btnEditar').classList.remove('d-none');
        const ac = document.getElementById('perfil-acciones');
        ac.classList.add('d-none'); ac.classList.remove('d-flex');
    });

    document.getElementById('perfil-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const nombreInput = document.getElementById('perfil-nombre');
        const emailInput  = document.getElementById('perfil-email');
        ocultarErrorCampo(nombreInput);
        ocultarErrorCampo(emailInput);
        const nombre = nombreInput.value.trim();
        const email  = emailInput.value.trim();
        if (!nombre) { mostrarErrorCampo(nombreInput, t('profile.nameRequired')); return; }
        if (!email.includes('@')) { mostrarErrorCampo(emailInput, t('profile.emailInvalid')); return; }
        usuarioActual.nombre   = nombre; usuarioActual.email = email;
        usuarioActual.telefono = document.getElementById('perfil-telefono').value.trim();
        usuarioActual.dni      = document.getElementById('perfil-dni').value.trim();
        perfilInputs().forEach(inp => { inp.disabled = true; ocultarErrorCampo(inp); });
        document.getElementById('perfil-btnEditar').classList.remove('d-none');
        const ac = document.getElementById('perfil-acciones');
        ac.classList.add('d-none'); ac.classList.remove('d-flex');
        document.getElementById('perfil-display-nombre').textContent = usuarioActual.nombre;
        mostrarToast(t('profile.savedSuccess'), 'success');
    });

    inicializarCambioPassword(() => usuarioActual.email || getCookie('user_email'));

    document.getElementById('btnEliminarCuenta')?.addEventListener('click', () => {
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEliminarCuenta')).show();
    });

    document.getElementById('btnConfirmarEliminarCuenta')?.addEventListener('click', async () => {
        bootstrap.Modal.getInstance(document.getElementById('modalEliminarCuenta')).hide();
        const id = usuarioActual.id || getCookie('user_id');
        if (!id) { mostrarToast('No se pudo desactivar: id de usuario desconocido', 'danger'); return; }
        try {
            const res = await apiPost('usuario', 'DELETE', { id_usuario: id });
            if (res.ok) {
                limpiarSesion();
                mostrarToast(t('profile.deleteSuccess'), 'danger');
                setTimeout(() => { window.location.href = 'public.html'; }, 1500);
            } else {
                mostrarToast('Error al desactivar cuenta: ' + (res.error || res.code || 'desconocido'), 'danger');
            }
        } catch (err) {
            console.error(err);
            mostrarToast('Error al desactivar cuenta: ' + err.message, 'danger');
        }
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

    resetPagina('tabla-resumen-convivencia');
    resetPagina('tabla-preferencias');
    switch(sectionName) {
        case 'general':      cargarResumenGeneral();                   break;
        case 'convivencia':  convivencia.renderizarConvivencia();      break;
        case 'recomendadas': renderizarCandidatos('grid-recomendadas'); break;
        case 'preferencias': preferencias.cargarPreferencias(usuarioActual.id || getCookie('user_id')); break;
    }

    aplicarFiltros();
    const descriptions = convivencia.convivenciaMemoria
        ? { general: () => t('huesped.sections.general.descriptionWithHome'), convivencia: () => t('huesped.sections.convivencia.description'), recomendadas: () => t('huesped.sections.recommended.description'), preferencias: () => t('huesped.sections.preferences.description'), perfil: () => t('huesped.sections.profile.description') }
        : { general: () => t('huesped.sections.general.descriptionWithoutHome'), recomendadas: () => t('huesped.sections.recommended.description'), preferencias: () => t('huesped.sections.preferences.description'), perfil: () => t('huesped.sections.profile.description') };

    document.getElementById('section-title').textContent       = SECTION_TITLES[sectionName]?.()  || '';
    document.getElementById('section-description').textContent = descriptions[sectionName]?.()     || '';
}

function cargarResumenGeneral() {
    const c = convivencia.convivenciaMemoria;
    const sinBloque = document.getElementById('general-sin-convivencia');
    const conBloque = document.getElementById('general-con-convivencia');

    if (!c) {
        sinBloque?.classList.remove('d-none');
        conBloque?.classList.add('d-none');
        renderizarCandidatos();
    } else {
        sinBloque?.classList.add('d-none');
        conBloque?.classList.remove('d-none');
        renderizarResumenConvivencia(c);
    }
}

function renderizarCandidatos(containerId = 'grid-candidatos') {
    const candidatos = [...convivencia.candidatosMemoria].sort((a, b) => b.compatibilidad - a.compatibilidad);

    const totalEl = document.getElementById('total-candidatos');
    const maxEl   = document.getElementById('max-compatibilidad');
    const prefEl  = document.getElementById('preferencias-activas');
    if (totalEl) totalEl.textContent = candidatos.length;
    if (maxEl)   maxEl.textContent   = candidatos.length ? `${candidatos[0].compatibilidad}%` : '-';
    if (prefEl)  prefEl.textContent  = preferencias.listaRespuestasMemoria.filter(p => p.id_opcion != null).length;

    const grid = document.getElementById(containerId);
    if (!grid) return;

    grid.innerHTML = candidatos.map(cand => {
        const pctColor = cand.compatibilidad >= 85 ? 'success' : cand.compatibilidad >= 65 ? 'warning' : 'danger';
        const inis = cand.anfitrion.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
        const slotsKey = cand.plazasLibres !== 1 ? t('huesped.candidates.freeSlotsPlural') : t('huesped.candidates.freeSlotsSingular');
        return `
            <div class="col-12 col-md-6 col-xl-3">
                <div class="card border-0 shadow-sm rounded-4 h-100 p-3 candidato-card" data-id="${cand.id}" style="cursor:pointer;">
                    <div class="d-flex align-items-center gap-3 mb-3">
                        <div class="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                             style="width:44px;height:44px;background-color:#EBF0FF;color:var(--color-primario);font-weight:700;font-size:.9rem;">${inis}</div>
                        <div class="overflow-hidden">
                            <span class="fw-semibold d-block text-truncate">${cand.anfitrion}</span>
                            <span class="text-muted small">${cand.ciudad}</span>
                        </div>
                    </div>
                    <p class="text-muted small mb-1 text-truncate"><i class="bi bi-geo-alt me-1"></i>${cand.direccion}</p>
                    <p class="text-muted small mb-3"><i class="bi bi-door-open me-1"></i>${cand.plazasLibres} ${slotsKey}</p>
                    <div class="mt-auto">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <small class="text-muted">${t('huesped.candidates.compatibility')}</small>
                            <small class="fw-bold text-${pctColor}">${cand.compatibilidad}%</small>
                        </div>
                        <div class="progress mb-3" style="height:6px;">
                            <div class="progress-bar bg-${pctColor}" style="width:${cand.compatibilidad}%;"></div>
                        </div>
                        <button type="button" class="btn btn-sm btn-primary rounded-pill w-100 btn-ver-detalle-vivienda" data-id="${cand.id}">
                            <i class="bi bi-eye me-1"></i>${t('huesped.candidates.viewDetail') || 'Ver detalle'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    grid.querySelectorAll('.candidato-card').forEach(card => {
        card.addEventListener('dblclick', () => mostrarDetalleVivienda(card.getAttribute('data-id')));
    });

    grid.querySelectorAll('.btn-ver-detalle-vivienda').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            mostrarDetalleVivienda(this.getAttribute('data-id'));
        });
    });
}

async function solicitarVivienda(btn) {
    const idVivienda   = btn.getAttribute('data-id');
    const idUsuario    = usuarioActual.id || getCookie('user_id');
    const fechaInicio  = document.getElementById('solicitud-fecha-inicio')?.value || '';
    const fechaFin     = document.getElementById('solicitud-fecha-fin')?.value || '';

    if (!fechaInicio) {
        mostrarToast(t('huesped.candidates.expectedStartRequired') || 'Indica la fecha de inicio esperada.', 'danger');
        return;
    }
    if (fechaFin && fechaFin <= fechaInicio) {
        mostrarToast(t('huesped.candidates.expectedEndInvalid') || 'La fecha de fin debe ser posterior a la de inicio.', 'danger');
        return;
    }

    btn.disabled = true;

    const res = await apiPost('usuario_vivienda', 'ADD', {
        id_usuario: idUsuario,
        id_vivienda: idVivienda,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin
    });

    if (res.ok) {
        mostrarToast(t('huesped.candidates.requestSuccess') || 'Solicitud enviada correctamente.', 'success');
        await convivencia.cargarCandidatos(idUsuario);
        renderizarCandidatos('grid-candidatos');
        renderizarCandidatos('grid-recomendadas');
        bootstrap.Modal.getInstance(document.getElementById('modalDetalle'))?.hide();
    } else {
        const mensajes = {
            USUARIO_YA_TIENE_CONVIVENCIA_ACTIVA_KO: t('huesped.candidates.requestErrorActive') || 'Ya tienes una convivencia activa en otra vivienda.',
            SOLICITUD_YA_EXISTE_KO: t('huesped.candidates.requestErrorExists') || 'Ya has solicitado esta vivienda.',
            FECHA_INICIO_PASADA_KO: t('huesped.candidates.expectedStartPast') || 'La fecha de inicio no puede estar en el pasado.',
            FECHA_FIN_ANTERIOR_A_INICIO_KO: t('huesped.candidates.expectedEndInvalid') || 'La fecha de fin debe ser posterior a la de inicio.'
        };
        mostrarToast(mensajes[res.code] || t('huesped.candidates.requestError') || 'Error al enviar la solicitud.', 'danger');
        btn.disabled = false;
    }
}

async function mostrarDetalleVivienda(idVivienda) {
    const cand = convivencia.candidatosMemoria.find(c => String(c.id) === String(idVivienda));

    const [resVivienda, resPreferencias] = await Promise.all([
        apiPost('vivienda', 'getById', { id: idVivienda }),
        apiPost('vivienda_criterio_opcion', 'getByVivienda', { id_vivienda: idVivienda })
    ]);

    const v = (resVivienda.ok && Array.isArray(resVivienda.resource) && resVivienda.resource[0]) ? resVivienda.resource[0] : null;
    const prefs = (resPreferencias.ok && Array.isArray(resPreferencias.resource)) ? resPreferencias.resource : [];

    const direccion      = v?.direccion   ?? cand?.direccion ?? '';
    const ciudad         = v?.ciudad      ?? cand?.ciudad ?? '';
    const descripcion    = v?.descripcion ?? '';
    const plazasLibres   = v ? Number(v.plazas_libres)  : cand?.plazasLibres;
    const plazasTotales  = v ? Number(v.plazas_totales) : null;
    const anfitrion      = cand?.anfitrion ?? '';
    const compatibilidad = cand?.compatibilidad ?? null;

    const preferenciasHtml = prefs.length
        ? `<ul class="list-unstyled mb-0">${prefs.map(p => `<li class="mb-1"><span class="fw-semibold">${p.nombre_criterio}:</span> ${p.nombre_opcion}</li>`).join('')}</ul>`
        : `<p class="text-muted small mb-0">${t('huesped.candidates.noPreferences') || 'Esta vivienda no tiene preferencias definidas.'}</p>`;

    document.getElementById('modalDetalleTitle').textContent = direccion || t('modal.details');
    document.getElementById('modalDetalleContent').innerHTML = `
        <div class="row mb-3">
            <div class="col-12 col-md-6"><h6 class="text-muted small mb-1">${t('huesped.table.host')}</h6><p class="fw-semibold mb-0">${anfitrion}</p></div>
            <div class="col-12 col-md-6"><h6 class="text-muted small mb-1">${t('common.city')}</h6><p class="fw-semibold mb-0">${ciudad}</p></div>
        </div>
        <div class="row mb-3">
            <div class="col-12 col-md-12"><h6 class="text-muted small mb-1">${t('common.address')}</h6><p class="fw-semibold mb-0">${direccion}</p></div>
        </div>
        ${descripcion ? `<div class="row mb-3"><div class="col-12 col-md-12"><h6 class="text-muted small mb-1">${t('common.description')}</h6><p class="mb-0">${descripcion}</p></div></div>` : ''}
        <div class="row mb-3">
            <div class="col-12 col-md-6"><h6 class="text-muted small mb-1">${t('anfitrion.home.freeSlots')}</h6><p class="fw-semibold mb-0">${plazasLibres ?? '-'}</p></div>
            ${plazasTotales !== null ? `<div class="col-12 col-md-6"><h6 class="text-muted small mb-1">${t('anfitrion.home.totalSlots')}</h6><p class="fw-semibold mb-0">${plazasTotales}</p></div>` : ''}
        </div>
        ${compatibilidad !== null ? `
        <div class="row mb-3"><div class="col-12 col-md-12">
            <h6 class="text-muted small mb-1">${t('huesped.candidates.compatibility')}</h6>
            <p class="fw-semibold mb-0">${compatibilidad}%</p>
        </div></div>` : ''}
        <hr>
        <h6 class="fw-bold mb-2">${t('huesped.candidates.preferences') || 'Preferencias de la vivienda'}</h6>
        ${preferenciasHtml}
        <hr>
        <h6 class="fw-bold mb-2">${t('huesped.candidates.expectedDates') || 'Fechas propuestas para la convivencia'}</h6>
        <div class="row g-2 mb-3">
            <div class="col-12 col-md-6">
                <label class="form-label small fw-bold" for="solicitud-fecha-inicio">${t('huesped.candidates.expectedStart') || 'Fecha de inicio esperada'}</label>
                <input type="date" class="form-control form-control-sm" id="solicitud-fecha-inicio" min="${new Date().toISOString().split('T')[0]}" required>
            </div>
            <div class="col-12 col-md-6">
                <label class="form-label small fw-bold" for="solicitud-fecha-fin">${t('huesped.candidates.expectedEnd') || 'Fecha de fin esperada (opcional)'}</label>
                <input type="date" class="form-control form-control-sm" id="solicitud-fecha-fin">
            </div>
        </div>
        <button type="button" class="btn btn-primary rounded-pill w-100 btn-solicitar-vivienda" data-id="${idVivienda}">
            <i class="bi bi-send me-1"></i>${t('huesped.candidates.request') || 'Solicitar'}
        </button>
    `;

    document.getElementById('modalDetalleContent').querySelectorAll('.btn-solicitar-vivienda').forEach(btn => {
        btn.addEventListener('click', () => solicitarVivienda(btn));
    });

    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalDetalle')).show();
}

function renderizarResumenConvivencia(c) {
    const textos = {
        activo:     t('huesped.summary_status.statusActive'),
        entrevista: t('huesped.summary_status.statusInterview'),
        prueba:     t('huesped.summary_status.statusTrial'),
        inactivo:   t('huesped.summary_status.statusFinished')
    };
    const estadoEl = document.getElementById('estado-solicitud');
    const compatEl = document.getElementById('compatibilidad-score');
    const fechaEl  = document.getElementById('fecha-inicio');
    if (estadoEl) estadoEl.textContent = textos[c.estado] || c.estado;
    if (compatEl) compatEl.textContent = `${c.compatibilidad}%`;
    if (fechaEl)  fechaEl.textContent  = c.fechaInicio || t('huesped.summary_status.pending');

    const badges = {
        activo:     `<span class="badge rounded-pill px-3 py-2" style="background-color:#D1E7DD;color:#0F5132;">${t('huesped.convivencia.statusActive')}</span>`,
        entrevista: `<span class="badge rounded-pill px-3 py-2" style="background-color:#FFF3CD;color:#856404;">${t('huesped.convivencia.statusInterview')}</span>`,
        prueba:     `<span class="badge rounded-pill px-3 py-2" style="background-color:#CFE2FF;color:#084298;">${t('huesped.convivencia.statusTrial')}</span>`
    };
    aplicarPaginacion('tabla-resumen-convivencia', [c], (pagina) => {
        const tbody = document.getElementById('tabla-resumen-convivencia');
        if (!tbody) return;
        tbody.innerHTML = '';
        pagina.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td data-label="${t('huesped.table.host')}" class="fw-semibold">${item.anfitrion}</td>
                <td data-label="${t('huesped.table.address')}">${item.direccion}, ${item.ciudad}</td>
                <td data-label="${t('huesped.table.startDate')}">${item.fechaInicio || '-'}</td>
                <td data-label="${t('huesped.table.status')}">${badges[item.estado] || `<span class="badge bg-secondary rounded-pill px-3 py-2">${item.estado}</span>`}</td>
            `;
            tbody.appendChild(row);
        });
    });
}

function abrirModalGenerico(seccion, param = null) {
    const config = CONFIG_MODALES[seccion];
    if (!config) return;
    document.getElementById('modalTitle').textContent     = config.getTitulo();
    document.getElementById('modalFormContent').innerHTML  = config.getHtml(param);
    const form = document.getElementById('formGenerico');
    form.reset();
    form.querySelector('input[name="id_edit"]')?.remove();
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalGenerico')).show();
}

function actualizarControlesSeccion(seccion) {
    const accionesGlobales   = document.getElementById('acciones-globales');
    const filtrosGlobales    = document.getElementById('filtros-globales');
    const filtrosEspecificos = document.getElementById('filtrosEspecificos');
    const filtroTexto        = document.getElementById('filtroTexto');
    if (!accionesGlobales || !filtrosGlobales) return;

    if (['general','convivencia','recomendadas','perfil'].includes(seccion)) {
        accionesGlobales.classList.replace('d-flex','d-none');
        filtrosGlobales.classList.replace('d-flex','d-none');
        if (filtrosEspecificos) filtrosEspecificos.innerHTML = '';
        if (filtroTexto) filtroTexto.value = '';
        return;
    }

    accionesGlobales.classList.replace('d-none','d-flex');
    filtrosGlobales.classList.replace('d-none','d-flex');

    if (seccion === 'preferencias') {
        const btnCrear     = document.getElementById('btnCrear');
        const btnEliminar  = document.getElementById('btnEliminar');
        const btnReactivar = document.getElementById('btnReactivar');
        const btnEditar    = document.getElementById('btnEditar');
        btnCrear?.classList.add('d-none');
        btnEliminar?.classList.add('d-none');
        btnReactivar?.classList.add('d-none');
        if (btnEditar) btnEditar.innerHTML = `<i class="bi bi-pencil me-2"></i><span class="btn-label">${t('buttons.edit')}</span>`;
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
        select.className = 'form-select'; select.style.width = 'auto';
        select.dataset.filtroCampo = filtro.campo;
        select.innerHTML = `
            <option value="">${t('common.allStatuses')}</option>
            ${filtro.opciones.map(([val, key]) => `<option value="${val}">${t(`huesped.preferences.${key}`)}</option>`).join('')}
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
    return { preferencias: { lista: preferencias.listaRespuestasMemoria, renderizar: preferencias.renderizarPreferencias } }[seccion];
}

function obtenerIdsSeleccionados(seccion) {
    const s = { preferencias: '.preferencia-checkbox' }[seccion];
    if (!s) return [];
    return Array.from(document.querySelectorAll(`tbody ${s}:checked`)).map(cb => cb.value);
}

function actualizarBotones() {
    const seccion = document.querySelector('.section-link.active-custom')?.getAttribute('data-section');
    const seleccionados = seccion === 'preferencias'
        ? document.querySelectorAll('tbody .preferencia-checkbox:checked').length : 0;

    const btnEditar = document.getElementById('btnEditar');
    if (btnEditar) btnEditar.disabled = (seleccionados !== 1);
}

