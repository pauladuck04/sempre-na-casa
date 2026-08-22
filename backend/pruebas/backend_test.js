class Backend_Test {

    static abrirVentanaResultados() {
        return DOM_class.abrirVentanaResultados('Nueva Ventana Backend');
    }

    constructor(nombreEntidad, ventanaResultados) {
        this.nombreEntidad = nombreEntidad;
        this.dom = new DOM_class();
        this.casos = eval(nombreEntidad + '_backend_tests');
        this.fixtures = null;
        this.filasCreadas = [];
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

        const limpieza = await limpiarFixtures(this.filasCreadas, this.fixtures);
        if (limpieza.omitidas && limpieza.omitidas.length > 0) {
            console.warn('Limpieza de fixtures QA: filas omitidas por seguridad ->', limpieza.omitidas);
        }
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

            if (resultado.filaCreada) this.filasCreadas.push(resultado.filaCreada);

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
        const marcados = {
            backend_status: { value: 'BACKEND_MAS_ESTRICTO', clase: 'table-danger' }
        };

        this.dom.mostrarResultadosEnVentana({
            contenedorId: 'IU_Test_result_nofile',
            salida, marcados,
            ventana: this.ventanaResultados,
            tituloDocumento: 'Resultados de pruebas de backend',
            tituloPanel: `Resultados: ${this.nombreEntidad}`
        });
    }
}
