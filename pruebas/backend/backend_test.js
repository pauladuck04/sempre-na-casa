class Backend_Test {

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
        if (!panel) return;
        panel.innerHTML = `<h5 class="fw-bold mb-3">Resultados: ${this.nombreEntidad}</h5>${htmlContenido}`;
        panel.style.display = 'block';
    }
}
