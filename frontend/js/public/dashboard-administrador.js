import { initI18n, t, applyTranslations } from '../i18n.js';
import * as usuarios from '../admin/usuarios.js';
import * as roles     from '../admin/roles.js';
import * as criterios from '../admin/criterios.js';
import * as viviendas from '../admin/viviendas.js';

const FILTROS_POR_SECCION = {
    usuarios: [{ campo: 'estado', opciones: [['activo','filterActive'],['pendiente','filterPending'],['inactivo','filterInactive']] }],
    roles:    [{ campo: 'estado', opciones: [['activo','filterActive'],['inactivo','filterInactive']] }],
    viviendas:[{ campo: 'estado', opciones: [['disponible','filterAvailable'],['ocupada','filterOccupied'],['inactivo','filterInactive']] }],
    criterios:[{ campo: 'estado', opciones: [['activo','filterActive'],['inactivo','filterInactive']] }]
};

const CONFIG_MODALES = {
    usuarios: {
        getTitulo: () => t('admin.users.createTitle'),
        getHtml: () => `
            <div class="mb-3"><label class="form-label fw-bold">${t('admin.users.fullName')}</label><input name="nombre" class="form-control" placeholder="Ej: Juan Pérez" required></div>
            <div class="mb-3"><label class="form-label fw-bold">${t('admin.users.email')}</label><input type="email" name="email" class="form-control" placeholder="usuario@ejemplo.com" required></div>
            <div class="row">
                <div class="col-md-6 mb-3"><label class="form-label fw-bold">${t('admin.users.dni')}</label><input name="dni" class="form-control" required></div>
                <div class="col-md-6 mb-3"><label class="form-label fw-bold">${t('admin.users.phone')}</label><input name="tel" class="form-control" required></div>
            </div>
            <div class="mb-3">
                <label class="form-label fw-bold">${t('admin.users.role')}</label>
                <select name="rol" class="form-select">
                    <option value="inquilino">${t('admin.users.roleInquilino')}</option>
                    <option value="anfitrion">${t('admin.users.roleAnfitrion')}</option>
                </select>
            </div>`
    },
    viviendas: {
        getTitulo: () => t('admin.homes.createTitle'),
        getHtml: () => `
            <div class="mb-3"><label class="form-label fw-bold">${t('admin.homes.address')}</label><input name="direccion" class="form-control" required></div>
            <div class="mb-3"><label class="form-label fw-bold">${t('admin.homes.city')}</label><input name="ciudad" class="form-control" required></div>
            <div class="mb-3"><label class="form-label fw-bold">${t('admin.homes.freeSlots')}</label><input name="plazas_libres" class="form-control" required></div>
            <div class="mb-3"><label class="form-label fw-bold">${t('admin.homes.totalSlots')}</label><input name="plazas_totales" class="form-control" required></div>
            <div class="mb-3"><label class="form-label fw-bold">${t('admin.homes.host')}</label><input name="anfitrion" class="form-control" required></div>`
    },
    roles: {
        getTitulo: () => t('admin.roles.createTitle'),
        getHtml: () => `<div class="mb-3"><label class="form-label fw-bold">${t('admin.roles.roleName')}</label><input name="nombre" class="form-control" required></div>`
    },
    criterios: {
        getTitulo: () => t('admin.criteria.createTitle'),
        getHtml: () => `
            <div class="mb-3"><label class="form-label fw-bold">${t('admin.criteria.criteriaName')}</label><input name="nombre" class="form-control" required></div>
            <div class="mb-3"><label class="form-label fw-bold">${t('admin.criteria.option')}</label><input name="opcion" class="form-control" required></div>
            <div class="mb-3"><label class="form-label fw-bold">${t('admin.criteria.value')}</label><input name="valor" class="form-control" required></div>`
    }
};

const sectionTitles = {
    general:  () => t('admin.sections.general.title'),
    usuarios: () => t('admin.sections.users.title'),
    roles:    () => t('admin.sections.roles.title'),
    viviendas:() => t('admin.sections.homes.title'),
    criterios:() => t('admin.sections.criteria.title')
};

const sectionDescriptions = {
    general:  () => t('admin.sections.general.description'),
    usuarios: () => t('admin.sections.users.description'),
    roles:    () => t('admin.sections.roles.description'),
    viviendas:() => t('admin.sections.homes.description'),
    criterios:() => t('admin.sections.criteria.description')
};

document.addEventListener('DOMContentLoaded', async function() {
    await initI18n();
    applyTranslations();

    const seccionActiva = document.querySelector('.section-link.active-custom')?.getAttribute('data-section');
    actualizarControlesSeccion(seccionActiva);
    cargarSeguimientoConvivencias();

    document.getElementById('btnPerfil')?.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionName = 'perfil';
        document.querySelectorAll('.section-content').forEach(c => c.classList.remove('active'));
        document.querySelectorAll('.section-link').forEach(l => { l.classList.remove('active-custom'); l.classList.add('text-muted'); });
        document.querySelector(`.section-content[data-section="${sectionName}"]`)?.classList.add('active');
        document.getElementById('acciones-globales').classList.add('d-none');
        document.getElementById('filtros-globales').classList.add('d-none');
    });

    document.getElementById('btnCrear')?.addEventListener('click', () => {
        const seccionActual = document.querySelector('.section-link.active-custom')?.getAttribute('data-section') || 'usuarios';
        abrirModalGenerico(seccionActual);
    });

    document.getElementById('btnEditar')?.addEventListener('click', () => {
        const seccion = document.querySelector('.section-link.active-custom').getAttribute('data-section');
        let seleccionado;
        if (seccion === 'usuarios')  seleccionado = document.querySelector('tbody .usuario-checkbox:checked');
        else if (seccion === 'roles')     seleccionado = document.querySelector('tbody .rol-checkbox:checked');
        else if (seccion === 'criterios') seleccionado = document.querySelector('tbody .criterio-checkbox:checked');
        else if (seccion === 'viviendas') seleccionado = document.querySelector('tbody .vivienda-checkbox:checked');
        if (!seleccionado) return;

        const id   = parseInt(seleccionado.value);
        abrirModalGenerico(seccion);
        const form = document.getElementById('formGenerico');
        form.insertAdjacentHTML('beforeend', `<input type="hidden" name="id_edit" value="${id}">`);

        if (seccion === 'usuarios') {
            const u = usuarios.listaUsuariosMemoria.find(x => x.id === id);
            if (u) {
                form.querySelector('[name="nombre"]').value = u.nombre;
                form.querySelector('[name="email"]').value  = u.email;
                form.querySelector('[name="dni"]').value    = u.dni;
                form.querySelector('[name="tel"]').value    = u.telefono;
                form.querySelector('[name="rol"]').value    = u.rol;
                document.getElementById('modalTitle').textContent = `${t('admin.users.editTitle')}: ${u.nombre}`;
            }
        } else if (seccion === 'roles') {
            const r = roles.listaRolesMemoria.find(x => x.id === id);
            if (r) {
                form.querySelector('[name="nombre"]').value = r.nombre;
                document.getElementById('modalTitle').textContent = `${t('admin.roles.editTitle')}: ${r.nombre}`;
            }
        } else if (seccion === 'criterios') {
            const c = criterios.listaCriteriosMemoria.find(x => x.id === id);
            if (c) {
                form.querySelector('[name="nombre"]').value = c.criterio;
                form.querySelector('[name="opcion"]').value = c.opcion;
                form.querySelector('[name="valor"]').value  = c.valor;
                document.getElementById('modalTitle').textContent = `${t('admin.criteria.editTitle')}: ${c.criterio}`;
            }
        } else if (seccion === 'viviendas') {
            const v = viviendas.listaViviendasMemoria.find(x => x.id === id);
            if (v) {
                form.querySelector('[name="direccion"]').value     = v.direccion;
                form.querySelector('[name="ciudad"]').value        = v.ciudad;
                form.querySelector('[name="plazas_libres"]').value = v.plazas_libres;
                form.querySelector('[name="plazas_totales"]').value= v.plazas_totales;
                form.querySelector('[name="anfitrion"]').value     = v.anfitrion;
                document.getElementById('modalTitle').textContent = `${t('admin.homes.editTitle')}: ${v.direccion}`;
            }
        }
    });

    let _pendingEliminar = null;
    let _pendingReactivar = null;

    document.getElementById('btnEliminar')?.addEventListener('click', () => {
        const seccion = document.querySelector('.section-link.active-custom').getAttribute('data-section');
        const seleccionados = obtenerIdsSeleccionados(seccion);
        if (seleccionados.length === 0) return;
        _pendingEliminar = { seccion, seleccionados };
        const msg = document.getElementById('modalConfirmarEliminarMsg');
        if (msg) msg.textContent = `${t('modal.confirmDeleteBody')} (${seleccionados.length})`;
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalConfirmarEliminar')).show();
    });

    document.getElementById('btnConfirmarEliminar')?.addEventListener('click', () => {
        if (_pendingEliminar) {
            desactivarSeleccion(_pendingEliminar.seccion, _pendingEliminar.seleccionados);
            aplicarFiltros();
            actualizarBotones();
            _pendingEliminar = null;
        }
        bootstrap.Modal.getInstance(document.getElementById('modalConfirmarEliminar')).hide();
    });

    document.getElementById('btnReactivar')?.addEventListener('click', () => {
        const seccion = document.querySelector('.section-link.active-custom').getAttribute('data-section');
        const seleccionados = obtenerIdsSeleccionadosInactivos(seccion);
        if (seleccionados.length === 0) return;
        _pendingReactivar = { seccion, seleccionados };
        const msg = document.getElementById('modalConfirmarReactivarMsg');
        if (msg) msg.textContent = `${t('modal.confirmReactivateBody')} (${seleccionados.length})`;
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalConfirmarReactivar')).show();
    });

    document.getElementById('btnConfirmarReactivar')?.addEventListener('click', () => {
        if (_pendingReactivar) {
            reactivarSeleccion(_pendingReactivar.seccion, _pendingReactivar.seleccionados);
            aplicarFiltros();
            actualizarBotones();
            _pendingReactivar = null;
        }
        bootstrap.Modal.getInstance(document.getElementById('modalConfirmarReactivar')).hide();
    });

    document.getElementById('filtroTexto')?.addEventListener('input', aplicarFiltros);
    document.getElementById('filtros-globales')?.addEventListener('change', (e) => {
        if (e.target.matches('[data-filtro-campo]')) aplicarFiltros();
    });
    document.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') actualizarBotones();
    });

    document.getElementById('formGenerico')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const seccionActual = document.querySelector('.section-link.active-custom').getAttribute('data-section');
        const data = Object.fromEntries(new FormData(this));

        if (seccionActual === 'usuarios') usuarios.cargarUsuarios();
        if (seccionActual === 'roles')    roles.cargarRoles();
        if (seccionActual === 'criterios')criterios.cargarCriterios();
        if (seccionActual === 'viviendas')viviendas.cargarViviendas();
        aplicarFiltros();
        bootstrap.Modal.getInstance(document.getElementById('modalGenerico')).hide();
    });

    // Perfil
    document.querySelectorAll('[data-toggle-pwd]').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = document.getElementById(btn.dataset.togglePwd);
            const icon  = btn.querySelector('i');
            input.type = input.type === 'password' ? 'text' : 'password';
            icon.className = input.type === 'password' ? 'bi bi-eye' : 'bi bi-eye-slash';
        });
    });

    document.getElementById('perfil-btnEditar')?.addEventListener('click', () => {
        Array.from(document.querySelectorAll('#perfil-form input')).forEach(inp => inp.disabled = false);
        document.getElementById('perfil-btnEditar').classList.add('d-none');
        document.getElementById('perfil-acciones').classList.remove('d-none');
    });

    document.getElementById('perfil-btnCancelar')?.addEventListener('click', () => {
        Array.from(document.querySelectorAll('#perfil-form input')).forEach(inp => inp.disabled = true);
        document.getElementById('perfil-btnEditar').classList.remove('d-none');
        document.getElementById('perfil-acciones').classList.add('d-none');
    });

    document.getElementById('perfil-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        Array.from(document.querySelectorAll('#perfil-form input')).forEach(inp => inp.disabled = true);
        document.getElementById('perfil-btnEditar').classList.remove('d-none');
        document.getElementById('perfil-acciones').classList.add('d-none');
        alert(t('profile.savedSuccess'));
    });

    document.getElementById('perfil-form-pwd')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const nueva    = document.getElementById('pwd-nueva').value;
        const confirma = document.getElementById('pwd-confirmar').value;
        if (nueva.length < 8) { alert(t('profile.passwordTooShort')); return; }
        if (nueva !== confirma) { alert(t('profile.passwordMismatch')); return; }
        document.getElementById('perfil-form-pwd').reset();
        alert(t('profile.passwordUpdated'));
    });

    document.getElementById('btnEliminarCuenta')?.addEventListener('click', () => {
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEliminarCuenta')).show();
    });

    document.getElementById('btnConfirmarEliminarCuenta')?.addEventListener('click', () => {
        bootstrap.Modal.getInstance(document.getElementById('modalEliminarCuenta')).hide();
        alert(t('profile.deleteSuccess'));
        setTimeout(() => { window.location.href = 'public.html'; }, 2000);
    });

    // Navegación
    document.querySelectorAll('.section-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionName = link.getAttribute('data-section');
            actualizarControlesSeccion(sectionName);

            document.querySelectorAll('.section-content').forEach(c => c.classList.remove('active'));
            document.querySelectorAll('.section-link').forEach(l => { l.classList.remove('active-custom'); l.classList.add('text-muted'); });
            actualizarBotones();

            document.querySelector(`.section-content[data-section="${sectionName}"]`)?.classList.add('active');
            link.classList.add('active-custom');
            link.classList.remove('text-muted');

            switch(sectionName) {
                case 'general':   cargarSeguimientoConvivencias(); break;
                case 'usuarios':  usuarios.cargarUsuarios();  break;
                case 'roles':     roles.cargarRoles();        break;
                case 'viviendas': viviendas.cargarViviendas();break;
                case 'criterios': criterios.cargarCriterios();break;
            }

            aplicarFiltros();
            document.getElementById('section-title').textContent       = sectionTitles[sectionName]?.()       || '';
            document.getElementById('section-description').textContent = sectionDescriptions[sectionName]?.() || '';
        });
    });
});

function cargarSeguimientoConvivencias() {
    const convivencias = [
        { id:1, anfitrion:'Mercedes Rosas',  inquilino:'Luis Martínez', inicio:'01/02/2026', estado:'activa'     },
        { id:2, anfitrion:'Ramón Vázquez',   inquilino:'Marta Soto',    inicio:null,          estado:'entrevista' },
        { id:3, anfitrion:'Carmen Cid',      inquilino:'Javier López',  inicio:'15/03/2026', estado:'prueba'     }
    ];
    renderizarConvivencias(convivencias);
}

function renderizarConvivencias(convivencias) {
    const tbody = document.getElementById('tabla-convivencias');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (convivencias.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center">${t('admin.convivencias.noActive')}</td></tr>`;
        return;
    }

    convivencias.forEach(c => {
        const badges = {
            activa:     `<span class="badge rounded-pill px-3 py-2" style="background-color:#D1E7DD;color:#0F5132;">✓ ${t('anfitrion.convivencias.statusActive').replace('✓ ','')}</span>`,
            entrevista: `<span class="badge rounded-pill px-3 py-2" style="background-color:#FFF3CD;color:#856404;">${t('anfitrion.convivencias.statusInterview')}</span>`,
            prueba:     `<span class="badge rounded-pill px-3 py-2" style="background-color:#CFE2FF;color:#084298;">${t('anfitrion.convivencias.statusTrial')}</span>`
        };
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="fw-semibold">${c.anfitrion}</td>
            <td>${c.inquilino}</td>
            <td>${c.inicio || '-'}</td>
            <td>${badges[c.estado] || c.estado}</td>
        `;
        tbody.appendChild(row);
    });
}

function abrirModalGenerico(seccion) {
    const config = CONFIG_MODALES[seccion];
    if (!config) return;

    document.getElementById('modalTitle').textContent    = config.getTitulo();
    document.getElementById('modalFormContent').innerHTML = config.getHtml();

    const form = document.getElementById('formGenerico');
    form.reset();
    form.querySelector('input[name="id_edit"]')?.remove();

    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalGenerico')).show();
}

function obtenerIdsSeleccionados(seccion) {
    const selectores = { usuarios: '.usuario-checkbox', roles: '.rol-checkbox', criterios: '.criterio-checkbox', viviendas: '.vivienda-checkbox' };
    const selector = selectores[seccion];
    if (!selector) return [];
    return Array.from(document.querySelectorAll(`tbody ${selector}:checked`)).map(cb => cb.value);
}

function obtenerIdsSeleccionadosInactivos(seccion) {
    const config = obtenerConfigSeccion(seccion);
    if (!config) return [];
    return obtenerIdsSeleccionados(seccion).filter(id => {
        const item = config.lista.find(el => String(el.id) === id);
        return item?.estado === 'inactivo';
    });
}

function obtenerConfigSeccion(seccion) {
    return {
        usuarios: { lista: usuarios.listaUsuariosMemoria, renderizar: usuarios.renderizarUsuarios, reactivar: usuarios.reactivarUsuarios, desactivar: usuarios.desactivarUsuarios },
        roles:    { lista: roles.listaRolesMemoria,     renderizar: roles.renderizarRoles,     reactivar: roles.reactivarRoles,     desactivar: roles.desactivarRoles     },
        criterios:{ lista: criterios.listaCriteriosMemoria, renderizar: criterios.renderizarCriterios, reactivar: criterios.reactivarCriterios, desactivar: criterios.desactivarCriterios },
        viviendas:{ lista: viviendas.listaViviendasMemoria, renderizar: viviendas.renderizarViviendas, reactivar: viviendas.reactivarViviendas, desactivar: viviendas.desactivarViviendas }
    }[seccion];
}

function actualizarControlesSeccion(seccion) {
    const accionesGlobales   = document.getElementById('acciones-globales');
    const filtrosGlobales    = document.getElementById('filtros-globales');
    const filtrosEspecificos = document.getElementById('filtrosEspecificos');
    const filtroTexto        = document.getElementById('filtroTexto');
    if (!accionesGlobales || !filtrosGlobales) return;

    if (seccion === 'general') {
        accionesGlobales.classList.replace('d-flex','d-none');
        filtrosGlobales.classList.replace('d-flex','d-none');
        if (filtrosEspecificos) filtrosEspecificos.innerHTML = '';
        if (filtroTexto) filtroTexto.value = '';
        return;
    }
    accionesGlobales.classList.replace('d-none','d-flex');
    filtrosGlobales.classList.replace('d-none','d-flex');
    configurarFiltros(seccion);
}

function configurarFiltros(seccion) {
    const contenedor = document.getElementById('filtrosEspecificos');
    const texto      = document.getElementById('filtroTexto');
    if (!contenedor) return;
    if (texto) texto.value = '';
    contenedor.innerHTML = '';

    (FILTROS_POR_SECCION[seccion] || []).forEach(filtro => {
        const secKey = seccion === 'usuarios' ? 'admin.users' : seccion === 'roles' ? 'admin.roles' : seccion === 'viviendas' ? 'admin.homes' : 'admin.criteria';
        const select = document.createElement('select');
        select.className = 'form-select';
        select.style.width = 'auto';
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

function reactivarSeleccion(seccion, ids) { obtenerConfigSeccion(seccion)?.reactivar?.(ids); }
function desactivarSeleccion(seccion, ids) { obtenerConfigSeccion(seccion)?.desactivar?.(ids); }

function actualizarBotones() {
    const seccion = document.querySelector('.section-link.active-custom')?.getAttribute('data-section');
    const selectores = { usuarios: '.usuario-checkbox', roles: '.rol-checkbox', criterios: '.criterio-checkbox', viviendas: '.vivienda-checkbox' };
    const seleccionados = document.querySelectorAll(`tbody ${selectores[seccion] || '.noexiste'}:checked`).length;

    const btnEditar    = document.getElementById('btnEditar');
    const btnEliminar  = document.getElementById('btnEliminar');
    const btnReactivar = document.getElementById('btnReactivar');
    if (btnEditar && btnEliminar && btnReactivar) {
        btnEditar.disabled    = (seleccionados !== 1);
        btnEliminar.disabled  = (seleccionados === 0);
        btnReactivar.disabled = (obtenerIdsSeleccionadosInactivos(seccion).length === 0);
    }
}

window.verUsuario = function(id) {
    const u = usuarios.listaUsuariosMemoria.find(x => x.id === id);
    if (!u) return;

    const estadoBadge = u.estado === 'activo'
        ? `<span class="badge bg-success">${t('admin.users.statusActive')}</span>`
        : u.estado === 'inactivo'
            ? `<span class="badge bg-secondary">${t('admin.users.statusInactive')}</span>`
            : `<span class="badge bg-warning text-dark">${t('admin.users.statusPending')}</span>`;

    const rolBadge = u.rol === 'anfitrion'
        ? `<span class="badge bg-success-subtle text-success">${t('admin.users.roleAnfitrion')}</span>`
        : `<span class="badge bg-info-subtle text-info">${t('admin.users.roleInquilino')}</span>`;

    document.getElementById('modalDetalleTitle').textContent = `${t('admin.users.detailTitle')}: ${u.nombre}`;
    document.getElementById('modalDetalleContent').innerHTML = `
        <div class="row"><div class="col-md-6"><h6 class="text-muted small mb-2">${t('admin.users.fullName')}</h6><p class="fw-semibold">${u.nombre}</p></div>
        <div class="col-md-6"><h6 class="text-muted small mb-2">${t('admin.users.email')}</h6><p class="fw-semibold">${u.email}</p></div></div>
        <div class="row"><div class="col-md-6"><h6 class="text-muted small mb-2">${t('admin.users.dni')}</h6><p class="fw-semibold">${u.dni}</p></div>
        <div class="col-md-6"><h6 class="text-muted small mb-2">${t('admin.users.phone')}</h6><p class="fw-semibold">${u.telefono}</p></div></div>
        <div class="row"><div class="col-md-6"><h6 class="text-muted small mb-2">${t('admin.users.role')}</h6><p>${rolBadge}</p></div>
        <div class="col-md-6"><h6 class="text-muted small mb-2">${t('common.status')}</h6><p>${estadoBadge}</p></div></div>
        <div class="row"><div class="col-md-12"><h6 class="text-muted small mb-2">${t('admin.users.registerDate')}</h6><p class="fw-semibold">${u.fechaRegistro}</p></div></div>
    `;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalDetalle')).show();
};

window.verVivienda = function(id) {
    const v = viviendas.listaViviendasMemoria.find(x => x.id === id);
    if (!v) return;

    const estadoBadge = v.estado === 'ocupada'
        ? `<span class="badge bg-success">${t('admin.homes.statusOccupied')}</span>`
        : v.estado === 'inactivo'
            ? `<span class="badge bg-secondary">${t('admin.homes.statusInactive')}</span>`
            : `<span class="badge bg-info">${t('admin.homes.statusAvailable')}</span>`;

    document.getElementById('modalDetalleTitle').textContent = `${t('admin.homes.detailTitle')}: ${v.direccion}`;
    document.getElementById('modalDetalleContent').innerHTML = `
        <div class="row"><div class="col-md-12"><h6 class="text-muted small mb-2">${t('admin.homes.address')}</h6><p class="fw-semibold">${v.direccion}</p></div></div>
        <div class="row"><div class="col-md-6"><h6 class="text-muted small mb-2">${t('admin.homes.city')}</h6><p class="fw-semibold">${v.ciudad}</p></div>
        <div class="col-md-6"><h6 class="text-muted small mb-2">${t('admin.homes.host')}</h6><p class="fw-semibold">${v.anfitrion}</p></div></div>
        <div class="row"><div class="col-md-6"><h6 class="text-muted small mb-2">${t('admin.homes.totalSlots')}</h6><p class="fw-semibold">${v.plazas_totales}</p></div>
        <div class="col-md-6"><h6 class="text-muted small mb-2">${t('admin.homes.freeSlots')}</h6><p class="fw-semibold text-success">${v.plazas_libres}</p></div></div>
        <div class="row"><div class="col-md-12"><h6 class="text-muted small mb-2">${t('common.status')}</h6><p>${estadoBadge}</p></div></div>
    `;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalDetalle')).show();
};

window.verRol = function(id) {
    const r = roles.listaRolesMemoria.find(x => x.id === id);
    if (!r) return;

    const estadoBadge = r.estado === 'activo'
        ? `<span class="badge bg-success">${t('common.active')}</span>`
        : `<span class="badge bg-secondary">${t('common.inactive')}</span>`;

    document.getElementById('modalDetalleTitle').textContent = `${t('admin.roles.detailTitle')}: ${r.nombre}`;
    document.getElementById('modalDetalleContent').innerHTML = `
        <div class="row"><div class="col-md-12"><h6 class="text-muted small mb-2">${t('admin.roles.roleName')}</h6><p class="fw-semibold">${r.nombre}</p></div></div>
        <div class="row"><div class="col-md-12"><h6 class="text-muted small mb-2">${t('common.status')}</h6><p>${estadoBadge}</p></div></div>
    `;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalDetalle')).show();
};

window.verCriterio = function(id) {
    const c = criterios.listaCriteriosMemoria.find(x => x.id === id);
    if (!c) return;

    const estadoBadge = c.estado === 'activo'
        ? `<span class="badge bg-success">${t('common.active')}</span>`
        : `<span class="badge bg-secondary">${t('common.inactive')}</span>`;

    document.getElementById('modalDetalleTitle').textContent = `${t('admin.criteria.detailTitle')}: ${c.criterio}`;
    document.getElementById('modalDetalleContent').innerHTML = `
        <div class="row"><div class="col-md-12"><h6 class="text-muted small mb-2">${t('admin.criteria.compatibilityCriteria')}</h6><p class="fw-semibold">${c.criterio}</p></div></div>
        <div class="row"><div class="col-md-6"><h6 class="text-muted small mb-2">${t('admin.criteria.option')}</h6><p class="fw-semibold">${c.opcion}</p></div>
        <div class="col-md-6"><h6 class="text-muted small mb-2">${t('admin.criteria.value')}</h6><p class="fw-semibold">${c.valor}</p></div></div>
        <div class="row"><div class="col-md-12"><h6 class="text-muted small mb-2">${t('common.status')}</h6><p>${estadoBadge}</p></div></div>
    `;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalDetalle')).show();
};
