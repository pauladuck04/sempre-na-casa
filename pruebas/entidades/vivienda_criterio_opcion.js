// Entidad "vivienda_criterio_opcion" real de Sempre na Casa: la respuesta de un anfitrion/
// vivienda a un criterio (tabla puramente relacional, solo tres FK numericas, ver
// backend/app/vivienda_criterio_opcion/vivienda_criterio_opcion_SERVICE.php).
class vivienda_criterio_opcion extends Entidad_Abstracta {

    constructor(modo) {
        super(modo);
        this.entidad = 'vivienda_criterio_opcion';
    }

    cargar_formulario_html(id) {
        document.getElementById(id).innerHTML =
            '<input type="text" id="id_vivienda" name="id_vivienda" value="">' +
            '<input type="text" id="id_criterio" name="id_criterio" value="">' +
            '<input type="text" id="id_opcion" name="id_opcion" value="">';
    }

    ADD_id_vivienda_validation() { return this._vn('id_vivienda', REGLAS_CAMPOS.vivienda_criterio_opcion.id_vivienda.regex); }
    EDIT_id_vivienda_validation() { return this.ADD_id_vivienda_validation(); }
    SEARCH_id_vivienda_validation() { return this._vns('id_vivienda', REGLAS_CAMPOS.vivienda_criterio_opcion.id_vivienda.regexBusqueda); }

    ADD_id_criterio_validation() { return this._vn('id_criterio', REGLAS_CAMPOS.vivienda_criterio_opcion.id_criterio.regex); }
    EDIT_id_criterio_validation() { return this.ADD_id_criterio_validation(); }
    SEARCH_id_criterio_validation() { return this._vns('id_criterio', REGLAS_CAMPOS.vivienda_criterio_opcion.id_criterio.regexBusqueda); }

    ADD_id_opcion_validation() { return this._vn('id_opcion', REGLAS_CAMPOS.vivienda_criterio_opcion.id_opcion.regex); }
    EDIT_id_opcion_validation() { return this.ADD_id_opcion_validation(); }
    SEARCH_id_opcion_validation() { return this._vns('id_opcion', REGLAS_CAMPOS.vivienda_criterio_opcion.id_opcion.regexBusqueda); }
}
