import { initI18n, t, applyTranslations, getLang, setLang } from '../i18n.js';

await initI18n();
applyTranslations();

const LANG_LABELS = { es: 'Español', en: 'English', gal: 'Galego' };

function updateLangLabel() {
    const label = document.getElementById('lang-label');
    if (label) label.textContent = LANG_LABELS[getLang()] ?? getLang();
}

updateLangLabel();

document.querySelectorAll('.lang-option').forEach(btn => {
    btn.addEventListener('click', async () => {
        await setLang(btn.dataset.lang);
        applyTranslations();
        updateLangLabel();
    });
});

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

    errorMessage.classList.add('d-none');
    errorMessage.textContent = '';

    try {
        const res = await apiPost('auth', 'LOGIN', { usuario: email, contrasena: password });

        if (!res.ok) {
            const mensajes = {
                'USUARIO_LOGIN_KO': t('login.userNotFound') || 'Usuario no encontrado.',
                'USUARIO_PASS_KO':  t('login.wrongPassword') || 'Contraseña incorrecta.',
                'USUARIO_INACTIVO_KO': t('login.inactiveUser') || 'La cuenta está desactivada.'
            };
            errorMessage.textContent = mensajes[res.code] || t('login.error') || 'Error al iniciar sesión.';
            errorMessage.classList.remove('d-none');
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
        errorMessage.textContent = 'Error técnico: ' + error.message;
        errorMessage.classList.remove('d-none');
    }
});
