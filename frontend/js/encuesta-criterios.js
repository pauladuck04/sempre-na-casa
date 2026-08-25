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
                <div class="col-12 col-md-4">
                    <input type="radio" class="btn-check" name="${nombreCampo}" id="${id}" value="${opcion.id_opcion}">
                    <label class="btn btn-outline-light-custom w-100 p-3" for="${id}">${opcion.nombre_opcion}</label>
                </div>`;
        });
        html += `</div>`;

        const idPeso        = `${nombreCampo}-peso`;
        const idRestrictivo = `${nombreCampo}-restrictivo`;
        const idExcluyente  = `${nombreCampo}-excluyente`;
        html += `
            <div class="row g-2 align-items-center mt-2">
                <div class="col-auto">
                    <label class="form-label small text-muted mb-0" for="${idPeso}" data-i18n="survey.weightLabel">Importancia para mí</label>
                    <select class="form-select form-select-sm" id="${idPeso}" data-peso>
                        <option value="1" data-i18n="survey.weightLow">1 - Baja</option>
                        <option value="3" selected data-i18n="survey.weightMedium">3 - Media</option>
                        <option value="5" data-i18n="survey.weightHigh">5 - Alta</option>
                    </select>
                </div>
                <div class="col-auto form-check">
                    <input type="checkbox" class="form-check-input" id="${idRestrictivo}" data-restrictivo>
                    <label class="form-check-label small" for="${idRestrictivo}" data-i18n="survey.restrictiveLabel">Es imprescindible para mí</label>
                </div>
                <div class="col-auto">
                    <label class="form-label small text-muted mb-0" for="${idExcluyente}" data-i18n="survey.exclusionOptionLabel">Opción que no acepto</label>
                    <select class="form-select form-select-sm" id="${idExcluyente}" data-excluyente disabled>
                        <option value="" data-i18n="survey.exclusionOptionNone">Ninguna</option>
                        ${opcionesCriterio.map(o => `<option value="${o.id_opcion}">${o.nombre_opcion}</option>`).join('')}
                    </select>
                </div>
            </div>`;

        html += `</div>`;
    });
    contenedor.innerHTML = html;

    conectarControlOpcionExcluyente(contenedor);
}

function conectarControlOpcionExcluyente(contenedor) {
    contenedor.querySelectorAll('[data-criterio]').forEach(seccion => {
        const chkRestrictivo = seccion.querySelector('[data-restrictivo]');
        const selExcluyente  = seccion.querySelector('[data-excluyente]');
        if (!chkRestrictivo || !selExcluyente) return;

        chkRestrictivo.addEventListener('change', () => {
            selExcluyente.disabled = !chkRestrictivo.checked;
            if (!chkRestrictivo.checked) selExcluyente.value = '';
        });
    });
}

/**
 * Lee, para un bloque de criterio ya renderizado por renderPreguntasEncuesta(), la opcion
 * elegida como respuesta y las preferencias propias (peso/restrictivo/opcion a excluir) listas
 * para mandar en el payload de ADD/UPSERT_RESPUESTA/updateOpcion.
 * @param {HTMLElement} seccion elemento con [data-criterio], tal como lo devuelve
 *   `contenedor.querySelectorAll('[data-criterio]')`.
 * @returns {{idOpcion: string, peso: string, restrictivo: number, idOpcionExcluyente: string}|null}
 *   null si no se ha elegido ninguna opcion en ese criterio. idOpcionExcluyente es '' si no se
 *   ha marcado ninguna opcion a excluir.
 */
export function leerRespuestaCriterio(seccion) {
    const marcado = seccion.querySelector('.btn-check:checked');
    if (!marcado) return null;
    const chkRestrictivo = seccion.querySelector('[data-restrictivo]');
    const selExcluyente  = seccion.querySelector('[data-excluyente]');
    return {
        idOpcion:            marcado.value,
        peso:                seccion.querySelector('[data-peso]')?.value || '3',
        restrictivo:         chkRestrictivo?.checked ? 1 : 0,
        idOpcionExcluyente:  (chkRestrictivo?.checked && selExcluyente?.value) || ''
    };
}
