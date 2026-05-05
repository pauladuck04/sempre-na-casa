// js/public/perfil-anfitrion.js

const usuario = {
    nombre:    'Ana García López',
    iniciales: 'AG',
    email:     'ana.garcia@semprenacasa.es',
    telefono:  '+34 600 123 456',
    rol:       'Anfitrión',
    ciudad:    'Santiago de Compostela',
    dni:       '12345678A',
    fechaAlta: 'enero de 2024',
};

document.addEventListener('DOMContentLoaded', function () {
    const btnEditar      = document.getElementById('btnEditarPerfil');
    const btnCancelar    = document.getElementById('btnCancelarEdicion');
    const accionesEdit   = document.getElementById('acciones-edicion');
    const formPerfil     = document.getElementById('formPerfil');
    const inputs         = Array.from(formPerfil.querySelectorAll('input'));
    let valoresOriginales = {};

    // ---- Modo edición ----
    btnEditar.addEventListener('click', () => {
        valoresOriginales = {};
        inputs.forEach(inp => {
            valoresOriginales[inp.id] = inp.value;
            inp.disabled = false;
        });
        btnEditar.classList.add('d-none');
        accionesEdit.classList.remove('d-none');
        accionesEdit.classList.add('d-flex');
        document.getElementById('input-nombre').focus();
    });

    // ---- Cancelar edición ----
    btnCancelar.addEventListener('click', () => {
        inputs.forEach(inp => {
            inp.value    = valoresOriginales[inp.id];
            inp.disabled = true;
            inp.classList.remove('is-invalid');
        });
        btnEditar.classList.remove('d-none');
        accionesEdit.classList.add('d-none');
        accionesEdit.classList.remove('d-flex');
    });

    // ---- Guardar datos personales ----
    formPerfil.addEventListener('submit', function (e) {
        e.preventDefault();

        const nombre = document.getElementById('input-nombre').value.trim();
        const email  = document.getElementById('input-email').value.trim();

        if (!nombre) {
            marcarInvalido('input-nombre', 'El nombre no puede estar vacío.');
            return;
        }
        if (!email.includes('@')) {
            marcarInvalido('input-email', 'Introduce un correo válido.');
            return;
        }

        usuario.nombre   = nombre;
        usuario.email    = email;
        usuario.telefono = document.getElementById('input-telefono').value.trim();
        usuario.ciudad   = document.getElementById('input-ciudad').value.trim();
        usuario.dni      = document.getElementById('input-dni').value.trim();

        inputs.forEach(inp => {
            inp.disabled = true;
            inp.classList.remove('is-invalid');
        });
        btnEditar.classList.remove('d-none');
        accionesEdit.classList.add('d-none');
        accionesEdit.classList.remove('d-flex');

        document.getElementById('display-nombre').textContent = usuario.nombre;
        mostrarToast('Datos personales actualizados correctamente.', 'success');
    });

    // ---- Mostrar/ocultar contraseña ----
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

    // ---- Indicador de fortaleza ----
    document.getElementById('input-pwd-nueva').addEventListener('input', function () {
        const val  = this.value;
        const wrap = document.getElementById('pwd-strength-wrap');
        const bar  = document.getElementById('pwd-strength-bar');
        const txt  = document.getElementById('pwd-strength-text');

        if (!val) { wrap.style.display = 'none'; return; }
        wrap.style.display = 'block';

        const nivel = calcularFortaleza(val);
        const config = {
            1: { pct: 25, color: '#dc3545', label: 'Muy débil' },
            2: { pct: 50, color: '#fd7e14', label: 'Débil' },
            3: { pct: 75, color: '#ffc107', label: 'Moderada' },
            4: { pct: 100, color: '#28a745', label: 'Fuerte' },
        }[nivel];

        bar.style.width           = config.pct + '%';
        bar.style.backgroundColor = config.color;
        txt.textContent           = config.label;
        txt.style.color           = config.color;
    });

    // ---- Cambiar contraseña ----
    document.getElementById('formPassword').addEventListener('submit', function (e) {
        e.preventDefault();
        const actual    = document.getElementById('input-pwd-actual').value;
        const nueva     = document.getElementById('input-pwd-nueva').value;
        const confirmar = document.getElementById('input-pwd-confirmar').value;
        const feedback  = document.getElementById('pwd-feedback');

        feedback.innerHTML = '';

        if (!actual) {
            feedback.innerHTML = errorHtml('Introduce tu contraseña actual.');
            return;
        }
        if (nueva.length < 8) {
            feedback.innerHTML = errorHtml('La nueva contraseña debe tener al menos 8 caracteres.');
            return;
        }
        if (nueva !== confirmar) {
            feedback.innerHTML = errorHtml('Las contraseñas no coinciden.');
            return;
        }

        this.reset();
        document.getElementById('pwd-strength-wrap').style.display = 'none';
        mostrarToast('Contraseña actualizada correctamente.', 'success');
    });

    // ---- Eliminar cuenta ----
    document.getElementById('btnEliminarCuenta').addEventListener('click', () => {
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEliminarCuenta')).show();
    });

    document.getElementById('btnConfirmarEliminar').addEventListener('click', () => {
        bootstrap.Modal.getInstance(document.getElementById('modalEliminarCuenta')).hide();
        mostrarToast('Cuenta eliminada. Redirigiendo...', 'danger');
        setTimeout(() => { window.location.href = 'public.html'; }, 2000);
    });
});

// ============================================
// UTILIDADES
// ============================================

function marcarInvalido(id, mensaje) {
    const el = document.getElementById(id);
    el.classList.add('is-invalid');
    let feedback = el.nextElementSibling;
    if (!feedback || !feedback.classList.contains('invalid-feedback')) {
        feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        el.after(feedback);
    }
    feedback.textContent = mensaje;
}

function calcularFortaleza(pwd) {
    let puntos = 0;
    if (pwd.length >= 8)              puntos++;
    if (/[A-Z]/.test(pwd))            puntos++;
    if (/[0-9]/.test(pwd))            puntos++;
    if (/[^A-Za-z0-9]/.test(pwd))     puntos++;
    return Math.max(1, puntos);
}

function errorHtml(texto) {
    return `<p class="text-danger small mb-0"><i class="bi bi-x-circle me-1"></i>${texto}</p>`;
}

function mostrarToast(mensaje, tipo = 'success') {
    const toast = document.getElementById('toastPerfil');
    toast.className = `toast align-items-center border-0 text-bg-${tipo}`;
    document.getElementById('toastMensaje').textContent = mensaje;
    bootstrap.Toast.getOrCreateInstance(toast, { delay: 3000 }).show();
}
