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
        passError.classList.remove('d-none');
    } else {
        passError.classList.add('d-none');
    }
});


function mostrarError(msg) {
    errorMessage.textContent = msg;
    errorMessage.classList.remove('d-none');
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    errorMessage.classList.add('d-none');

    const dni      = document.getElementById('dni').value;
    const telefono = document.getElementById('telefono').value;
    const email    = document.getElementById('email').value;

    if (!/^[0-9]{8}[A-Z]$/.test(dni)) {
        mostrarError('El DNI debe tener 8 dígitos seguidos de una letra mayúscula (ej: 12345678A).');
        return;
    }
    if (!/^[0-9]{9}$/.test(telefono)) {
        mostrarError('El teléfono debe tener exactamente 9 dígitos.');
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        mostrarError('El formato del email no es válido.');
        return;
    }
    if (password.value !== password2.value) {
        passError.classList.remove('d-none');
        return;
    }

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
