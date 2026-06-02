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

    try {
        errorMessage.classList.add('d-none');
        errorMessage.textContent = '';

        await api.login(email, password);
        await auth.login(email, password);

        const role = auth.getRole();
        if (role === 'anfitrion') {
            window.location.href = 'dashboard-administrador.html';
        } else if (role === 'inquilino') {
            window.location.href = 'dashboard-administrador.html';
        }
    } catch (error) {
        console.error('Error en login:', error);
        errorMessage.textContent = error.message || t('login.error');
        errorMessage.classList.remove('d-none');
    }
});
