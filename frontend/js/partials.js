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
