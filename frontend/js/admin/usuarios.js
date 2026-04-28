// js/admin/usuarios.js
// Script para la página de gestión de usuarios

/**
 * Cargar lista de usuarios
 */
export function cargarUsuarios() {
    // Datos simulados
    const usuarios = [
        {
            id: 1,
            nombre: 'Paula Gómez',
            email: 'paula@ejemplo.com',
            rol: 'inquilino',
            telefono: '609 875 321',
            estado: 'activo',
            fechaRegistro: '12/03/2026'
        },
        {
            id: 2,
            nombre: 'Juan Martínez',
            email: 'juan@ejemplo.com',
            rol: 'anfitrion',
            telefono: '612 345 678',
            estado: 'activo',
            fechaRegistro: '10/03/2026'
        },
        {
            id: 3,
            nombre: 'Marta Soto',
            email: 'marta@ejemplo.com',
            rol: 'inquilino',
            telefono: '613 456 789',
            estado: 'pendiente',
            fechaRegistro: '08/03/2026'
        }
    ];
    
    renderizarUsuarios(usuarios);
}

/**
 * Renderizar tabla de usuarios
 */
function renderizarUsuarios(usuarios) {
    const tbody = document.querySelector('table tbody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    usuarios.forEach((usuario, index) => {
        const iniciales = usuario.nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        const colorRol = usuario.rol === 'anfitrion' ? 'var(--color-secundario)' : 'var(--color-primario)';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <input class="form-check-input usuario-checkbox" type="checkbox" value="${usuario.id}">
            </td>
            <td>
                <div class="d-flex align-items-center gap-2">
                    <div class="rounded-circle text-white fw-bold" 
                         style="width: 35px; height: 35px; background-color: ${colorRol}; display: flex; align-items: center; justify-content: center; font-size: 0.9rem;">
                        ${iniciales}
                    </div>
                    <span class="fw-semibold">${usuario.nombre}</span>
                </div>
            </td>
            <td>${usuario.email}</td>
            <td>
                <span class="badge rounded-pill ${usuario.rol === 'anfitrion' ? 'bg-success-subtle text-success' : 'bg-info-subtle text-info'} px-3">
                    ${usuario.rol === 'anfitrion' ? 'Anfitrión' : 'Inquilino'}
                </span>
            </td>
            <td>${usuario.telefono}</td>
            <td>
                <span class="badge ${usuario.estado === 'activo' ? 'bg-success' : 'bg-warning text-dark'} rounded-pill px-3">
                    ${usuario.estado === 'activo' ? 'Activo' : 'Pendiente'}
                </span>
            </td>
            <td>${usuario.fechaRegistro}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary rounded-pill px-3" onclick="verUsuario(${usuario.id}, event)">
                    <i class="bi bi-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Actualizar estado de botones
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
        if (e.target.classList.contains('usuario-checkbox')) {
            actualizarBotones();
        }
    });
    
    // Botón Añadir
    const btnAnadir = document.querySelector('button[data-bs-toggle="modal"]');
    if (btnAnadir) {
        btnAnadir.addEventListener('click', abrirModalNuevoUsuario);
    }
    
    // Formulario de nuevo usuario
    const formNuevoUsuario = document.getElementById('formNuevoUsuario');
    if (formNuevoUsuario) {
        formNuevoUsuario.addEventListener('submit', guardarNuevoUsuario);
    }
}

/**
 * Actualizar estado de botones según selección
 */
function actualizarBotones() {
    const seleccionados = document.querySelectorAll('tbody input[type="checkbox"]:checked').length;
    const btnEditar = document.querySelectorAll('button')[1];
    const btnEliminar = document.querySelectorAll('button')[2];
    
    if (btnEditar && btnEliminar) {
        btnEditar.disabled = seleccionados === 0;
        btnEliminar.disabled = seleccionados === 0;
    }
}

/**
 * Abrir modal para nuevo usuario
 */
function abrirModalNuevoUsuario() {
    const modal = new bootstrap.Modal(document.getElementById('modalNuevoUsuario'));
    modal.show();
}

/**
 * Guardar nuevo usuario
 */
function guardarNuevoUsuario(e) {
    e.preventDefault();
    
    const form = e.target;
    const nuevoUsuario = {
        nombre: form.querySelector('input[placeholder*="Nombre"]').value,
        email: form.querySelector('input[type="email"]').value,
        dni: form.querySelector('input[placeholder*="DNI"]').value,
        telefono: form.querySelector('input[type="tel"]').value,
        rol: form.querySelector('input[name="rol"]:checked').value
    };
    
    console.log('Guardando nuevo usuario:', nuevoUsuario);
    
    // Aquí iría la llamada a la API
    // api.post('/admin/usuarios', nuevoUsuario)
    //    .then(response => {
    //        alert('Usuario creado correctamente');
    //        cargarUsuarios();
    //        const modal = bootstrap.Modal.getInstance(document.getElementById('modalNuevoUsuario'));
    //        modal.hide();
    //        form.reset();
    //    })
    //    .catch(error => alert('Error: ' + error.message));
    
    alert('Usuario creado correctamente. Se enviará contraseña temporal al email.');
    cargarUsuarios();
    
    // Cerrar modal y resetear formulario
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalNuevoUsuario'));
    modal.hide();
    form.reset();
}

/**
 * Ver detalles de usuario
 */
function verUsuario(usuarioId, event) {
    event.preventDefault();
    console.log('Ver usuario:', usuarioId);
    alert('Abriendo detalles del usuario ID: ' + usuarioId);
}

/**
 * Editar usuario
 */
function editarUsuario() {
    const seleccionados = Array.from(document.querySelectorAll('tbody input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    
    if (seleccionados.length === 0) {
        alert('Selecciona un usuario para editar');
        return;
    }
    
    if (seleccionados.length > 1) {
        alert('Solo puedes editar un usuario a la vez');
        return;
    }
    
    console.log('Editando usuario:', seleccionados[0]);
    alert('Abriendo formulario de edición para usuario ID: ' + seleccionados[0]);
}

/**
 * Eliminar usuario
 */
function eliminarUsuario() {
    const seleccionados = Array.from(document.querySelectorAll('tbody input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    
    if (seleccionados.length === 0) {
        alert('Selecciona un usuario para eliminar');
        return;
    }
    
    if (confirm(`¿Estás seguro de que deseas eliminar ${seleccionados.length} usuario(s)?`)) {
        console.log('Eliminando usuarios:', seleccionados);
        
        // Aquí iría la llamada a la API
        // api.delete('/admin/usuarios', { ids: seleccionados })
        //    .then(response => {
        //        alert('Usuario(s) eliminado(s) correctamente');
        //        cargarUsuarios();
        //    })
        //    .catch(error => alert('Error: ' + error.message));
        
        alert('Usuario(s) eliminado(s) correctamente');
        cargarUsuarios();
    }
}