// js/admin/roles.js
// Script para la página de gestión de roles

document.addEventListener('DOMContentLoaded', function() {
    console.log('Gestión de roles cargada');
    
    verificarAutenticacion();
    cargarRoles();
    configurarEventListeners();
});

/**
 * Verificar autenticación
 */
function verificarAutenticacion() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!user.id || user.rol !== 'admin') {
        window.location.href = '../../index.html';
        return;
    }
}

/**
 * Cargar lista de roles
 */
function cargarRoles() {
    const roles = [
        {
            id: 1,
            nombre: 'Administrador',
            descripcion: 'Acceso total a todas las funciones',
            usuarios: 1,
            estado: 'activo',
            permisos: ['gestionar_usuarios', 'gestionar_viviendas', 'ver_reportes', 'gestionar_roles']
        },
        {
            id: 2,
            nombre: 'Anfitrión',
            descripcion: 'Gestiona sus propiedades y reservas',
            usuarios: 12,
            estado: 'activo',
            permisos: ['gestionar_propiedades', 'ver_reservas', 'contactar_inquilinos']
        },
        {
            id: 3,
            nombre: 'Inquilino',
            descripcion: 'Busca viviendas y envía solicitudes',
            usuarios: 28,
            estado: 'activo',
            permisos: ['buscar_viviendas', 'enviar_solicitudes', 'ver_perfil']
        }
    ];
    
    renderizarRoles(roles);
}

/**
 * Renderizar tabla de roles
 */
function renderizarRoles(roles) {
    const tbody = document.querySelector('table tbody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    roles.forEach(rol => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <input class="form-check-input rol-checkbox" type="checkbox" value="${rol.id}">
            </td>
            <td>
                <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-shield-fill" style="color: var(--color-primario); font-size: 1.3rem;"></i>
                    <span class="fw-semibold">${rol.nombre}</span>
                </div>
            </td>
            <td class="text-muted">${rol.descripcion}</td>
            <td>
                <span class="badge bg-light text-dark rounded-pill px-3">${rol.usuarios}</span>
            </td>
            <td>
                <span class="badge bg-success rounded-pill px-3">Activo</span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary rounded-pill px-3" onclick="verDetallesRol(${rol.id}, event)">
                    <i class="bi bi-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    actualizarBotones();
}

/**
 * Configurar event listeners
 */
function configurarEventListeners() {
    // Checkbox maestro
    const masterCheckbox = document.querySelector('th input[type="checkbox"]');
    if (masterCheckbox) {
        masterCheckbox.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
            checkboxes.forEach(cb => cb.checked = this.checked);
            actualizarBotones();
        });
    }
    
    // Checkboxes individuales
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('rol-checkbox')) {
            actualizarBotones();
        }
    });
    
    // Botón Añadir
    const btnAnadir = document.querySelector('button[data-bs-toggle="modal"]');
    if (btnAnadir) {
        btnAnadir.addEventListener('click', abrirModalNuevoRol);
    }
    
    // Formulario
    const form = document.getElementById('formNuevoRol');
    if (form) {
        form.addEventListener('submit', guardarNuevoRol);
    }
}

/**
 * Actualizar estado de botones
 */
function actualizarBotones() {
    const seleccionados = document.querySelectorAll('tbody input[type="checkbox"]:checked').length;
    const botones = document.querySelectorAll('.card-header button');
    
    if (botones.length >= 3) {
        botones[1].disabled = seleccionados === 0; // Editar
        botones[2].disabled = seleccionados === 0; // Eliminar
    }
}

/**
 * Abrir modal para nuevo rol
 */
function abrirModalNuevoRol() {
    const modal = new bootstrap.Modal(document.getElementById('modalNuevoRol'));
    modal.show();
}

/**
 * Guardar nuevo rol
 */
function guardarNuevoRol(e) {
    e.preventDefault();
    
    const form = e.target;
    const inputs = form.querySelectorAll('input[type="text"], textarea');
    const permisos = Array.from(form.querySelectorAll('input[type="checkbox"]:checked'))
        .map(cb => cb.id);
    
    const nuevoRol = {
        nombre: inputs[0].value,
        descripcion: inputs[1].value,
        permisos: permisos
    };
    
    console.log('Guardando nuevo rol:', nuevoRol);
    
    alert('Rol creado correctamente');
    cargarRoles();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalNuevoRol'));
    modal.hide();
    form.reset();
}

/**
 * Ver detalles del rol
 */
function verDetallesRol(rolId, event) {
    event.preventDefault();
    console.log('Ver rol:', rolId);
    alert('Abriendo detalles del rol ID: ' + rolId);
}

/**
 * Editar rol
 */
function editarRol() {
    const seleccionados = Array.from(document.querySelectorAll('tbody input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    
    if (seleccionados.length === 0) {
        alert('Selecciona un rol para editar');
        return;
    }
    
    if (seleccionados.length > 1) {
        alert('Solo puedes editar un rol a la vez');
        return;
    }
    
    console.log('Editando rol:', seleccionados[0]);
    alert('Abriendo formulario de edición para rol ID: ' + seleccionados[0]);
}

/**
 * Eliminar rol
 */
function eliminarRol() {
    const seleccionados = Array.from(document.querySelectorAll('tbody input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    
    if (seleccionados.length === 0) {
        alert('Selecciona un rol para eliminar');
        return;
    }
    
    if (confirm(`¿Estás seguro de que deseas eliminar ${seleccionados.length} rol(es)?`)) {
        console.log('Eliminando roles:', seleccionados);
        alert('Rol(es) eliminado(s) correctamente');
        cargarRoles();
    }
}