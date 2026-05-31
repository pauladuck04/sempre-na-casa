// js/admin/dashboard.js
// Script para el dashboard del administrador

import * as usuarios from '../admin/usuarios.js';
import * as roles from '../admin/roles.js';
import * as criterios from '../admin/criterios.js';
import * as viviendas from '../admin/viviendas.js';

const FILTROS_POR_SECCION = {
    usuarios: [
        {
            campo: 'estado',
            opciones: [
                ['activo', 'Activos'],
                ['pendiente', 'Pendientes'],
                ['inactivo', 'Inactivos']
            ]
        }
    ],
    roles: [
        {
            campo: 'estado',
            opciones: [
                ['activo', 'Activos'],
                ['inactivo', 'Inactivos']
            ]
        }
    ],
    viviendas: [
        {
            campo: 'estado',
            opciones: [
                ['disponible', 'Disponibles'],
                ['ocupada', 'Ocupadas'],
                ['inactivo', 'Inactivas']
            ]
        }
    ],
    criterios: [
        {
            campo: 'estado',
            opciones: [
                ['activo', 'Activos'],
                ['inactivo', 'Inactivos']
            ]
        }
    ]
};

// Configuración de los formularios para el modal genérico
    const CONFIG_MODALES = {
        usuarios: {
            titulo: 'Crear Nuevo Usuario',
            html: `
                <div class="mb-3"><label class="form-label fw-bold">Nombre Completo</label><input name="nombre" class="form-control" placeholder="Ej: Juan Pérez" required></div>
                <div class="mb-3"><label class="form-label fw-bold">Correo Electrónico</label><input type="email" name="email" class="form-control" placeholder="usuario@ejemplo.com" required></div>
                <div class="row">
                    <div class="col-md-6 mb-3"><label class="form-label fw-bold">DNI</label><input name="dni" class="form-control" required></div>
                    <div class="col-md-6 mb-3"><label class="form-label fw-bold">Teléfono</label><input name="tel" class="form-control" required></div>
                </div>
                <div class="mb-3">
                    <label class="form-label fw-bold">Rol de Usuario</label>
                    <select name="rol" class="form-select">
                        <option value="inquilino">Inquilino</option>
                        <option value="anfitrion">Anfitrión</option>
                    </select>
                </div>`
        },
        viviendas: {
            titulo: 'Nueva Vivienda',
            html: `
                <div class="mb-3"><label class="form-label fw-bold">Dirección</label><input name="direccion" class="form-control" required></div>
                <div class="mb-3"><label class="form-label fw-bold">Ciudad</label><input name="ciudad" class="form-control" required></div>
                <div class="mb-3"><label class="form-label fw-bold">Plazas Libres</label><input name="plazas_libres" class="form-control" required></div>
                <div class="mb-3"><label class="form-label fw-bold">Plazas Totales</label><input name="plazas_totales" class="form-control" required></div>
                <div class="mb-3"><label class="form-label fw-bold">Anfitrion</label><input name="anfitrion" class="form-control" required></div>`
        },
        roles: {
            titulo: 'Crear Nuevo Rol',
            html: `<div class="mb-3"><label class="form-label fw-bold">Nombre del Rol</label><input name="nombre" class="form-control" required></div>`
        },
        criterios: {
            titulo: 'Nuevo Criterio de Match',
            html: `
                <div class="mb-3">
                    <label class="form-label fw-bold">Nombre del Criterio</label>
                    <input name="nombre" class="form-control" placeholder="Ej: Preferencia de edad" required>
                </div>
                <div class="mb-3">
                    <label class="form-label fw-bold">Opción</label>
                    <input name="opcion" class="form-control" placeholder="Ej: Mayor de 30" required>
                </div>
                <div class="mb-3">
                    <label class="form-label fw-bold">Valor</label>
                    <input name="valor" class="form-control" placeholder="Ej: 1" required>
                </div>`
        }
    };


document.addEventListener('DOMContentLoaded', function() {
        // Ocultar acciones globales si la sección activa es 'general' al cargar
        const seccionActiva = document.querySelector('.section-link.active-custom')?.getAttribute('data-section');
        actualizarControlesSeccion(seccionActiva);
    console.log('Dashboard administrador cargado');
    
    // Verificar autenticación
    //verificarAutenticacion();
    
    // Cargar datos
    cargarSeguimientoConvivencias();

    // ---- Avatar → sección perfil ----
    document.getElementById('btnPerfil')?.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionName = 'perfil';
        document.querySelectorAll('.section-content').forEach(c => c.classList.remove('active'));
        document.querySelectorAll('.section-link').forEach(l => { l.classList.remove('active-custom'); l.classList.add('text-muted'); });
        const activeSection = document.querySelector(`.section-content[data-section="${sectionName}"]`);
        if (activeSection) activeSection.classList.add('active');
        document.getElementById('acciones-globales').classList.add('d-none');
        document.getElementById('filtros-globales').classList.add('d-none');
    });

    const btnCrear = document.querySelector('#btnCrear'); 

    if (btnCrear) {
        btnCrear.addEventListener('click', () => {
            // 1. Buscamos qué sección tiene la clase de 'activa' en el sidebar
            const linkActivo = document.querySelector('.section-link.active-custom');
            
            // 2. Obtenemos el nombre de la sección (usuarios, roles, etc.)
            const seccionActual = linkActivo ? linkActivo.getAttribute('data-section') : 'usuarios';

            // 3. Abrimos el modal genérico con esa configuración
            console.log("Abriendo creador para:", seccionActual);
            abrirModalGenerico(seccionActual);
        });
    }
    
    document.getElementById('btnEditar')?.addEventListener('click', () => {
        // Detectar sección activa
        const seccion = document.querySelector('.section-link.active-custom').getAttribute('data-section');
        let seleccionado;
        if (seccion === 'usuarios') {
            seleccionado = document.querySelector('tbody .usuario-checkbox:checked');
        } else if (seccion === 'roles') {
            seleccionado = document.querySelector('tbody .rol-checkbox:checked');
        } else if (seccion === 'criterios') {
            seleccionado = document.querySelector('tbody .criterio-checkbox:checked');
        } else if (seccion === 'viviendas') {
            seleccionado = document.querySelector('tbody .vivienda-checkbox:checked');
        }
        if (!seleccionado) return;

        const id = parseInt(seleccionado.value);

        // 2. Abrimos el modal vacío
        abrirModalGenerico(seccion);
        const form = document.getElementById('formGenerico');
        // 3. Metemos el ID en un campo oculto para saber qué editamos al guardar
        form.insertAdjacentHTML('beforeend', `<input type="hidden" name="id_edit" value="${id}">`);

        // 4. RELLENAR LOS DATOS SEGÚN LA SECCIÓN
        if (seccion === 'usuarios') {
            const u = usuarios.listaUsuariosMemoria.find(user => user.id === id);
            if (u) {
                form.querySelector('[name="nombre"]').value = u.nombre;
                form.querySelector('[name="email"]').value = u.email;
                form.querySelector('[name="dni"]').value = u.dni;
                form.querySelector('[name="tel"]').value = u.telefono;
                form.querySelector('[name="rol"]').value = u.rol;
                document.getElementById('modalTitle').textContent = "Editar Usuario: " + u.nombre;
            }
        } 
        if (seccion === 'roles') {
            const r = roles.listaRolesMemoria.find(role => role.id === id);
            if (r) {
                form.querySelector('[name="nombre"]').value = r.nombre;
                document.getElementById('modalTitle').textContent = "Editar Rol: " + r.nombre;
            }
        }
        if (seccion === 'criterios') {
            const c = criterios.listaCriteriosMemoria.find(criterio => criterio.id === id);
            if (c) {
                form.querySelector('[name="nombre"]').value = c.criterio;
                form.querySelector('[name="opcion"]').value = c.opcion;
                form.querySelector('[name="valor"]').value = c.valor;
                document.getElementById('modalTitle').textContent = "Editar Criterio: " + c.criterio;
            }
        }
        if (seccion === 'viviendas') {
            const v = viviendas.listaViviendasMemoria.find(vivienda => vivienda.id === id);
            if (v) {
                form.querySelector('[name="direccion"]').value = v.direccion;
                form.querySelector('[name="ciudad"]').value = v.ciudad;
                form.querySelector('[name="plazas_libres"]').value = v.plazas_libres;
                form.querySelector('[name="plazas_totales"]').value = v.plazas_totales;
                form.querySelector('[name="anfitrion"]').value = v.anfitrion;
                document.getElementById('modalTitle').textContent = "Editar Vivienda: " + v.direccion;
            }
        }
    });

    document.getElementById('btnEliminar')?.addEventListener('click', () => {
        // Detectar sección activa
        const seccion = document.querySelector('.section-link.active-custom').getAttribute('data-section');
        let seleccionados = obtenerIdsSeleccionados(seccion);
        if (seleccionados.length === 0) return;
        if (confirm(`¿Estás seguro de que deseas eliminar ${seleccionados.length} elemento(s)?`)) {
            desactivarSeleccion(seccion, seleccionados);
            aplicarFiltros();
            actualizarBotones();
        }
    });

    // --- Escuchar cambios en los Checkboxes (Delegación) ---
    document.getElementById('btnReactivar')?.addEventListener('click', () => {
        const seccion = document.querySelector('.section-link.active-custom').getAttribute('data-section');
        const seleccionados = obtenerIdsSeleccionadosInactivos(seccion);
        if (seleccionados.length === 0) return;

        reactivarSeleccion(seccion, seleccionados);
        aplicarFiltros();
        actualizarBotones();
    });

    document.getElementById('filtroTexto')?.addEventListener('input', aplicarFiltros);
    document.getElementById('filtros-globales')?.addEventListener('change', (e) => {
        if (e.target.matches('[data-filtro-campo]')) {
            aplicarFiltros();
        }
    });

    document.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            actualizarBotones();
        }
    });

    document.getElementById('formGenerico')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const linkActivo = document.querySelector('.section-link.active-custom');
        const seccionActual = linkActivo.getAttribute('data-section');
        
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);

        if (data.id_edit) {
            console.log(`Editando ${seccionActual} con ID: ${data.id_edit}`, data);
        } else {
            console.log(`Creando nuevo en ${seccionActual}`, data);
        }

        // Aquí puedes refrescar la tabla automáticamente
        if (seccionActual === 'usuarios') usuarios.cargarUsuarios();
        if (seccionActual === 'roles') roles.cargarRoles();
        if (seccionActual === 'criterios') criterios.cargarCriterios();
        if (seccionActual === 'viviendas') viviendas.cargarViviendas();
        aplicarFiltros();
        
        bootstrap.Modal.getInstance(document.getElementById('modalGenerico')).hide();
    
    });

    const sectionLinks = document.querySelectorAll('.section-link');
    const sectionContents = document.querySelectorAll('.section-content');

    // Textos para cada sección
    const sectionTitles = {
        general: 'Panel de Control',
        usuarios: 'Gestión de Usuarios',
        roles: 'Roles y Permisos',
        viviendas: 'Gestión de Viviendas',
        criterios: 'Criterios de Compatibilidad'
    };

    const sectionDescriptions = {
        general: 'Gestión global de usuarios, viviendas y algoritmos de compatibilidad',
        usuarios: 'Administra y gestiona todos los usuarios del sistema',
        roles: 'Configura roles y permisos de acceso',
        viviendas: 'Gestiona el catálogo de viviendas disponibles',
        criterios: 'Define criterios de compatibilidad para el matching'
    };

    // Event listeners para cada enlace
    sectionLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            const sectionName = link.getAttribute('data-section');
            actualizarControlesSeccion(sectionName);

            // LÓGICA DE VISIBILIDAD
            sectionContents.forEach(content => content.classList.remove('active'));
            sectionLinks.forEach(l => {
                l.classList.remove('active-custom');
                l.classList.add('text-muted');
            });

            actualizarBotones(); // Reseteamos estado de botones al cambiar de sección

            // Mostrar la sección seleccionada
            const activeSection = document.querySelector(`.section-content[data-section="${sectionName}"]`);
            if (activeSection) {
                activeSection.classList.add('active');
            }

            link.classList.add('active-custom');
            link.classList.remove('text-muted');

            switch(sectionName) {
                case 'general':
                    cargarSeguimientoConvivencias();
                    break;
                case 'usuarios':
                    if (usuarios && typeof usuarios.cargarUsuarios === 'function') {
                        usuarios.cargarUsuarios();
                    }
                    break;
                case 'roles':
                    if (roles && typeof roles.cargarRoles === 'function') {
                        roles.cargarRoles();
                    }
                    break;
                case 'viviendas':
                    if (viviendas && typeof viviendas.cargarViviendas === 'function') {
                    viviendas.cargarViviendas();
                    }
                    break;
                case 'criterios':
                    if (criterios && typeof criterios.cargarCriterios === 'function') {
                        criterios.cargarCriterios();
                    }
                    break;
            }

            // Actualizar título y descripción
            aplicarFiltros();
            document.getElementById('section-title').textContent = sectionTitles[sectionName] || 'Panel de Control';
            document.getElementById('section-description').textContent = sectionDescriptions[sectionName] || '';
        });
    });

    // ---- Perfil: toggle ojo contraseña ----
    document.querySelectorAll('[data-toggle-pwd]').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = document.getElementById(btn.dataset.togglePwd);
            const icon  = btn.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'bi bi-eye-slash';
            } else {
                input.type = 'password';
                icon.className = 'bi bi-eye';
            }
        });
    });

    // ---- Perfil: editar datos ----
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

    // ---- Perfil: guardar cambios ----
    document.getElementById('perfil-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        Array.from(document.querySelectorAll('#perfil-form input')).forEach(inp => inp.disabled = true);
        document.getElementById('perfil-btnEditar').classList.remove('d-none');
        document.getElementById('perfil-acciones').classList.add('d-none');
        alert('Datos actualizados correctamente');
    });

    // ---- Perfil: cambiar contraseña ----
    document.getElementById('perfil-form-pwd')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const nueva = document.getElementById('pwd-nueva').value;
        const confirma = document.getElementById('pwd-confirmar').value;
        if (nueva.length < 8) { alert('La contraseña debe tener al menos 8 caracteres'); return; }
        if (nueva !== confirma) { alert('Las contraseñas no coinciden'); return; }
        document.getElementById('perfil-form-pwd').reset();
        alert('Contraseña actualizada correctamente');
    });

    // ---- Perfil: eliminar cuenta ----
    document.getElementById('btnEliminarCuenta')?.addEventListener('click', () => {
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEliminarCuenta')).show();
    });

    document.getElementById('btnConfirmarEliminarCuenta')?.addEventListener('click', () => {
        bootstrap.Modal.getInstance(document.getElementById('modalEliminarCuenta')).hide();
        alert('Cuenta eliminada. Redirigiendo...');
        setTimeout(() => { window.location.href = 'public.html'; }, 2000);
    });
});

/**
 * Verificar si el usuario está autenticado y es administrador
 */
function verificarAutenticacion() {
    // Verificar si está autenticado usando auth.js
    if (!auth.isLoggedIn()) {
        window.location.href = '../../index.html';
        return;
    }

    // Obtener datos del usuario
    const email = auth.getEmail();
    const role = auth.getRole();

    // Actualizar nombre de usuario en el header (si existe el elemento)
    const userNameElement = document.querySelector('[data-user-name]');
    if (userNameElement) {
        userNameElement.textContent = email || 'Admin';
    }
}

/**
 * Cargar y mostrar seguimiento de convivencias
 */
function cargarSeguimientoConvivencias() {
    const convivencias = [
        {
            id: 1,
            anfitrion: 'Mercedes Rosas',
            inquilino: 'Luis Martínez',
            inicio: '01/02/2026',
            estado: 'activa'
        },
        {
            id: 2,
            anfitrion: 'Ramón Vázquez',
            inquilino: 'Marta Soto',
            inicio: null,
            estado: 'entrevista'
        },
        {
            id: 3,
            anfitrion: 'Carmen Cid',
            inquilino: 'Javier López',
            inicio: '15/03/2026',
            estado: 'prueba'
        }
    ];
    
    renderizarConvivencias(convivencias);
}

/**
 * Renderizar tabla de convivencias
 */
function renderizarConvivencias(convivencias) {
    const tbody = document.getElementById('tabla-convivencias');
    console.log("Intentando renderizar en:", tbody);
    
    if (!tbody) return;
    
    tbody.innerHTML = '';

    if (convivencias.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No hay convivencias activas</td></tr>';
        return;
    }
    
    convivencias.forEach(convivencia => {
        const row = document.createElement('tr');
        let estadoBadge = '';
        
        switch(convivencia.estado) {
            case 'activa':
                estadoBadge = `<span class="badge rounded-pill px-3 py-2" style="background-color: #D1E7DD; color: #0F5132;">✓ Activa</span>`;
                break;
            case 'entrevista':
                estadoBadge = `<span class="badge rounded-pill px-3 py-2" style="background-color: #FFF3CD; color: #856404;">⏳ En Entrevista</span>`;
                break;
            case 'prueba':
                estadoBadge = `<span class="badge rounded-pill px-3 py-2" style="background-color: #CFE2FF; color: #084298;">⚠️ Periodo de Prueba</span>`;
                break;
        }
        
        row.innerHTML = `
            <td class="fw-semibold">${convivencia.anfitrion}</td>
            <td>${convivencia.inquilino}</td>
            <td>${convivencia.inicio || '-'}</td>
            <td>${estadoBadge}</td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * Abre el modal genérico inyectando el contenido según la sección
 */
function abrirModalGenerico(seccion) {
    const config = CONFIG_MODALES[seccion];
    if (!config) return;

    // Inyectar título y HTML
    document.getElementById('modalTitle').textContent = config.titulo;
    document.getElementById('modalFormContent').innerHTML = config.html;
    
    // Resetear el formulario por si tenía datos anteriores
    const form = document.getElementById('formGenerico');
    form.reset();

    const hiddenId = form.querySelector('input[name="id_edit"]');
    if (hiddenId) hiddenId.remove();

    // Mostrar modal (usando la instancia de Bootstrap)
    const modalElement = document.getElementById('modalGenerico');
    const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
    modalInstance.show();
}

function obtenerIdsSeleccionados(seccion) {
    const selectores = {
        usuarios: '.usuario-checkbox',
        roles: '.rol-checkbox',
        criterios: '.criterio-checkbox',
        viviendas: '.vivienda-checkbox'
    };
    const selector = selectores[seccion];
    if (!selector) return [];

    return Array.from(document.querySelectorAll(`tbody ${selector}:checked`)).map(cb => cb.value);
}

function obtenerIdsSeleccionadosInactivos(seccion) {
    const config = obtenerConfigSeccion(seccion);
    const seleccionados = obtenerIdsSeleccionados(seccion);
    if (!config) return [];

    return seleccionados.filter(id => {
        const item = config.lista.find(elemento => String(elemento.id) === id);
        return item?.estado === 'inactivo';
    });
}

function obtenerConfigSeccion(seccion) {
    const configs = {
        usuarios: {
            lista: usuarios.listaUsuariosMemoria,
            renderizar: usuarios.renderizarUsuarios,
            reactivar: usuarios.reactivarUsuarios,
            desactivar: usuarios.desactivarUsuarios,
        },
        roles: {
            lista: roles.listaRolesMemoria,
            renderizar: roles.renderizarRoles,
            reactivar: roles.reactivarRoles,
            desactivar: roles.desactivarRoles,
        },
        criterios: {
            lista: criterios.listaCriteriosMemoria,
            renderizar: criterios.renderizarCriterios,
            reactivar: criterios.reactivarCriterios,
            desactivar: criterios.desactivarCriterios,
        },
        viviendas: {
            lista: viviendas.listaViviendasMemoria,
            renderizar: viviendas.renderizarViviendas,
            reactivar: viviendas.reactivarViviendas,
            desactivar: viviendas.desactivarViviendas,
        }
    };

    return configs[seccion];
}

function actualizarControlesSeccion(seccion) {
    const accionesGlobales = document.getElementById('acciones-globales');
    const filtrosGlobales = document.getElementById('filtros-globales');
    const filtrosEspecificos = document.getElementById('filtrosEspecificos');
    const filtroTexto = document.getElementById('filtroTexto');

    if (!accionesGlobales || !filtrosGlobales) return;

    if (seccion === 'general') {
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
    configurarFiltros(seccion);
}

function configurarFiltros(seccion) {
    const contenedor = document.getElementById('filtrosEspecificos');
    const texto = document.getElementById('filtroTexto');
    if (!contenedor) return;

    if (texto) texto.value = '';
    contenedor.innerHTML = '';

    (FILTROS_POR_SECCION[seccion] || []).forEach(filtro => {
        const select = document.createElement('select');
        select.className = 'form-select';
        select.style.width = 'auto';
        select.dataset.filtroCampo = filtro.campo;
        select.innerHTML = `
            <option value="">${obtenerEtiquetaFiltro(filtro.campo)}</option>
            ${filtro.opciones.map(([valor, etiqueta]) => `<option value="${valor}">${etiqueta}</option>`).join('')}
        `;
        contenedor.appendChild(select);
    });
}

function obtenerEtiquetaFiltro(campo) {
    const etiquetas = {
        estado: 'Todos los estados'
    };

    return etiquetas[campo] || 'Todos';
}

function aplicarFiltros() {
    const seccion = document.querySelector('.section-link.active-custom')?.getAttribute('data-section');
    const config = obtenerConfigSeccion(seccion);
    if (!config) return;

    const texto = document.getElementById('filtroTexto')?.value.trim().toLowerCase() || '';
    const filtrosActivos = Array.from(document.querySelectorAll('#filtrosEspecificos [data-filtro-campo]'))
        .map(select => ({
            campo: select.dataset.filtroCampo,
            valor: select.value
        }))
        .filter(filtro => filtro.valor);

    const filtrados = config.lista.filter(item => {
        const coincideTexto = !texto || Object.values(item).some(valor =>
            String(valor).toLowerCase().includes(texto)
        );
        const coincidenFiltros = filtrosActivos.every(filtro => coincideFiltro(item, filtro));

        return coincideTexto && coincidenFiltros;
    });

    config.renderizar(filtrados);
    actualizarBotones();
}

function coincideFiltro(item, filtro) {
    return String(item[filtro.campo]) === filtro.valor;
}

function reactivarSeleccion(seccion, ids) {
    const config = obtenerConfigSeccion(seccion);
    if (config?.reactivar) config.reactivar(ids);
}

function desactivarSeleccion(seccion, ids) {
    const config = obtenerConfigSeccion(seccion);
    if (config?.desactivar) config.desactivar(ids);
}

/**
 * Actualizar estado de botones según selección
 */
function actualizarBotones() {
    // Detectar sección activa
    const seccion = document.querySelector('.section-link.active-custom')?.getAttribute('data-section');
    let seleccionados = 0;
    if (seccion === 'usuarios') {
        seleccionados = document.querySelectorAll('tbody .usuario-checkbox:checked').length;
    } else if (seccion === 'roles') {
        seleccionados = document.querySelectorAll('tbody .rol-checkbox:checked').length;
    } else if (seccion === 'criterios') {
        seleccionados = document.querySelectorAll('tbody .criterio-checkbox:checked').length;
    } else if (seccion === 'viviendas') {
        seleccionados = document.querySelectorAll('tbody .vivienda-checkbox:checked').length;
    }
    const btnEditar = document.getElementById('btnEditar');
    const btnEliminar = document.getElementById('btnEliminar');
    const btnReactivar = document.getElementById('btnReactivar');
    const inactivosSeleccionados = obtenerIdsSeleccionadosInactivos(seccion).length;
    if (btnEditar && btnEliminar && btnReactivar) {
        btnEditar.disabled = (seleccionados !== 1);
        btnEliminar.disabled = (seleccionados == 0);
        btnReactivar.disabled = (inactivosSeleccionados == 0);
    }
}

/**
 * Ver detalles de un usuario
 */
window.verUsuario = function(id) {
    const usuario = usuarios.listaUsuariosMemoria.find(u => u.id === id);
    if (!usuario) return;

    const estadoBadge = usuario.estado === 'activo'
        ? '<span class="badge bg-success">Activo</span>'
        : usuario.estado === 'inactivo'
            ? '<span class="badge bg-secondary">Inactivo</span>'
            : '<span class="badge bg-warning text-dark">Pendiente</span>';

    const rolBadge = usuario.rol === 'anfitrion'
        ? '<span class="badge bg-success-subtle text-success">Anfitrión</span>'
        : '<span class="badge bg-info-subtle text-info">Inquilino</span>';

    const contenido = `
        <div class="row">
            <div class="col-md-6">
                <h6 class="text-muted small mb-2">Nombre Completo</h6>
                <p class="fw-semibold">${usuario.nombre}</p>
            </div>
            <div class="col-md-6">
                <h6 class="text-muted small mb-2">Correo Electrónico</h6>
                <p class="fw-semibold">${usuario.email}</p>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6">
                <h6 class="text-muted small mb-2">DNI</h6>
                <p class="fw-semibold">${usuario.dni}</p>
            </div>
            <div class="col-md-6">
                <h6 class="text-muted small mb-2">Teléfono</h6>
                <p class="fw-semibold">${usuario.telefono}</p>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6">
                <h6 class="text-muted small mb-2">Rol</h6>
                <p>${rolBadge}</p>
            </div>
            <div class="col-md-6">
                <h6 class="text-muted small mb-2">Estado</h6>
                <p>${estadoBadge}</p>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12">
                <h6 class="text-muted small mb-2">Fecha de Registro</h6>
                <p class="fw-semibold">${usuario.fechaRegistro}</p>
            </div>
        </div>
    `;

    document.getElementById('modalDetalleTitle').textContent = `Detalles del Usuario: ${usuario.nombre}`;
    document.getElementById('modalDetalleContent').innerHTML = contenido;
    const modalInstance = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalDetalle'));
    modalInstance.show();
};

/**
 * Ver detalles de una vivienda
 */
window.verVivienda = function(id) {
    const vivienda = viviendas.listaViviendasMemoria.find(v => v.id === id);
    if (!vivienda) return;

    const estadoBadge = vivienda.estado === 'ocupada'
        ? '<span class="badge bg-success">Ocupada</span>'
        : vivienda.estado === 'inactivo'
            ? '<span class="badge bg-secondary">Inactiva</span>'
            : '<span class="badge bg-info">Disponible</span>';

    const contenido = `
        <div class="row">
            <div class="col-md-12">
                <h6 class="text-muted small mb-2">Dirección</h6>
                <p class="fw-semibold">${vivienda.direccion}</p>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6">
                <h6 class="text-muted small mb-2">Ciudad</h6>
                <p class="fw-semibold">${vivienda.ciudad}</p>
            </div>
            <div class="col-md-6">
                <h6 class="text-muted small mb-2">Anfitrión</h6>
                <p class="fw-semibold">${vivienda.anfitrion}</p>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6">
                <h6 class="text-muted small mb-2">Plazas Totales</h6>
                <p class="fw-semibold">${vivienda.plazas_totales}</p>
            </div>
            <div class="col-md-6">
                <h6 class="text-muted small mb-2">Plazas Libres</h6>
                <p class="fw-semibold text-success">${vivienda.plazas_libres}</p>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12">
                <h6 class="text-muted small mb-2">Estado</h6>
                <p>${estadoBadge}</p>
            </div>
        </div>
    `;

    document.getElementById('modalDetalleTitle').textContent = `Detalles de la Vivienda: ${vivienda.direccion}`;
    document.getElementById('modalDetalleContent').innerHTML = contenido;
    const modalInstance = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalDetalle'));
    modalInstance.show();
};

/**
 * Ver detalles de un rol
 */
window.verRol = function(id) {
    const rol = roles.listaRolesMemoria.find(r => r.id === id);
    if (!rol) return;

    const estadoBadge = rol.estado === 'activo'
        ? '<span class="badge bg-success">Activo</span>'
        : '<span class="badge bg-secondary">Inactivo</span>';

    const contenido = `
        <div class="row">
            <div class="col-md-12">
                <h6 class="text-muted small mb-2">Nombre del Rol</h6>
                <p class="fw-semibold">${rol.nombre}</p>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12">
                <h6 class="text-muted small mb-2">Estado</h6>
                <p>${estadoBadge}</p>
            </div>
        </div>
    `;

    document.getElementById('modalDetalleTitle').textContent = `Detalles del Rol: ${rol.nombre}`;
    document.getElementById('modalDetalleContent').innerHTML = contenido;
    const modalInstance = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalDetalle'));
    modalInstance.show();
};

/**
 * Ver detalles de un criterio
 */
window.verCriterio = function(id) {
    const criterio = criterios.listaCriteriosMemoria.find(c => c.id === id);
    if (!criterio) return;

    const estadoBadge = criterio.estado === 'activo'
        ? '<span class="badge bg-success">Activo</span>'
        : '<span class="badge bg-secondary">Inactivo</span>';

    const contenido = `
        <div class="row">
            <div class="col-md-12">
                <h6 class="text-muted small mb-2">Criterio de Compatibilidad</h6>
                <p class="fw-semibold">${criterio.criterio}</p>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6">
                <h6 class="text-muted small mb-2">Opción</h6>
                <p class="fw-semibold">${criterio.opcion}</p>
            </div>
            <div class="col-md-6">
                <h6 class="text-muted small mb-2">Valor</h6>
                <p class="fw-semibold">${criterio.valor}</p>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12">
                <h6 class="text-muted small mb-2">Estado</h6>
                <p>${estadoBadge}</p>
            </div>
        </div>
    `;

    document.getElementById('modalDetalleTitle').textContent = `Detalles del Criterio: ${criterio.criterio}`;
    document.getElementById('modalDetalleContent').innerHTML = contenido;
    const modalInstance = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalDetalle'));
    modalInstance.show();
};
