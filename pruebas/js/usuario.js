// Entidad "usuario" real de Sempre na Casa. Los regex/min/max de cada campo viven en
// frontend/js/validaciones-campos.js (REGLAS_CAMPOS), única fuente de verdad que también
// usa frontend/js/auth.js (registro) — ver el puente en pruebas/test_runner.html.
class usuario extends Entidad_Abstracta {

    constructor(modo) {
        super(modo);
        this.entidad = 'usuario';
    }

    cargar_formulario_html(id) {
        document.getElementById(id).innerHTML =
            '<input type="text" id="dni" name="dni" value="">' +
            '<input type="text" id="mail" name="mail" value="">' +
            '<input type="text" id="nombre_usuario" name="nombre_usuario" value="">' +
            '<input type="text" id="apellidos" name="apellidos" value="">' +
            '<input type="text" id="telefono" name="telefono" value="">' +
            '<input type="text" id="password" name="password" value="">';
    }

    // --- dni: formato fijo, no tiene sentido min/max independientes del formato ---
    ADD_dni_validation() { const r = REGLAS_CAMPOS.usuario.dni; return this._vt('dni', r.min, r.max, r.regex); }
    EDIT_dni_validation() { return this.ADD_dni_validation(); }
    SEARCH_dni_validation() { const r = REGLAS_CAMPOS.usuario.dni; return this._vts('dni', r.max, r.regexBusqueda); }

    // --- mail ---
    ADD_mail_validation() { const r = REGLAS_CAMPOS.usuario.mail; return this._vt('mail', r.min, r.max, r.regex); }
    EDIT_mail_validation() { return this.ADD_mail_validation(); }
    SEARCH_mail_validation() { const r = REGLAS_CAMPOS.usuario.mail; return this._vts('mail', r.max, r.regexBusqueda); }

    // --- nombre_usuario (maxlength=25 en registro.html) ---
    ADD_nombre_usuario_validation() { const r = REGLAS_CAMPOS.usuario.nombre_usuario; return this._vt('nombre_usuario', r.min, r.max, r.regex); }
    EDIT_nombre_usuario_validation() { return this.ADD_nombre_usuario_validation(); }
    SEARCH_nombre_usuario_validation() { const r = REGLAS_CAMPOS.usuario.nombre_usuario; return this._vts('nombre_usuario', r.max, r.regexBusqueda); }

    // --- apellidos (maxlength=100 en registro.html) ---
    ADD_apellidos_validation() { const r = REGLAS_CAMPOS.usuario.apellidos; return this._vt('apellidos', r.min, r.max, r.regex); }
    EDIT_apellidos_validation() { return this.ADD_apellidos_validation(); }
    SEARCH_apellidos_validation() { const r = REGLAS_CAMPOS.usuario.apellidos; return this._vts('apellidos', r.max, r.regexBusqueda); }

    // --- telefono: formato fijo (9 dígitos) ---
    ADD_telefono_validation() { const r = REGLAS_CAMPOS.usuario.telefono; return this._vt('telefono', r.min, r.max, r.regex); }
    EDIT_telefono_validation() { return this.ADD_telefono_validation(); }
    SEARCH_telefono_validation() { const r = REGLAS_CAMPOS.usuario.telefono; return this._vts('telefono', r.max, r.regexBusqueda); }

    // --- password: obligatoria al crear (8-15, igual que registro.html), opcional al editar
    // (vacía = no se cambia, ver usuario_SERVICE::EDIT en el backend) ---
    ADD_password_validation() { const r = REGLAS_CAMPOS.usuario.password; return this._vt('password', r.min, r.max, r.regex); }
    EDIT_password_validation() {
        const valor = this._valorCampo('password');
        if (valor.length === 0) return true;
        return this.ADD_password_validation();
    }
}
