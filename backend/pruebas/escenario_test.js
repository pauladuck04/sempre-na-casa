class Escenario_Test {

    static abrirVentanaResultados() {
        return DOM_class.abrirVentanaResultados('Nueva Ventana Escenario');
    }

    constructor(nombreEscenario, ventanaResultados) {
        this.nombreEscenario = nombreEscenario;
        this.escenario = ESCENARIOS[nombreEscenario];
        this.dom = new DOM_class();
        this.ventanaResultados = ventanaResultados || null;
    }

    async ejecutar() {
        const filasCreadas = [];
        let salida;
        try {
            salida = await this.escenario.ejecutar(filasCreadas);
        } catch (e) {
            console.error('Error ejecutando el escenario:', e);
            salida = [{
                paso: 'Ejecución del escenario', esperado: 'completar sin excepciones',
                obtenido: e.message, resultado: 'FALLO'
            }];
        }
        this._mostrarResultados(salida);

        const limpieza = await limpiarFixtures(filasCreadas, null);
        if (limpieza.omitidas && limpieza.omitidas.length > 0) {
            console.warn('Limpieza de fixtures QA: filas omitidas por seguridad ->', limpieza.omitidas);
        }
    }

    _mostrarResultados(salida) {
        const marcados = { resultado: { value: 'FALLO', clase: 'table-danger' } };

        this.dom.mostrarResultadosEnVentana({
            contenedorId: 'IU_Test_result_nofile',
            salida, marcados,
            ventana: this.ventanaResultados,
            tituloDocumento: `Resultados del escenario: ${this.escenario.nombre}`,
            tituloPanel: `Escenario: ${this.escenario.nombre}`,
            encabezadoPopup: `<h4 class="fw-bold mt-3">Escenario: ${this.escenario.nombre}</h4>`
        });
    }
}
