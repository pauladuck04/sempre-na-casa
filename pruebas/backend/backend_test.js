// Runner de pruebas de backend: consume pruebas/backend/backend_pruebas.js (casos DEDICADOS a
// probar las acciones reales del backend -- ADD/EDIT/SEARCH/DELETE -- independientes de
// pruebas/frontend/pruebas.js, que solo se usa para las pruebas de FORMATO del frontend en
// pruebas/frontend/test_runner.html). Hace una llamada real a apiPost(entidad, accion, payload)
// contra el backend PHP (ver pruebas/backend/backend_fixtures.js para cómo se construye un
// payload completo y válido por caso).
class Backend_Test {

    // Abre la ventana de resultados de forma SÍNCRONA, antes de cualquier await (llamar a esto
    // como primera línea del manejador de clic, ver pruebas/backend/backend_runner.html). El "user
    // activation" que permite abrir un popup se consume en el momento de llamar a window.open(),
    // no cuando se le escribe contenido después con document.write() -- eso último no necesita
    // gesto del usuario. Por eso basta con abrirla aquí, ya vacía, y rellenarla más tarde en
    // _mostrarResultados() tras los await de ejecutar() (fixtures + una petición real por caso
    // contra el backend, que si se esperase a que terminen para recién abrir la ventana, el
    // navegador ya no lo asociaría al clic y la bloquearía -> window.open devuelve null).
    static abrirVentanaResultados() {
        const anchoVentana = Math.round(screen.availWidth * 0.9);
        const altoVentana  = Math.round(screen.availHeight * 0.9);
        const newWindow = window.open("", "Nueva Ventana Backend", `width=${anchoVentana},height=${altoVentana}`);
        if (!newWindow) return null;
        newWindow.resizeTo(anchoVentana, altoVentana);
        newWindow.moveTo(0, 0);
        newWindow.focus();
        return newWindow;
    }

    constructor(nombreEntidad, ventanaResultados) {
        this.nombreEntidad = nombreEntidad;
        this.dom = new DOM_class();
        this.casos = eval(nombreEntidad + '_backend_tests');
        this.contextoBackend = null;
        this.ventanaResultados = ventanaResultados || null;
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

    async _ejecutarCasos() {
        const salida = [];

        for (let i = 0; i < this.casos.length; i++) {
            const { accion, descripcion, overrides, esperado } = this.casos[i];

            let valorprueba = '';
            for (const clave in overrides) {
                valorprueba += clave + '=' + JSON.stringify(overrides[clave]) + '<br>';
            }

            const resultado = await compararConBackend(this.nombreEntidad, accion, this.contextoBackend, i, overrides, esperado);

            salida.push({
                entidad: this.nombreEntidad, accion, descripcion,
                valorprueba, respuestaesperada: esperado,
                backend_status: resultado.backend_status,
                backend_code: resultado.backend_code
            });
        }

        return salida;
    }

    // Mismo aspecto que la ventana de resultados de Data_Test (ver pruebas/frontend/data.js:
    // data_test_class()): misma ventana al 90% de pantalla, mismo CSS (tabla con cabecera
    // pegajosa y scroll propio). Si por lo que sea no hay ventana disponible (no se abrió a
    // tiempo en abrirVentanaResultados(), o el navegador la bloqueó de todos modos), se pinta
    // igualmente en #resultados_panel dentro de la propia página como último recurso, para que
    // los resultados nunca se pierdan.
    _mostrarResultados(salida) {
        let marcados = {
            backend_status: { value: 'BACKEND_MAS_ESTRICTO', clase: 'table-danger' }
        };

        this.dom.showData('IU_Test_result_nofile', salida, marcados);
        const htmlContenido = document.getElementById('IU_Test_result_nofile').innerHTML;
        document.getElementById('IU_Test_result_nofile').style.display = 'none';

        const newWindow = (this.ventanaResultados && !this.ventanaResultados.closed) ? this.ventanaResultados : null;

        if (newWindow) {
            newWindow.document.open();
            newWindow.document.write(`
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <title>Resultados de pruebas de backend</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                    <link rel="stylesheet" href="../../frontend/css/main.css?v=3">
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
            return;
        }

        const panel = document.getElementById('resultados_panel');
        if (!panel) return; // permite reutilizar Backend_Test fuera de backend_runner.html sin romper
        panel.innerHTML = `<h5 class="fw-bold mb-3">Resultados: ${this.nombreEntidad}</h5>${htmlContenido}`;
        panel.style.display = 'block';
    }
}
