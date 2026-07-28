// Lógica de validación genérica, sin dependencias del DOM: cada función recibe el valor ya
// leído y una regla (min/max/regex, ver REGLAS_CAMPOS en validaciones-campos.js) y devuelve
// el motivo de fallo ('min_size' | 'max_size' | 'format') o null si el valor es válido.
//
// La usan tanto el frontend real (auth.js, perfil-comun.js, vía import directo) como el
// motor de pruebas (pruebas/js/validaciones.js, que solo añade la lectura del DOM y traduce
// el motivo al código "<campo>_<motivo>_KO"), a través del puente en pruebas/test_runner.html.
// Así la comparación de longitudes/regex/fecha vive en un único sitio.

export function validarTexto(valor, { min = 0, max = Infinity, regex = null } = {}) {
    if (valor.length < min) return 'min_size';
    if (valor.length > max) return 'max_size';
    if (regex && valor.length > 0 && !(new RegExp(regex).test(valor))) return 'format';
    return null;
}

export function validarTextoBusqueda(valor, { max = Infinity, regex = null } = {}) {
    if (valor.length > max) return 'max_size';
    if (regex && valor.length > 0 && !(new RegExp(regex).test(valor))) return 'format';
    return null;
}

export function validarNumero(valor, { regex = '^-?\\d+(\\.\\d+)?$' } = {}) {
    return (new RegExp(regex).test(valor)) ? null : 'format';
}

export function validarNumeroBusqueda(valor, regla = {}) {
    if (valor.length === 0) return null;
    return validarNumero(valor, regla);
}

export function validarFecha(valor) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return 'format';
    const [anio, mes, dia] = valor.split('-').map(Number);
    const fecha = new Date(anio, mes - 1, dia);
    if (fecha.getFullYear() !== anio || fecha.getMonth() !== mes - 1 || fecha.getDate() !== dia) {
        return 'format';
    }
    return null;
}

export function validarFechaOpcional(valor) {
    if (valor.length === 0) return null;
    if (valor.length > 10) return 'max_size';
    return validarFecha(valor);
}
