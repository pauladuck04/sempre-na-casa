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
