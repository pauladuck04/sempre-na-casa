import { initI18n, t, applyTranslations } from '../i18n.js';

await initI18n();
applyTranslations();

const form           = document.getElementById('registro-form');
const errorMessage   = document.getElementById('error-message');
const rolInput       = document.getElementById('rol');
const rolLabel       = document.getElementById('rol-label');
const password       = document.getElementById('password');
const password2      = document.getElementById('password2');
const passError      = document.getElementById('pass-error');
const togglePassword  = document.querySelector('.toggle-password');
const togglePassword2 = document.querySelector('.toggle-password2');
const iconPass        = document.getElementById('icon-pass');
const iconPass2       = document.getElementById('icon-pass2');

// Obtener rol de URL
const urlParams = new URLSearchParams(window.location.search);
const rolParam  = urlParams.get('rol');
if (rolParam === 'anfitrion') {
    rolInput.value     = 'anfitrion';
    rolLabel.textContent = t('register.roleAnfitrion');
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
        passError.classList.remove('d-none');
    } else {
        passError.classList.add('d-none');
    }
});

form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (password.value !== password2.value) {
        passError.classList.remove('d-none');
        return;
    }

    const formData = {
        dni:       document.getElementById('dni').value,
        nombre:    document.getElementById('nombre').value,
        apellidos: document.getElementById('apellidos').value,
        email:     document.getElementById('email').value,
        telefono:  document.getElementById('telefono').value,
        password:  password.value,
        rol:       rolInput.value
    };

    sessionStorage.setItem('newUser', JSON.stringify(formData));
    window.location.href = `encuesta.html?rol=${formData.rol}`;
});
