// Única fuente de verdad para las reglas de formato (min/max/regex) de los campos de cada
// entidad. La consumen tanto el frontend real (auth.js, perfil-comun.js) como el framework
// de pruebas (pruebas/js/*.js, a través del puente en pruebas/test_runner.html), para no
// mantener los mismos regex duplicados en dos sitios que puedan divergir con el tiempo.
//
// `regex` es la regla en ADD/EDIT; `regexBusqueda` es la regla en modo búsqueda (a menudo
// más laxa o null). Los campos de fecha (fecha_inicio/fecha_fin de usuario_vivienda) no
// están aquí: su formato (AAAA-MM-DD) es fijo y lo valida _vd/_vds directamente, sin regex
// que compartir.
export const REGLAS_CAMPOS = {
    usuario: {
        dni:            { min: 9, max: 9,   regex: '^[0-9]{8}[A-Z]$',              regexBusqueda: '^[0-9]{0,8}[A-Z]?$' },
        mail:           { min: 5, max: 100, regex: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$', regexBusqueda: null },
        nombre_usuario: { min: 2, max: 25,  regex: "^[A-Za-zÀ-ÿ '-]+$",             regexBusqueda: null },
        apellidos:      { min: 2, max: 100, regex: "^[A-Za-zÀ-ÿ '-]+$",             regexBusqueda: null },
        telefono:       { min: 9, max: 9,   regex: '^[0-9]{9}$',                    regexBusqueda: '^[0-9]{0,9}$' },
        password:       { min: 8, max: 15,  regex: null }
    },
    vivienda: {
        direccion:      { min: 5, max: 150, regex: "^[A-Za-z0-9À-ÿ .,ºª'-]+$", regexBusqueda: null },
        ciudad:         { min: 2, max: 60,  regex: "^[A-Za-zÀ-ÿ '-]+$",        regexBusqueda: null },
        descripcion:    { min: 0, max: 500, regex: '^[^<>]*$',                 regexBusqueda: '^[^<>]*$' },
        plazas_totales: { regex: '^[0-9]+$', regexBusqueda: '^[0-9]+$' },
        plazas_libres:  { regex: '^[0-9]+$', regexBusqueda: '^[0-9]+$' }
    },
    criterio: {
        nombre_criterio: { min: 3, max: 50, regex: '^[A-Za-zÀ-ÿ ]+$', regexBusqueda: null },
        peso_criterio:   { regex: '^[0-9]+$', regexBusqueda: '^[0-9]+$' }
    },
    opcion: {
        nombre_opcion: { min: 2, max: 100, regex: null,        regexBusqueda: null },
        valor:         { regex: '^[0-9]+$', regexBusqueda: '^[0-9]+$' },
        id_criterio:   { regex: '^[0-9]+$', regexBusqueda: '^[0-9]+$' }
    },
    usuario_vivienda: {
        id_usuario:  { regex: '^[0-9]+$', regexBusqueda: '^[0-9]+$' },
        id_vivienda: { regex: '^[0-9]+$', regexBusqueda: '^[0-9]+$' }
    },
    usuario_criterio_opcion: {
        id_usuario:  { regex: '^[0-9]+$', regexBusqueda: '^[0-9]+$' },
        id_criterio: { regex: '^[0-9]+$', regexBusqueda: '^[0-9]+$' },
        id_opcion:   { regex: '^[0-9]+$', regexBusqueda: '^[0-9]+$' }
    },
    vivienda_criterio_opcion: {
        id_vivienda: { regex: '^[0-9]+$', regexBusqueda: '^[0-9]+$' },
        id_criterio: { regex: '^[0-9]+$', regexBusqueda: '^[0-9]+$' },
        id_opcion:   { regex: '^[0-9]+$', regexBusqueda: '^[0-9]+$' }
    }
};
