import { initI18n, t, applyTranslations, initLangDropdown } from './i18n.js';
import { mostrarErrorCampo, ocultarErrorCampo } from './form-errors.js';

await initI18n();
applyTranslations();
initLangDropdown();

const form           = document.getElementById('registro-form');
const rolInput       = document.getElementById('rol');
const rolLabel       = document.getElementById('rol-label');
const dniInput       = document.getElementById('dni');
const telefonoInput  = document.getElementById('telefono');
const emailInput     = document.getElementById('email');
const password       = document.getElementById('password');
const password2      = document.getElementById('password2');
const togglePassword  = document.querySelector('.toggle-password');
const togglePassword2 = document.querySelector('.toggle-password2');
const iconPass        = document.getElementById('icon-pass');
const iconPass2       = document.getElementById('icon-pass2');

// Obtener rol de URL
const urlParams = new URLSearchParams(window.location.search);
const rolParam  = (urlParams.get('rol') || '').toLowerCase();
if (rolParam === 'anfitrion') {
    rolInput.value = 'anfitrion';
    rolLabel.textContent = t('register.roleAnfitrion');
} else {
    rolInput.value = 'huesped';
    rolLabel.textContent = t('register.studentRole');
}

// Toggle mostrar/ocultar contraseña
togglePassword.addEventListener('click', () => {
    if (password.type === 'password') {
        password.type = 'text';
        iconPass.classList.replace('bi-eye', 'bi-eye-slash');
    } else {
        password.type = 'password';
        iconPass.classList.replace('bi-eye-slash', 'bi-eye');
    }
});

togglePassword2.addEventListener('click', () => {
    if (password2.type === 'password') {
        password2.type = 'text';
        iconPass2.classList.replace('bi-eye', 'bi-eye-slash');
    } else {
        password2.type = 'password';
        iconPass2.classList.replace('bi-eye-slash', 'bi-eye');
    }
});

password2.addEventListener('input', () => {
    if (password.value !== password2.value) {
        mostrarErrorCampo(password2, t('register.passwordMismatch'));
    } else {
        ocultarErrorCampo(password2);
    }
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    [dniInput, telefonoInput, emailInput, password2].forEach(ocultarErrorCampo);

    const dni      = dniInput.value;
    const telefono = telefonoInput.value;
    const email    = emailInput.value;
    let valido = true;

    if (!/^[0-9]{8}[A-Z]$/.test(dni)) {
        mostrarErrorCampo(dniInput, t('register.dniInvalid'));
        valido = false;
    }
    if (!/^[0-9]{9}$/.test(telefono)) {
        mostrarErrorCampo(telefonoInput, t('register.phoneInvalid'));
        valido = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        mostrarErrorCampo(emailInput, t('register.emailInvalid'));
        valido = false;
    }
    if (password.value !== password2.value) {
        mostrarErrorCampo(password2, t('register.passwordMismatch'));
        valido = false;
    }

    if (!valido) return;

    const rolSeleccionado = rolInput.value === 'anfitrion' ? 'anfitrion' : 'huesped';
    const idRolSeleccionado = rolSeleccionado === 'anfitrion' ? 4 : 5;

    const formData = {
        dni:       document.getElementById('dni').value,
        nombre:    document.getElementById('nombre').value,
        apellidos: document.getElementById('apellidos').value,
        email:     document.getElementById('email').value,
        telefono:  document.getElementById('telefono').value,
        password:  password.value,
        rol:       rolSeleccionado,
        id_rol:    idRolSeleccionado
    };

    sessionStorage.setItem('newUser', JSON.stringify(formData));
    window.location.href = `encuesta.html?rol=${formData.rol}`;
});
