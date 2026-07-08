import { initI18n, applyTranslations, getLang, setLang } from '../i18n.js';
import { cargarPartials } from '../partials.js';

await cargarPartials();
await initI18n();
applyTranslations();

if (document.body.hasAttribute('data-hide-nav-auth')) {
    document.getElementById('navbar-btn-register')?.remove();
    document.getElementById('navbar-btn-login')?.remove();
}

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
