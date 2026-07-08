import { initI18n, t, applyTranslations, getLang, setLang } from '../i18n.js';
import { mostrarErrorCampo, ocultarErrorCampo } from '../form-errors.js';

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

const form        = document.getElementById('contacto-form');
const successBox  = document.getElementById('contacto-success');
const nombreInput = document.getElementById('contacto-nombre');
const emailInput  = document.getElementById('contacto-email');
const asuntoInput = document.getElementById('contacto-asunto');
const mensajeInput = document.getElementById('contacto-mensaje');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    successBox.classList.add('d-none');
    [nombreInput, emailInput, asuntoInput, mensajeInput].forEach(ocultarErrorCampo);

    let valido = true;
    if (!nombreInput.value.trim()) { mostrarErrorCampo(nombreInput, t('contact.form.nameRequired')); valido = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) { mostrarErrorCampo(emailInput, t('contact.form.emailInvalid')); valido = false; }
    if (!asuntoInput.value.trim()) { mostrarErrorCampo(asuntoInput, t('contact.form.subjectRequired')); valido = false; }
    if (!mensajeInput.value.trim()) { mostrarErrorCampo(mensajeInput, t('contact.form.messageRequired')); valido = false; }

    if (!valido) return;

    form.reset();
    successBox.classList.remove('d-none');
    successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
