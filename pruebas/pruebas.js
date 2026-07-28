// Casos de prueba reales para la entidad "usuario" de Sempre na Casa (ver pruebas/js/usuario.js
// para las reglas de validación exactas). Formato de cada array, heredado del framework
// original: [entidad, campo, tipoElemento, NumDef, descripcion, accion, respuestaEsperada]
// para *_def_tests, y [entidad, campo, NumDef, NumPrueba, accion, [{campo: valor}], respuestaEsperada]
// para *_tests_fields.

let usuario_def_tests = Array(
    // dni
    ['usuario', 'dni', 'input', 1, 'cumple tamaño mínimo', 'ADD', 'dni_min_size_KO'],
    ['usuario', 'dni', 'input', 2, 'cumple tamaño máximo', 'ADD', 'dni_max_size_KO'],
    ['usuario', 'dni', 'input', 3, 'cumple formato', 'ADD', 'dni_format_KO'],
    ['usuario', 'dni', 'input', 4, 'es correcto', 'ADD', true],
    ['usuario', 'dni', 'input', 5, 'es correcto', 'EDIT', true],
    ['usuario', 'dni', 'input', 6, 'cumple formato', 'EDIT', 'dni_format_KO'],
    ['usuario', 'dni', 'input', 7, 'es correcto vacío', 'SEARCH', true],
    ['usuario', 'dni', 'input', 8, 'es correcto como substring', 'SEARCH', true],
    ['usuario', 'dni', 'input', 9, 'cumple tamaño máximo', 'SEARCH', 'dni_max_size_KO'],
    ['usuario', 'dni', 'input', 10, 'cumple formato', 'SEARCH', 'dni_format_KO'],

    // mail
    ['usuario', 'mail', 'input', 11, 'cumple tamaño mínimo', 'ADD', 'mail_min_size_KO'],
    ['usuario', 'mail', 'input', 12, 'cumple formato', 'ADD', 'mail_format_KO'],
    ['usuario', 'mail', 'input', 13, 'es correcto', 'ADD', true],
    ['usuario', 'mail', 'input', 14, 'es correcto', 'EDIT', true],
    ['usuario', 'mail', 'input', 15, 'cumple formato', 'EDIT', 'mail_format_KO'],
    ['usuario', 'mail', 'input', 16, 'es correcto vacío', 'SEARCH', true],
    ['usuario', 'mail', 'input', 17, 'es correcto como substring', 'SEARCH', true],

    // nombre_usuario
    ['usuario', 'nombre_usuario', 'input', 18, 'cumple tamaño mínimo', 'ADD', 'nombre_usuario_min_size_KO'],
    ['usuario', 'nombre_usuario', 'input', 19, 'cumple tamaño máximo', 'ADD', 'nombre_usuario_max_size_KO'],
    ['usuario', 'nombre_usuario', 'input', 20, 'cumple formato', 'ADD', 'nombre_usuario_format_KO'],
    ['usuario', 'nombre_usuario', 'input', 21, 'es correcto', 'ADD', true],
    ['usuario', 'nombre_usuario', 'input', 22, 'es correcto', 'EDIT', true],
    ['usuario', 'nombre_usuario', 'input', 23, 'es correcto vacío', 'SEARCH', true],
    ['usuario', 'nombre_usuario', 'input', 24, 'cumple tamaño máximo', 'SEARCH', 'nombre_usuario_max_size_KO'],

    // apellidos
    ['usuario', 'apellidos', 'input', 25, 'cumple tamaño mínimo', 'ADD', 'apellidos_min_size_KO'],
    ['usuario', 'apellidos', 'input', 26, 'cumple tamaño máximo', 'ADD', 'apellidos_max_size_KO'],
    ['usuario', 'apellidos', 'input', 27, 'cumple formato', 'ADD', 'apellidos_format_KO'],
    ['usuario', 'apellidos', 'input', 28, 'es correcto', 'ADD', true],
    ['usuario', 'apellidos', 'input', 29, 'es correcto', 'EDIT', true],
    ['usuario', 'apellidos', 'input', 30, 'es correcto vacío', 'SEARCH', true],

    // telefono
    ['usuario', 'telefono', 'input', 31, 'cumple tamaño mínimo', 'ADD', 'telefono_min_size_KO'],
    ['usuario', 'telefono', 'input', 32, 'cumple tamaño máximo', 'ADD', 'telefono_max_size_KO'],
    ['usuario', 'telefono', 'input', 33, 'cumple formato', 'ADD', 'telefono_format_KO'],
    ['usuario', 'telefono', 'input', 34, 'es correcto', 'ADD', true],
    ['usuario', 'telefono', 'input', 35, 'es correcto', 'EDIT', true],
    ['usuario', 'telefono', 'input', 36, 'es correcto vacío', 'SEARCH', true],
    ['usuario', 'telefono', 'input', 37, 'cumple formato', 'SEARCH', 'telefono_format_KO'],

    // password
    ['usuario', 'password', 'input', 38, 'cumple tamaño mínimo', 'ADD', 'password_min_size_KO'],
    ['usuario', 'password', 'input', 39, 'cumple tamaño máximo', 'ADD', 'password_max_size_KO'],
    ['usuario', 'password', 'input', 40, 'es correcto', 'ADD', true],
    ['usuario', 'password', 'input', 41, 'es correcto vacío (no se cambia)', 'EDIT', true],
    ['usuario', 'password', 'input', 42, 'es correcto', 'EDIT', true],
    ['usuario', 'password', 'input', 43, 'cumple tamaño mínimo', 'EDIT', 'password_min_size_KO']
);

let usuario_tests_fields = Array(
    // dni
    ['usuario', 'dni', 1, 1, 'ADD', [{ dni: '123' }], 'dni_min_size_KO'],
    ['usuario', 'dni', 2, 2, 'ADD', [{ dni: '123456789A' }], 'dni_max_size_KO'],
    ['usuario', 'dni', 3, 3, 'ADD', [{ dni: '1234567AB' }], 'dni_format_KO'],
    ['usuario', 'dni', 4, 4, 'ADD', [{ dni: '12345678A' }], true],
    ['usuario', 'dni', 5, 5, 'EDIT', [{ dni: '12345678A' }], true],
    ['usuario', 'dni', 6, 6, 'EDIT', [{ dni: '1234567ab' }], 'dni_format_KO'],
    ['usuario', 'dni', 7, 7, 'SEARCH', [{ dni: '' }], true],
    ['usuario', 'dni', 8, 8, 'SEARCH', [{ dni: '12345678A' }], true],
    ['usuario', 'dni', 9, 9, 'SEARCH', [{ dni: '1234567890' }], 'dni_max_size_KO'],
    ['usuario', 'dni', 10, 10, 'SEARCH', [{ dni: 'ABCDEFGH1' }], 'dni_format_KO'],

    // mail
    ['usuario', 'mail', 11, 11, 'ADD', [{ mail: 'a@b' }], 'mail_min_size_KO'],
    ['usuario', 'mail', 12, 12, 'ADD', [{ mail: 'correo-sin-arroba.com' }], 'mail_format_KO'],
    ['usuario', 'mail', 13, 13, 'ADD', [{ mail: 'ana.garcia@example.com' }], true],
    ['usuario', 'mail', 14, 14, 'EDIT', [{ mail: 'ana.garcia@example.com' }], true],
    ['usuario', 'mail', 15, 15, 'EDIT', [{ mail: 'correo-sin-arroba.com' }], 'mail_format_KO'],
    ['usuario', 'mail', 16, 16, 'SEARCH', [{ mail: '' }], true],
    ['usuario', 'mail', 17, 17, 'SEARCH', [{ mail: 'ana.garcia' }], true],

    // nombre_usuario
    ['usuario', 'nombre_usuario', 18, 18, 'ADD', [{ nombre_usuario: 'A' }], 'nombre_usuario_min_size_KO'],
    ['usuario', 'nombre_usuario', 19, 19, 'ADD', [{ nombre_usuario: 'N'.repeat(26) }], 'nombre_usuario_max_size_KO'],
    ['usuario', 'nombre_usuario', 20, 20, 'ADD', [{ nombre_usuario: 'Ana123' }], 'nombre_usuario_format_KO'],
    ['usuario', 'nombre_usuario', 21, 21, 'ADD', [{ nombre_usuario: 'Ana María' }], true],
    ['usuario', 'nombre_usuario', 22, 22, 'EDIT', [{ nombre_usuario: 'Ana María' }], true],
    ['usuario', 'nombre_usuario', 23, 23, 'SEARCH', [{ nombre_usuario: '' }], true],
    ['usuario', 'nombre_usuario', 24, 24, 'SEARCH', [{ nombre_usuario: 'n'.repeat(26) }], 'nombre_usuario_max_size_KO'],

    // apellidos
    ['usuario', 'apellidos', 25, 25, 'ADD', [{ apellidos: 'A' }], 'apellidos_min_size_KO'],
    ['usuario', 'apellidos', 26, 26, 'ADD', [{ apellidos: 'A'.repeat(101) }], 'apellidos_max_size_KO'],
    ['usuario', 'apellidos', 27, 27, 'ADD', [{ apellidos: 'Garcia123' }], 'apellidos_format_KO'],
    ['usuario', 'apellidos', 28, 28, 'ADD', [{ apellidos: 'García López' }], true],
    ['usuario', 'apellidos', 29, 29, 'EDIT', [{ apellidos: 'García López' }], true],
    ['usuario', 'apellidos', 30, 30, 'SEARCH', [{ apellidos: '' }], true],

    // telefono
    ['usuario', 'telefono', 31, 31, 'ADD', [{ telefono: '12345' }], 'telefono_min_size_KO'],
    ['usuario', 'telefono', 32, 32, 'ADD', [{ telefono: '1234567890' }], 'telefono_max_size_KO'],
    ['usuario', 'telefono', 33, 33, 'ADD', [{ telefono: '61234567A' }], 'telefono_format_KO'],
    ['usuario', 'telefono', 34, 34, 'ADD', [{ telefono: '612345678' }], true],
    ['usuario', 'telefono', 35, 35, 'EDIT', [{ telefono: '612345678' }], true],
    ['usuario', 'telefono', 36, 36, 'SEARCH', [{ telefono: '' }], true],
    ['usuario', 'telefono', 37, 37, 'SEARCH', [{ telefono: 'abc' }], 'telefono_format_KO'],

    // password
    ['usuario', 'password', 38, 38, 'ADD', [{ password: '1234567' }], 'password_min_size_KO'],
    ['usuario', 'password', 39, 39, 'ADD', [{ password: 'p'.repeat(16) }], 'password_max_size_KO'],
    ['usuario', 'password', 40, 40, 'ADD', [{ password: 'Segura123' }], true],
    ['usuario', 'password', 41, 41, 'EDIT', [{ password: '' }], true],
    ['usuario', 'password', 42, 42, 'EDIT', [{ password: 'NuevaSegura1' }], true],
    ['usuario', 'password', 43, 43, 'EDIT', [{ password: '123' }], 'password_min_size_KO']
);

// usuario no tiene ningún campo de tipo fichero.
let usuario_tests_files = Array();


// =====================================================================================
// vivienda
// =====================================================================================
let vivienda_def_tests = Array(
    ['vivienda', 'direccion', 'input', 1, 'cumple tamaño mínimo', 'ADD', 'direccion_min_size_KO'],
    ['vivienda', 'direccion', 'input', 2, 'cumple tamaño máximo', 'ADD', 'direccion_max_size_KO'],
    ['vivienda', 'direccion', 'input', 3, 'cumple formato', 'ADD', 'direccion_format_KO'],
    ['vivienda', 'direccion', 'input', 4, 'es correcto', 'ADD', true],
    ['vivienda', 'direccion', 'input', 5, 'es correcto', 'EDIT', true],
    ['vivienda', 'direccion', 'input', 6, 'es correcto vacío', 'SEARCH', true],
    ['vivienda', 'direccion', 'input', 7, 'es correcto como substring', 'SEARCH', true],

    ['vivienda', 'ciudad', 'input', 8, 'cumple tamaño mínimo', 'ADD', 'ciudad_min_size_KO'],
    ['vivienda', 'ciudad', 'input', 9, 'cumple tamaño máximo', 'ADD', 'ciudad_max_size_KO'],
    ['vivienda', 'ciudad', 'input', 10, 'cumple formato', 'ADD', 'ciudad_format_KO'],
    ['vivienda', 'ciudad', 'input', 11, 'es correcto', 'ADD', true],
    ['vivienda', 'ciudad', 'input', 12, 'es correcto', 'EDIT', true],
    ['vivienda', 'ciudad', 'input', 13, 'es correcto vacío', 'SEARCH', true],

    ['vivienda', 'descripcion', 'input', 14, 'es correcto vacío', 'ADD', true],
    ['vivienda', 'descripcion', 'input', 15, 'cumple tamaño máximo', 'ADD', 'descripcion_max_size_KO'],
    ['vivienda', 'descripcion', 'input', 16, 'cumple formato', 'ADD', 'descripcion_format_KO'],
    ['vivienda', 'descripcion', 'input', 17, 'es correcto', 'ADD', true],
    ['vivienda', 'descripcion', 'input', 18, 'es correcto', 'EDIT', true],
    ['vivienda', 'descripcion', 'input', 19, 'es correcto vacío', 'SEARCH', true],

    ['vivienda', 'plazas_totales', 'input', 20, 'cumple formato', 'ADD', 'plazas_totales_format_KO'],
    ['vivienda', 'plazas_totales', 'input', 21, 'es correcto', 'ADD', true],
    ['vivienda', 'plazas_totales', 'input', 22, 'es correcto', 'EDIT', true],
    ['vivienda', 'plazas_totales', 'input', 23, 'es correcto vacío', 'SEARCH', true],
    ['vivienda', 'plazas_totales', 'input', 24, 'cumple formato', 'SEARCH', 'plazas_totales_format_KO'],

    ['vivienda', 'plazas_libres', 'input', 25, 'cumple formato', 'ADD', 'plazas_libres_format_KO'],
    ['vivienda', 'plazas_libres', 'input', 26, 'es correcto', 'ADD', true],
    ['vivienda', 'plazas_libres', 'input', 27, 'es correcto', 'EDIT', true]
);

let vivienda_tests_fields = Array(
    ['vivienda', 'direccion', 1, 1, 'ADD', [{ direccion: 'Rua' }], 'direccion_min_size_KO'],
    ['vivienda', 'direccion', 2, 2, 'ADD', [{ direccion: 'R'.repeat(151) }], 'direccion_max_size_KO'],
    ['vivienda', 'direccion', 3, 3, 'ADD', [{ direccion: 'Calle#1!!' }], 'direccion_format_KO'],
    ['vivienda', 'direccion', 4, 4, 'ADD', [{ direccion: 'Rua de Proba 1' }], true],
    ['vivienda', 'direccion', 5, 5, 'EDIT', [{ direccion: 'Rua de Proba 1' }], true],
    ['vivienda', 'direccion', 6, 6, 'SEARCH', [{ direccion: '' }], true],
    ['vivienda', 'direccion', 7, 7, 'SEARCH', [{ direccion: 'Proba' }], true],

    ['vivienda', 'ciudad', 8, 8, 'ADD', [{ ciudad: 'A' }], 'ciudad_min_size_KO'],
    ['vivienda', 'ciudad', 9, 9, 'ADD', [{ ciudad: 'C'.repeat(61) }], 'ciudad_max_size_KO'],
    ['vivienda', 'ciudad', 10, 10, 'ADD', [{ ciudad: 'Vigo123' }], 'ciudad_format_KO'],
    ['vivienda', 'ciudad', 11, 11, 'ADD', [{ ciudad: 'Santiago de Compostela' }], true],
    ['vivienda', 'ciudad', 12, 12, 'EDIT', [{ ciudad: 'Santiago de Compostela' }], true],
    ['vivienda', 'ciudad', 13, 13, 'SEARCH', [{ ciudad: '' }], true],

    ['vivienda', 'descripcion', 14, 14, 'ADD', [{ descripcion: '' }], true],
    ['vivienda', 'descripcion', 15, 15, 'ADD', [{ descripcion: 'D'.repeat(501) }], 'descripcion_max_size_KO'],
    ['vivienda', 'descripcion', 16, 16, 'ADD', [{ descripcion: '<script>' }], 'descripcion_format_KO'],
    ['vivienda', 'descripcion', 17, 17, 'ADD', [{ descripcion: 'Piso luminoso' }], true],
    ['vivienda', 'descripcion', 18, 18, 'EDIT', [{ descripcion: 'Piso luminoso' }], true],
    ['vivienda', 'descripcion', 19, 19, 'SEARCH', [{ descripcion: '' }], true],

    ['vivienda', 'plazas_totales', 20, 20, 'ADD', [{ plazas_totales: 'tres' }], 'plazas_totales_format_KO'],
    ['vivienda', 'plazas_totales', 21, 21, 'ADD', [{ plazas_totales: '3' }], true],
    ['vivienda', 'plazas_totales', 22, 22, 'EDIT', [{ plazas_totales: '2' }], true],
    ['vivienda', 'plazas_totales', 23, 23, 'SEARCH', [{ plazas_totales: '' }], true],
    ['vivienda', 'plazas_totales', 24, 24, 'SEARCH', [{ plazas_totales: 'abc' }], 'plazas_totales_format_KO'],

    ['vivienda', 'plazas_libres', 25, 25, 'ADD', [{ plazas_libres: 'uno' }], 'plazas_libres_format_KO'],
    ['vivienda', 'plazas_libres', 26, 26, 'ADD', [{ plazas_libres: '1' }], true],
    ['vivienda', 'plazas_libres', 27, 27, 'EDIT', [{ plazas_libres: '0' }], true]
);

let vivienda_tests_files = Array();


// =====================================================================================
// criterio
// =====================================================================================
let criterio_def_tests = Array(
    ['criterio', 'nombre_criterio', 'input', 1, 'cumple tamaño mínimo', 'ADD', 'nombre_criterio_min_size_KO'],
    ['criterio', 'nombre_criterio', 'input', 2, 'cumple tamaño máximo', 'ADD', 'nombre_criterio_max_size_KO'],
    ['criterio', 'nombre_criterio', 'input', 3, 'cumple formato', 'ADD', 'nombre_criterio_format_KO'],
    ['criterio', 'nombre_criterio', 'input', 4, 'es correcto', 'ADD', true],
    ['criterio', 'nombre_criterio', 'input', 5, 'es correcto', 'EDIT', true],
    ['criterio', 'nombre_criterio', 'input', 6, 'es correcto vacío', 'SEARCH', true],
    ['criterio', 'nombre_criterio', 'input', 7, 'es correcto como substring', 'SEARCH', true],

    ['criterio', 'peso_criterio', 'input', 8, 'cumple formato', 'ADD', 'peso_criterio_format_KO'],
    ['criterio', 'peso_criterio', 'input', 9, 'es correcto', 'ADD', true],
    ['criterio', 'peso_criterio', 'input', 10, 'es correcto', 'EDIT', true],
    ['criterio', 'peso_criterio', 'input', 11, 'es correcto vacío', 'SEARCH', true]
);

let criterio_tests_fields = Array(
    ['criterio', 'nombre_criterio', 1, 1, 'ADD', [{ nombre_criterio: 'Ru' }], 'nombre_criterio_min_size_KO'],
    ['criterio', 'nombre_criterio', 2, 2, 'ADD', [{ nombre_criterio: 'N'.repeat(51) }], 'nombre_criterio_max_size_KO'],
    ['criterio', 'nombre_criterio', 3, 3, 'ADD', [{ nombre_criterio: 'Ruido123' }], 'nombre_criterio_format_KO'],
    ['criterio', 'nombre_criterio', 4, 4, 'ADD', [{ nombre_criterio: 'Nivel de ruido' }], true],
    ['criterio', 'nombre_criterio', 5, 5, 'EDIT', [{ nombre_criterio: 'Nivel de ruido' }], true],
    ['criterio', 'nombre_criterio', 6, 6, 'SEARCH', [{ nombre_criterio: '' }], true],
    ['criterio', 'nombre_criterio', 7, 7, 'SEARCH', [{ nombre_criterio: 'ruido' }], true],

    ['criterio', 'peso_criterio', 8, 8, 'ADD', [{ peso_criterio: 'alto' }], 'peso_criterio_format_KO'],
    ['criterio', 'peso_criterio', 9, 9, 'ADD', [{ peso_criterio: '5' }], true],
    ['criterio', 'peso_criterio', 10, 10, 'EDIT', [{ peso_criterio: '1' }], true],
    ['criterio', 'peso_criterio', 11, 11, 'SEARCH', [{ peso_criterio: '' }], true]
);

let criterio_tests_files = Array();


// =====================================================================================
// opcion
// =====================================================================================
let opcion_def_tests = Array(
    ['opcion', 'nombre_opcion', 'input', 1, 'cumple tamaño mínimo', 'ADD', 'nombre_opcion_min_size_KO'],
    ['opcion', 'nombre_opcion', 'input', 2, 'cumple tamaño máximo', 'ADD', 'nombre_opcion_max_size_KO'],
    ['opcion', 'nombre_opcion', 'input', 3, 'es correcto', 'ADD', true],
    ['opcion', 'nombre_opcion', 'input', 4, 'es correcto', 'EDIT', true],
    ['opcion', 'nombre_opcion', 'input', 5, 'es correcto vacío', 'SEARCH', true],

    ['opcion', 'valor', 'input', 6, 'cumple formato', 'ADD', 'valor_format_KO'],
    ['opcion', 'valor', 'input', 7, 'es correcto', 'ADD', true],
    ['opcion', 'valor', 'input', 8, 'es correcto', 'EDIT', true],
    ['opcion', 'valor', 'input', 9, 'es correcto vacío', 'SEARCH', true],

    ['opcion', 'id_criterio', 'input', 10, 'cumple formato', 'ADD', 'id_criterio_format_KO'],
    ['opcion', 'id_criterio', 'input', 11, 'es correcto', 'ADD', true],
    ['opcion', 'id_criterio', 'input', 12, 'es correcto', 'EDIT', true]
);

let opcion_tests_fields = Array(
    ['opcion', 'nombre_opcion', 1, 1, 'ADD', [{ nombre_opcion: 'A' }], 'nombre_opcion_min_size_KO'],
    ['opcion', 'nombre_opcion', 2, 2, 'ADD', [{ nombre_opcion: 'O'.repeat(101) }], 'nombre_opcion_max_size_KO'],
    ['opcion', 'nombre_opcion', 3, 3, 'ADD', [{ nombre_opcion: 'Silencio absoluto' }], true],
    ['opcion', 'nombre_opcion', 4, 4, 'EDIT', [{ nombre_opcion: 'Silencio absoluto' }], true],
    ['opcion', 'nombre_opcion', 5, 5, 'SEARCH', [{ nombre_opcion: '' }], true],

    ['opcion', 'valor', 6, 6, 'ADD', [{ valor: 'bajo' }], 'valor_format_KO'],
    ['opcion', 'valor', 7, 7, 'ADD', [{ valor: '1' }], true],
    ['opcion', 'valor', 8, 8, 'EDIT', [{ valor: '2' }], true],
    ['opcion', 'valor', 9, 9, 'SEARCH', [{ valor: '' }], true],

    ['opcion', 'id_criterio', 10, 10, 'ADD', [{ id_criterio: 'x' }], 'id_criterio_format_KO'],
    ['opcion', 'id_criterio', 11, 11, 'ADD', [{ id_criterio: '1' }], true],
    ['opcion', 'id_criterio', 12, 12, 'EDIT', [{ id_criterio: '1' }], true]
);

let opcion_tests_files = Array();


// =====================================================================================
// usuario_vivienda (solicitud/convivencia)
// =====================================================================================
let usuario_vivienda_def_tests = Array(
    ['usuario_vivienda', 'id_usuario', 'input', 1, 'cumple formato', 'ADD', 'id_usuario_format_KO'],
    ['usuario_vivienda', 'id_usuario', 'input', 2, 'es correcto', 'ADD', true],
    ['usuario_vivienda', 'id_usuario', 'input', 3, 'es correcto vacío', 'SEARCH', true],

    ['usuario_vivienda', 'id_vivienda', 'input', 4, 'cumple formato', 'ADD', 'id_vivienda_format_KO'],
    ['usuario_vivienda', 'id_vivienda', 'input', 5, 'es correcto', 'ADD', true],
    ['usuario_vivienda', 'id_vivienda', 'input', 6, 'es correcto vacío', 'SEARCH', true],

    ['usuario_vivienda', 'fecha_inicio', 'input', 7, 'cumple formato', 'ADD', 'fecha_inicio_format_KO'],
    ['usuario_vivienda', 'fecha_inicio', 'input', 8, 'es correcto', 'ADD', true],
    ['usuario_vivienda', 'fecha_inicio', 'input', 9, 'es correcto', 'EDIT', true],
    ['usuario_vivienda', 'fecha_inicio', 'input', 10, 'es correcto vacío', 'SEARCH', true],
    ['usuario_vivienda', 'fecha_inicio', 'input', 11, 'cumple formato', 'SEARCH', 'fecha_inicio_format_KO'],

    ['usuario_vivienda', 'fecha_fin', 'input', 12, 'es correcto vacío (estancia abierta)', 'ADD', true],
    ['usuario_vivienda', 'fecha_fin', 'input', 13, 'cumple formato', 'ADD', 'fecha_fin_format_KO'],
    ['usuario_vivienda', 'fecha_fin', 'input', 14, 'es correcto', 'ADD', true],
    ['usuario_vivienda', 'fecha_fin', 'input', 15, 'es correcto vacío', 'SEARCH', true]
);

let usuario_vivienda_tests_fields = Array(
    ['usuario_vivienda', 'id_usuario', 1, 1, 'ADD', [{ id_usuario: 'x' }], 'id_usuario_format_KO'],
    ['usuario_vivienda', 'id_usuario', 2, 2, 'ADD', [{ id_usuario: '9101' }], true],
    ['usuario_vivienda', 'id_usuario', 3, 3, 'SEARCH', [{ id_usuario: '' }], true],

    ['usuario_vivienda', 'id_vivienda', 4, 4, 'ADD', [{ id_vivienda: 'x' }], 'id_vivienda_format_KO'],
    ['usuario_vivienda', 'id_vivienda', 5, 5, 'ADD', [{ id_vivienda: '9001' }], true],
    ['usuario_vivienda', 'id_vivienda', 6, 6, 'SEARCH', [{ id_vivienda: '' }], true],

    ['usuario_vivienda', 'fecha_inicio', 7, 7, 'ADD', [{ fecha_inicio: '32/14/2026' }], 'fecha_inicio_format_KO'],
    ['usuario_vivienda', 'fecha_inicio', 8, 8, 'ADD', [{ fecha_inicio: '2026-08-01' }], true],
    ['usuario_vivienda', 'fecha_inicio', 9, 9, 'EDIT', [{ fecha_inicio: '2026-08-01' }], true],
    ['usuario_vivienda', 'fecha_inicio', 10, 10, 'SEARCH', [{ fecha_inicio: '' }], true],
    ['usuario_vivienda', 'fecha_inicio', 11, 11, 'SEARCH', [{ fecha_inicio: 'ayer' }], 'fecha_inicio_format_KO'],

    ['usuario_vivienda', 'fecha_fin', 12, 12, 'ADD', [{ fecha_fin: '' }], true],
    ['usuario_vivienda', 'fecha_fin', 13, 13, 'ADD', [{ fecha_fin: 'nunca' }], 'fecha_fin_format_KO'],
    ['usuario_vivienda', 'fecha_fin', 14, 14, 'ADD', [{ fecha_fin: '2027-02-01' }], true],
    ['usuario_vivienda', 'fecha_fin', 15, 15, 'SEARCH', [{ fecha_fin: '' }], true]
);

let usuario_vivienda_tests_files = Array();


// =====================================================================================
// usuario_criterio_opcion (respuesta del huesped a un criterio)
// =====================================================================================
let usuario_criterio_opcion_def_tests = Array(
    ['usuario_criterio_opcion', 'id_usuario', 'input', 1, 'cumple formato', 'ADD', 'id_usuario_format_KO'],
    ['usuario_criterio_opcion', 'id_usuario', 'input', 2, 'es correcto', 'ADD', true],
    ['usuario_criterio_opcion', 'id_usuario', 'input', 3, 'es correcto vacío', 'SEARCH', true],

    ['usuario_criterio_opcion', 'id_criterio', 'input', 4, 'cumple formato', 'ADD', 'id_criterio_format_KO'],
    ['usuario_criterio_opcion', 'id_criterio', 'input', 5, 'es correcto', 'ADD', true],
    ['usuario_criterio_opcion', 'id_criterio', 'input', 6, 'es correcto vacío', 'SEARCH', true],

    ['usuario_criterio_opcion', 'id_opcion', 'input', 7, 'cumple formato', 'ADD', 'id_opcion_format_KO'],
    ['usuario_criterio_opcion', 'id_opcion', 'input', 8, 'es correcto', 'ADD', true],
    ['usuario_criterio_opcion', 'id_opcion', 'input', 9, 'es correcto vacío', 'SEARCH', true]
);

let usuario_criterio_opcion_tests_fields = Array(
    ['usuario_criterio_opcion', 'id_usuario', 1, 1, 'ADD', [{ id_usuario: 'x' }], 'id_usuario_format_KO'],
    ['usuario_criterio_opcion', 'id_usuario', 2, 2, 'ADD', [{ id_usuario: '9101' }], true],
    ['usuario_criterio_opcion', 'id_usuario', 3, 3, 'SEARCH', [{ id_usuario: '' }], true],

    ['usuario_criterio_opcion', 'id_criterio', 4, 4, 'ADD', [{ id_criterio: 'x' }], 'id_criterio_format_KO'],
    ['usuario_criterio_opcion', 'id_criterio', 5, 5, 'ADD', [{ id_criterio: '1' }], true],
    ['usuario_criterio_opcion', 'id_criterio', 6, 6, 'SEARCH', [{ id_criterio: '' }], true],

    ['usuario_criterio_opcion', 'id_opcion', 7, 7, 'ADD', [{ id_opcion: 'x' }], 'id_opcion_format_KO'],
    ['usuario_criterio_opcion', 'id_opcion', 8, 8, 'ADD', [{ id_opcion: '3' }], true],
    ['usuario_criterio_opcion', 'id_opcion', 9, 9, 'SEARCH', [{ id_opcion: '' }], true]
);

let usuario_criterio_opcion_tests_files = Array();


// =====================================================================================
// vivienda_criterio_opcion (respuesta de la vivienda/anfitrion a un criterio)
// =====================================================================================
let vivienda_criterio_opcion_def_tests = Array(
    ['vivienda_criterio_opcion', 'id_vivienda', 'input', 1, 'cumple formato', 'ADD', 'id_vivienda_format_KO'],
    ['vivienda_criterio_opcion', 'id_vivienda', 'input', 2, 'es correcto', 'ADD', true],
    ['vivienda_criterio_opcion', 'id_vivienda', 'input', 3, 'es correcto vacío', 'SEARCH', true],

    ['vivienda_criterio_opcion', 'id_criterio', 'input', 4, 'cumple formato', 'ADD', 'id_criterio_format_KO'],
    ['vivienda_criterio_opcion', 'id_criterio', 'input', 5, 'es correcto', 'ADD', true],
    ['vivienda_criterio_opcion', 'id_criterio', 'input', 6, 'es correcto vacío', 'SEARCH', true],

    ['vivienda_criterio_opcion', 'id_opcion', 'input', 7, 'cumple formato', 'ADD', 'id_opcion_format_KO'],
    ['vivienda_criterio_opcion', 'id_opcion', 'input', 8, 'es correcto', 'ADD', true],
    ['vivienda_criterio_opcion', 'id_opcion', 'input', 9, 'es correcto vacío', 'SEARCH', true]
);

let vivienda_criterio_opcion_tests_fields = Array(
    ['vivienda_criterio_opcion', 'id_vivienda', 1, 1, 'ADD', [{ id_vivienda: 'x' }], 'id_vivienda_format_KO'],
    ['vivienda_criterio_opcion', 'id_vivienda', 2, 2, 'ADD', [{ id_vivienda: '9001' }], true],
    ['vivienda_criterio_opcion', 'id_vivienda', 3, 3, 'SEARCH', [{ id_vivienda: '' }], true],

    ['vivienda_criterio_opcion', 'id_criterio', 4, 4, 'ADD', [{ id_criterio: 'x' }], 'id_criterio_format_KO'],
    ['vivienda_criterio_opcion', 'id_criterio', 5, 5, 'ADD', [{ id_criterio: '1' }], true],
    ['vivienda_criterio_opcion', 'id_criterio', 6, 6, 'SEARCH', [{ id_criterio: '' }], true],

    ['vivienda_criterio_opcion', 'id_opcion', 7, 7, 'ADD', [{ id_opcion: 'x' }], 'id_opcion_format_KO'],
    ['vivienda_criterio_opcion', 'id_opcion', 8, 8, 'ADD', [{ id_opcion: '2' }], true],
    ['vivienda_criterio_opcion', 'id_opcion', 9, 9, 'SEARCH', [{ id_opcion: '' }], true]
);

let vivienda_criterio_opcion_tests_files = Array();
