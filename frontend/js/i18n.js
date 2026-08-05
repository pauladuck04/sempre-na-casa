const DEFAULT_LANG = 'es';
const LANGS_DISPONIBLES = ['es', 'en', 'gal'];

let traducciones = {};
let idiomaActual = getCookie('lang') || DEFAULT_LANG;

export async function setLang(lang) {
    if (!LANGS_DISPONIBLES.includes(lang)) return;
    const res = await fetch(new URL(`../assets/translations/${lang}.json`, import.meta.url));
    traducciones = await res.json();
    idiomaActual = lang;
    setCookie('lang', lang, 365);
    document.documentElement.lang = lang;
    document.dispatchEvent(new CustomEvent('langChanged', { detail: { lang } }));
}

export function t(clave) {
    const partes = clave.split('.');
    let valor = traducciones;
    for (const parte of partes) {
        valor = valor?.[parte];
        if (valor === undefined) return clave;
    }
    return valor ?? clave;
}

/** Devuelve el código del idioma activo ('es', 'en' o 'gal'). */
export function getLang() {
    return idiomaActual;
}

/**
 * Recorre el DOM (o el nodo raíz indicado) y aplica traducciones a:
 *   data-i18n="clave"        → textContent del elemento
 *   data-i18n-ph="clave"     → placeholder del input
 *   data-i18n-title="clave"  → atributo title
 */
export function applyTranslations(root = document) {
    root.querySelectorAll('[data-i18n]').forEach(el => {
        const val = t(el.getAttribute('data-i18n'));
        if (val !== el.getAttribute('data-i18n')) el.textContent = val;
    });
    root.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const val = t(el.getAttribute('data-i18n-ph'));
        if (val !== el.getAttribute('data-i18n-ph')) el.placeholder = val;
    });
    root.querySelectorAll('[data-i18n-title]').forEach(el => {
        const val = t(el.getAttribute('data-i18n-title'));
        if (val !== el.getAttribute('data-i18n-title')) el.title = val;
    });
}

/**
 * Inicializa i18n y expone t(), setLang(), getLang() y applyTranslations() globalmente.
 */
export async function initI18n(lang) {
    await setLang(lang || idiomaActual);
    window.t                = t;
    window.setLang          = setLang;
    window.getLang          = getLang;
    window.applyTranslations = applyTranslations;
}

const LANG_LABELS = { es: 'Español', en: 'English', gal: 'Galego' };

/**
 * Conecta el selector de idioma del navbar:
 * actualiza la etiqueta visible y engancha el cambio de idioma al hacer clic.
 * Debe llamarse cuando ese HTML ya esté en el DOM.
 */
export function initLangDropdown() {
    const actualizarEtiqueta = () => {
        const label = document.getElementById('lang-label');
        if (label) label.textContent = LANG_LABELS[getLang()] ?? getLang();
    };
    actualizarEtiqueta();

    document.querySelectorAll('.lang-option').forEach(btn => {
        btn.addEventListener('click', async () => {
            await setLang(btn.dataset.lang);
            applyTranslations();
            actualizarEtiqueta();
        });
    });
}
