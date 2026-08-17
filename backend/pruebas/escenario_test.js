// Runner de pruebas de caja negra por ESCENARIO de negocio (ver escenarios_pruebas.js).
// Mismo mecanismo de ventana/panel de resultados que Backend_Test (backend_test.js), pero las
// filas que pinta son pasos de un flujo, no casos aislados de un campo.
class Escenario_Test {

    static abrirVentanaResultados() {
        const anchoVentana = Math.round(screen.availWidth * 0.9);
        const altoVentana  = Math.round(screen.availHeight * 0.9);
        const newWindow = window.open("", "Nueva Ventana Escenario", `width=${anchoVentana},height=${altoVentana}`);
        if (!newWindow) return null;
        newWindow.resizeTo(anchoVentana, altoVentana);
        newWindow.moveTo(0, 0);
        newWindow.focus();
        return newWindow;
    }

    constructor(nombreEscenario, ventanaResultados) {
        this.nombreEscenario = nombreEscenario;
        this.escenario = ESCENARIOS[nombreEscenario];
        this.dom = new DOM_class();
        this.ventanaResultados = ventanaResultados || null;
    }

    async ejecutar() {
        let salida;
        try {
            salida = await this.escenario.ejecutar();
        } catch (e) {
            console.error('Error ejecutando el escenario:', e);
            salida = [{
                paso: 'Ejecución del escenario', esperado: 'completar sin excepciones',
                obtenido: e.message, resultado: 'FALLO'
            }];
        }
        this._mostrarResultados(salida);
    }

    _mostrarResultados(salida) {
        const marcados = { resultado: { value: 'FALLO', clase: 'table-danger' } };

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
                    <title>Resultados del escenario: ${this.escenario.nombre}</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                    <link rel="stylesheet" href="../../frontend/css/main.css?v=3">
                    <style>
                    * { box-sizing: border-box !important; }
                    html, body { height: 100% !important; margin: 0 !important; padding: 0 !important; }
                    body { display: flex !important; flex-direction: column !important; overflow: hidden !important; }
                    #resultados-wrap {
                        flex: 1 1 0 !important; min-height: 0 !important;
                        overflow-y: auto !important; overflow-x: auto !important;
                        padding: 0 1rem 1rem 1rem !important;
                    }
                    .table-responsive { overflow: visible !important; height: auto !important; }
                    table {
                        table-layout: auto !important; width: 100% !important; font-size: 0.8rem !important;
                        border-collapse: separate !important; border-spacing: 0 !important; margin-top: 0 !important;
                    }
                    thead th {
                        position: sticky !important; top: 0 !important; z-index: 9999 !important;
                        background-color: #e9ecef !important; color: #000 !important;
                        border-bottom: 2px solid #dee2e6 !important; white-space: nowrap !important;
                        padding: 0.6rem 0.8rem !important; text-align: left !important;
                    }
                    tbody td {
                        white-space: normal !important; word-break: break-word !important;
                        overflow-wrap: anywhere !important; padding: 0.5rem 0.8rem !important; vertical-align: top !important;
                    }
                    tbody tr, tbody td { position: static !important; }
                </style>
                </head>
                <body>
                    <div id="resultados-wrap">
                        <h4 class="fw-bold mt-3">Escenario: ${this.escenario.nombre}</h4>
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
        panel.innerHTML = `<h5 class="fw-bold mb-3">Escenario: ${this.escenario.nombre}</h5>${htmlContenido}`;
        panel.style.display = 'block';
    }
}
