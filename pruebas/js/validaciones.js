// Adaptador entre el framework de pruebas (lee valores del DOM) y la lógica de validación
// genérica real de la app (frontend/js/validaciones-campos.js, sin dependencias del DOM),
// expuesta aquí como el global `Validadores` a través del puente en pruebas/test_runner.html.
// Cada método lee el valor del campo por id y traduce el motivo devuelto ('min_size' |
// 'max_size' | 'format' | null) al código "<campo>_<motivo>_KO" (mismo formato que ya usan
// los códigos de error reales del backend, p.ej. 'dni_format_KO'), o `true` si es válido.
class Validaciones {

    _valorCampo(campo) {
        const el = document.getElementById(campo);
        return el ? el.value : '';
    }

    _resultado(campo, motivo) {
        return motivo ? campo + '_' + motivo + '_KO' : true;
    }

    // Texto libre: tamaño mínimo/máximo + formato (regex opcional). min=0 permite vacío.
    _vt(campo, min, max, regex) {
        return this._resultado(campo, Validadores.validarTexto(this._valorCampo(campo), { min, max, regex }));
    }

    // Texto en modo búsqueda: vacío siempre válido (sin filtro), solo se comprueban máximo y formato.
    _vts(campo, max, regex) {
        return this._resultado(campo, Validadores.validarTextoBusqueda(this._valorCampo(campo), { max, regex }));
    }

    // Fecha obligatoria: formato AAAA-MM-DD y que sea una fecha real (descarta '32/14/2026').
    _vd(campo) {
        return this._resultado(campo, Validadores.validarFecha(this._valorCampo(campo)));
    }

    // Fecha opcional (vacía siempre válida; si no está vacía, tamaño máximo (10) + formato).
    // Sirve tanto para modo búsqueda como para campos de fecha no obligatorios en ADD/EDIT
    // (p.ej. una fecha_fin abierta).
    _vds(campo) {
        return this._resultado(campo, Validadores.validarFechaOpcional(this._valorCampo(campo)));
    }

    // Numérico (entero o decimal): obligatorio, valida solo formato (los rangos min/max de
    // negocio, p.ej. "plazas_libres <= plazas_totales", son cruzados entre campos y no
    // encajan en este framework de validación campo a campo).
    _vn(campo, regex = '^-?\\d+(\\.\\d+)?$') {
        return this._resultado(campo, Validadores.validarNumero(this._valorCampo(campo), { regex }));
    }

    // Numérico en modo búsqueda: vacío siempre válido, si no está vacío se valida el formato.
    _vns(campo, regex = '^-?\\d+(\\.\\d+)?$') {
        return this._resultado(campo, Validadores.validarNumeroBusqueda(this._valorCampo(campo), { regex }));
    }
}
