import { initI18n, t, applyTranslations } from './i18n.js';
import { mostrarErrorFormulario, ocultarErrorFormulario, mostrarErrorCampo, ocultarErrorCampo } from './form-errors.js';
import { inicializarTogglePassword, inicializarMedidorFortaleza } from './perfil-comun.js';

await initI18n();
applyTranslations();
inicializarTogglePassword();
inicializarMedidorFortaleza();

const form         = document.getElementById('reset-form');
const errorMessage = document.getElementById('error-message');
const successBlock = document.getElementById('success-block');
const btn           = document.getElementById('btn-restablecer');
const nuevaInput    = document.getElementById('pwd-nueva');
const confirmaInput = document.getElementById('pwd-confirmar');

const token = new URLSearchParams(window.location.search).get('token');

function mostrarSoloError(mensaje, { conEnlaceNuevo = false } = {}) {
    form.classList.add('d-none');
    let html = mensaje;
    if (conEnlaceNuevo) {
        html += ` <a href="recuperar-password.html">${t('resetPassword.requestNewLink')}</a>`;
    }
    mostrarErrorFormulario(errorMessage, html);
}

if (!token) {
    mostrarSoloError(t('resetPassword.noToken'), { conEnlaceNuevo: true });
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    ocultarErrorFormulario(errorMessage);
    [nuevaInput, confirmaInput].forEach(ocultarErrorCampo);

    if (nuevaInput.value.length < 8) { mostrarErrorCampo(nuevaInput, t('profile.passwordTooShort')); return; }
    if (nuevaInput.value !== confirmaInput.value) { mostrarErrorCampo(confirmaInput, t('profile.passwordMismatch')); return; }

    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> ${t('resetPassword.processing')}`;
    btn.disabled  = true;

    try {
        const res = await apiPost('auth', 'RESTABLECER_PASSWORD', { token, password: nuevaInput.value });

        if (!res.ok) {
            const mensajes = {
                TOKEN_INVALIDO_KO: t('resetPassword.invalidToken'),
                TOKEN_EXPIRADO_KO: t('resetPassword.expiredToken')
            };
            mostrarSoloError(mensajes[res.code] || t('resetPassword.error'), { conEnlaceNuevo: res.code in mensajes });
            return;
        }

        form.classList.add('d-none');
        successBlock.classList.remove('d-none');

    } catch (error) {
        console.error('Error al restablecer contraseña:', error);
        mostrarErrorFormulario(errorMessage, error.message || t('resetPassword.error'));
    } finally {
        btn.textContent = t('resetPassword.submit');
        btn.disabled    = false;
    }
});
