import { initI18n, t, applyTranslations } from '../i18n.js';
import * as criterios  from './criterios.js';
import * as huespedes from './huespedes.js';
import { mostrarErrorFormulario, ocultarErrorFormulario, mostrarErrorCampo, ocultarErrorCampo } from '../form-errors.js';
import { renderPreguntasEncuesta, leerRespuestaCriterio } from '../encuesta-criterios.js';
import { cargarPartials } from '../partials.js';
import { mostrarToast, cargarPerfilPorMail, inicializarMedidorFortaleza, inicializarTogglePassword, inicializarCambioPassword } from '../perfil-comun.js';

const FILTROS_POR_SECCION = {
    criterios:  [],
    huespedes: [{ campo: 'estado', opciones: [['activo','filterActive'],['inactivo','filterInactive']] }]
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
                <div class="col-12 col-md-6 mb-3"><label class="form-label fw-bold">${t('anfitrion.home.totalSlots')}</label><input type="number" name="plazas_totales" class="form-control" min="1" required></div>
                <div class="col-12 col-md-6 mb-3"><label class="form-label fw-bold">${t('anfitrion.home.freeSlots')}</label><input type="number" name="plazas_libres" class="form-control" min="0" required></div>
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

let viviendaActual = null;
let pendingViviendaId = null;

let huespedBajaId = null;

const usuarioActual = {
    nombre: 'Ana García López', iniciales: 'AG',
    email: 'ana.garcia@semprenacasa.es', telefono: '+34 600 123 456',
    ciudad: 'Santiago de Compostela', dni: '12345678A', fechaAlta: 'enero de 2024'
};

document.addEventListener('DOMContentLoaded', async function() {
    await cargarPartials();

    await renderPreguntasEncuesta(document.getElementById('preguntas-encuesta-vivienda'), {
        namePrefix: 'v-q', headingTag: 'h6', headingClass: 'fw-bold mb-3', wrapperClass: 'mb-4', rowClass: 'row g-2'
    });

    await initI18n();
    applyTranslations();

    // La carga de huéspedes se hace al navegar a esa sección
    cargarPerfilPorMail({
        onDatos: (u) => {
            usuarioActual.id = u.id;
            usuarioActual.nombre = u.nombre;
            usuarioActual.email = u.email;
            usuarioActual.dni = u.dni;
            usuarioActual.telefono = u.telefono;
            usuarioActual.fechaAlta = u.fechaRegistro;
        }
    });
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
            const c = criterios.listaCriteriosMemoria.find(x => String(x.id) === String(seleccionado.value));
            if (!c) return;

            const opciones    = criterios.listaOpcionesMemoria.filter(o => String(o.id_criterio) === String(c.id_criterio));
            const peso        = c.peso ?? 3;
            const restrictivo = c.restrictivo == 1;
            const idOpcionExcluyente = c.id_opcion_excluyente ?? '';
            const optsExcluyenteHtml = opciones.map(o =>
                `<option value="${o.id_opcion}" ${String(idOpcionExcluyente) === String(o.id_opcion) ? 'selected' : ''}>${o.nombre_opcion}</option>`
            ).join('');
            document.getElementById('modalTitle').textContent = `${t('anfitrion.criteria.editTitle')}: ${c.criterio}`;
            document.getElementById('modalFormContent').innerHTML = `
                <input type="hidden" name="id_criterio" value="${c.id_criterio}">
                <input type="hidden" name="id_vivienda"  value="${c.id_vivienda}">
                <p class="text-muted small mb-3">${t('anfitrion.criteria.preferredValue')}</p>
                ${opciones.map(o => `
                    <div class="mb-2">
                        <input type="radio" class="btn-check" name="id_opcion" id="copt-${o.id_opcion}" value="${o.id_opcion}">
                        <label class="btn btn-outline-secondary w-100 p-3 text-start rounded-3" for="copt-${o.id_opcion}">${o.nombre_opcion}</label>
                    </div>`).join('')}
                <div class="mb-3 mt-3">
                    <label class="form-label fw-bold">${t('survey.weightLabel') || 'Importancia para mí'}</label>
                    <select name="peso" class="form-select">
                        <option value="1" ${peso == 1 ? 'selected' : ''}>1 - ${t('survey.weightLow') || 'Baja'}</option>
                        <option value="2" ${peso == 2 ? 'selected' : ''}>2</option>
                        <option value="3" ${peso == 3 ? 'selected' : ''}>3 - ${t('survey.weightMedium') || 'Media'}</option>
                        <option value="4" ${peso == 4 ? 'selected' : ''}>4</option>
                        <option value="5" ${peso == 5 ? 'selected' : ''}>5 - ${t('survey.weightHigh') || 'Alta'}</option>
                    </select>
                </div>
                <div class="form-check mb-1">
                    <input type="checkbox" class="form-check-input" name="restrictivo" id="chk-crit-restrictivo" value="1" ${restrictivo ? 'checked' : ''}>
                    <label class="form-check-label" for="chk-crit-restrictivo">${t('survey.restrictiveLabel') || 'Es imprescindible para mí'}</label>
                </div>
                <div class="mb-2">
                    <label class="form-label fw-bold">${t('survey.exclusionOptionLabel') || 'Opción que no acepto'}</label>
                    <select name="id_opcion_excluyente" class="form-select" id="sel-crit-excluyente" ${restrictivo ? '' : 'disabled'}>
                        <option value="">${t('survey.exclusionOptionNone') || 'Ninguna'}</option>
                        ${optsExcluyenteHtml}
                    </select>
                </div>
            `;
            const currentRadio = document.getElementById(`copt-${c.id_opcion}`);
            if (currentRadio) currentRadio.checked = true;
            document.getElementById('chk-crit-restrictivo').addEventListener('change', function() {
                const selExcluyente = document.getElementById('sel-crit-excluyente');
                selExcluyente.disabled = !this.checked;
                if (!this.checked) selExcluyente.value = '';
            });
            ocultarErrorFormulario(document.getElementById('formGenerico-error'));
            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalGenerico')).show();
        } else if (seccion === 'huespedes') {
            const seleccionado = document.querySelector('tbody .huesped-checkbox:checked');
            if (!seleccionado) return;
            huespedes.verHuesped(seleccionado.value);
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
            abrirModalBaja(seleccionados[0]);
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

        const errorEl = document.getElementById('formGenerico-error');
        ocultarErrorFormulario(errorEl);

        if (seccion === 'criterios') {
            if (!data.id_opcion) {
                mostrarErrorFormulario(errorEl, t('anfitrion.criteria.selectOption'));
                return;
            }
            bootstrap.Modal.getInstance(document.getElementById('modalGenerico')).hide();
            apiPost('vivienda_criterio_opcion', 'updateOpcion', {
                id_vivienda:          data.id_vivienda,
                id_criterio:          data.id_criterio,
                id_opcion:            data.id_opcion,
                peso:                 data.peso,
                restrictivo:          data.restrictivo ? 1 : 0,
                id_opcion_excluyente: data.id_opcion_excluyente || ''
            }).then(res => {
                if (res.ok) {
                    mostrarToast(t('anfitrion.criteria.updateSuccess'), 'success');
                    criterios.cargarCriterios(viviendaActual?.id);
                } else {
                    mostrarToast(t('anfitrion.criteria.updateError'), 'danger');
                }
            });
            return;
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

    document.getElementById('btnConfirmarBaja')?.addEventListener('click', async () => {
        if (!huespedBajaId) return;
        bootstrap.Modal.getInstance(document.getElementById('modalBaja')).hide();
        const res = await apiPost('usuario_vivienda', 'DELETE', {
            id_usuario:  huespedBajaId,
            id_vivienda: viviendaActual?.id
        });
        huespedBajaId = null;
        await cargarSeguimientoConvivencias();
        await huespedes.cargarHuespedes(viviendaActual?.id);
        aplicarFiltros(); actualizarBotones();
    });

    document.getElementById('btnDarDeAlta')?.addEventListener('click', () => mostrarPanelVivienda('form-alta-vivienda'));

    document.getElementById('btnCancelarAltaVivienda')?.addEventListener('click', () => mostrarPanelVivienda('sin-vivienda'));

    document.getElementById('formAltaVivienda')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(this));
        const errorEl = document.getElementById('formAltaVivienda-error');
        const btn = document.getElementById('btnSiguienteEncuesta');
        const camposObligatorios = ['direccion', 'ciudad', 'plazas_totales', 'plazas_libres']
            .map(name => this.querySelector(`[name="${name}"]`));

        ocultarErrorFormulario(errorEl);
        camposObligatorios.forEach(ocultarErrorCampo);

        let valido = true;
        camposObligatorios.forEach(campo => {
            if (!campo.value.trim()) { mostrarErrorCampo(campo, t('common.fieldRequired')); valido = false; }
        });
        if (!valido) return;

        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>${t('survey.processing')}`;

        const idAnfitrion = getCookie('user_id') || usuarioActual.id;
        const res = await apiPost('vivienda', 'ADD', {
            direccion:      data.direccion.trim(),
            ciudad:         data.ciudad.trim(),
            plazas_totales: data.plazas_totales,
            plazas_libres:  data.plazas_libres,
            descripcion:    data.descripcion || '',
            id_anfitrion:   idAnfitrion
        });

        btn.disabled = false;
        btn.innerHTML = `<i class="bi bi-arrow-right me-1"></i><span>${t('anfitrion.home.next')}</span>`;

        if (!res.ok) {
            mostrarErrorFormulario(errorEl, t('anfitrion.home.savingError'));
            return;
        }

        pendingViviendaId = res.resource;
        viviendaActual = {
            id:             pendingViviendaId,
            direccion:      data.direccion.trim(),
            ciudad:         data.ciudad.trim(),
            plazas_totales: Number(data.plazas_totales),
            plazas_libres:  Number(data.plazas_libres),
            descripcion:    data.descripcion || '',
            estado:         Number(data.plazas_libres) > 0 ? 'disponible' : 'completa'
        };

        // Iniciar encuesta de criterios
        const form2 = document.getElementById('formEncuestaVivienda');
        if (form2) { form2.reset(); actualizarProgresoEncuestaVivienda(); }
        mostrarPanelVivienda('encuesta-alta-vivienda');
    });

    // Progreso de la encuesta de criterios de vivienda
    document.getElementById('formEncuestaVivienda')?.querySelectorAll('.btn-check').forEach(input =>
        input.addEventListener('change', actualizarProgresoEncuestaVivienda)
    );

    document.getElementById('formEncuestaVivienda')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const errorEl = document.getElementById('encuesta-vivienda-error');
        const btn = document.getElementById('btnGuardarEncuestaVivienda');

        const secciones = this.querySelectorAll('[data-criterio]');
        let allAnswered = true;
        secciones.forEach(sec => {
            if (!sec.querySelector('.btn-check:checked')) allAnswered = false;
        });

        if (!allAnswered) {
            mostrarErrorFormulario(errorEl, t('anfitrion.home.criteriaRequired'));
            window.scrollTo(0, 0);
            return;
        }
        ocultarErrorFormulario(errorEl);
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>${t('survey.processing')}`;

        const promesas = [];
        secciones.forEach(sec => {
            const idCriterio = sec.getAttribute('data-criterio');
            const respuesta  = leerRespuestaCriterio(sec);
            if (respuesta) {
                promesas.push(apiPost('vivienda_criterio_opcion', 'ADD', {
                    id_vivienda:          pendingViviendaId,
                    id_criterio:          idCriterio,
                    id_opcion:            respuesta.idOpcion,
                    peso:                 respuesta.peso,
                    restrictivo:          respuesta.restrictivo,
                    id_opcion_excluyente: respuesta.idOpcionExcluyente
                }));
            }
        });

        try {
            await Promise.all(promesas);
            pendingViviendaId = null;
            mostrarToast(t('anfitrion.home.criteriaSuccess'), 'success');
            renderizarVivienda();
        } catch (err) {
            mostrarErrorFormulario(errorEl, t('anfitrion.home.savingError'));
            btn.disabled = false;
            btn.innerHTML = `<i class="bi bi-check-circle me-2"></i><span>${t('anfitrion.home.savePreferences')}</span>`;
        }
    });

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
        usuarioActual.nombre   = nombre;
        usuarioActual.email    = email;
        usuarioActual.telefono = document.getElementById('perfil-telefono').value.trim();
        usuarioActual.ciudad   = document.getElementById('perfil-ciudad')?.value.trim() || '';
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
        const id = usuarioActual.id;
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

    switch(sectionName) {
        case 'general':    cargarSeguimientoConvivencias(); break;
        case 'vivienda':   renderizarVivienda();            break;
        case 'criterios':  criterios.cargarCriterios(viviendaActual?.id); break;
        case 'huespedes': huespedes.cargarHuespedes(viviendaActual?.id); break;
    }

    aplicarFiltros();
    document.getElementById('section-title').textContent       = SECTION_TITLES[sectionName]?.()       || '';
    document.getElementById('section-description').textContent = SECTION_DESCRIPTIONS[sectionName]?.() || '';
}

async function cargarSeguimientoConvivencias() {
    const idUsuario = getCookie('user_id');

    // Cargar vivienda del anfitrión
    if (idUsuario) {
        const resV = await apiPost('vivienda', 'getAll');
        if (resV.ok && Array.isArray(resV.resource)) {
            const v = resV.resource.find(v => String(v.id_anfitrion) === String(idUsuario));
            if (v) {
                viviendaActual = {
                    id:             v.id_vivienda,
                    direccion:      v.direccion,
                    ciudad:         v.ciudad,
                    plazas_totales: Number(v.plazas_totales),
                    plazas_libres:  Number(v.plazas_libres),
                    descripcion:    v.descripcion || '',
                    estado:         v.activo_vivienda == 1 ? 'disponible' : 'inactivo'
                };
            }
        }
    }

    // Actualizar tarjeta de estado
    const estadoEl = document.getElementById('estado-vivienda');
    if (estadoEl) estadoEl.textContent = viviendaActual
        ? (viviendaActual.estado === 'disponible' ? t('anfitrion.home.available') : t('anfitrion.home.complete'))
        : t('anfitrion.home.noHome');

    // Cargar TODOS los huéspedes históricos de la vivienda
    let todosHuespedes = [];
    if (viviendaActual?.id) {
        const resH = await apiPost('usuario_vivienda', 'getHuespedesByVivienda', { id_vivienda: viviendaActual.id });
        todosHuespedes = (resH.ok && Array.isArray(resH.resource)) ? resH.resource : [];
    }

    const activos = todosHuespedes.filter(r => r.activo_usuario_vivienda == 1);
    const plazasEl = document.getElementById('plazas-ocupadas');
    if (plazasEl) plazasEl.textContent = viviendaActual
        ? `${activos.length} / ${viviendaActual.plazas_totales}`
        : '-';

    renderizarConvivencias(todosHuespedes);
}

function renderizarConvivencias(lista) {
    const tbody = document.getElementById('tabla-convivencias');
    if (!tbody) return;

    if (!lista || lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted py-3">${t('anfitrion.convivencias.noActive')}</td></tr>`;
        return;
    }

    tbody.innerHTML = lista.map(r => {
        const nombre = `${r.nombre_usuario || ''} ${r.apellidos || ''}`.trim();
        const fecha  = r.fecha_inicio ? r.fecha_inicio.split(' ')[0] : '-';
        const badge  = r.activo_usuario_vivienda == 1
            ? `<span class="badge rounded-pill px-3 py-2" style="background-color:#D1E7DD;color:#0F5132;">${t('anfitrion.convivencias.statusActive')}</span>`
            : `<span class="badge rounded-pill px-3 py-2" style="background-color:#F8D7DA;color:#842029;">${t('anfitrion.convivencias.statusInactive')}</span>`;
        return `<tr>
            <td data-label="${t('anfitrion.table.tenant')}" class="fw-semibold">${nombre}</td>
            <td data-label="${t('anfitrion.table.startDate')}">${fecha}</td>
            <td data-label="${t('anfitrion.table.status')}">${badge}</td>
        </tr>`;
    }).join('');
}

function mostrarPanelVivienda(panelId) {
    ['sin-vivienda', 'form-alta-vivienda', 'encuesta-alta-vivienda', 'con-vivienda'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.toggle('d-none', id !== panelId);
    });
}

function actualizarProgresoEncuestaVivienda() {
    const form = document.getElementById('formEncuestaVivienda');
    if (!form) return;
    const secciones = form.querySelectorAll('[data-criterio]');
    let respondidas = 0;
    secciones.forEach(sec => { if (sec.querySelector('.btn-check:checked')) respondidas++; });
    const pct = Math.round((respondidas / secciones.length) * 100);
    const barra = document.getElementById('progreso-encuesta-vivienda');
    if (barra) barra.style.width = pct + '%';
}

async function renderizarVivienda() {
    if (!viviendaActual) {
        const idUsuario = getCookie('user_id');
        if (idUsuario) {
            const resV = await apiPost('vivienda', 'getAll');
            if (resV.ok && Array.isArray(resV.resource)) {
                const v = resV.resource.find(v => String(v.id_anfitrion) === String(idUsuario));
                if (v) {
                    viviendaActual = {
                        id:             v.id_vivienda,
                        direccion:      v.direccion,
                        ciudad:         v.ciudad,
                        plazas_totales: Number(v.plazas_totales),
                        plazas_libres:  Number(v.plazas_libres),
                        descripcion:    v.descripcion || '',
                        estado:         v.activo_vivienda == 1 ? 'disponible' : 'inactivo'
                    };
                }
            }
        }
    }

    if (!viviendaActual) {
        mostrarPanelVivienda('sin-vivienda');
        return;
    }

    mostrarPanelVivienda('con-vivienda');

    const badgeHtml = viviendaActual.estado === 'disponible'
        ? `<span class="badge bg-success rounded-pill px-3">${t('anfitrion.home.available')}</span>`
        : `<span class="badge bg-secondary rounded-pill px-3">${t('anfitrion.home.complete')}</span>`;

    document.getElementById('ficha-vivienda').innerHTML = `
        <div class="row g-4">
            <div class="col-12 col-md-8">
                <h6 class="text-muted small mb-1">${t('anfitrion.home.address')}</h6>
                <p class="fw-semibold mb-3">${viviendaActual.direccion}</p>
                <h6 class="text-muted small mb-1">${t('anfitrion.home.city')}</h6>
                <p class="fw-semibold mb-3">${viviendaActual.ciudad}</p>
                <h6 class="text-muted small mb-1">${t('anfitrion.home.description')}</h6>
                <p class="mb-0">${viviendaActual.descripcion || '-'}</p>
            </div>
            <div class="col-12 col-md-4">
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
    ocultarErrorFormulario(document.getElementById('formGenerico-error'));
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalGenerico')).show();
}

function abrirModalBaja(id) {
    const i = huespedes.listaHuespedesMemoria.find(x => String(x.id) === String(id));
    if (!i) return;
    huespedBajaId = id;
    document.getElementById('baja-nombre').textContent  = i.nombre;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalBaja')).show();
}

window.verHuesped = function(id) {
    const i = huespedes.listaHuespedesMemoria.find(x => String(x.id) === String(id));
    if (!i) return;

    const estadoBadge = i.estado === 'activo'
        ? `<span class="badge bg-success">${t('anfitrion.tenants.statusActive')}</span>`
        : `<span class="badge bg-secondary">${t('anfitrion.tenants.statusInactive')}</span>`;

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
            <div class="col-12 col-md-6"><h6 class="text-muted small mb-1">${t('anfitrion.tenants.email')}</h6><p class="fw-semibold mb-0">${i.email}</p></div>
            <div class="col-12 col-md-6"><h6 class="text-muted small mb-1">${t('anfitrion.tenants.phone')}</h6><p class="fw-semibold mb-0">${i.telefono}</p></div>
        </div>
        <div class="row">
            <div class="col-12 col-md-6"><h6 class="text-muted small mb-1">${t('anfitrion.tenants.joinDate')}</h6><p class="fw-semibold mb-0">${i.fechaIngreso || t('anfitrion.tenants.pending')}</p></div>
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
        btnCrear?.classList.add('d-none');
        btnEliminar?.classList.add('d-none');
        btnReactivar?.classList.add('d-none');
            if (btnEditar) btnEditar.innerHTML = `<i class="bi bi-pencil me-2"></i><span class="btn-label">${t('buttons.edit')}</span>`;
    } else if (seccion === 'huespedes') {
        btnCrear?.classList.add('d-none');
        btnEditar?.classList.add('d-none');
            if (btnEliminar) btnEliminar.innerHTML = `<i class="bi bi-box-arrow-right me-2"></i><span class="btn-label">${t('common.notifyLeave')}</span>`;
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
        criterios:  { lista: criterios.listaCriteriosMemoria,  renderizar: criterios.renderizarConPaginacion },
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
            return i?.estado === 'activo';
        }).length;
        btnEliminar.disabled = (puedeBaja === 0);
    }
}

