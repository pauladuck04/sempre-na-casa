import { initI18n, t, applyTranslations, initLangDropdown } from '../i18n.js';
import { mostrarErrorFormulario, ocultarErrorFormulario } from '../form-errors.js';

await initI18n();
applyTranslations();
initLangDropdown();

const form           = document.getElementById('login-form');
const errorMessage   = document.getElementById('error-message');
const togglePassword = document.querySelector('.toggle-password');
const passwordInput  = document.getElementById('password');
const toggleIcon     = document.getElementById('toggleIcon');

togglePassword.addEventListener('click', () => {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.replace('bi-eye', 'bi-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.replace('bi-eye-slash', 'bi-eye');
    }
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email    = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    ocultarErrorFormulario(errorMessage);

    try {
        const res = await apiPost('auth', 'LOGIN', { usuario: email, contrasena: password });

        if (!res.ok) {
            const mensajes = {
                'USUARIO_LOGIN_KO': t('login.userNotFound') || 'Usuario no encontrado.',
                'USUARIO_PASS_KO':  t('login.wrongPassword') || 'Contraseña incorrecta.',
                'USUARIO_INACTIVO_KO': t('login.inactiveUser') || 'La cuenta está desactivada.'
            };
            mostrarErrorFormulario(errorMessage, mensajes[res.code] || t('login.error') || 'Error al iniciar sesión.');
            return;
        }

        const usuario = res.resource.usuario;
        localStorage.setItem('user_token',    res.resource.token);
        localStorage.setItem('user_id',       usuario.id_usuario);
        localStorage.setItem('user_email',    usuario.mail);
        localStorage.setItem('user_nombre',   usuario.nombre_usuario + ' ' + usuario.apellidos);
        localStorage.setItem('user_id_rol',   usuario.id_rol);
        localStorage.setItem('user_rol',      usuario.nombre_rol || '');

        const rol = (usuario.nombre_rol || '').toLowerCase()
            .normalize('NFD').replace(/[̀-ͯ]/g, '');

        if (rol.includes('admin')) {
            window.location.href = 'dashboard-administrador.html';
        } else if (rol.includes('anfitrion')) {
            window.location.href = 'dashboard-anfitrion.html';
        } else {
            const resRespuestas = await apiPost('usuario_criterio_opcion', 'getByUsuario', { id_usuario: usuario.id_usuario });
            const tieneRespuestas = resRespuestas.ok && Array.isArray(resRespuestas.resource) && resRespuestas.resource.length > 0;
            window.location.href = tieneRespuestas ? 'dashboard-huesped.html' : 'encuesta.html';
        }

    } catch (error) {
        console.error('Error en login:', error);
        mostrarErrorFormulario(errorMessage, 'Error técnico: ' + error.message);
    }
});
