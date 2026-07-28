// Entidad "usuario_vivienda" real de Sempre na Casa: la solicitud/convivencia entre un
// huesped y una vivienda (ver backend/app/usuario_vivienda/usuario_vivienda_SERVICE.php:
// notnull ADD = id_usuario, id_vivienda, fecha_inicio). fecha_fin es opcional (estancia
// abierta), por eso usa _vds tambien en ADD/EDIT y no solo en SEARCH.
class usuario_vivienda extends Entidad_Abstracta {

    constructor(modo) {
        super(modo);
        this.entidad = 'usuario_vivienda';
    }

    cargar_formulario_html(id) {
        document.getElementById(id).innerHTML =
            '<input type="text" id="id_usuario" name="id_usuario" value="">' +
            '<input type="text" id="id_vivienda" name="id_vivienda" value="">' +
            '<input type="text" id="fecha_inicio" name="fecha_inicio" value="">' +
            '<input type="text" id="fecha_fin" name="fecha_fin" value="">';
    }

    // --- id_usuario / id_vivienda (FK) ---
    ADD_id_usuario_validation() { return this._vn('id_usuario', REGLAS_CAMPOS.usuario_vivienda.id_usuario.regex); }
    EDIT_id_usuario_validation() { return this.ADD_id_usuario_validation(); }
    SEARCH_id_usuario_validation() { return this._vns('id_usuario', REGLAS_CAMPOS.usuario_vivienda.id_usuario.regexBusqueda); }

    ADD_id_vivienda_validation() { return this._vn('id_vivienda', REGLAS_CAMPOS.usuario_vivienda.id_vivienda.regex); }
    EDIT_id_vivienda_validation() { return this.ADD_id_vivienda_validation(); }
    SEARCH_id_vivienda_validation() { return this._vns('id_vivienda', REGLAS_CAMPOS.usuario_vivienda.id_vivienda.regexBusqueda); }

    // --- fecha_inicio: obligatoria al solicitar (fecha esperada de inicio) ---
    ADD_fecha_inicio_validation() { return this._vd('fecha_inicio'); }
    EDIT_fecha_inicio_validation() { return this.ADD_fecha_inicio_validation(); }
    SEARCH_fecha_inicio_validation() { return this._vds('fecha_inicio'); }

    // --- fecha_fin: opcional en cualquier accion (estancia abierta si se deja vacia) ---
    ADD_fecha_fin_validation() { return this._vds('fecha_fin'); }
    EDIT_fecha_fin_validation() { return this.ADD_fecha_fin_validation(); }
    SEARCH_fecha_fin_validation() { return this._vds('fecha_fin'); }
}
