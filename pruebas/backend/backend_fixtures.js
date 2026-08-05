/** Genera un número de `digitos` cifras, distinto en cada llamada dentro de la misma ejecución
 * (combina el reloj con `semilla` para que varias filas de prueba no choquen entre sí). Se usa
 * para construir dni/mail/teléfono únicos por fila. */
function idUnico(semilla, digitos) {
    const base = (Date.now() + semilla) % (10 ** digitos);
    return String(base).padStart(digitos, '0');
}

/** Fecha 'YYYY-MM-DD' relativa a hoy (positivo = futuro, negativo = pasado). Se usa en vez de
 * fechas fijas para las reglas de negocio de usuario_vivienda_SERVICE::ADD() (fecha_inicio no
 * puede estar en el pasado): una fecha fija como '2026-01-01' es "futura" solo hasta que el
 * reloj real la alcanza, y entonces el fixture empieza a fallar con FECHA_INICIO_PASADA_KO
 * aunque el test en sí no haya cambiado. */
function fechaOffset(diasDesdeHoy) {
    const d = new Date();
    d.setDate(d.getDate() + diasDesdeHoy);
    return d.toISOString().slice(0, 10);
}

/** Primera fila que devuelve un SEARCH real contra el backend, o null si no hay ninguna. Se usa
 * para reutilizar datos ya existentes (p.ej. un id_rol válido) en vez de asumir un ID fijo que
 * podría no existir en esta base de datos.
 **/
async function primeraFila(entidad, filtro = {}) {
    const res = await apiPost(entidad, 'SEARCH', filtro);
    if (res.ok && Array.isArray(res.resource) && res.resource.length > 0) return res.resource[0];
    return null;
}

async function crearUsuarioFixture(semilla, idRolForzado) {
    const idRol = idRolForzado ?? (await primeraFila('rol'))?.id_rol ?? '';
    const sufijo = idUnico(semilla, 8);
    const payload = {
        dni: sufijo + 'A',
        mail: `qa.${sufijo}@example.com`,
        nombre_usuario: 'QA',
        apellidos: 'AutomaticaBackend',
        telefono: '6' + sufijo,
        password: 'Test1234!',
        id_rol: idRol
    };
    const res = await apiPost('usuario', 'ADD', payload);
    return { id: res.ok ? res.resource : null, idRol };
}

async function crearCriterioFixture() {
    const res = await apiPost('criterio', 'ADD', { nombre_criterio: 'QA Fixture Backend' });
    return { id: res.ok ? res.resource : null };
}

async function crearRolFixture() {
    const res = await apiPost('rol', 'ADD', { nombre_rol: 'QA Rol Fixture' });
    return { id: res.ok ? res.resource : null };
}

async function crearOpcionFixture(semilla, idCriterio) {
    const sufijo = idUnico(semilla, 4);
    const res = await apiPost('opcion', 'ADD', { nombre_opcion: 'QA Fixture ' + sufijo, valor: '1', id_criterio: idCriterio });
    return { id: res.ok ? res.resource : null, idCriterio };
}

async function crearViviendaFixture(semilla, idAnfitrion) {
    const sufijo = idUnico(semilla, 4);
    const payload = {
        direccion: 'Rua QA Fixture ' + sufijo,
        ciudad: 'Santiago',
        descripcion: 'QA fixture',
        plazas_totales: '2',
        plazas_libres: '1',
        id_anfitrion: idAnfitrion
    };
    const res = await apiPost('vivienda', 'ADD', payload);
    return { id: res.ok ? res.resource : null };
}

/**
 * Construye el "contexto" de una entidad: los datos de partida (IDs de FK válidos, fixture
 * dedicado para EDIT) que necesitan sus pruebas ADD/EDIT reales contra el backend.
 * `payloadPara(accion, numPrueba)` devuelve un payload COMPLETO y válido para esa acción;
 * quien la llama solo tiene que sobreescribir encima el campo bajo prueba.
 */
async function crearContextoBackend(nombreEntidad) {
    switch (nombreEntidad) {

        case 'usuario': {
            const rol = await primeraFila('rol');
            const idRol = rol ? rol.id_rol : '';
            const fixtureEdit = await crearUsuarioFixture(900001, idRol);
            const fixtureDelete = await crearUsuarioFixture(900020, idRol);
            return {
                idPrincipal: fixtureEdit.id,
                async payloadPara(accion, numPrueba) {
                    if (accion === 'DELETE') return { id_usuario: fixtureDelete.id };
                    const sufijo = idUnico(numPrueba, 8);
                    const base = {
                        dni: sufijo + 'A',
                        mail: `qa.${sufijo}@example.com`,
                        nombre_usuario: 'QA',
                        apellidos: 'AutomaticaBackend',
                        telefono: '6' + sufijo,
                        password: 'Test1234!',
                        id_rol: idRol
                    };
                    if (accion === 'EDIT') { base.id_usuario = fixtureEdit.id; delete base.password; }
                    return base;
                }
            };
        }

        case 'vivienda': {
            const anfitrion = await crearUsuarioFixture(900002);
            const fixtureEdit = await crearViviendaFixture(900003, anfitrion.id);
            const anfitrionDelete = await crearUsuarioFixture(900021);
            const fixtureDelete = await crearViviendaFixture(900022, anfitrionDelete.id);
            return {
                idPrincipal: fixtureEdit.id,
                async payloadPara(accion, numPrueba) {
                    if (accion === 'DELETE') return { id_vivienda: fixtureDelete.id };
                    const sufijo = idUnico(numPrueba, 4);
                    const base = {
                        direccion: 'Rua QA ' + sufijo,
                        ciudad: 'Santiago',
                        descripcion: 'QA fixture',
                        plazas_totales: '2',
                        plazas_libres: '1',
                        id_anfitrion: anfitrion.id
                    };
                    if (accion === 'EDIT') base.id_vivienda = fixtureEdit.id;
                    return base;
                }
            };
        }

        case 'criterio': {
            const fixtureEdit = await crearCriterioFixture();
            const fixtureDelete = await crearCriterioFixture();
            return {
                idPrincipal: fixtureEdit.id,
                async payloadPara(accion) {
                    if (accion === 'DELETE') return { id_criterio: fixtureDelete.id };
                    const base = { nombre_criterio: 'QA Fixture Backend' };
                    if (accion === 'EDIT') base.id_criterio = fixtureEdit.id;
                    return base;
                }
            };
        }

        case 'rol': {
            const fixtureEdit = await crearRolFixture();
            const fixtureDelete = await crearRolFixture();
            return {
                idPrincipal: fixtureEdit.id,
                async payloadPara(accion) {
                    if (accion === 'DELETE') return { id_rol: fixtureDelete.id };
                    const base = { nombre_rol: 'QA Rol Fixture' };
                    if (accion === 'EDIT') base.id_rol = fixtureEdit.id;
                    return base;
                }
            };
        }

        case 'opcion': {
            const criterio = await crearCriterioFixture();
            const fixtureEdit = await crearOpcionFixture(900006, criterio.id);
            const fixtureDelete = await crearOpcionFixture(900023, criterio.id);
            return {
                idPrincipal: fixtureEdit.id,
                async payloadPara(accion, numPrueba) {
                    if (accion === 'DELETE') return { id_opcion: fixtureDelete.id };
                    const sufijo = idUnico(numPrueba, 4);
                    const base = { nombre_opcion: 'QA Fixture ' + sufijo, valor: '1', id_criterio: criterio.id };
                    if (accion === 'EDIT') base.id_opcion = fixtureEdit.id;
                    return base;
                }
            };
        }

        case 'usuario_vivienda': {
            const usuarioEdit  = await crearUsuarioFixture(900007);
            const viviendaEdit = await crearViviendaFixture(900008, usuarioEdit.id);
            const usuarioDelete  = await crearUsuarioFixture(900024);
            const viviendaDelete = await crearViviendaFixture(900025, usuarioDelete.id);
            return {
                idPrincipal: null,
                async payloadPara(accion, numPrueba) {
                    if (accion === 'DELETE') {
                        return { id_usuario: usuarioDelete.id, id_vivienda: viviendaDelete.id };
                    }
                    if (accion === 'ADD') {
                        const usuario  = await crearUsuarioFixture(numPrueba);
                        const vivienda = await crearViviendaFixture(numPrueba + 500, usuario.id);
                        return { id_usuario: usuario.id, id_vivienda: vivienda.id, fecha_inicio: fechaOffset(30) };
                    }
                    return { id_usuario: usuarioEdit.id, id_vivienda: viviendaEdit.id, fecha_inicio: fechaOffset(30) };
                }
            };
        }

        case 'usuario_criterio_opcion': {
            const criterio    = await crearCriterioFixture();
            const opcion      = await crearOpcionFixture(900010, criterio.id);
            const usuarioEdit = await crearUsuarioFixture(900011);
            const usuarioDelete = await crearUsuarioFixture(900026);
            return {
                idPrincipal: null,
                async payloadPara(accion, numPrueba) {
                    if (accion === 'DELETE') {
                        return { id_usuario: usuarioDelete.id, id_criterio: criterio.id, id_opcion: opcion.id };
                    }
                    const idUsuario = accion === 'ADD' ? (await crearUsuarioFixture(numPrueba)).id : usuarioEdit.id;
                    return { id_usuario: idUsuario, id_criterio: criterio.id, id_opcion: opcion.id };
                }
            };
        }

        case 'vivienda_criterio_opcion': {
            const criterio      = await crearCriterioFixture();
            const opcion        = await crearOpcionFixture(900013, criterio.id);
            const anfitrionEdit = await crearUsuarioFixture(900014);
            const viviendaEdit  = await crearViviendaFixture(900015, anfitrionEdit.id);
            const anfitrionDelete = await crearUsuarioFixture(900027);
            const viviendaDelete  = await crearViviendaFixture(900028, anfitrionDelete.id);
            return {
                idPrincipal: null,
                async payloadPara(accion, numPrueba) {
                    if (accion === 'DELETE') {
                        return { id_vivienda: viviendaDelete.id, id_criterio: criterio.id, id_opcion: opcion.id };
                    }
                    let idVivienda = viviendaEdit.id;
                    if (accion === 'ADD') {
                        const anfitrion = await crearUsuarioFixture(numPrueba);
                        idVivienda = (await crearViviendaFixture(numPrueba + 500, anfitrion.id)).id;
                    }
                    return { id_vivienda: idVivienda, id_criterio: criterio.id, id_opcion: opcion.id };
                }
            };
        }

        default:
            return { idPrincipal: null, async payloadPara() { return {}; } };
    }
}

async function compararConBackend(nombreEntidad, accion, contexto, numPrueba, overrides, respuestaEsperadaLocal) {
    if (accion !== 'ADD' && accion !== 'EDIT' && accion !== 'SEARCH' && accion !== 'DELETE') {
        return { backend_status: 'N/A', backend_code: '' };
    }
    try {
        const payload = accion === 'SEARCH' ? {} : await contexto.payloadPara(accion, numPrueba);
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
