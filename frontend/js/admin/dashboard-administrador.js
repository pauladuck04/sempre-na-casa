// js/admin/dashboard.js
// Script para el dashboard del administrador

document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard administrador cargado');
    
    // Verificar autenticación
    verificarAutenticacion();
    
    // Cargar datos
    cargarValidacionesUsuarios();
    cargarSeguimientoConvivencias();

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

            // Ocultar todas las secciones
            sectionContents.forEach(content => {
                content.classList.remove('active');
            });

            // Mostrar la sección seleccionada
            const activeSection = document.querySelector(`.section-content[data-section="${sectionName}"]`);
            if (activeSection) {
                activeSection.classList.add('active');
            }

            // Actualizar título y descripción
            document.getElementById('section-title').textContent = sectionTitles[sectionName] || 'Panel de Control';
            document.getElementById('section-description').textContent = sectionDescriptions[sectionName] || '';

            // Actualizar estilos de los enlaces
            sectionLinks.forEach(l => {
                l.classList.remove('active-custom');
                l.classList.add('text-muted');
            });
            link.classList.add('active-custom');
            link.classList.remove('text-muted');
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
 * Cargar y mostrar validaciones de usuarios
 */
function cargarValidacionesUsuarios() {
    // Aquí irían las llamadas a tu API
    // Ejemplo:
    // api.get('/admin/usuarios-pendientes')
    //    .then(usuarios => renderizarValidaciones(usuarios))
    //    .catch(error => console.error('Error:', error));
    
    // Por ahora usa datos simulados
    const usuariosPendientes = [
        {
            id: 1,
            nombre: 'Paula Gómez',
            email: 'paula@ejemplo.com',
            rol: 'inquilino',
            fechaRegistro: '12/03/2026',
            documento: 'dni_anverso.jpg',
            estado: 'pendiente'
        },
        {
            id: 2,
            nombre: 'Juan Martínez',
            email: 'juan@ejemplo.com',
            rol: 'anfitrion',
            fechaRegistro: '10/03/2026',
            documento: 'dni_anverso.jpg',
            estado: 'aprobado'
        }
    ];
    
    renderizarValidaciones(usuariosPendientes);
}

/**
 * Renderizar tabla de validaciones de usuarios
 */
function renderizarValidaciones(usuarios) {
    const tbody = document.querySelector('table tbody');
    
    if (!tbody) return;
    
    // Limpiar tabla existente
    tbody.innerHTML = '';
    
    usuarios.forEach(usuario => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center gap-2">
                    <div class="rounded-circle p-2 text-white fw-bold" 
                         style="width: 40px; height: 40px; background-color: var(--color-primario); display: flex; align-items: center; justify-content: center;">
                        ${obtenerInicialesNombre(usuario.nombre)}
                    </div>
                    <div>
                        <p class="mb-0 fw-semibold">${usuario.nombre}</p>
                        <small class="text-muted">${usuario.email}</small>
                    </div>
                </div>
            </td>
            <td>
                <span class="badge rounded-pill ${usuario.rol === 'anfitrion' ? 'bg-success-subtle text-success' : 'bg-info-subtle text-info'} px-3">
                    ${usuario.rol === 'anfitrion' ? 'Anfitrión' : 'Inquilino'}
                </span>
            </td>
            <td>${usuario.fechaRegistro}</td>
            <td>
                <a href="#" class="text-decoration-none small">
                    <i class="bi bi-file-earmark-image me-1"></i>
                    ${usuario.documento}
                </a>
            </td>
            <td>
                <span class="badge ${usuario.estado === 'pendiente' ? 'bg-warning text-dark' : 'bg-success'} rounded-pill px-3">
                    ${usuario.estado === 'pendiente' ? 'Pendiente' : 'Aprobado'}
                </span>
            </td>
            <td>
                ${usuario.estado === 'pendiente' ? `
                    <button class="btn btn-sm btn-success rounded-pill px-3 me-2" onclick="aprobarUsuario(${usuario.id})">
                        <i class="bi bi-check-lg me-1"></i> Aprobar
                    </button>
                    <button class="btn btn-sm btn-outline-danger rounded-pill px-3" onclick="rechazarUsuario(${usuario.id})">
                        <i class="bi bi-x-lg me-1"></i> Rechazar
                    </button>
                ` : `
                    <button class="btn btn-sm btn-outline-secondary rounded-pill px-3">
                        <i class="bi bi-eye me-1"></i> Ver
                    </button>
                `}
            </td>
        `;
        tbody.appendChild(row);
    });
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
    const tbody = document.querySelectorAll('table tbody')[1];
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
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
            <td>
                <button class="btn btn-sm btn-outline-primary rounded-pill px-3" onclick="contactarUsuario(${convivencia.id})">
                    <i class="bi bi-chat me-1"></i> Contactar
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * Obtener iniciales del nombre
 */
function obtenerInicialesNombre(nombre) {
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

/**
 * Aprobar usuario
 */
function aprobarUsuario(usuarioId) {
    if (confirm('¿Estás seguro de que deseas aprobar este usuario?')) {
        console.log('Aprobando usuario:', usuarioId);
        
        // Aquí irían las llamadas a tu API
        // api.post(`/admin/usuarios/${usuarioId}/aprobar`)
        //    .then(response => {
        //        alert('Usuario aprobado correctamente');
        //        cargarValidacionesUsuarios();
        //    })
        //    .catch(error => alert('Error al aprobar: ' + error.message));
        
        alert('Usuario aprobado correctamente');
        cargarValidacionesUsuarios();
    }
}

/**
 * Rechazar usuario
 */
function rechazarUsuario(usuarioId) {
    const motivo = prompt('¿Cuál es el motivo del rechazo?');
    
    if (motivo) {
        console.log('Rechazando usuario:', usuarioId, 'Motivo:', motivo);
        
        // Aquí irían las llamadas a tu API
        // api.post(`/admin/usuarios/${usuarioId}/rechazar`, { motivo })
        //    .then(response => {
        //        alert('Usuario rechazado');
        //        cargarValidacionesUsuarios();
        //    })
        //    .catch(error => alert('Error: ' + error.message));
        
        alert('Usuario rechazado correctamente');
        cargarValidacionesUsuarios();
    }
}

/**
 * Contactar usuario
 */
function contactarUsuario(convivenciaId) {
    console.log('Contactando para convivencia:', convivenciaId);
    alert('Abriendo chat con los usuarios...');
}