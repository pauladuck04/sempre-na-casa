// js/admin/dashboard.js
// Script para el dashboard del administrador

import * as usuarios from '../admin/usuarios.js';
import * as roles from '../admin/roles.js';
import * as criterios from '../admin/criterios.js';
import * as viviendas from '../admin/viviendas.js';

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
        const accionesGlobales = document.getElementById('acciones-globales');
        const seccionActiva = document.querySelector('.section-link.active-custom')?.getAttribute('data-section');
        if (accionesGlobales && seccionActiva === 'general') {
            accionesGlobales.classList.add('d-none');
        }
    console.log('Dashboard administrador cargado');
    
    // Verificar autenticación
    //verificarAutenticacion();
    
    // Cargar datos
    cargarSeguimientoConvivencias();

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
        let seleccionados = [];
        if (seccion === 'usuarios') {
            seleccionados = Array.from(document.querySelectorAll('tbody .usuario-checkbox:checked')).map(cb => cb.value);
        } else if (seccion === 'roles') {
            seleccionados = Array.from(document.querySelectorAll('tbody .rol-checkbox:checked')).map(cb => cb.value);
        }else if (seccion === 'criterios') {
            seleccionados = Array.from(document.querySelectorAll('tbody .criterio-checkbox:checked')).map(cb => cb.value);
        }else if (seccion === 'viviendas') {
            seleccionados = Array.from(document.querySelectorAll('tbody .vivienda-checkbox:checked')).map(cb => cb.value);
        }
        if (confirm(`¿Estás seguro de que deseas eliminar ${seleccionados.length} elemento(s)?`)) {
            console.log('Eliminando IDs:', seleccionados);
            alert('Elementos eliminados correctamente');
            // Refrescar la vista actual
            const linkActivo = document.querySelector('.section-link.active-custom');
            if (linkActivo) linkActivo.click(); 
            actualizarBotones();
        }
    });

    // --- Escuchar cambios en los Checkboxes (Delegación) ---
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

            const accionesGlobales = document.getElementById('acciones-globales');

            // LÓGICA DE VISIBILIDAD
            if (sectionName === 'general') {
                accionesGlobales.classList.add('d-none'); // Escondemos en Convivencias
            } else {
                accionesGlobales.classList.remove('d-none'); // Mostramos en el resto
            }

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
            document.getElementById('section-title').textContent = sectionTitles[sectionName] || 'Panel de Control';
            document.getElementById('section-description').textContent = sectionDescriptions[sectionName] || '';
        });
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
    if (btnEditar && btnEliminar) {
        btnEditar.disabled = (seleccionados !== 1);
        btnEliminar.disabled = (seleccionados == 0);
    }
}
