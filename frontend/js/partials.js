// Carga fragmentos HTML compartidos (navbar, footer...) dentro de contenedores marcados
// con data-partial="ruta/al/fragmento.html". Debe llamarse antes de applyTranslations()
// para que las claves data-i18n del fragmento se traduzcan también.

export async function cargarPartials(root = document) {
    const contenedores = Array.from(root.querySelectorAll('[data-partial]'));
    await Promise.all(contenedores.map(async (el) => {
        const url = el.getAttribute('data-partial');
        try {
            const res = await fetch(url);
            el.innerHTML = await res.text();
        } catch (err) {
            console.error(`No se pudo cargar el parcial "${url}":`, err);
        }
    }));
}
