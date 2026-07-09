// Fuente única de verdad para las 10 preguntas del cuestionario de convivencia.
// Se usa tanto en el registro de huéspedes (encuesta.html) como en el alta de
// vivienda del anfitrión (dashboard-anfitrion.html) — antes estaban calcadas
// a mano en los dos sitios.

const TOTAL_PREGUNTAS = 10;
const OPCIONES_POR_PREGUNTA = 3;

/**
 * Pinta las N preguntas dentro de `contenedor` como bloques `[data-criterio]`
 * con radios `.btn-check` agrupados por pregunta (comportamiento idéntico al
 * HTML estático que sustituye). Los valores de cada opción son 1..30, la misma
 * numeración secuencial que ya usaban ambas páginas.
 */
export function renderPreguntasEncuesta(contenedor, opciones = {}) {
    if (!contenedor) return;
    const {
        namePrefix  = 'q',
        headingTag  = 'h5',
        headingClass = 'fw-bold mb-4',
        wrapperClass = 'mb-5',
        rowClass     = 'row g-3'
    } = opciones;

    let html = '';
    for (let n = 1; n <= TOTAL_PREGUNTAS; n++) {
        const nombreCampo = `${namePrefix}${n}`;
        html += `<div class="${wrapperClass}" data-criterio="${n}">`;
        html += `<${headingTag} class="${headingClass}" data-i18n="survey.q${n}.title"></${headingTag}>`;
        html += `<div class="${rowClass}">`;
        for (let o = 1; o <= OPCIONES_POR_PREGUNTA; o++) {
            const valor = (n - 1) * OPCIONES_POR_PREGUNTA + o;
            const id = `${nombreCampo}-${o}`;
            html += `
                <div class="col-md-4">
                    <input type="radio" class="btn-check" name="${nombreCampo}" id="${id}" value="${valor}">
                    <label class="btn btn-outline-light-custom w-100 p-3" for="${id}" data-i18n="survey.q${n}.o${o}"></label>
                </div>`;
        }
        html += `</div></div>`;
    }
    contenedor.innerHTML = html;
}
