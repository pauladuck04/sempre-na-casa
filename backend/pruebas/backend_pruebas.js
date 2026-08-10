// =====================================================================================
// usuario
// =====================================================================================
let usuario_backend_tests = [
    { accion: 'ADD', descripcion: 'ADD con todos los campos obligatorios', overrides: {}, esperado: true },
    { accion: 'ADD', descripcion: 'ADD sin dni', overrides: { dni: '' }, esperado: 'dni_es_nulo_KO' },
    { accion: 'ADD', descripcion: 'ADD sin mail', overrides: { mail: '' }, esperado: 'mail_es_nulo_KO' },
    { accion: 'ADD', descripcion: 'ADD sin nombre_usuario', overrides: { nombre_usuario: '' }, esperado: 'nombre_usuario_es_nulo_KO' },
    { accion: 'ADD', descripcion: 'ADD sin apellidos', overrides: { apellidos: '' }, esperado: 'apellidos_es_nulo_KO' },
    { accion: 'ADD', descripcion: 'ADD sin password', overrides: { password: '' }, esperado: 'password_es_nulo_KO' },
    { accion: 'ADD', descripcion: 'ADD sin telefono', overrides: { telefono: '' }, esperado: 'telefono_es_nulo_KO' },
    { accion: 'ADD', descripcion: 'ADD sin id_rol', overrides: { id_rol: '' }, esperado: 'id_rol_es_nulo_KO' },

    { accion: 'SEARCH', descripcion: 'SEARCH sin filtros devuelve listado', overrides: {}, esperado: true },

    { accion: 'EDIT', descripcion: 'EDIT de un usuario existente', overrides: {}, esperado: true },
    { accion: 'EDIT', descripcion: 'EDIT sin id_usuario', overrides: { id_usuario: '' }, esperado: 'id_usuario_es_nulo_KO' },
    { accion: 'EDIT', descripcion: 'EDIT sin dni', overrides: { dni: '' }, esperado: 'dni_es_nulo_KO' },
    { accion: 'EDIT', descripcion: 'EDIT sin mail', overrides: { mail: '' }, esperado: 'mail_es_nulo_KO' },
    { accion: 'EDIT', descripcion: 'EDIT sin nombre_usuario', overrides: { nombre_usuario: '' }, esperado: 'nombre_usuario_es_nulo_KO' },
    { accion: 'EDIT', descripcion: 'EDIT sin apellidos', overrides: { apellidos: '' }, esperado: 'apellidos_es_nulo_KO' },
    { accion: 'EDIT', descripcion: 'EDIT sin telefono', overrides: { telefono: '' }, esperado: 'telefono_es_nulo_KO' },
    { accion: 'EDIT', descripcion: 'EDIT sin id_rol', overrides: { id_rol: '' }, esperado: 'id_rol_es_nulo_KO' },
    { accion: 'EDIT', descripcion: 'EDIT sin password no falla (no se cambia la contraseña)', overrides: { password: '' }, esperado: true },

    { accion: 'DELETE', descripcion: 'DELETE de un usuario existente (baja lógica)', overrides: {}, esperado: true },
    { accion: 'DELETE', descripcion: 'DELETE sin id_usuario', overrides: { id_usuario: '' }, esperado: 'id_usuario_es_nulo_KO' }
];

// =====================================================================================
// vivienda
// =====================================================================================
let vivienda_backend_tests = [
    { accion: 'ADD', descripcion: 'ADD con todos los campos obligatorios', overrides: {}, esperado: true },
    { accion: 'ADD', descripcion: 'ADD sin descripcion', overrides: { descripcion: '' }, esperado: 'descripcion_es_nulo_KO' },
    { accion: 'ADD', descripcion: 'ADD sin plazas_libres', overrides: { plazas_libres: '' }, esperado: 'plazas_libres_es_nulo_KO' },
    { accion: 'ADD', descripcion: 'ADD sin plazas_totales', overrides: { plazas_totales: '' }, esperado: 'plazas_totales_es_nulo_KO' },
    { accion: 'ADD', descripcion: 'ADD sin id_anfitrion', overrides: { id_anfitrion: '' }, esperado: 'id_anfitrion_es_nulo_KO' },
    { accion: 'ADD', descripcion: 'ADD sin direccion', overrides: { direccion: '' }, esperado: 'direccion_es_nulo_KO' },
    { accion: 'ADD', descripcion: 'ADD sin ciudad', overrides: { ciudad: '' }, esperado: 'ciudad_es_nulo_KO' },

    { accion: 'SEARCH', descripcion: 'SEARCH sin filtros devuelve listado', overrides: {}, esperado: true },

    { accion: 'EDIT', descripcion: 'EDIT de una vivienda existente', overrides: {}, esperado: true },
    { accion: 'EDIT', descripcion: 'EDIT sin descripcion', overrides: { descripcion: '' }, esperado: 'descripcion_es_nulo_KO' },
    { accion: 'EDIT', descripcion: 'EDIT sin plazas_libres', overrides: { plazas_libres: '' }, esperado: 'plazas_libres_es_nulo_KO' },
    { accion: 'EDIT', descripcion: 'EDIT sin plazas_totales', overrides: { plazas_totales: '' }, esperado: 'plazas_totales_es_nulo_KO' },
    { accion: 'EDIT', descripcion: 'EDIT sin id_anfitrion', overrides: { id_anfitrion: '' }, esperado: 'id_anfitrion_es_nulo_KO' },
    { accion: 'EDIT', descripcion: 'EDIT sin direccion', overrides: { direccion: '' }, esperado: 'direccion_es_nulo_KO' },
    { accion: 'EDIT', descripcion: 'EDIT sin ciudad', overrides: { ciudad: '' }, esperado: 'ciudad_es_nulo_KO' },

    { accion: 'DELETE', descripcion: 'DELETE de una vivienda existente (baja lógica)', overrides: {}, esperado: true },
    { accion: 'DELETE', descripcion: 'DELETE sin id_vivienda', overrides: { id_vivienda: '' }, esperado: 'id_vivienda_es_nulo_KO' }
];

// =====================================================================================
// criterio
// =====================================================================================
let criterio_backend_tests = [
    { accion: 'ADD', descripcion: 'ADD con el campo obligatorio', overrides: {}, esperado: true },
    { accion: 'ADD', descripcion: 'ADD sin nombre_criterio', overrides: { nombre_criterio: '' }, esperado: 'nombre_criterio_es_nulo_KO' },

    { accion: 'SEARCH', descripcion: 'SEARCH sin filtros devuelve listado', overrides: {}, esperado: true },

    { accion: 'EDIT', descripcion: 'EDIT de un criterio existente', overrides: {}, esperado: true },
    { accion: 'EDIT', descripcion: 'EDIT sin id_criterio', overrides: { id_criterio: '' }, esperado: 'id_criterio_es_nulo_KO' },
    { accion: 'EDIT', descripcion: 'EDIT sin nombre_criterio', overrides: { nombre_criterio: '' }, esperado: 'nombre_criterio_es_nulo_KO' },

    { accion: 'DELETE', descripcion: 'DELETE de un criterio existente (baja lógica)', overrides: {}, esperado: true },
    { accion: 'DELETE', descripcion: 'DELETE sin id_criterio', overrides: { id_criterio: '' }, esperado: 'id_criterio_es_nulo_KO' }
];

// =====================================================================================
// rol
// =====================================================================================
let rol_backend_tests = [
    { accion: 'ADD', descripcion: 'ADD con el campo obligatorio', overrides: {}, esperado: true },
    { accion: 'ADD', descripcion: 'ADD sin nombre_rol', overrides: { nombre_rol: '' }, esperado: 'nombre_rol_es_nulo_KO' },

    { accion: 'SEARCH', descripcion: 'SEARCH sin filtros devuelve listado', overrides: {}, esperado: true },

    { accion: 'EDIT', descripcion: 'EDIT de un rol existente', overrides: {}, esperado: true },
    { accion: 'EDIT', descripcion: 'EDIT sin id_rol', overrides: { id_rol: '' }, esperado: 'id_rol_es_nulo_KO' },
    { accion: 'EDIT', descripcion: 'EDIT sin nombre_rol', overrides: { nombre_rol: '' }, esperado: 'nombre_rol_es_nulo_KO' },

    // DELETE de rol también desactiva (soft delete) a los usuarios con ese id_rol (ver
    // rol_SERVICE::DELETE), pero el fixture de DELETE es un rol nuevo sin usuarios asociados,
    // así que no tiene ese efecto secundario aquí.
    { accion: 'DELETE', descripcion: 'DELETE de un rol existente (baja lógica)', overrides: {}, esperado: true },
    { accion: 'DELETE', descripcion: 'DELETE sin id_rol', overrides: { id_rol: '' }, esperado: 'id_rol_es_nulo_KO' }
];

// =====================================================================================
// opcion
// =====================================================================================
let opcion_backend_tests = [
    { accion: 'ADD', descripcion: 'ADD con todos los campos obligatorios', overrides: {}, esperado: true },
    { accion: 'ADD', descripcion: 'ADD sin nombre_opcion', overrides: { nombre_opcion: '' }, esperado: 'nombre_opcion_es_nulo_KO' },
    { accion: 'ADD', descripcion: 'ADD sin valor', overrides: { valor: '' }, esperado: 'valor_es_nulo_KO' },
    { accion: 'ADD', descripcion: 'ADD sin id_criterio', overrides: { id_criterio: '' }, esperado: 'id_criterio_es_nulo_KO' },
    { accion: 'ADD', descripcion: 'ADD excluyente=1 sobre un criterio NO restrictivo', overrides: { excluyente: '1' }, esperado: 'EXCLUYENTE_REQUIERE_CRITERIO_RESTRICTIVO_KO' },

    { accion: 'SEARCH', descripcion: 'SEARCH sin filtros devuelve listado', overrides: {}, esperado: true },

    { accion: 'EDIT', descripcion: 'EDIT de una opcion existente', overrides: {}, esperado: true },
    { accion: 'EDIT', descripcion: 'EDIT sin id_opcion', overrides: { id_opcion: '' }, esperado: 'id_opcion_es_nulo_KO' },
    { accion: 'EDIT', descripcion: 'EDIT sin nombre_opcion', overrides: { nombre_opcion: '' }, esperado: 'nombre_opcion_es_nulo_KO' },
    { accion: 'EDIT', descripcion: 'EDIT sin valor', overrides: { valor: '' }, esperado: 'valor_es_nulo_KO' },
    { accion: 'EDIT', descripcion: 'EDIT sin id_criterio', overrides: { id_criterio: '' }, esperado: 'id_criterio_es_nulo_KO' },

    { accion: 'DELETE', descripcion: 'DELETE de una opcion existente (baja lógica)', overrides: {}, esperado: true },
    { accion: 'DELETE', descripcion: 'DELETE sin id_opcion', overrides: { id_opcion: '' }, esperado: 'id_opcion_es_nulo_KO' }
];

// =====================================================================================
// usuario_vivienda (solicitud/convivencia)
// =====================================================================================
let usuario_vivienda_backend_tests = [
    { accion: 'ADD', descripcion: 'ADD con todos los campos obligatorios', overrides: {}, esperado: true },
    { accion: 'ADD', descripcion: 'ADD sin id_usuario', overrides: { id_usuario: '' }, esperado: 'id_usuario_es_nulo_KO' },
    { accion: 'ADD', descripcion: 'ADD sin id_vivienda', overrides: { id_vivienda: '' }, esperado: 'id_vivienda_es_nulo_KO' },
    { accion: 'ADD', descripcion: 'ADD sin fecha_inicio', overrides: { fecha_inicio: '' }, esperado: 'fecha_inicio_es_nulo_KO' },
    { accion: 'ADD', descripcion: 'ADD con fecha_inicio en el pasado', overrides: { fecha_inicio: fechaOffset(-30) }, esperado: 'FECHA_INICIO_PASADA_KO' },
    { accion: 'ADD', descripcion: 'ADD con fecha_fin anterior o igual a fecha_inicio', overrides: { fecha_inicio: fechaOffset(60), fecha_fin: fechaOffset(60) }, esperado: 'FECHA_FIN_ANTERIOR_A_INICIO_KO' },

    { accion: 'SEARCH', descripcion: 'SEARCH sin filtros devuelve listado', overrides: {}, esperado: true },

    { accion: 'EDIT', descripcion: 'EDIT de una convivencia existente', overrides: {}, esperado: true },
    { accion: 'EDIT', descripcion: 'EDIT sin id_usuario', overrides: { id_usuario: '' }, esperado: 'id_usuario_es_nulo_KO' },
    { accion: 'EDIT', descripcion: 'EDIT sin id_vivienda', overrides: { id_vivienda: '' }, esperado: 'id_vivienda_es_nulo_KO' },

    { accion: 'DELETE', descripcion: 'DELETE de una convivencia existente (baja lógica)', overrides: {}, esperado: true },
    { accion: 'DELETE', descripcion: 'DELETE sin id_usuario', overrides: { id_usuario: '' }, esperado: 'id_usuario_es_nulo_KO' },
    { accion: 'DELETE', descripcion: 'DELETE sin id_vivienda', overrides: { id_vivienda: '' }, esperado: 'id_vivienda_es_nulo_KO' }
];

// =====================================================================================
// usuario_criterio_opcion (respuesta del huesped a un criterio)
// =====================================================================================
let usuario_criterio_opcion_backend_tests = [
    { accion: 'ADD', descripcion: 'ADD con todos los campos obligatorios', overrides: {}, esperado: true },
    { accion: 'ADD', descripcion: 'ADD sin id_usuario', overrides: { id_usuario: '' }, esperado: 'id_usuario_es_nulo_KO' },
    { accion: 'ADD', descripcion: 'ADD sin id_criterio', overrides: { id_criterio: '' }, esperado: 'id_criterio_es_nulo_KO' },
    { accion: 'ADD', descripcion: 'ADD sin id_opcion', overrides: { id_opcion: '' }, esperado: 'id_opcion_es_nulo_KO' },

    { accion: 'SEARCH', descripcion: 'SEARCH sin filtros devuelve listado', overrides: {}, esperado: true },

    { accion: 'EDIT', descripcion: 'EDIT de una respuesta existente', overrides: {}, esperado: true },
    { accion: 'EDIT', descripcion: 'EDIT sin id_usuario', overrides: { id_usuario: '' }, esperado: 'id_usuario_es_nulo_KO' },
    { accion: 'EDIT', descripcion: 'EDIT sin id_criterio', overrides: { id_criterio: '' }, esperado: 'id_criterio_es_nulo_KO' },
    { accion: 'EDIT', descripcion: 'EDIT sin id_opcion', overrides: { id_opcion: '' }, esperado: 'id_opcion_es_nulo_KO' },

    { accion: 'DELETE', descripcion: 'DELETE de una respuesta existente (baja lógica)', overrides: {}, esperado: true },
    { accion: 'DELETE', descripcion: 'DELETE sin id_usuario', overrides: { id_usuario: '' }, esperado: 'id_usuario_es_nulo_KO' },
    { accion: 'DELETE', descripcion: 'DELETE sin id_criterio', overrides: { id_criterio: '' }, esperado: 'id_criterio_es_nulo_KO' },
    { accion: 'DELETE', descripcion: 'DELETE sin id_opcion', overrides: { id_opcion: '' }, esperado: 'id_opcion_es_nulo_KO' }
];

// =====================================================================================
// vivienda_criterio_opcion (respuesta de la vivienda/anfitrion a un criterio)
// =====================================================================================
let vivienda_criterio_opcion_backend_tests = [
    { accion: 'ADD', descripcion: 'ADD con todos los campos obligatorios', overrides: {}, esperado: true },
    { accion: 'ADD', descripcion: 'ADD sin id_vivienda', overrides: { id_vivienda: '' }, esperado: 'id_vivienda_es_nulo_KO' },
    { accion: 'ADD', descripcion: 'ADD sin id_criterio', overrides: { id_criterio: '' }, esperado: 'id_criterio_es_nulo_KO' },
    { accion: 'ADD', descripcion: 'ADD sin id_opcion', overrides: { id_opcion: '' }, esperado: 'id_opcion_es_nulo_KO' },

    { accion: 'SEARCH', descripcion: 'SEARCH sin filtros devuelve listado', overrides: {}, esperado: true },

    { accion: 'EDIT', descripcion: 'EDIT de una respuesta existente', overrides: {}, esperado: true },
    { accion: 'EDIT', descripcion: 'EDIT sin id_vivienda', overrides: { id_vivienda: '' }, esperado: 'id_vivienda_es_nulo_KO' },
    { accion: 'EDIT', descripcion: 'EDIT sin id_criterio', overrides: { id_criterio: '' }, esperado: 'id_criterio_es_nulo_KO' },
    { accion: 'EDIT', descripcion: 'EDIT sin id_opcion', overrides: { id_opcion: '' }, esperado: 'id_opcion_es_nulo_KO' },

    { accion: 'DELETE', descripcion: 'DELETE de una respuesta existente (baja lógica)', overrides: {}, esperado: true },
    { accion: 'DELETE', descripcion: 'DELETE sin id_vivienda', overrides: { id_vivienda: '' }, esperado: 'id_vivienda_es_nulo_KO' },
    { accion: 'DELETE', descripcion: 'DELETE sin id_criterio', overrides: { id_criterio: '' }, esperado: 'id_criterio_es_nulo_KO' },
    { accion: 'DELETE', descripcion: 'DELETE sin id_opcion', overrides: { id_opcion: '' }, esperado: 'id_opcion_es_nulo_KO' }
];
