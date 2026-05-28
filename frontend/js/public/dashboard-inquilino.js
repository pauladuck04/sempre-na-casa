// js/public/dashboard-inquilino.js

import * as convivencia  from '../inquilino/convivencia.js';
import * as preferencias from '../inquilino/preferencias.js';

// ============================================
// CONFIGURACIÓN DE FILTROS POR SECCIÓN
// ============================================

const FILTROS_POR_SECCION = {
    preferencias: [
        {
            campo: 'estado',
            opciones: [
                ['activo',   'Activos'],
                ['inactivo', 'Inactivos']
            ]
        }
    ]
};

// ============================================
// CONFIGURACIÓN DE MODALES GENÉRICOS
// ============================================

const CONFIG_MODALES = {
    preferencias: {
        titulo: 'Añadir Preferencia',
        html: `
            <div class="mb-3">
                <label class="form-label fw-bold">Preferencia</label>
                <input name="preferencia" class="form-control" placeholder="Ej: Ambiente de la vivienda" required>
            </div>
            <div class="mb-3">
                <label class="form-label fw-bold">Mi Valor</label>
                <input name="valor" class="form-control" placeholder="Ej: Tranquilo" required>
            </div>`
    }
};

// ============================================
// DATOS DE USUARIO
// ============================================

const usuarioActual = {
    nombre:    'Luis Martínez',
    iniciales: 'LM',
    email:     'luis.m@email.com',
    telefono:  '666 111 222',
    ciudad:    'Santiago de Compostela',
    dni:       '87654321B',
    fechaAlta: 'febrero de 2026',
};

// ============================================
// TEXTOS DE SECCIONES
// ============================================

const SECTION_TITLES = {
    general:      'Panel de Inquilino',
    convivencia:  'Mi Convivencia',
    preferencias: 'Mis Preferencias',
    perfil:       'Mi Perfil',
};

const SECTION_DESCRIPTIONS = {
    general:      'Resumen de tu convivencia y estado de solicitud',
    convivencia:  'Consulta los detalles de tu vivienda y anfitrión',
    preferencias: 'Define tus preferencias para el proceso de matching',
    perfil:       'Gestiona tu información personal y configuración de cuenta',
};

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    convivencia.cargarConvivencia();
    preferencias.cargarPreferencias();

    const seccionActiva = document.querySelector('.section-link.active-custom')?.getAttribute('data-section');
    actualizarControlesSeccion(seccionActiva);
    cargarResumenGeneral();

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
        if (seccion !== 'preferencias') return;

        const seleccionado = document.querySelector('tbody .preferencia-checkbox:checked');
        if (!seleccionado) return;
        const id = parseInt(seleccionado.value);
        const p = preferencias.listaPreferenciasMemoria.find(x => x.id === id);
        if (!p) return;
        abrirModalGenerico('preferencias');
        const form = document.getElementById('formGenerico');
        form.querySelector('[name="preferencia"]').value = p.preferencia;
        form.querySelector('[name="valor"]').value = p.valor;
        form.insertAdjacentHTML('beforeend', `<input type="hidden" name="id_edit" value="${id}">`);
        document.getElementById('modalTitle').textContent = 'Editar Preferencia: ' + p.preferencia;
    });

    // ---- Botón Desactivar ----
    document.getElementById('btnEliminar')?.addEventListener('click', () => {
        const seccion = document.querySelector('.section-link.active-custom')?.getAttribute('data-section');
        if (seccion !== 'preferencias') return;
        const seleccionados = obtenerIdsSeleccionados(seccion);
        if (seleccionados.length === 0) return;
        if (confirm(`¿Desactivar ${seleccionados.length} preferencia(s)?`)) {
            preferencias.desactivarPreferencias(seleccionados);
            aplicarFiltros();
            actualizarBotones();
        }
    });

    // ---- Botón Reactivar ----
    document.getElementById('btnReactivar')?.addEventListener('click', () => {
        const seccion = document.querySelector('.section-link.active-custom')?.getAttribute('data-section');
        if (seccion !== 'preferencias') return;
        const seleccionados = obtenerIdsSeleccionadosInactivos(seccion);
        if (seleccionados.length === 0) return;
        preferencias.reactivarPreferencias(seleccionados);
        aplicarFiltros();
        actualizarBotones();
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
                input.type     = 'text';
                icon.className = 'bi bi-eye-slash';
            } else {
                input.type     = 'password';
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
        case 'general':      cargarResumenGeneral();                   break;
        case 'convivencia':  convivencia.renderizarConvivencia();      break;
        case 'preferencias': preferencias.cargarPreferencias();        break;
    }

    aplicarFiltros();
    document.getElementById('section-title').textContent       = SECTION_TITLES[sectionName]       || '';
    document.getElementById('section-description').textContent = SECTION_DESCRIPTIONS[sectionName] || '';
}

// ============================================
// VISTA GENERAL
// ============================================

function cargarResumenGeneral() {
    const c = convivencia.convivenciaMemoria;

    const estadoEl = document.getElementById('estado-solicitud');
    if (estadoEl) {
        const textos = {
            activo:     'Activa',
            entrevista: 'En Entrevista',
            prueba:     'Periodo de Prueba',
            inactivo:   'Finalizada',
        };
        estadoEl.textContent = c ? (textos[c.estado] || c.estado) : 'Sin solicitud';
    }

    const compatEl = document.getElementById('compatibilidad-score');
    if (compatEl) compatEl.textContent = c ? `${c.compatibilidad}%` : '-';

    const fechaEl = document.getElementById('fecha-inicio');
    if (fechaEl) fechaEl.textContent = c ? (c.fechaInicio || 'Pendiente') : '-';

    renderizarTablaResumen();
}

function renderizarTablaResumen() {
    const tbody = document.getElementById('tabla-resumen-convivencia');
    if (!tbody) return;

    const c = convivencia.convivenciaMemoria;

    if (!c) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-3">No tienes una convivencia asignada</td></tr>';
        return;
    }

    let estadoBadge = '';
    switch (c.estado) {
        case 'activo':     estadoBadge = `<span class="badge rounded-pill px-3 py-2" style="background-color:#D1E7DD;color:#0F5132;">✓ Activa</span>`;           break;
        case 'entrevista': estadoBadge = `<span class="badge rounded-pill px-3 py-2" style="background-color:#FFF3CD;color:#856404;">⏳ En Entrevista</span>`;   break;
        case 'prueba':     estadoBadge = `<span class="badge rounded-pill px-3 py-2" style="background-color:#CFE2FF;color:#084298;">⚠️ Periodo de Prueba</span>`; break;
        default:           estadoBadge = `<span class="badge bg-secondary rounded-pill px-3 py-2">${c.estado}</span>`;
    }

    tbody.innerHTML = `
        <tr>
            <td class="fw-semibold">${c.anfitrion}</td>
            <td>${c.direccion}, ${c.ciudad}</td>
            <td>${c.fechaInicio || '-'}</td>
            <td>${estadoBadge}</td>
        </tr>
    `;
}

// ============================================
// MODAL GENÉRICO
// ============================================

function abrirModalGenerico(seccion) {
    const config = CONFIG_MODALES[seccion];
    if (!config) return;

    document.getElementById('modalTitle').textContent     = config.titulo;
    document.getElementById('modalFormContent').innerHTML = config.html;

    const form = document.getElementById('formGenerico');
    form.reset();
    form.querySelector('input[name="id_edit"]')?.remove();

    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalGenerico')).show();
}

// ============================================
// CONTROLES DE SECCIÓN (acciones + filtros)
// ============================================

function actualizarControlesSeccion(seccion) {
    const accionesGlobales   = document.getElementById('acciones-globales');
    const filtrosGlobales    = document.getElementById('filtros-globales');
    const filtrosEspecificos = document.getElementById('filtrosEspecificos');
    const filtroTexto        = document.getElementById('filtroTexto');

    if (!accionesGlobales || !filtrosGlobales) return;

    if (seccion === 'general' || seccion === 'convivencia' || seccion === 'perfil') {
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

    if (seccion === 'preferencias') {
        if (btnCrear)     { btnCrear.classList.remove('d-none');    btnCrear.innerHTML     = '<i class="bi bi-plus-circle me-2"></i> Añadir'; }
        if (btnEditar)    { btnEditar.innerHTML    = '<i class="bi bi-pencil me-2"></i> Editar'; }
        if (btnEliminar)  { btnEliminar.innerHTML  = '<i class="bi bi-x-circle me-2"></i> Desactivar'; }
        if (btnReactivar) { btnReactivar.classList.remove('d-none'); btnReactivar.innerHTML = '<i class="bi bi-check-circle me-2"></i> Activar'; }
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
        preferencias: { lista: preferencias.listaPreferenciasMemoria, renderizar: preferencias.renderizarPreferencias },
    };
    return configs[seccion];
}

function obtenerIdsSeleccionados(seccion) {
    const selectores = { preferencias: '.preferencia-checkbox' };
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

    if (seccion === 'preferencias') seleccionados = document.querySelectorAll('tbody .preferencia-checkbox:checked').length;

    const btnEditar    = document.getElementById('btnEditar');
    const btnEliminar  = document.getElementById('btnEliminar');
    const btnReactivar = document.getElementById('btnReactivar');

    if (btnEditar)   btnEditar.disabled   = (seleccionados !== 1);
    if (btnEliminar) btnEliminar.disabled = (seleccionados === 0);

    if (seccion === 'preferencias') {
        if (btnReactivar) btnReactivar.disabled = (obtenerIdsSeleccionadosInactivos(seccion).length === 0);
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
