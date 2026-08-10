class criterio extends Entidad_Abstracta {

    constructor(modo) {
        super(modo);
        this.entidad = 'criterio';
    }

    cargar_formulario_html(id) {
        document.getElementById(id).innerHTML =
            '<input type="text" id="nombre_criterio" name="nombre_criterio" value="">' +
            '<input type="text" id="peso_criterio" name="peso_criterio" value="">';
    }

    // --- nombre_criterio ---
    ADD_nombre_criterio_validation() { const r = REGLAS_CAMPOS.criterio.nombre_criterio; return this._vt('nombre_criterio', r.min, r.max, r.regex); }
    EDIT_nombre_criterio_validation() { return this.ADD_nombre_criterio_validation(); }
    SEARCH_nombre_criterio_validation() { const r = REGLAS_CAMPOS.criterio.nombre_criterio; return this._vts('nombre_criterio', r.max, r.regexBusqueda); }

    // --- peso_criterio ---
    ADD_peso_criterio_validation() { return this._vn('peso_criterio', REGLAS_CAMPOS.criterio.peso_criterio.regex); }
    EDIT_peso_criterio_validation() { return this.ADD_peso_criterio_validation(); }
    SEARCH_peso_criterio_validation() { return this._vns('peso_criterio', REGLAS_CAMPOS.criterio.peso_criterio.regexBusqueda); }
}
