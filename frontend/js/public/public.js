import { initI18n, applyTranslations, getLang, setLang } from '../i18n.js';

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
