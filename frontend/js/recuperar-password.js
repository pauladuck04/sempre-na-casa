import { initI18n, t, applyTranslations } from './i18n.js';
import { mostrarErrorFormulario, ocultarErrorFormulario } from './form-errors.js';

await initI18n();
applyTranslations();

const form           = document.getElementById('recuperar-form');
const emailInput     = document.getElementById('email');
const successMessage = document.getElementById('success-message');
const errorMessage   = document.getElementById('error-message');
const btnRecuperar   = document.getElementById('btn-recuperar');
const resetLink       = document.getElementById('reset-link');

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
        const res = await apiPost('auth', 'RECUPERAR_PASSWORD', { mail: email });

        if (!res.ok) {
            const mensaje = res.code === 'USUARIO_NO_ENCONTRADO_KO'
                ? t('recoverPassword.userNotFound')
                : t('recoverPassword.error');
            mostrarErrorFormulario(errorMessage, mensaje);
            return;
        }

        const url = new URL(`restablecer-password.html?token=${encodeURIComponent(res.resource.token)}`, window.location.href);
        resetLink.href = url.href;
        successMessage.classList.remove('d-none');
        form.reset();

    } catch (error) {
        console.error('Error en recuperar contraseña:', error);
        mostrarErrorFormulario(errorMessage, error.message || t('recoverPassword.error'));
        window.scrollTo(0, 0);
    } finally {
        btnRecuperar.textContent = t('recoverPassword.submit');
        btnRecuperar.disabled    = false;
    }
});
