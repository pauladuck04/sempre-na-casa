// Puente mínimo a las traducciones reales del proyecto (frontend/assets/translations), para
// no duplicar un segundo sistema de idiomas solo para el test runner. No es un módulo (esta
// página carga todo como <script> clásico) así que no reutiliza directamente
// frontend/js/i18n.js — que además resuelve su propio fetch relativo a la página que lo
// carga, y aquí resolvería mal (frontend/js/i18n.js pide './assets/...', que desde
// pruebas/ apuntaría a pruebas/assets/, inexistente). Usa el mismo idioma guardado en la
// cookie 'lang' por el resto de la app (cookies.js ya está cargado antes que este script).
let _traduccionesPruebas = {};

async function initI18nPruebas(lang) {
    const idioma = lang || getCookie('lang') || 'es';
    const res = await fetch(`../frontend/assets/translations/${idioma}.json`);
    _traduccionesPruebas = await res.json();
}

function t(clave) {
    const partes = clave.split('.');
    let valor = _traduccionesPruebas;
    for (const parte of partes) {
        valor = valor?.[parte];
        if (valor === undefined) return clave;
    }
    return valor ?? clave;
}
