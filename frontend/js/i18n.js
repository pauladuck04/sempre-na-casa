// Módulo de internacionalización
// Uso (módulo):  import { t, initI18n, applyTranslations } from '../i18n.js';
// Uso (global):  window.t('login.title')  — disponible tras llamar a initI18n()

const DEFAULT_LANG = 'es';
const LANGS_DISPONIBLES = ['es', 'en', 'gal'];

let traducciones = {};
let idiomaActual = localStorage.getItem('lang') || DEFAULT_LANG;

/**
 * Carga el JSON del idioma y actualiza las traducciones activas.
 * Lanza el evento 'langChanged' en document cuando termina.
 */
export async function setLang(lang) {
    if (!LANGS_DISPONIBLES.includes(lang)) return;
    const res = await fetch(`./assets/translations/${lang}.json`);
    traducciones = await res.json();
    idiomaActual = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
    document.dispatchEvent(new CustomEvent('langChanged', { detail: { lang } }));
}

/**
 * Devuelve el valor de una clave con notación de puntos.
 * Si la clave no existe devuelve la propia clave como fallback.
 * Ejemplo: t('login.error') → "Error al iniciar sesión..."
 */
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
 * Llama a esto una vez al arrancar cada página, antes de usar t().
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
 * Conecta el selector de idioma del navbar (#langDropdown, #lang-label, .lang-option):
 * actualiza la etiqueta visible y engancha el cambio de idioma al hacer clic.
 * Debe llamarse cuando ese HTML ya esté en el DOM (tras cargar partials si vienen de fuera).
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
