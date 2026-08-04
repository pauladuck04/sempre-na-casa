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

    // Ventana emergente con el mismo aspecto (y el mismo truco de dimensionado: ocupar el 90%
    // de pantalla disponible + document.write síncrono de todo el HTML) que la de Data_Test
    // (ver pruebas/data.js: data_test_class()), para que los resultados de ambos runners se
    // vean consistentes y la tabla ocupe siempre toda la ventana.
    _mostrarResultados(salida) {
        let marcados = {
            backend_status: { value: 'BACKEND_MAS_ESTRICTO', clase: 'table-danger' }
        };

        this.dom.showData('IU_Test_result_nofile', salida, marcados);
        let htmlContenido = document.getElementById('IU_Test_result_nofile').innerHTML;
        document.getElementById('IU_Test_result_nofile').style.display = 'none';

        const anchoVentana = Math.round(screen.availWidth * 0.9);
        const altoVentana  = Math.round(screen.availHeight * 0.9);
        const newWindow = window.open("", "Nueva Ventana Backend", `width=${anchoVentana},height=${altoVentana}`);
        newWindow.resizeTo(anchoVentana, altoVentana);
        newWindow.moveTo(0, 0);
        newWindow.focus();

        newWindow.document.open();
        newWindow.document.write(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Resultados de pruebas de backend</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <link rel="stylesheet" href="../frontend/css/main.css?v=3">
                <style>
                * { box-sizing: border-box !important; }
                html, body { height: 100% !important; margin: 0 !important; padding: 0 !important; }
                body { display: flex !important; flex-direction: column !important; overflow: hidden !important; }

                /* Contenedor principal: activa scroll vertical y horizontal si no caben las columnas */
                #resultados-wrap {
                    flex: 1 1 0 !important;
                    min-height: 0 !important;
                    overflow-y: auto !important;
                    overflow-x: auto !important; /* Permite scroll horizontal solo si la pantalla es más estrecha que la suma de los títulos */
                    padding: 0 1rem 1rem 1rem !important;
                }

                .table-responsive {
                    overflow: visible !important;
                    height: auto !important;
                }

                table {
                    table-layout: auto !important; /* Permite que el ancho se adapte dinámicamente al contenido */
                    width: 100% !important;
                    font-size: 0.75rem !important;
                    border-collapse: separate !important;
                    border-spacing: 0 !important;
                    margin-top: 0 !important;
                }

                /* 1. ENCABEZADOS: Nunca se dividen y dictan el ancho mínimo de la columna */
                thead th {
                    position: sticky !important;
                    top: 0 !important;
                    z-index: 9999 !important;
                    background-color: #e9ecef !important;
                    color: #000000 !important;
                    border-bottom: 2px solid #dee2e6 !important;
                    background-clip: padding-box !important;

                    /* REGLAS CLAVE PARA TÍTULOS */
                    white-space: nowrap !important; /* EL TÍTULO NUNCA SE ROMPE EN VARIAS LÍNEAS */
                    padding: 0.6rem 0.8rem !important;
                    text-align: left !important;
                }

                /* 2. CELDAS DE DATOS: Se adaptan al ancho fijado por el título y parten el texto si es largo */
                tbody td {
                    white-space: normal !important;      /* Permite saltos de línea */
                    word-break: break-word !important;   /* Corta palabras largas o rutas */
                    overflow-wrap: anywhere !important;
                    padding: 0.5rem 0.8rem !important;
                    vertical-align: top !important;
                }

                tbody tr, tbody td {
                    position: static !important;
                }
            </style>
            </head>
            <body>
                <div id="resultados-wrap">
                    ${htmlContenido}
                </div>
            </body>
            </html>
        `);
        newWindow.document.close();
    }
}
