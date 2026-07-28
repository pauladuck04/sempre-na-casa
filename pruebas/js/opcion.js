// Entidad "opcion" real de Sempre na Casa (ver backend/app/opcion/opcion_SERVICE.php:
// notnull ADD = nombre_opcion, valor, id_criterio).
class opcion extends Entidad_Abstracta {

    constructor(modo) {
        super(modo);
        this.entidad = 'opcion';
    }

    cargar_formulario_html(id) {
        document.getElementById(id).innerHTML =
            '<input type="text" id="nombre_opcion" name="nombre_opcion" value="">' +
            '<input type="text" id="valor" name="valor" value="">' +
            '<input type="text" id="id_criterio" name="id_criterio" value="">';
    }

    // --- nombre_opcion ---
    ADD_nombre_opcion_validation() { const r = REGLAS_CAMPOS.opcion.nombre_opcion; return this._vt('nombre_opcion', r.min, r.max, r.regex); }
    EDIT_nombre_opcion_validation() { return this.ADD_nombre_opcion_validation(); }
    SEARCH_nombre_opcion_validation() { const r = REGLAS_CAMPOS.opcion.nombre_opcion; return this._vts('nombre_opcion', r.max, r.regexBusqueda); }

    // --- valor (escala ordinal, ver seed_criterio_opcion.sql: '1','2','3'...) ---
    ADD_valor_validation() { return this._vn('valor', REGLAS_CAMPOS.opcion.valor.regex); }
    EDIT_valor_validation() { return this.ADD_valor_validation(); }
    SEARCH_valor_validation() { return this._vns('valor', REGLAS_CAMPOS.opcion.valor.regexBusqueda); }

    // --- id_criterio (FK) ---
    ADD_id_criterio_validation() { return this._vn('id_criterio', REGLAS_CAMPOS.opcion.id_criterio.regex); }
    EDIT_id_criterio_validation() { return this.ADD_id_criterio_validation(); }
    SEARCH_id_criterio_validation() { return this._vns('id_criterio', REGLAS_CAMPOS.opcion.id_criterio.regexBusqueda); }
}
