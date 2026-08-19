class criterio extends Entidad_Abstracta {

    constructor(modo) {
        super(modo);
        this.entidad = 'criterio';
    }

    cargar_formulario_html(id) {
        document.getElementById(id).innerHTML =
            '<input type="text" id="nombre_criterio" name="nombre_criterio" value="">';
    }

    // --- nombre_criterio ---
    ADD_nombre_criterio_validation() { const r = REGLAS_CAMPOS.criterio.nombre_criterio; return this._vt('nombre_criterio', r.min, r.max, r.regex); }
    EDIT_nombre_criterio_validation() { return this.ADD_nombre_criterio_validation(); }
    SEARCH_nombre_criterio_validation() { const r = REGLAS_CAMPOS.criterio.nombre_criterio; return this._vts('nombre_criterio', r.max, r.regexBusqueda); }
}
