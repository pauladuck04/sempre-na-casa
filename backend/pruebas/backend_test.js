class Backend_Test {

    static abrirVentanaResultados() {
        const anchoVentana = screen.availWidth;
        const altoVentana  = screen.availHeight;
        const newWindow = window.open("", "Nueva Ventana Backend", `width=${anchoVentana},height=${altoVentana}`);
        if (!newWindow) return null;
        newWindow.moveTo(0, 0);
        newWindow.resizeTo(anchoVentana, altoVentana);
        newWindow.focus();
        return newWindow;
    }

    constructor(nombreEntidad, ventanaResultados) {
        this.nombreEntidad = nombreEntidad;
        this.dom = new DOM_class();
        this.casos = eval(nombreEntidad + '_backend_tests');
        this.fixtures = null;
        this.ventanaResultados = ventanaResultados || null;
    }

    async ejecutar() {
        try {
            this.fixtures = await prepararFixtures();
        } catch (e) {
            console.error('No se pudieron preparar las fixtures de backend:', e);
            this.fixtures = null;
            this.errorFixtures = e;
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

            const resultado = this.fixtures
                ? await compararConBackend(this.nombreEntidad, accion, this.fixtures, overrides, esperado)
                : { backend_status: 'SIN_CONEXION', backend_code: this.errorFixtures?.message || 'no se pudieron preparar las fixtures' };

            salida.push({
                entidad: this.nombreEntidad, accion, descripcion,
                valorprueba, respuestaesperada: esperado,
                backend_status: resultado.backend_status,
                backend_code: resultado.backend_code
            });
        }

        return salida;
    }

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

                    /* Contenedor principal: activa scroll vertical si no caben las filas */
                    #resultados-wrap {
                        flex: 1 1 0 !important;
                        min-height: 0 !important;
                        overflow-y: auto !important;
                        overflow-x: hidden !important; /* La tabla nunca debe ser más ancha que la ventana */
                        padding: 0 !important;
                    }

                    .table-responsive {
                        overflow: visible !important;
                        height: auto !important;
                        max-width: 100% !important;
                    }

                    table {
                        table-layout: fixed !important; /* Ancho de columnas fijado por el colgroup: la tabla no puede desbordar la ventana */
                        width: 100% !important;
                        max-width: 100% !important;
                        font-size: 0.65rem !important;
                        border-collapse: separate !important;
                        border-spacing: 0 !important;
                        margin: 0 !important;
                    }

                    /* 1. ENCABEZADOS: se ajustan al ancho de columna, partiendo el texto si hace falta */
                    thead th {
                        position: sticky !important;
                        top: 0 !important;
                        z-index: 9999 !important;
                        background-color: #e9ecef !important;
                        color: #000000 !important;
                        border-bottom: 2px solid #dee2e6 !important;
                        background-clip: padding-box !important;

                        /* REGLAS CLAVE PARA TÍTULOS */
                        white-space: normal !important; /* El título se parte si no cabe en la columna */
                        word-break: break-word !important;
                        overflow-wrap: anywhere !important;
                        padding: 0.6rem 0.8rem !important;
                        text-align: left !important;
                        font-size: 0.75rem !important; /* Independiente del tamaño de letra del cuerpo */
                    }

                    /* 2. CELDAS DE DATOS: Se adaptan al ancho fijado por el título y parten el texto si es largo */
                    tbody td {
                        white-space: normal !important;      /* Permite saltos de línea */
                        word-break: break-word !important;   /* Corta palabras largas o rutas */
                        overflow-wrap: anywhere !important;
                        padding: 0.35rem 0.6rem !important;
                        vertical-align: top !important;
                        font-size: 0.65rem !important;
                        line-height: 1.3 !important;
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
        if (!panel) return;
        panel.innerHTML = `<h5 class="fw-bold mb-3">Resultados: ${this.nombreEntidad}</h5>${htmlContenido}`;
        panel.style.display = 'block';
    }
}
