// Entidad "vivienda" real de Sempre na Casa (ver backend/app/vivienda/vivienda_SERVICE.php:
// notnull ADD = descripcion, plazas_libres, plazas_totales, id_anfitrion, direccion, ciudad).
// No se valida aquí la regla cruzada "plazas_libres <= plazas_totales" (ver nota en _vn de
// validaciones.js: este framework valida campo a campo, no reglas entre campos).
class vivienda extends Entidad_Abstracta {

    constructor(modo) {
        super(modo);
        this.entidad = 'vivienda';
    }

    cargar_formulario_html(id) {
        document.getElementById(id).innerHTML =
            '<input type="text" id="direccion" name="direccion" value="">' +
            '<input type="text" id="ciudad" name="ciudad" value="">' +
            '<input type="text" id="descripcion" name="descripcion" value="">' +
            '<input type="text" id="plazas_totales" name="plazas_totales" value="">' +
            '<input type="text" id="plazas_libres" name="plazas_libres" value="">';
    }

    // --- direccion ---
    ADD_direccion_validation() { const r = REGLAS_CAMPOS.vivienda.direccion; return this._vt('direccion', r.min, r.max, r.regex); }
    EDIT_direccion_validation() { return this.ADD_direccion_validation(); }
    SEARCH_direccion_validation() { const r = REGLAS_CAMPOS.vivienda.direccion; return this._vts('direccion', r.max, r.regexBusqueda); }

    // --- ciudad ---
    ADD_ciudad_validation() { const r = REGLAS_CAMPOS.vivienda.ciudad; return this._vt('ciudad', r.min, r.max, r.regex); }
    EDIT_ciudad_validation() { return this.ADD_ciudad_validation(); }
    SEARCH_ciudad_validation() { const r = REGLAS_CAMPOS.vivienda.ciudad; return this._vts('ciudad', r.max, r.regexBusqueda); }

    // --- descripcion: no obligatoria (min 0) ---
    ADD_descripcion_validation() { const r = REGLAS_CAMPOS.vivienda.descripcion; return this._vt('descripcion', r.min, r.max, r.regex); }
    EDIT_descripcion_validation() { return this.ADD_descripcion_validation(); }
    SEARCH_descripcion_validation() { const r = REGLAS_CAMPOS.vivienda.descripcion; return this._vts('descripcion', r.max, r.regexBusqueda); }

    // --- plazas_totales / plazas_libres: enteros ---
    ADD_plazas_totales_validation() { return this._vn('plazas_totales', REGLAS_CAMPOS.vivienda.plazas_totales.regex); }
    EDIT_plazas_totales_validation() { return this.ADD_plazas_totales_validation(); }
    SEARCH_plazas_totales_validation() { return this._vns('plazas_totales', REGLAS_CAMPOS.vivienda.plazas_totales.regexBusqueda); }

    ADD_plazas_libres_validation() { return this._vn('plazas_libres', REGLAS_CAMPOS.vivienda.plazas_libres.regex); }
    EDIT_plazas_libres_validation() { return this.ADD_plazas_libres_validation(); }
    SEARCH_plazas_libres_validation() { return this._vns('plazas_libres', REGLAS_CAMPOS.vivienda.plazas_libres.regexBusqueda); }
}
