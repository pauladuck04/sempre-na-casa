// Fuente única de verdad para las preguntas del cuestionario de convivencia.
// Se usa tanto en el registro de huéspedes (encuesta.html) como en el alta de
// vivienda del anfitrión (dashboard-anfitrion.html) — antes estaban calcadas
// a mano en los dos sitios.
//
// Carga TODOS los criterios y opciones activos desde el backend (sin límite
// fijo de preguntas/opciones), en vez de tener un número fijo hardcodeado.

/**
 * Pinta un bloque `[data-criterio]` por cada criterio activo, con radios
 * `.btn-check` agrupados por criterio (comportamiento idéntico al HTML
 * estático que sustituye). El `value` de cada opción es su id_opcion real.
 */
export async function renderPreguntasEncuesta(contenedor, opciones = {}) {
    if (!contenedor) return;
    const {
        namePrefix  = 'q',
        headingTag  = 'h5',
        headingClass = 'fw-bold mb-4',
        wrapperClass = 'mb-5',
        rowClass     = 'row g-3'
    } = opciones;

    const [resCriterios, resOpciones] = await Promise.all([
        apiPost('criterio', 'getAll'),
        apiPost('opcion', 'getAll')
    ]);

    const criterios = (resCriterios.ok && Array.isArray(resCriterios.resource))
        ? resCriterios.resource.filter(c => c.activo_criterio == 1)
        : [];

    const opcionesPorCriterio = new Map();
    if (resOpciones.ok && Array.isArray(resOpciones.resource)) {
        resOpciones.resource
            .filter(o => o.activo_opcion == 1)
            .forEach(o => {
                const lista = opcionesPorCriterio.get(o.id_criterio) || [];
                lista.push(o);
                opcionesPorCriterio.set(o.id_criterio, lista);
            });
    }

    let html = '';
    criterios.forEach(criterio => {
        const nombreCampo = `${namePrefix}${criterio.id_criterio}`;
        const opcionesCriterio = opcionesPorCriterio.get(criterio.id_criterio) || [];

        html += `<div class="${wrapperClass}" data-criterio="${criterio.id_criterio}">`;
        html += `<${headingTag} class="${headingClass}">${criterio.nombre_criterio}</${headingTag}>`;
        html += `<div class="${rowClass}">`;
        opcionesCriterio.forEach(opcion => {
            const id = `${nombreCampo}-${opcion.id_opcion}`;
            html += `
                <div class="col-md-4">
                    <input type="radio" class="btn-check" name="${nombreCampo}" id="${id}" value="${opcion.id_opcion}">
                    <label class="btn btn-outline-light-custom w-100 p-3" for="${id}">${opcion.nombre_opcion}</label>
                </div>`;
        });
        html += `</div></div>`;
    });
    contenedor.innerHTML = html;
}
