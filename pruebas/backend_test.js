// Runner de pruebas de backend: reutiliza los mismos casos de pruebas/pruebas.js que usa
// test_runner.html (Data_Test), pero en vez de invocar los métodos de validación del propio
// JS, hace una llamada real a apiPost(entidad, accion, payload) contra el backend PHP (ver
// pruebas/backend_fixtures.js para cómo se construye un payload completo y válido por fila).
class Backend_Test {

    constructor(nombreEntidad) {
        this.nombreEntidad = nombreEntidad;
        this.dom = new DOM_class();
        this.array_def_tests = eval(nombreEntidad + '_def_tests');
        this.array_pruebas_nofile = eval(nombreEntidad + '_tests_fields');
        this.contextoBackend = null;
    }

    /** Punto de entrada async: primero prepara el contexto de backend de la entidad (puede
     * implicar crear varias filas reales de fixture), y solo entonces ejecuta las pruebas. */
    async ejecutar() {
        try {
            this.contextoBackend = await crearContextoBackend(this.nombreEntidad);
        } catch (e) {
            console.error('No se pudo preparar el contexto de backend:', e);
            this.contextoBackend = { idPrincipal: null, async payloadPara() { throw e; } };
        }
        const salida = await this._ejecutarCasos();
        this._mostrarResultados(salida);
    }

    devolver_def(numDef) {
        return this.array_def_tests.find(d => d[3] === numDef);
    }

    async _ejecutarCasos() {
        const pruebas = this.array_pruebas_nofile;
        const salida = [];

        for (let i = 0; i < pruebas.length; i++) {
            const [entidad, campo, numDef, numPrueba, accion, overridesArr, respuestaesperada] = pruebas[i];

            const overrides = {};
            let valorprueba = '';
            overridesArr.forEach(obj => {
                for (const clave in obj) {
                    overrides[clave] = obj[clave];
                    valorprueba += clave + '=' + obj[clave] + '<br>';
                }
            });

            const def = this.devolver_def(numDef);
            const descripcion = def ? def[4] : '';

            const resultado = await compararConBackend(entidad, accion, this.contextoBackend, numPrueba, overrides, respuestaesperada);

            salida.push({
                entidad, campo, NumDef: numDef, NumPrueba: numPrueba, descripcion, accion,
                valorprueba, respuestaesperada,
                backend_status: resultado.backend_status,
                backend_code: resultado.backend_code
            });
        }

        return salida;
    }

    // Ventana emergente con el mismo aspecto que la de Data_Test (ver pruebas/data.js), para
    // que los resultados de ambos runners se vean consistentes.
    _mostrarResultados(salida) {
        let marcados = {
            backend_status: { value: 'BACKEND_MAS_ESTRICTO', clase: 'table-danger' }
        };

        const anchoVentana = Math.round(screen.availWidth * 0.9);
        const altoVentana  = Math.round(screen.availHeight * 0.9);
        const newWindow = window.open("", "Nueva Ventana Backend", `width=${anchoVentana},height=${altoVentana}`);
        newWindow.resizeTo(anchoVentana, altoVentana);
        newWindow.moveTo(0, 0);
        newWindow.focus();

        newWindow.document.head.innerHTML = `
            <meta charset="UTF-8">
            <title>Resultados de pruebas de backend</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <link rel="stylesheet" href="../frontend/css/main.css?v=3">
            <style>
                * { box-sizing: border-box; }
                html, body { height: 100%; margin: 0; }
                body { display: flex; flex-direction: column; overflow: hidden; }
                #resultados-wrap { flex: 1 1 0; min-height: 0; overflow-y: auto; overflow-x: hidden; padding: 1rem; }
                .table-responsive { height: 100%; }
                table { table-layout: fixed; width: 100%; font-size: 0.75rem; }
                td, th { word-break: break-word; overflow-wrap: break-word; }
                thead th { position: sticky; top: 0; z-index: 1; background-color: var(--bs-table-bg, #fff); }
            </style>
        `;
        newWindow.document.body.innerHTML = '<div id="resultados-wrap"></div>';
        const resultadosWrap = newWindow.document.getElementById('resultados-wrap');

        this.dom.showData('IU_Test_result_nofile', salida, marcados);
        resultadosWrap.innerHTML = document.getElementById('IU_Test_result_nofile').innerHTML;
        document.getElementById('IU_Test_result_nofile').style.display = 'none';

        newWindow.document.close();
    }
}
