import { initI18n, t, applyTranslations } from '../i18n.js';
import * as convivencia  from '../huesped/convivencia.js';
import * as preferencias from '../huesped/preferencias.js';

const FILTROS_POR_SECCION = {
    preferencias: [{ campo: 'estado', opciones: [['activo','filterActive'],['inactivo','filterInactive']] }]
};

const CONFIG_MODALES = {
    preferencias: {
        getTitulo: () => t('huesped.preferences.add'),
        getHtml: () => `
            <div class="mb-3"><label class="form-label fw-bold">${t('huesped.preferences.preferenceLabel')}</label>
            <input name="preferencia" class="form-control" placeholder="Ej: Ambiente de la vivienda" required></div>
            <div class="mb-3"><label class="form-label fw-bold">${t('huesped.preferences.myValue')}</label>
            <input name="valor" class="form-control" placeholder="Ej: Tranquilo" required></div>`
    }
};

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
    preferencias.cargarPreferencias();

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

    document.getElementById('btnEditar')?.addEventListener('click', () => {
        const seccion = document.querySelector('.section-link.active-custom')?.getAttribute('data-section');
        if (seccion !== 'preferencias') return;
        const seleccionado = document.querySelector('tbody .preferencia-checkbox:checked');
        if (!seleccionado) return;
        const id = parseInt(seleccionado.value);
        const p  = preferencias.listaPreferenciasMemoria.find(x => x.id === id);
        if (!p) return;
        abrirModalGenerico('preferencias');
        const form = document.getElementById('formGenerico');
        form.querySelector('[name="preferencia"]').value = p.preferencia;
        form.querySelector('[name="valor"]').value       = p.valor;
        form.insertAdjacentHTML('beforeend', `<input type="hidden" name="id_edit" value="${id}">`);
        document.getElementById('modalTitle').textContent = `${t('huesped.preferences.add')}: ${p.preferencia}`;
    });

    document.getElementById('btnEliminar')?.addEventListener('click', () => {
        const seccion = document.querySelector('.section-link.active-custom')?.getAttribute('data-section');
        if (seccion !== 'preferencias') return;
        const seleccionados = obtenerIdsSeleccionados(seccion);
        if (seleccionados.length === 0) return;
        if (confirm(`¿${t('common.deactivate')} ${seleccionados.length} preferencia(s)?`)) {
            preferencias.desactivarPreferencias(seleccionados);
            aplicarFiltros(); actualizarBotones();
        }
    });

    document.getElementById('btnReactivar')?.addEventListener('click', () => {
        const seccion = document.querySelector('.section-link.active-custom')?.getAttribute('data-section');
        if (seccion !== 'preferencias') return;
        const seleccionados = obtenerIdsSeleccionadosInactivos(seccion);
        if (seleccionados.length === 0) return;
        preferencias.reactivarPreferencias(seleccionados);
        aplicarFiltros(); actualizarBotones();
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

        if (seccion === 'preferencias') {
            if (data.id_edit) {
                const p = preferencias.listaPreferenciasMemoria.find(x => x.id === parseInt(data.id_edit));
                if (p) { p.preferencia = data.preferencia; p.valor = data.valor; }
            } else {
                preferencias.listaPreferenciasMemoria.push({ id: Date.now(), preferencia: data.preferencia, valor: data.valor, estado: 'activo' });
            }
            preferencias.cargarPreferencias();
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
        usuarioActual.nombre   = nombre; usuarioActual.email = email;
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

    document.getElementById('btnConfirmarEliminarCuenta')?.addEventListener('click', async () => {
        bootstrap.Modal.getInstance(document.getElementById('modalEliminarCuenta')).hide();
        const id = usuarioActual.id;
        if (!id) { mostrarToast('No se pudo eliminar: id de usuario desconocido', 'danger'); return; }
        try {
            const res = await apiPost('usuario', 'DELETE', { id_usuario: id });
            if (res.ok) {
                localStorage.removeItem('user_email');
                localStorage.removeItem('user_token');
                localStorage.removeItem('user_role');
                mostrarToast(t('profile.deleteSuccess'), 'danger');
                setTimeout(() => { window.location.href = 'login.html'; }, 1500);
            } else {
                mostrarToast('Error al eliminar cuenta: ' + (res.error || res.code || 'desconocido'), 'danger');
            }
        } catch (err) {
            console.error(err);
            mostrarToast('Error al eliminar cuenta: ' + err.message, 'danger');
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
        case 'general':      cargarResumenGeneral();                   break;
        case 'convivencia':  convivencia.renderizarConvivencia();      break;
        case 'preferencias': preferencias.cargarPreferencias();        break;
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
    if (prefEl)  prefEl.textContent  = preferencias.listaPreferenciasMemoria.filter(p => p.estado === 'activo').length;

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

    const tbody = document.getElementById('tabla-resumen-convivencia');
    if (!tbody) return;
    const badges = {
        activo:     `<span class="badge rounded-pill px-3 py-2" style="background-color:#D1E7DD;color:#0F5132;">${t('huesped.convivencia.statusActive')}</span>`,
        entrevista: `<span class="badge rounded-pill px-3 py-2" style="background-color:#FFF3CD;color:#856404;">${t('huesped.convivencia.statusInterview')}</span>`,
        prueba:     `<span class="badge rounded-pill px-3 py-2" style="background-color:#CFE2FF;color:#084298;">${t('huesped.convivencia.statusTrial')}</span>`
    };
    tbody.innerHTML = `
        <tr>
            <td class="fw-semibold">${c.anfitrion}</td>
            <td>${c.direccion}, ${c.ciudad}</td>
            <td>${c.fechaInicio || '-'}</td>
            <td>${badges[c.estado] || `<span class="badge bg-secondary rounded-pill px-3 py-2">${c.estado}</span>`}</td>
        </tr>
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
        const btnEditar    = document.getElementById('btnEditar');
        const btnEliminar  = document.getElementById('btnEliminar');
        const btnReactivar = document.getElementById('btnReactivar');
        btnCrear?.classList.remove('d-none');
        if (btnCrear)     btnCrear.innerHTML     = `<i class="bi bi-plus-circle me-2"></i> ${t('buttons.add')}`;
        if (btnEditar)    btnEditar.innerHTML    = `<i class="bi bi-pencil me-2"></i> ${t('buttons.edit')}`;
        if (btnEliminar)  btnEliminar.innerHTML  = `<i class="bi bi-x-circle me-2"></i> ${t('buttons.deactivate')}`;
        btnReactivar?.classList.remove('d-none');
        if (btnReactivar) btnReactivar.innerHTML = `<i class="bi bi-check-circle me-2"></i> ${t('buttons.activate')}`;
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
    return { preferencias: { lista: preferencias.listaPreferenciasMemoria, renderizar: preferencias.renderizarPreferencias } }[seccion];
}

function obtenerIdsSeleccionados(seccion) {
    const s = { preferencias: '.preferencia-checkbox' }[seccion];
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
    const seleccionados = seccion === 'preferencias'
        ? document.querySelectorAll('tbody .preferencia-checkbox:checked').length : 0;

    const btnEditar    = document.getElementById('btnEditar');
    const btnEliminar  = document.getElementById('btnEliminar');
    const btnReactivar = document.getElementById('btnReactivar');

    if (btnEditar)   btnEditar.disabled   = (seleccionados !== 1);
    if (btnEliminar) btnEliminar.disabled = (seleccionados === 0);
    if (seccion === 'preferencias' && btnReactivar) {
        btnReactivar.disabled = (obtenerIdsSeleccionadosInactivos(seccion).length === 0);
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
