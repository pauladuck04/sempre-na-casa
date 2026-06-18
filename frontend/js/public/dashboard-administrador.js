import { initI18n, t, applyTranslations } from '../i18n.js';
import * as usuarios from '../admin/usuarios.js';
import * as roles     from '../admin/roles.js';
import * as criterios from '../admin/criterios.js';
import * as viviendas from '../admin/viviendas.js';

const FILTROS_POR_SECCION = {
    usuarios: [{ campo: 'estado', opciones: [['activo','filterActive'],['inactivo','filterInactive']] }],
    roles:    [{ campo: 'estado', opciones: [['activo','filterActive'],['inactivo','filterInactive']] }],
    viviendas:[{ campo: 'estado', opciones: [['disponible','filterAvailable'],['ocupada','filterOccupied'],['inactivo','filterInactive']] }],
    criterios:[{ campo: 'estado', opciones: [['activo','filterActive'],['inactivo','filterInactive']] }],
    opciones: [{ campo: 'estado', opciones: [['activo','filterActive'],['inactivo','filterInactive']] }]
};

const CONFIG_MODALES = {
    usuarios: {
        getTitulo: () => t('admin.users.createTitle'),
        getHtml: () => {
            const rolesOpts = roles.listaRolesMemoria.length > 0
                ? roles.listaRolesMemoria.map(r => `<option value="${r.id}">${r.nombre}</option>`).join('')
                : '<option value="" disabled>No hay roles disponibles</option>';
            return `
            <div class="row">
                <div class="col-md-6 mb-3"><label class="form-label fw-bold">Nombre</label><input name="nombre_usuario" class="form-control" required></div>
                <div class="col-md-6 mb-3"><label class="form-label fw-bold">Apellidos</label><input name="apellidos" class="form-control" required></div>
            </div>
            <div class="mb-3"><label class="form-label fw-bold">${t('admin.users.email')}</label><input type="email" name="mail" class="form-control" required></div>
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">${t('admin.users.dni')}</label>
                    <input name="dni" class="form-control" required maxlength="9">
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">${t('admin.users.phone')}</label>
                    <input name="telefono" class="form-control" required maxlength="9">
                </div>
            </div>
            <div class="mb-3"><label class="form-label fw-bold">Contraseña</label><input type="password" name="password" class="form-control"></div>
            <div class="mb-3">
                <label class="form-label fw-bold">${t('admin.users.role')}</label>
                <select name="id_rol" class="form-select">${rolesOpts}</select>
            </div>`;
        }
    },
    viviendas: {
        getTitulo: () => t('admin.homes.createTitle'),
        getHtml: (anfitrionActualId = null) => {
            const tomados = new Set(viviendas.listaViviendasMemoria.filter(v => v.estado !== 'inactivo').map(v => Number(v.anfitrion)));
            const optsAnfitrion = usuarios.listaUsuariosMemoria
                .filter(u => !tomados.has(Number(u.id)) || Number(u.id) === Number(anfitrionActualId))
                .map(u => `<option value="${u.id}">${u.nombre} (${u.email})</option>`)
                .join('');
            return `
            <div class="mb-3"><label class="form-label fw-bold">${t('admin.homes.address')}</label><input name="direccion" class="form-control" required></div>
            <div class="mb-3"><label class="form-label fw-bold">${t('admin.homes.city')}</label><input name="ciudad" class="form-control" required></div>
            <div class="mb-3"><label class="form-label fw-bold">Descripción</label><input name="descripcion" class="form-control" required></div>
            <div class="mb-3"><label class="form-label fw-bold">${t('admin.homes.freeSlots')}</label><input type="number" name="plazas_libres" class="form-control" required></div>
            <div class="mb-3"><label class="form-label fw-bold">${t('admin.homes.totalSlots')}</label><input type="number" name="plazas_totales" class="form-control" required></div>
            <div class="mb-3">
                <label class="form-label fw-bold">${t('admin.homes.host')}</label>
                <select name="id_anfitrion" class="form-select" required>
                    <option value="">-- Selecciona anfitrión --</option>
                    ${optsAnfitrion || '<option value="" disabled>No hay anfitriones disponibles</option>'}
                </select>
            </div>`;
        }
    },
    roles: {
        getTitulo: () => t('admin.roles.createTitle'),
        getHtml: () => `<div class="mb-3"><label class="form-label fw-bold">${t('admin.roles.roleName')}</label><input name="nombre" class="form-control" required></div>`
    },
    criterios: {
        getTitulo: () => t('admin.criteria.createTitle'),
        getHtml: () => `
            <div class="mb-3"><label class="form-label fw-bold">${t('admin.criteria.criteriaName')}</label><input name="nombre" class="form-control" required></div>`
    },
    opciones: {
        getTitulo: () => t('admin.criteria.createOptionTitle'),
        getHtml: () => `
            <div class="mb-3">
                <label class="form-label fw-bold">${t('admin.criteria.criteriaName')}</label>
                <select name="criterio_id" class="form-select">
                    ${criterios.listaCriteriosMemoria.filter(c => c.estado === 'activo').map(c => `<option value="${c.id}">${c.nombre}</option>`).join('')}
                </select>
            </div>
            <div class="mb-3"><label class="form-label fw-bold">${t('admin.criteria.option')}</label><input name="opcion" class="form-control" required></div>
            <div class="mb-3"><label class="form-label fw-bold">${t('admin.criteria.value')}</label><input name="valor" class="form-control" required></div>`
    },
    convivencias: {
        getTitulo: () => 'Editar Estado de Convivencia',
        getHtml: () => `
            <div class="mb-3">
                <label class="form-label fw-bold">Estado</label>
                <select name="estado" class="form-select">
                    <option value="entrevista">⏳ En Entrevista</option>
                    <option value="prueba">⚠️ Periodo de Prueba</option>
                    <option value="activa">✓ Activa</option>
                    <option value="finalizada">✕ Finalizada</option>
                </select>
            </div>
            <input type="hidden" name="tipo" value="convivencia">`
    }
};

let listaConvivenciasMemoria = [];

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

function getActiveCriteriosSubTab() {
    const activeTabBtn = document.querySelector('#criteriosTabs .nav-link.active');
    return activeTabBtn?.getAttribute('data-bs-target') === '#tab-opciones' ? 'opciones' : 'criterios';
}

document.addEventListener('DOMContentLoaded', async function() {
    await initI18n();
    applyTranslations();

    const seccionActiva = document.querySelector('.section-link.active-custom')?.getAttribute('data-section');
    actualizarControlesSeccion(seccionActiva);
    cargarSeguimientoConvivencias();

    // Listener para cambio de pestaña en criterios
    document.querySelectorAll('#criteriosTabs .nav-link').forEach(tab => {
        tab.addEventListener('shown.bs.tab', () => {
            const subTab = getActiveCriteriosSubTab();
            configurarFiltros(subTab);
            aplicarFiltros();
            actualizarBotones();
        });
    });

    document.getElementById('btnPerfil')?.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionName = 'perfil';
        document.querySelectorAll('.section-content').forEach(c => c.classList.remove('active'));
        document.querySelectorAll('.section-link').forEach(l => { l.classList.remove('active-custom'); l.classList.add('text-muted'); });
        document.querySelector(`.section-content[data-section="${sectionName}"]`)?.classList.add('active');
        document.getElementById('acciones-globales').classList.add('d-none');
        document.getElementById('filtros-globales').classList.add('d-none');
    });

    document.getElementById('btnCrear')?.addEventListener('click', async () => {
        const seccion = document.querySelector('.section-link.active-custom')?.getAttribute('data-section') || 'usuarios';
        const efectiva = seccion === 'criterios' ? getActiveCriteriosSubTab() : seccion;
        if (efectiva === 'viviendas' && usuarios.listaUsuariosMemoria.length === 0) {
            await usuarios.cargarUsuarios();
        }
        if (efectiva === 'usuarios' && roles.listaRolesMemoria.length === 0) {
            await roles.cargarRoles();
        }
        abrirModalGenerico(efectiva);
    });

    document.getElementById('btnEditar')?.addEventListener('click', async () => {
        const seccion = document.querySelector('.section-link.active-custom').getAttribute('data-section');
        const efectiva = seccion === 'criterios' ? getActiveCriteriosSubTab() : seccion;

        if (efectiva === 'viviendas' && usuarios.listaUsuariosMemoria.length === 0) {
            await usuarios.cargarUsuarios();
        }
        if (efectiva === 'usuarios' && roles.listaRolesMemoria.length === 0) {
            await roles.cargarRoles();
        }

        let seleccionado;
        if (efectiva === 'usuarios')  seleccionado = document.querySelector('tbody .usuario-checkbox:checked');
        else if (efectiva === 'roles')     seleccionado = document.querySelector('tbody .rol-checkbox:checked');
        else if (efectiva === 'criterios') seleccionado = document.querySelector('tbody .criterio-checkbox:checked');
        else if (efectiva === 'opciones')  seleccionado = document.querySelector('tbody .opcion-checkbox:checked');
        else if (efectiva === 'viviendas') seleccionado = document.querySelector('tbody .vivienda-checkbox:checked');
        if (!seleccionado) return;

        const id = seleccionado.value;
        abrirModalGenerico(efectiva);
        const form = document.getElementById('formGenerico');
        form.insertAdjacentHTML('beforeend', `<input type="hidden" name="id_edit" value="${id}">`);

        if (efectiva === 'usuarios') {
            const u = usuarios.listaUsuariosMemoria.find(x => String(x.id) === id);
            if (u) {
                form.querySelector('[name="nombre_usuario"]').value = u.nombre_usuario;
                form.querySelector('[name="apellidos"]').value      = u.apellidos;
                form.querySelector('[name="mail"]').value           = u.email;
                form.querySelector('[name="dni"]').value            = u.dni;
                form.querySelector('[name="telefono"]').value       = u.telefono;
                const selRol = form.querySelector('[name="id_rol"]');
                if (selRol) Array.from(selRol.options).forEach(o => { o.selected = String(o.value) === String(u.id_rol); });
                document.getElementById('modalTitle').textContent = `${t('admin.users.editTitle')}: ${u.nombre}`;
            }
        } else if (efectiva === 'roles') {
            const r = roles.listaRolesMemoria.find(x => String(x.id) === id);
            if (r) {
                form.querySelector('[name="nombre"]').value = r.nombre;
                document.getElementById('modalTitle').textContent = `${t('admin.roles.editTitle')}: ${r.nombre}`;
            }
        } else if (efectiva === 'criterios') {
            const c = criterios.listaCriteriosMemoria.find(x => String(x.id) === id);
            if (c) {
                form.querySelector('[name="nombre"]').value = c.nombre;
                document.getElementById('modalTitle').textContent = `${t('admin.criteria.editTitle')}: ${c.nombre}`;
            }
        } else if (efectiva === 'opciones') {
            const o = criterios.listaOpcionesMemoria.find(x => String(x.id) === id);
            if (o) {
                const selCrit = form.querySelector('[name="criterio_id"]');
                if (selCrit) Array.from(selCrit.options).forEach(opt => { opt.selected = String(opt.value) === String(o.criterio_id); });
                form.querySelector('[name="opcion"]').value = o.opcion;
                form.querySelector('[name="valor"]').value  = o.valor;
                document.getElementById('modalTitle').textContent = `${t('admin.criteria.editOptionTitle')}: ${o.opcion}`;
            }
        } else if (efectiva === 'viviendas') {
            const v = viviendas.listaViviendasMemoria.find(x => String(x.id) === id);
            if (v) {
                document.getElementById('modalFormContent').innerHTML = CONFIG_MODALES.viviendas.getHtml(v.anfitrion);
                form.querySelector('[name="direccion"]').value      = v.direccion;
                form.querySelector('[name="ciudad"]').value         = v.ciudad;
                form.querySelector('[name="descripcion"]').value    = v.descripcion;
                form.querySelector('[name="plazas_libres"]').value  = v.plazas_libres;
                form.querySelector('[name="plazas_totales"]').value = v.plazas_totales;
                const selAnf = form.querySelector('[name="id_anfitrion"]');
                if (selAnf) Array.from(selAnf.options).forEach(opt => { opt.selected = String(opt.value) === String(v.anfitrion); });
                document.getElementById('modalTitle').textContent = `${t('admin.homes.editTitle')}: ${v.direccion}`;
            }
        }
    });

    let _pendingEliminar = null;
    let _pendingReactivar = null;

    document.getElementById('btnEliminar')?.addEventListener('click', async () => {
        const seccion = document.querySelector('.section-link.active-custom').getAttribute('data-section');
        const efectiva = seccion === 'criterios' ? getActiveCriteriosSubTab() : seccion;
        const seleccionados = obtenerIdsSeleccionados(efectiva);
        if (seleccionados.length === 0) return;

        if (efectiva === 'usuarios' || efectiva === 'viviendas') {
            const [resUV, resV] = await Promise.all([
                apiPost('usuario_vivienda', 'getAll'),
                efectiva === 'usuarios' ? apiPost('vivienda', 'getAll') : Promise.resolve({ ok: false })
            ]);
            const uvActivas = (resUV.ok && Array.isArray(resUV.resource))
                ? resUV.resource.filter(r => r.activo_usuario_vivienda == 1)
                : [];

            let bloqueado = false;
            if (efectiva === 'viviendas') {
                bloqueado = seleccionados.some(id => uvActivas.some(r => String(r.id_vivienda) === String(id)));
            } else {
                const viviendasData = (resV.ok && Array.isArray(resV.resource)) ? resV.resource : [];
                bloqueado = seleccionados.some(id => {
                    const esInquilino = uvActivas.some(r => String(r.id_usuario) === String(id));
                    const viviendasPropias = viviendasData.filter(v => String(v.id_anfitrion) === String(id));
                    const esAnfitrion = viviendasPropias.some(v => uvActivas.some(r => String(r.id_vivienda) === String(v.id_vivienda)));
                    return esInquilino || esAnfitrion;
                });
            }

            if (bloqueado) {
                mostrarToast('No se puede eliminar: hay convivencias activas asociadas.');
                return;
            }
        }

        _pendingEliminar = { seccion: efectiva, seleccionados };
        const msg = document.getElementById('modalConfirmarEliminarMsg');
        if (msg) msg.textContent = `${t('modal.confirmDeleteBody')} (${seleccionados.length})`;
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalConfirmarEliminar')).show();
    });

    document.getElementById('btnConfirmarEliminar')?.addEventListener('click', async () => {
        if (_pendingEliminar) {
            await desactivarSeleccion(_pendingEliminar.seccion, _pendingEliminar.seleccionados);
            aplicarFiltros();
            actualizarBotones();
            _pendingEliminar = null;
        }
        bootstrap.Modal.getInstance(document.getElementById('modalConfirmarEliminar')).hide();
    });

    document.getElementById('btnReactivar')?.addEventListener('click', () => {
        const seccion = document.querySelector('.section-link.active-custom').getAttribute('data-section');
        const efectiva = seccion === 'criterios' ? getActiveCriteriosSubTab() : seccion;
        const seleccionados = obtenerIdsSeleccionadosInactivos(efectiva);
        if (seleccionados.length === 0) return;
        _pendingReactivar = { seccion: efectiva, seleccionados };
        const msg = document.getElementById('modalConfirmarReactivarMsg');
        if (msg) msg.textContent = `${t('modal.confirmReactivateBody')} (${seleccionados.length})`;
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalConfirmarReactivar')).show();
    });

    document.getElementById('btnConfirmarReactivar')?.addEventListener('click', async () => {
        if (_pendingReactivar) {
            await reactivarSeleccion(_pendingReactivar.seccion, _pendingReactivar.seleccionados);
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

    document.getElementById('formGenerico')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        try {
        const seccionActual = document.querySelector('.section-link.active-custom').getAttribute('data-section');
        const data = Object.fromEntries(new FormData(this));

        if (data.tipo === 'convivencia') {
            const c = listaConvivenciasMemoria.find(x => x.id === parseInt(data.id_edit));
            if (c) c.estado = data.estado;
            renderizarConvivencias(listaConvivenciasMemoria);
        }

        if (seccionActual === 'viviendas') {
            const params = {
                descripcion:    data.descripcion,
                plazas_libres:  data.plazas_libres,
                plazas_totales: data.plazas_totales,
                direccion:      data.direccion,
                ciudad:         data.ciudad,
                id_anfitrion:   data.id_anfitrion
            };
            if (data.id_edit) {
                params.id_vivienda = data.id_edit;
                const res = await apiPost('vivienda', 'EDIT', params);
                if (!res.ok) { alert('Error al guardar vivienda: ' + (res.code || 'desconocido')); return; }
            } else {
                const res = await apiPost('vivienda', 'ADD', params);
                if (!res.ok) { alert('Error al crear vivienda: ' + (res.code || 'desconocido')); return; }
            }
            viviendas.listaViviendasMemoria.splice(0);
            await viviendas.cargarViviendas();
        } else if (seccionActual === 'usuarios') {
            if (!/^[0-9]{8}[A-Z]$/.test(data.dni)) {
                mostrarToast('El DNI debe tener 8 dígitos seguidos de una letra mayúscula (ej: 12345678A).');
                return;
            }
            if (!/^[0-9]{9}$/.test(data.telefono)) {
                mostrarToast('El teléfono debe tener exactamente 9 dígitos.');
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.mail)) {
                mostrarToast('El formato del email no es válido.');
                return;
            }
            if (!data.id_edit && !data.password) {
                alert('La contraseña es obligatoria para crear un nuevo usuario.');
                return;
            }
            const params = {
                nombre_usuario: data.nombre_usuario,
                apellidos:      data.apellidos,
                mail:           data.mail,
                dni:            data.dni,
                telefono:       data.telefono,
                id_rol:         data.id_rol
            };
            if (data.id_edit) {
                params.id_usuario = data.id_edit;
                if (data.password) params.password = data.password;
                const res = await apiPost('usuario', 'EDIT', params);
                if (!res.ok) { alert('Error al guardar: ' + (res.code || 'desconocido')); return; }
            } else {
                params.password = data.password;
                const res = await apiPost('usuario', 'ADD', params);
                if (!res.ok) { alert('Error al crear usuario: ' + (res.code || 'desconocido')); return; }
            }
            usuarios.listaUsuariosMemoria.splice(0);
            await usuarios.cargarUsuarios();
        } else if (seccionActual === 'roles') {
            const params = { nombre_rol: data.nombre };
            if (data.id_edit) {
                params.id_rol = data.id_edit;
                const res = await apiPost('rol', 'EDIT', params);
                if (!res.ok) { alert('Error al guardar rol: ' + (res.code || 'desconocido')); return; }
            } else {
                const res = await apiPost('rol', 'ADD', params);
                if (!res.ok) { alert('Error al crear rol: ' + (res.code || 'desconocido')); return; }
            }
            roles.listaRolesMemoria.splice(0);
            await roles.cargarRoles();
        } else if (seccionActual === 'criterios') {
            const subTab = getActiveCriteriosSubTab();
            if (subTab === 'opciones') {
                const params = {
                    nombre_opcion: data.opcion,
                    valor:         data.valor,
                    id_criterio:   data.criterio_id
                };
                if (data.id_edit) {
                    params.id_opcion = data.id_edit;
                    const res = await apiPost('opcion', 'EDIT', params);
                    if (!res.ok) { alert('Error al guardar opción: ' + (res.code || 'desconocido')); return; }
                } else {
                    const res = await apiPost('opcion', 'ADD', params);
                    if (!res.ok) { alert('Error al crear opción: ' + (res.code || 'desconocido')); return; }
                }
            } else {
                const params = { nombre_criterio: data.nombre };
                if (data.id_edit) {
                    params.id_criterio = data.id_edit;
                    const res = await apiPost('criterio', 'EDIT', params);
                    if (!res.ok) { alert('Error al guardar criterio: ' + (res.code || 'desconocido')); return; }
                } else {
                    const res = await apiPost('criterio', 'ADD', params);
                    if (!res.ok) { alert('Error al crear criterio: ' + (res.code || 'desconocido')); return; }
                }
            }
            criterios.listaCriteriosMemoria.splice(0);
            criterios.listaOpcionesMemoria.splice(0);
            await criterios.cargarCriterios();
        }

        aplicarFiltros();
        bootstrap.Modal.getInstance(document.getElementById('modalGenerico')).hide();
        } catch(err) { alert('ERROR en submit: ' + err.message); console.error(err); }
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
                case 'usuarios':
                    roles.cargarRoles().then(() => usuarios.cargarUsuarios());
                    break;
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

async function cargarSeguimientoConvivencias() {
    const [resUV, resV, resU] = await Promise.all([
        apiPost('usuario_vivienda', 'getAll'),
        apiPost('vivienda', 'getAll'),
        apiPost('usuario', 'getAll')
    ]);

    const viviendasData = (resV.ok && Array.isArray(resV.resource)) ? resV.resource : [];
    const usuariosData  = (resU.ok && Array.isArray(resU.resource)) ? resU.resource : [];
    const relaciones    = (resUV.ok && Array.isArray(resUV.resource)) ? resUV.resource : [];

    const nombreCompleto = id => {
        const u = usuariosData.find(u => u.id_usuario == id);
        return u ? `${u.nombre_usuario} ${u.apellidos}`.trim() : `Usuario ${id}`;
    };

    listaConvivenciasMemoria = relaciones.map(r => {
        const vivienda = viviendasData.find(v => v.id_vivienda == r.id_vivienda);
        return {
            id:           `${r.id_usuario}_${r.id_vivienda}`,
            anfitrion:    vivienda ? nombreCompleto(vivienda.id_anfitrion) : '-',
            inquilino:    nombreCompleto(r.id_usuario),
            estado:       r.activo_usuario_vivienda == 1 ? 'activo' : 'inactivo',
            fecha_inicio: r.fecha_inicio || '-',
            fecha_fin:    r.fecha_fin    || '-'
        };
    });

    renderizarConvivencias(listaConvivenciasMemoria);
}

function renderizarConvivencias(convivencias) {
    const tbody = document.getElementById('tabla-convivencias');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (convivencias.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-3">${t('admin.convivencias.noActive')}</td></tr>`;
        return;
    }

    convivencias.forEach(c => {
        const activo = c.estado === 'activo';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="fw-semibold">${c.anfitrion}</td>
            <td>${c.inquilino}</td>
            <td>
                <span class="badge rounded-pill px-3 ${activo ? 'bg-success' : 'bg-secondary'}">
                    ${activo ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td class="text-muted small">${c.fecha_inicio}</td>
            <td class="text-muted small">${c.fecha_fin}</td>
        `;
        tbody.appendChild(row);
    });
}

window.editarConvivencia = function(id) {
    const c = listaConvivenciasMemoria.find(x => x.id === id);
    if (!c) return;

    abrirModalGenerico('convivencias');

    const form = document.getElementById('formGenerico');
    form.querySelector('[name="estado"]').value = c.estado;
    form.insertAdjacentHTML('beforeend', `<input type="hidden" name="id_edit" value="${id}">`);
    document.getElementById('modalTitle').textContent = `Editar Convivencia: ${c.anfitrion} — ${c.inquilino}`;
};

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

function obtenerIdsSeleccionados(seccionEfectiva) {
    const selectores = {
        usuarios: '.usuario-checkbox',
        roles: '.rol-checkbox',
        criterios: '.criterio-checkbox',
        opciones: '.opcion-checkbox',
        viviendas: '.vivienda-checkbox'
    };
    const selector = selectores[seccionEfectiva];
    if (!selector) return [];
    return Array.from(document.querySelectorAll(`tbody ${selector}:checked`)).map(cb => cb.value);
}

function obtenerIdsSeleccionadosInactivos(seccionEfectiva) {
    const config = obtenerConfigSeccion(seccionEfectiva);
    if (!config) return [];
    return obtenerIdsSeleccionados(seccionEfectiva).filter(id => {
        const item = config.lista.find(el => String(el.id) === id);
        return item?.estado === 'inactivo';
    });
}

function obtenerConfigSeccion(seccion) {
    return {
        usuarios: { lista: usuarios.listaUsuariosMemoria, renderizar: usuarios.renderizarUsuarios, reactivar: usuarios.reactivarUsuarios, desactivar: usuarios.desactivarUsuarios },
        roles:    { lista: roles.listaRolesMemoria,     renderizar: roles.renderizarRoles,     reactivar: roles.reactivarRoles,     desactivar: roles.desactivarRoles     },
        criterios:{ lista: criterios.listaCriteriosMemoria, renderizar: criterios.renderizarCriterios, reactivar: criterios.reactivarCriterios, desactivar: criterios.desactivarCriterios },
        opciones: { lista: criterios.listaOpcionesMemoria, renderizar: criterios.renderizarOpciones, reactivar: criterios.reactivarOpciones, desactivar: criterios.desactivarOpciones },
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
    const subSeccion = seccion === 'criterios' ? getActiveCriteriosSubTab() : seccion;
    configurarFiltros(subSeccion);
}

function configurarFiltros(seccion) {
    const contenedor = document.getElementById('filtrosEspecificos');
    const texto      = document.getElementById('filtroTexto');
    if (!contenedor) return;
    if (texto) texto.value = '';
    contenedor.innerHTML = '';

    const secKeyMap = {
        usuarios: 'admin.users',
        roles: 'admin.roles',
        viviendas: 'admin.homes',
        criterios: 'admin.criteria',
        opciones: 'admin.criteria'
    };
    const secKey = secKeyMap[seccion] || 'admin.criteria';

    (FILTROS_POR_SECCION[seccion] || []).forEach(filtro => {
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
    const efectiva = seccion === 'criterios' ? getActiveCriteriosSubTab() : seccion;
    const config  = obtenerConfigSeccion(efectiva);
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

async function reactivarSeleccion(seccion, ids) { await obtenerConfigSeccion(seccion)?.reactivar?.(ids); }
async function desactivarSeleccion(seccion, ids) { await obtenerConfigSeccion(seccion)?.desactivar?.(ids); }

function mostrarToast(mensaje, bgClass = 'bg-danger text-white') {
    const el = document.getElementById('toastDashboard');
    if (!el) return;
    el.className = `toast align-items-center border-0 ${bgClass}`;
    document.getElementById('toastDashboardMsg').textContent = mensaje;
    bootstrap.Toast.getOrCreateInstance(el).show();
}

function actualizarBotones() {
    const seccion = document.querySelector('.section-link.active-custom')?.getAttribute('data-section');
    const efectiva = seccion === 'criterios' ? getActiveCriteriosSubTab() : seccion;
    const selectores = { usuarios: '.usuario-checkbox', roles: '.rol-checkbox', criterios: '.criterio-checkbox', opciones: '.opcion-checkbox', viviendas: '.vivienda-checkbox' };
    const seleccionados = document.querySelectorAll(`tbody ${selectores[efectiva] || '.noexiste'}:checked`).length;

    const btnEditar    = document.getElementById('btnEditar');
    const btnEliminar  = document.getElementById('btnEliminar');
    const btnReactivar = document.getElementById('btnReactivar');
    if (btnEditar && btnEliminar && btnReactivar) {
        const config = obtenerConfigSeccion(efectiva);
        const idsSeleccionados = obtenerIdsSeleccionados(efectiva);
        const hayInactivoSeleccionado = idsSeleccionados.some(id => {
            const item = config?.lista.find(el => String(el.id) === id);
            return item?.estado === 'inactivo';
        });
        btnEditar.disabled    = (seleccionados !== 1);
        btnEliminar.disabled  = (seleccionados === 0) || hayInactivoSeleccionado;
        btnReactivar.disabled = (obtenerIdsSeleccionadosInactivos(efectiva).length === 0);
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
        <div class="row mb-3"><div class="col-md-6"><h6 class="text-muted small mb-1">${t('admin.users.fullName')}</h6><p class="fw-semibold mb-0">${u.nombre}</p></div>
        <div class="col-md-6"><h6 class="text-muted small mb-1">${t('admin.users.email')}</h6><p class="fw-semibold mb-0">${u.email}</p></div></div>
        <div class="row mb-3"><div class="col-md-6"><h6 class="text-muted small mb-1">${t('admin.users.dni')}</h6><p class="fw-semibold mb-0">${u.dni}</p></div>
        <div class="col-md-6"><h6 class="text-muted small mb-1">${t('admin.users.phone')}</h6><p class="fw-semibold mb-0">${u.telefono}</p></div></div>
        <div class="row mb-3"><div class="col-md-6"><h6 class="text-muted small mb-1">${t('admin.users.role')}</h6><p class="mb-0">${rolBadge}</p></div>
        <div class="col-md-6"><h6 class="text-muted small mb-1">${t('common.status')}</h6><p class="mb-0">${estadoBadge}</p></div></div>
        <div class="row"><div class="col-md-12"><h6 class="text-muted small mb-1">${t('admin.users.registerDate')}</h6><p class="fw-semibold mb-0">${u.fechaRegistro}</p></div></div>
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
        <div class="row mb-3"><div class="col-md-12"><h6 class="text-muted small mb-1">${t('admin.homes.address')}</h6><p class="fw-semibold mb-0">${v.direccion}</p></div></div>
        <div class="row mb-3"><div class="col-md-6"><h6 class="text-muted small mb-1">${t('admin.homes.city')}</h6><p class="fw-semibold mb-0">${v.ciudad}</p></div>
        <div class="col-md-6"><h6 class="text-muted small mb-1">${t('admin.homes.host')}</h6><p class="fw-semibold mb-0">${v.anfitrion}</p></div></div>
        <div class="row mb-3"><div class="col-md-6"><h6 class="text-muted small mb-1">${t('admin.homes.totalSlots')}</h6><p class="fw-semibold mb-0">${v.plazas_totales}</p></div>
        <div class="col-md-6"><h6 class="text-muted small mb-1">${t('admin.homes.freeSlots')}</h6><p class="fw-semibold text-success mb-0">${v.plazas_libres}</p></div></div>
        <div class="row"><div class="col-md-12"><h6 class="text-muted small mb-1">${t('common.status')}</h6><p class="mb-0">${estadoBadge}</p></div></div>
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
        <div class="row mb-3"><div class="col-md-12"><h6 class="text-muted small mb-1">${t('admin.roles.roleName')}</h6><p class="fw-semibold mb-0">${r.nombre}</p></div></div>
        <div class="row"><div class="col-md-12"><h6 class="text-muted small mb-1">${t('common.status')}</h6><p class="mb-0">${estadoBadge}</p></div></div>
    `;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalDetalle')).show();
};

window.verCriterio = function(id) {
    const c = criterios.listaCriteriosMemoria.find(x => x.id === id);
    if (!c) return;

    const estadoBadge = c.estado === 'activo'
        ? `<span class="badge bg-success">${t('common.active')}</span>`
        : `<span class="badge bg-secondary">${t('common.inactive')}</span>`;

    const opcionesDelCriterio = criterios.listaOpcionesMemoria.filter(o => o.criterio_id === c.id);

    document.getElementById('modalDetalleTitle').textContent = `${t('admin.criteria.detailTitle')}: ${c.nombre}`;
    document.getElementById('modalDetalleContent').innerHTML = `
        <div class="row mb-3"><div class="col-md-12"><h6 class="text-muted small mb-1">${t('admin.criteria.criteriaName')}</h6><p class="fw-semibold mb-0">${c.nombre}</p></div></div>
        <div class="row ${opcionesDelCriterio.length ? 'mb-3' : ''}"><div class="col-md-12"><h6 class="text-muted small mb-1">${t('common.status')}</h6><p class="mb-0">${estadoBadge}</p></div></div>
        ${opcionesDelCriterio.length ? `
        <div class="row"><div class="col-md-12"><h6 class="text-muted small mb-1">${t('admin.criteria.tabOptions')}</h6>
            <ul class="list-unstyled mb-0">
                ${opcionesDelCriterio.map(o => `<li><span class="fw-semibold">${o.opcion}</span> <span class="text-muted">(${t('admin.criteria.value')}: ${o.valor})</span></li>`).join('')}
            </ul>
        </div></div>` : ''}
    `;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalDetalle')).show();
};
