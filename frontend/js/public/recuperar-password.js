import { initI18n, t, applyTranslations } from '../i18n.js';
import { mostrarErrorFormulario, ocultarErrorFormulario } from '../form-errors.js';

await initI18n();
applyTranslations();

const form           = document.getElementById('recuperar-form');
const emailInput     = document.getElementById('email');
const successMessage = document.getElementById('success-message');
const errorMessage   = document.getElementById('error-message');
const btnRecuperar   = document.getElementById('btn-recuperar');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();

    successMessage.classList.add('d-none');
    ocultarErrorFormulario(errorMessage);

    if (!email) {
        mostrarErrorFormulario(errorMessage, t('recoverPassword.emailRequired'));
        return;
    }

    btnRecuperar.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> ${t('recoverPassword.sending')}`;
    btnRecuperar.disabled  = true;

    try {
        await api.request('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email })
        });

        successMessage.classList.remove('d-none');
        form.reset();

        emailInput.disabled = true;
        setTimeout(() => {
            emailInput.disabled    = false;
            btnRecuperar.textContent = t('recoverPassword.submit');
            btnRecuperar.disabled  = false;
        }, 5000);

    } catch (error) {
        console.error('Error en recuperar contraseña:', error);
        mostrarErrorFormulario(errorMessage, error.message || t('recoverPassword.error'));

        btnRecuperar.textContent = t('recoverPassword.submit');
        btnRecuperar.disabled    = false;

        window.scrollTo(0, 0);
    }
});
