// Fixtures para pruebas/backend/backend_pruebas.js: datos reales contra los que se llama al
// backend. Diseño deliberadamente simple -- una única preparación por ejecución, sin
// "contextos" por entidad ni funciones async anidadas:
//
//  1. prepararFixtures() crea, UNA vez por ejecución (da igual qué entidad se vaya a probar),
//     una fila propia de cada entidad base: un usuario, una vivienda de ese usuario, un
//     criterio y una opción de ese criterio. Sale un poco "de más" si solo hace falta una,
//     pero son 4-5 llamadas HTTP triviales a cambio de no tener que calcular qué depende de
//     qué entidad por entidad.
//  2. payloadValido(entidad, fx) arma el payload ADD/EDIT completo y válido de esa entidad a
//     partir de esas filas (fx). Cada fila propia sirve a la vez de "dato para EDIT/DELETE de
//     su propia entidad" y de "FK para quien la necesite" (p.ej. el usuario creado aquí es a
//     la vez el que se edita/borra en las pruebas de "usuario" Y el id_anfitrion de la
//     vivienda) -- así no hace falta una fixture distinta para editar y otra para borrar.
//  3. idPrincipalPayload(entidad, fx) da la clave (o claves, en las tablas de relación) que
//     identifica esa fila propia, para los payloads de EDIT/DELETE.
//
// Los valores que tienen que ser únicos (dni, mail, teléfono) se generan con sufijo(), que
// combina el reloj con un contador que solo crece durante toda la ejecución -- así nunca dos
// llamadas de la misma tanda de pruebas usan el mismo valor, sin tener que pasarle a cada
// llamada en qué fila de la lista de casos está.

let _sufijoContador = 0;
function sufijo(digitos) {
    _sufijoContador++;
    return String(Date.now() + _sufijoContador).slice(-digitos).padStart(digitos, '0');
}

// Fecha 'YYYY-MM-DD' relativa a hoy (positivo = futuro, negativo = pasado). Necesario porque
// usuario_vivienda_SERVICE::ADD() rechaza fecha_inicio en el pasado -- una fecha fija como
// '2026-01-01' es "futura" solo hasta que el reloj real la alcanza.
function fechaOffset(diasDesdeHoy) {
    const d = new Date();
    d.setDate(d.getDate() + diasDesdeHoy);
    return d.toISOString().slice(0, 10);
}

async function primeraFila(entidad, filtro = {}) {
    const res = await apiPost(entidad, 'SEARCH', filtro);
    if (res.ok && Array.isArray(res.resource) && res.resource.length > 0) return res.resource[0];
    return null;
}

async function crear(entidad, payload) {
    const res = await apiPost(entidad, 'ADD', payload);
    return res.ok ? res.resource : null;
}

/** Prepara las filas base que necesita cualquier entidad, una sola vez por ejecución. */
async function prepararFixtures() {
    const rolExistente = await primeraFila('rol');
    const idRol = rolExistente ? rolExistente.id_rol : await crear('rol', { nombre_rol: 'QA Rol Fixture' });

    const idUsuario = await crear('usuario', {
        dni: sufijo(8) + 'A',
        mail: `qa.${sufijo(8)}@example.com`,
        nombre_usuario: 'QA',
        apellidos: 'AutomaticaBackend',
        telefono: '6' + sufijo(8),
        password: 'Test1234!',
        id_rol: idRol
    });

    const idVivienda = await crear('vivienda', {
        direccion: 'Rua QA ' + sufijo(4),
        ciudad: 'Santiago',
        descripcion: 'QA fixture',
        plazas_totales: '2',
        plazas_libres: '1',
        id_anfitrion: idUsuario
    });

    const idCriterio = await crear('criterio', { nombre_criterio: 'QA Fixture Backend' });
    const idOpcion = await crear('opcion', { nombre_opcion: 'QA ' + sufijo(4), valor: '1', id_criterio: idCriterio });

    return { idRol, idUsuario, idVivienda, idCriterio, idOpcion };
}

/** Payload ADD/EDIT completo y válido de una entidad, a partir de las fixtures ya preparadas. */
function payloadValido(entidad, fx) {
    switch (entidad) {
        case 'usuario':
            return {
                dni: sufijo(8) + 'A',
                mail: `qa.${sufijo(8)}@example.com`,
                nombre_usuario: 'QA',
                apellidos: 'AutomaticaBackend',
                telefono: '6' + sufijo(8),
                password: 'Test1234!',
                id_rol: fx.idRol
            };
        case 'vivienda':
            return {
                direccion: 'Rua QA ' + sufijo(4),
                ciudad: 'Santiago',
                descripcion: 'QA fixture',
                plazas_totales: '2',
                plazas_libres: '1',
                id_anfitrion: fx.idUsuario
            };
        case 'criterio':
            return { nombre_criterio: 'QA Fixture Backend' };
        case 'rol':
            return { nombre_rol: 'QA Rol Fixture' };
        case 'opcion':
            return { nombre_opcion: 'QA ' + sufijo(4), valor: '1', id_criterio: fx.idCriterio };
        case 'usuario_vivienda':
            return { id_usuario: fx.idUsuario, id_vivienda: fx.idVivienda, fecha_inicio: fechaOffset(30) };
        case 'usuario_criterio_opcion':
            return { id_usuario: fx.idUsuario, id_criterio: fx.idCriterio, id_opcion: fx.idOpcion };
        case 'vivienda_criterio_opcion':
            return { id_vivienda: fx.idVivienda, id_criterio: fx.idCriterio, id_opcion: fx.idOpcion };
        default:
            return {};
    }
}

/** Clave (o claves, en las tablas de relación) que identifica la fila propia de esa entidad,
 * para los payloads de EDIT/DELETE. */
function idPrincipalPayload(entidad, fx) {
    switch (entidad) {
        case 'usuario':                  return { id_usuario: fx.idUsuario };
        case 'vivienda':                 return { id_vivienda: fx.idVivienda };
        case 'criterio':                 return { id_criterio: fx.idCriterio };
        case 'rol':                      return { id_rol: fx.idRol };
        case 'opcion':                   return { id_opcion: fx.idOpcion };
        case 'usuario_vivienda':         return { id_usuario: fx.idUsuario, id_vivienda: fx.idVivienda };
        case 'usuario_criterio_opcion':  return { id_usuario: fx.idUsuario, id_criterio: fx.idCriterio, id_opcion: fx.idOpcion };
        case 'vivienda_criterio_opcion': return { id_vivienda: fx.idVivienda, id_criterio: fx.idCriterio, id_opcion: fx.idOpcion };
        default:                         return {};
    }
}

/**
 * Ejecuta la llamada real al backend para un caso de prueba y clasifica el resultado:
 *  - 'OK': backend y expectativa están de acuerdo (los dos aceptan, o los dos rechazan con el
 *    mismo motivo esperado).
 *  - 'DIVERGENCIA': se esperaba un error y el backend acepta igualmente.
 *  - 'BACKEND_MAS_ESTRICTO': se esperaba éxito y el backend rechaza -- normalmente apunta a un
 *    problema real (fixture mal construido, regla de negocio no esperada...).
 *  - 'SIN_CONEXION': la llamada ha fallado (backend caído, etc.).
 */
async function compararConBackend(nombreEntidad, accion, fixtures, overrides, respuestaEsperadaLocal) {
    if (accion !== 'ADD' && accion !== 'EDIT' && accion !== 'SEARCH' && accion !== 'DELETE') {
        return { backend_status: 'N/A', backend_code: '' };
    }
    try {
        let payload;
        if (accion === 'SEARCH') {
            payload = {};
        } else if (accion === 'DELETE') {
            payload = idPrincipalPayload(nombreEntidad, fixtures);
        } else {
            payload = payloadValido(nombreEntidad, fixtures);
            if (accion === 'EDIT') {
                Object.assign(payload, idPrincipalPayload(nombreEntidad, fixtures));
                if (nombreEntidad === 'usuario') delete payload.password;
            }
        }
        Object.assign(payload, overrides);

        const res = await apiPost(nombreEntidad, accion, payload);
        const backendOk = res.ok === true;
        const localEsperaOk = respuestaEsperadaLocal === true;

        let backend_status;
        if (backendOk === localEsperaOk) {
            backend_status = 'OK';
        } else if (backendOk && !localEsperaOk) {
            backend_status = 'DIVERGENCIA';
        } else {
            backend_status = 'BACKEND_MAS_ESTRICTO';
        }
        return { backend_status, backend_code: res.code || '' };
    } catch (e) {
        return { backend_status: 'SIN_CONEXION', backend_code: e.message };
    }
}
