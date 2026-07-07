import { initI18n, t, applyTranslations } from '../i18n.js';
import * as convivencia  from '../huesped/convivencia.js';
import * as preferencias from '../huesped/preferencias.js';
import { aplicarPaginacion, resetPagina } from '../admin/paginacion.js';
import { mostrarErrorFormulario, ocultarErrorFormulario, mostrarErrorCampo, ocultarErrorCampo } from '../form-errors.js';

const FILTROS_POR_SECCION = {};

const CONFIG_MODALES = {};

const SECTION_TITLES = {
    general:      () => t('huesped.sections.general.title'),
    convivencia:  () => t('huesped.sections.convivencia.title'),
    preferencias: () => t('huesped.sections.preferences.title'),
    perfil:       () => t('huesped.sections.profile.title')
};

const usuarioActual = {
    nombre: 'Luis Martínez', iniciales: 'LM',
    email: 'luis.m@email.com', telefono: '666 111 222',
    ciudad: 'Santiago de Compostela', dni: '87654321B', fechaAlta: 'febrero de 2026'
};

document.addEventListener('DOMContentLoaded', async function() {
    await initI18n();
    applyTranslations();

    convivencia.cargarConvivencia();

    // Cargar perfil del usuario logueado por email
    (async function cargarPerfilPorMail() {
        const email = (window.auth && typeof window.auth.getEmail === 'function') ? window.auth.getEmail() : localStorage.getItem('user_email');
        const initialsFrom = name => (name || '').split(' ').map(n => n[0] || '').join('').toUpperCase().slice(0,2);
        if (!email) return;
        try {
            const res = await apiPost('usuario', 'getByMail', { mail: email });
            if (res.ok && Array.isArray(res.resource) && res.resource.length > 0) {
                const ures = res.resource[0];
                const u = {
                    id: ures.id_usuario,
                    nombre: `${ures.nombre_usuario} ${ures.apellidos}`.trim(),
                    email: ures.mail,
                    dni: ures.dni,
                    telefono: ures.telefono,
                    ciudad: ures.ciudad || '',
                    fechaRegistro: ures.fecha_alta_usuario ? ures.fecha_alta_usuario.split(' ')[0] : '-'
                };
                // Guardar en usuarioActual
                usuarioActual.id = u.id;
                usuarioActual.nombre = u.nombre;
                usuarioActual.email = u.email;
                usuarioActual.dni = u.dni;
                usuarioActual.telefono = u.telefono;
                usuarioActual.ciudad = u.ciudad;
                usuarioActual.fechaAlta = u.fechaRegistro;

                document.getElementById('perfil-display-nombre').textContent = u.nombre || '';
                const inpNombre = document.getElementById('perfil-nombre'); if (inpNombre) inpNombre.value = u.nombre || '';
                const inpEmail = document.getElementById('perfil-email'); if (inpEmail) inpEmail.value = u.email || '';
                const inpDni = document.getElementById('perfil-dni'); if (inpDni) inpDni.value = u.dni || '';
                const inpTel = document.getElementById('perfil-telefono'); if (inpTel) inpTel.value = u.telefono || '';
                const fecha = document.getElementById('perfil-fecha-alta'); if (fecha) fecha.textContent = u.fechaRegistro || '-';
                const initials = initialsFrom(u.nombre);
                const avatar = document.getElementById('perfil-avatar'); if (avatar) { avatar.textContent = initials; avatar.style.backgroundColor = 'var(--color-primario)'; }
                const btn = document.getElementById('btnPerfil'); if (btn) { btn.textContent = initials; btn.style.backgroundColor = 'var(--color-primario)'; }
                return;
            }
        } catch (err) {
            console.warn('Error cargando perfil por mail (huesped):', err);
        }
    })();

    const navConvivencia = document.getElementById('nav-convivencia');
    if (navConvivencia) {
        navConvivencia.classList.toggle('d-none', !convivencia.convivenciaMemoria);
    }

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

        if (seccion === 'preferencias') {
            const idUsuario = usuarioActual.id || localStorage.getItem('user_id');
            if (!idUsuario) { mostrarToast('Error: usuario no identificado.', 'danger'); return; }
            const res = await apiPost('usuario_criterio_opcion', 'UPSERT_RESPUESTA', {
                id_usuario:  idUsuario,
                id_criterio: data.id_criterio,
                id_opcion:   data.id_opcion
            });
            if (!res.ok) { mostrarToast('Error al guardar la respuesta.', 'danger'); return; }
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

    document.getElementById('perfil-form-pwd')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const actualInput   = document.getElementById('pwd-actual');
        const nuevaInput    = document.getElementById('pwd-nueva');
        const confirmaInput = document.getElementById('pwd-confirmar');
        const feedback = document.getElementById('pwd-feedback');
        ocultarErrorFormulario(feedback);
        [actualInput, nuevaInput, confirmaInput].forEach(ocultarErrorCampo);

        if (!actualInput.value) { mostrarErrorCampo(actualInput, t('profile.passwordRequired')); return; }
        if (nuevaInput.value.length < 8) { mostrarErrorCampo(nuevaInput, t('profile.passwordTooShort')); return; }
        if (nuevaInput.value !== confirmaInput.value) { mostrarErrorCampo(confirmaInput, t('profile.passwordMismatch')); return; }
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalConfirmarPassword')).show();
    });

    document.getElementById('btnConfirmarPassword')?.addEventListener('click', async () => {
        const mail   = usuarioActual.email || localStorage.getItem('user_email');
        const actual = document.getElementById('pwd-actual').value;
        const nueva  = document.getElementById('pwd-nueva').value;

        const res = await apiPost('auth', 'CAMBIAR_CONTRASENA', { mail, password_actual: actual, password: nueva });

        bootstrap.Modal.getInstance(document.getElementById('modalConfirmarPassword')).hide();

        const feedback = document.getElementById('pwd-feedback');
        if (!res.ok) {
            const msg = res.code === 'PASSWORD_ACTUAL_INCORRECTA_KO'
                ? 'La contraseña actual no es correcta.'
                : 'Error al cambiar la contraseña.';
            mostrarErrorFormulario(feedback, msg);
            return;
        }

        document.getElementById('perfil-form-pwd').reset();
        document.getElementById('pwd-strength-wrap').style.display = 'none';
        ocultarErrorFormulario(feedback);
        mostrarToast(t('profile.passwordUpdated'), 'success');
    });

    document.getElementById('btnEliminarCuenta')?.addEventListener('click', () => {
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEliminarCuenta')).show();
    });

    document.getElementById('btnConfirmarEliminarCuenta')?.addEventListener('click', async () => {
        bootstrap.Modal.getInstance(document.getElementById('modalEliminarCuenta')).hide();
        const id = usuarioActual.id || localStorage.getItem('user_id');
        if (!id) { mostrarToast('No se pudo desactivar: id de usuario desconocido', 'danger'); return; }
        try {
            const res = await apiPost('usuario', 'DELETE', { id_usuario: id });
            if (res.ok) {
                localStorage.removeItem('user_email');
                localStorage.removeItem('user_token');
                localStorage.removeItem('user_role');
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
        case 'preferencias': preferencias.cargarPreferencias(usuarioActual.id || localStorage.getItem('user_id')); break;
    }

    aplicarFiltros();
    const descriptions = convivencia.convivenciaMemoria
        ? { general: () => t('huesped.sections.general.descriptionWithHome'), convivencia: () => t('huesped.sections.convivencia.description'), preferencias: () => t('huesped.sections.preferences.description'), perfil: () => t('huesped.sections.profile.description') }
        : { general: () => t('huesped.sections.general.descriptionWithoutHome'), preferencias: () => t('huesped.sections.preferences.description'), perfil: () => t('huesped.sections.profile.description') };

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

function renderizarCandidatos() {
    const candidatos = [...convivencia.candidatosMemoria].sort((a, b) => b.compatibilidad - a.compatibilidad);

    const totalEl = document.getElementById('total-candidatos');
    const maxEl   = document.getElementById('max-compatibilidad');
    const prefEl  = document.getElementById('preferencias-activas');
    if (totalEl) totalEl.textContent = candidatos.length;
    if (maxEl)   maxEl.textContent   = candidatos.length ? `${candidatos[0].compatibilidad}%` : '-';
    if (prefEl)  prefEl.textContent  = preferencias.listaRespuestasMemoria.filter(p => p.id_opcion != null).length;

    const grid = document.getElementById('grid-candidatos');
    if (!grid) return;

    grid.innerHTML = candidatos.map(cand => {
        const pctColor = cand.compatibilidad >= 85 ? 'success' : cand.compatibilidad >= 65 ? 'warning' : 'danger';
        const inis = cand.anfitrion.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
        const slotsKey = cand.plazasLibres !== 1 ? t('huesped.candidates.freeSlotsPlural') : t('huesped.candidates.freeSlotsSingular');
        return `
            <div class="col-md-6 col-xl-3">
                <div class="card border-0 shadow-sm rounded-4 h-100 p-3">
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
                        <div class="progress" style="height:6px;">
                            <div class="progress-bar bg-${pctColor}" style="width:${cand.compatibilidad}%;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
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
                <td class="fw-semibold">${item.anfitrion}</td>
                <td>${item.direccion}, ${item.ciudad}</td>
                <td>${item.fechaInicio || '-'}</td>
                <td>${badges[item.estado] || `<span class="badge bg-secondary rounded-pill px-3 py-2">${item.estado}</span>`}</td>
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

    if (['general','convivencia','perfil'].includes(seccion)) {
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
        if (btnEditar) btnEditar.innerHTML = `<i class="bi bi-pencil me-2"></i> ${t('buttons.edit')}`;
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

function calcularFortaleza(pwd) {
    let p = 0;
    if (pwd.length >= 8)          p++;
    if (/[A-Z]/.test(pwd))        p++;
    if (/[0-9]/.test(pwd))        p++;
    if (/[^A-Za-z0-9]/.test(pwd)) p++;
    return Math.max(1, p);
}

function mostrarToast(mensaje, tipo = 'success') {
    const toast = document.getElementById('toastDashboard');
    if (!toast) return;
    toast.className = `toast align-items-center border-0 text-bg-${tipo}`;
    document.getElementById('toastDashboardMsg').textContent = mensaje;
    bootstrap.Toast.getOrCreateInstance(toast, { delay: 3000 }).show();
}
