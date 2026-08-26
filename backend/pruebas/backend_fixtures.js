let _sufijoContador = 0;
function sufijo(digitos) {
    _sufijoContador++;
    return String(Date.now() + _sufijoContador).slice(-digitos).padStart(digitos, '0');
}

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

/** Prepara las filas base que necesita cualquier entidad, una sola vez por ejecución.
 * Todas las filas son fixtures QA desechables creadas aquí mismo: nunca se reutiliza una fila
 * ya existente (p.ej. vía SEARCH), porque los tests de EDIT/DELETE la modificarían/borrarían
 * de verdad, con el riesgo de corromper datos reales de la base de datos conectada. */
async function prepararFixtures() {
    const idRol = await crear('rol', { nombre_rol: 'QA Rol Fixture' });

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

/** Clave (tabla + valores) de la fila que un ADD (o un UPSERT_RESPUESTA/updateOpcion) acaba de
 * crear, para poder borrarla físicamente al terminar. En las tablas de relación no hace falta el
 * id que devuelve el backend (no tienen autoincremental): la clave ya estaba en el propio payload
 * enviado. Importante: en usuario_criterio_opcion/vivienda_criterio_opcion la clave primaria real
 * es (id_usuario|id_vivienda, id_criterio) — id_opcion NO forma parte de ella (updateOpcion la
 * cambia sin cambiar de fila) — así que no se incluye, o una fila cuyo id_opcion se actualizó
 * después dejaría de encontrarse al limpiar. */
function claveFilaCreada(entidad, payload, idBackend) {
    switch (entidad) {
        case 'usuario':   return { tabla: 'usuario',   valores: { id_usuario: idBackend } };
        case 'vivienda':  return { tabla: 'vivienda',  valores: { id_vivienda: idBackend } };
        case 'criterio':  return { tabla: 'criterio',  valores: { id_criterio: idBackend } };
        case 'rol':       return { tabla: 'rol',       valores: { id_rol: idBackend } };
        case 'opcion':    return { tabla: 'opcion',    valores: { id_opcion: idBackend } };
        case 'usuario_vivienda':
            return { tabla: entidad, valores: { id_usuario: payload.id_usuario, id_vivienda: payload.id_vivienda } };
        case 'usuario_criterio_opcion':
            return { tabla: entidad, valores: { id_usuario: payload.id_usuario, id_criterio: payload.id_criterio } };
        case 'vivienda_criterio_opcion':
            return { tabla: entidad, valores: { id_vivienda: payload.id_vivienda, id_criterio: payload.id_criterio } };
        default: return null;
    }
}

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

        const filaCreada = (accion === 'ADD' && backendOk) ? claveFilaCreada(nombreEntidad, payload, res.resource) : null;

        return { backend_status, backend_code: res.code || '', filaCreada };
    } catch (e) {
        return { backend_status: 'SIN_CONEXION', backend_code: e.message };
    }
}

const TABLAS_RELACION = ['usuario_criterio_opcion', 'vivienda_criterio_opcion', 'usuario_vivienda'];

async function limpiarFixtures(filasExtra, fixtures) {
    const extra = filasExtra.filter(Boolean);
    const relaciones = extra.filter(f => TABLAS_RELACION.includes(f.tabla));
    const resto       = extra.filter(f => !TABLAS_RELACION.includes(f.tabla));
    const filas = [...relaciones, ...resto];

    if (fixtures) {
        if (fixtures.idOpcion)    filas.push({ tabla: 'opcion',    valores: { id_opcion: fixtures.idOpcion } });
        if (fixtures.idCriterio) filas.push({ tabla: 'criterio',  valores: { id_criterio: fixtures.idCriterio } });
        if (fixtures.idVivienda) filas.push({ tabla: 'vivienda',  valores: { id_vivienda: fixtures.idVivienda } });
        if (fixtures.idUsuario)  filas.push({ tabla: 'usuario',   valores: { id_usuario: fixtures.idUsuario } });
        if (fixtures.idRol)      filas.push({ tabla: 'rol',       valores: { id_rol: fixtures.idRol } });
    }

    if (filas.length === 0) return { borradas: [], omitidas: [] };

    try {
        const res = await apiPost('qa_cleanup', 'LIMPIAR', { filas: JSON.stringify(filas) });
        if (!res.ok) {
            console.error('Limpieza de fixtures QA falló:', res.code);
            return { borradas: [], omitidas: filas.map(f => `${f.tabla}: ${res.code}`) };
        }
        return res.resource;
    } catch (e) {
        console.error('Limpieza de fixtures QA falló:', e);
        return { borradas: [], omitidas: filas.map(f => `${f.tabla}: ${e.message}`) };
    }
}
