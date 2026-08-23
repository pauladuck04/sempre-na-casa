function registrarPaso(pasos, paso, esperado, res, cumple) {
    pasos.push({
        paso,
        esperado,
        obtenido: res ? `ok:${res.ok}, code:${res.code}` : 'sin respuesta (red/backend caído)',
        resultado: cumple ? 'OK' : 'FALLO'
    });
}

/** Como crear() (backend_fixtures.js), pero además apunta la fila creada en filasCreadas para
 * poder borrarla físicamente al terminar el escenario. */
async function crearRegistrado(filasCreadas, entidad, payload) {
    const id = await crear(entidad, payload);
    if (id !== null) filasCreadas.push(claveFilaCreada(entidad, payload, id));
    return id;
}

// =====================================================================================
// LOGIN
// =====================================================================================
async function escenarioLogin(filasCreadas) {
    const pasos = [];
    const rol = (await primeraFila('rol')) || {};
    const mail = `qa.login.${sufijo(8)}@example.com`;
    const passwordCorrecta = 'Test1234!';

    const idUsuario = await crearRegistrado(filasCreadas, 'usuario', {
        dni: sufijo(8) + 'A', mail, nombre_usuario: 'QA', apellidos: 'LoginEscenario',
        telefono: '6' + sufijo(8), password: passwordCorrecta, id_rol: rol.id_rol || ''
    });

    let res = await apiPost('auth', 'LOGIN', { mail, password: passwordCorrecta });
    registrarPaso(pasos, 'Login con credenciales correctas', "ok:true, code:LOGIN_OK, token presente", res,
        res.ok === true && res.code === 'LOGIN_OK' && !!(res.resource && res.resource.token));

    res = await apiPost('auth', 'LOGIN', { mail, password: 'PasswordMala1' });
    registrarPaso(pasos, 'Login con password incorrecta', "ok:false, code:USUARIO_PASS_KO", res,
        res.ok === false && res.code === 'USUARIO_PASS_KO');

    res = await apiPost('auth', 'LOGIN', { mail: `no.existe.${sufijo(6)}@example.com`, password: passwordCorrecta });
    registrarPaso(pasos, 'Login con mail inexistente', "ok:false, code:USUARIO_LOGIN_KO", res,
        res.ok === false && res.code === 'USUARIO_LOGIN_KO');

    await apiPost('usuario', 'DELETE', { id_usuario: idUsuario }); // baja lógica
    res = await apiPost('auth', 'LOGIN', { mail, password: passwordCorrecta });
    registrarPaso(pasos, 'Login de un usuario desactivado', "ok:false, code:USUARIO_INACTIVO_KO", res,
        res.ok === false && res.code === 'USUARIO_INACTIVO_KO');

    return pasos;
}

// =====================================================================================
// REGISTRO
// =====================================================================================
async function escenarioRegistro(filasCreadas) {
    const pasos = [];
    const rol = (await primeraFila('rol')) || {};
    const mail = `qa.registro.${sufijo(8)}@example.com`;
    const dni = sufijo(8) + 'A';

    const base = {
        dni, mail, nombre_usuario: 'QA', apellidos: 'RegistroEscenario',
        telefono: '6' + sufijo(8), password: 'Test1234!', id_rol: rol.id_rol || ''
    };

    let res = await apiPost('auth', 'REGISTRAR', base);
    registrarPaso(pasos, 'Registro con datos nuevos y completos', "ok:true, code:REGISTRAR_OK", res,
        res.ok === true && res.code === 'REGISTRAR_OK');
    if (res.ok && res.resource) filasCreadas.push(claveFilaCreada('usuario', base, res.resource));

    res = await apiPost('auth', 'REGISTRAR', { ...base, dni: sufijo(8) + 'B' });
    registrarPaso(pasos, 'Registro repitiendo el mismo mail (dni distinto)', "ok:false, code:USUARIO_YA_EXISTE_KO", res,
        res.ok === false && res.code === 'USUARIO_YA_EXISTE_KO');

    res = await apiPost('auth', 'REGISTRAR', { ...base, mail: `qa.registro2.${sufijo(8)}@example.com` });
    registrarPaso(pasos, 'Registro repitiendo el mismo dni (mail distinto)', "ok:false, code:USUARIO_YA_EXISTE_KO", res,
        res.ok === false && res.code === 'USUARIO_YA_EXISTE_KO');

    res = await apiPost('auth', 'REGISTRAR', {
        ...base, mail: `qa.registro3.${sufijo(8)}@example.com`, dni: sufijo(8) + 'C', apellidos: ''
    });
    registrarPaso(pasos, 'Registro sin apellidos (campo obligatorio)', "ok:false, code:apellidos_es_nulo_KO", res,
        res.ok === false && res.code === 'apellidos_es_nulo_KO');

    return pasos;
}

// =====================================================================================
// RECUPERAR / RESTABLECER CONTRASEÑA
// =====================================================================================
async function escenarioRecuperarPassword(filasCreadas) {
    const pasos = [];
    const rol = (await primeraFila('rol')) || {};
    const mail = `qa.recuperar.${sufijo(8)}@example.com`;

    await crearRegistrado(filasCreadas, 'usuario', {
        dni: sufijo(8) + 'A', mail, nombre_usuario: 'QA', apellidos: 'RecuperarEscenario',
        telefono: '6' + sufijo(8), password: 'Test1234!', id_rol: rol.id_rol || ''
    });

    // El token de recuperación ya no viaja en la respuesta de la API (solo dentro del enlace que
    let res = await apiPost('auth', 'RECUPERAR_PASSWORD', { mail });
    registrarPaso(pasos, 'Solicitar recuperación con mail existente', "ok:true, code:RECUPERAR_PASSWORD_OK", res,
        res.ok === true && res.code === 'RECUPERAR_PASSWORD_OK');

    res = await apiPost('auth', 'RECUPERAR_PASSWORD', { mail: `no.existe.${sufijo(6)}@example.com` });
    registrarPaso(pasos, 'Solicitar recuperación con mail inexistente', "ok:false, code:USUARIO_NO_ENCONTRADO_KO", res,
        res.ok === false && res.code === 'USUARIO_NO_ENCONTRADO_KO');

    res = await apiPost('auth', 'RECUPERAR_PASSWORD', { mail: '' });
    registrarPaso(pasos, 'Solicitar recuperación sin mail', "ok:false, code:mail_es_nulo_KO", res,
        res.ok === false && res.code === 'mail_es_nulo_KO');

    res = await apiPost('auth', 'RESTABLECER_PASSWORD', { token: 'token-invalido-' + sufijo(6), password: 'Otra4!' });
    registrarPaso(pasos, 'Restablecer con un token inválido', "ok:false, code:TOKEN_INVALIDO_KO", res,
        res.ok === false && res.code === 'TOKEN_INVALIDO_KO');

    res = await apiPost('auth', 'RESTABLECER_PASSWORD', { token: '', password: 'Otra4!' });
    registrarPaso(pasos, 'Restablecer sin token', "ok:false, code:token_es_nulo_KO", res,
        res.ok === false && res.code === 'token_es_nulo_KO');

    res = await apiPost('auth', 'RESTABLECER_PASSWORD', { token: 'token-invalido-' + sufijo(6), password: '' });
    registrarPaso(pasos, 'Restablecer sin password nueva', "ok:false, code:password_es_nulo_KO", res,
        res.ok === false && res.code === 'password_es_nulo_KO');

    return pasos;
}

// =====================================================================================
// MATCHING (calcularAfinidad / rankViviendasParaUsuario)
// =====================================================================================
async function escenarioMatching(filasCreadas) {
    const pasos = [];
    const rol = (await primeraFila('rol')) || {};

    const idUsuario = await crearRegistrado(filasCreadas, 'usuario', {
        dni: sufijo(8) + 'A', mail: `qa.match.h.${sufijo(8)}@example.com`, nombre_usuario: 'QA',
        apellidos: 'MatchingHuesped', telefono: '6' + sufijo(8), password: 'Test1234!', id_rol: rol.id_rol || ''
    });
    const idAnfitrion = await crearRegistrado(filasCreadas, 'usuario', {
        dni: sufijo(8) + 'B', mail: `qa.match.a.${sufijo(8)}@example.com`, nombre_usuario: 'QA',
        apellidos: 'MatchingAnfitrion', telefono: '6' + sufijo(8), password: 'Test1234!', id_rol: rol.id_rol || ''
    });
    const idVivienda = await crearRegistrado(filasCreadas, 'vivienda', {
        direccion: 'Rua QA Matching ' + sufijo(4), ciudad: 'Santiago', descripcion: 'QA matching',
        plazas_totales: '2', plazas_libres: '1', id_anfitrion: idAnfitrion
    });

    // Criterio normal (no restrictivo), 2 opciones en los extremos de su rango (1 y 5)
    const idCriterio = await crearRegistrado(filasCreadas, 'criterio', { nombre_criterio: 'QA Matching Criterio' });
    const idOpcionBaja = await crearRegistrado(filasCreadas, 'opcion', { nombre_opcion: 'QA Baja', valor: '1', id_criterio: idCriterio });
    const idOpcionAlta = await crearRegistrado(filasCreadas, 'opcion', { nombre_opcion: 'QA Alta', valor: '5', id_criterio: idCriterio });

    await apiPost('usuario_criterio_opcion', 'UPSERT_RESPUESTA', { id_usuario: idUsuario, id_criterio: idCriterio, id_opcion: idOpcionBaja, peso: '1', restrictivo: '0' });
    filasCreadas.push(claveFilaCreada('usuario_criterio_opcion', { id_usuario: idUsuario, id_criterio: idCriterio }));
    // updateOpcion() actualiza id_opcion sobre la misma fila (id_vivienda, id_criterio), así que
    // una sola entrada de limpieza para este par vale para todas las llamadas siguientes.
    await apiPost('vivienda_criterio_opcion', 'updateOpcion', { id_vivienda: idVivienda, id_criterio: idCriterio, id_opcion: idOpcionBaja, peso: '1', restrictivo: '0' });
    filasCreadas.push(claveFilaCreada('vivienda_criterio_opcion', { id_vivienda: idVivienda, id_criterio: idCriterio }));

    let res = await apiPost('matching', 'calcularAfinidad', { id_usuario: idUsuario, id_vivienda: idVivienda });
    let pct = res.ok && res.resource ? res.resource.porcentaje : null;
    pasos.push({
        paso: 'Misma respuesta en el único criterio común', esperado: 'ok:true, porcentaje:100',
        obtenido: `ok:${res.ok}, porcentaje:${pct}`, resultado: (res.ok === true && pct === 100) ? 'OK' : 'FALLO'
    });

    await apiPost('vivienda_criterio_opcion', 'updateOpcion', { id_vivienda: idVivienda, id_criterio: idCriterio, id_opcion: idOpcionAlta });
    res = await apiPost('matching', 'calcularAfinidad', { id_usuario: idUsuario, id_vivienda: idVivienda });
    pct = res.ok && res.resource ? res.resource.porcentaje : null;
    pasos.push({
        paso: 'Respuestas en extremos opuestos del rango', esperado: 'ok:true, porcentaje:0',
        obtenido: `ok:${res.ok}, porcentaje:${pct}`, resultado: (res.ok === true && pct === 0) ? 'OK' : 'FALLO'
    });

    const idUsuarioSinRespuestas = await crearRegistrado(filasCreadas, 'usuario', {
        dni: sufijo(8) + 'C', mail: `qa.match.h2.${sufijo(8)}@example.com`, nombre_usuario: 'QA',
        apellidos: 'MatchingSinResp', telefono: '6' + sufijo(8), password: 'Test1234!', id_rol: rol.id_rol || ''
    });
    res = await apiPost('matching', 'calcularAfinidad', { id_usuario: idUsuarioSinRespuestas, id_vivienda: idVivienda });
    registrarPaso(pasos, 'Usuario sin respuestas a ningún criterio común', "ok:false, code:SIN_CRITERIOS_COMUNES_KO", res,
        res.ok === false && res.code === 'SIN_CRITERIOS_COMUNES_KO');

    // Criterio con una respuesta que el propio usuario marca como imprescindible, señalando una
    // opción específica ("Normal") como innegociable: si la vivienda elige justo esa, se excluye.
    const idCriterioR = await crearRegistrado(filasCreadas, 'criterio', { nombre_criterio: 'QA Matching Restrictivo' });
    const idOpcionExcl = await crearRegistrado(filasCreadas, 'opcion', { nombre_opcion: 'QA Excluyente', valor: '1', id_criterio: idCriterioR });
    const idOpcionNorm = await crearRegistrado(filasCreadas, 'opcion', { nombre_opcion: 'QA Normal', valor: '2', id_criterio: idCriterioR });

    await apiPost('usuario_criterio_opcion', 'UPSERT_RESPUESTA', {
        id_usuario: idUsuario, id_criterio: idCriterioR, id_opcion: idOpcionExcl,
        restrictivo: '1', id_opcion_excluyente: idOpcionNorm
    });
    filasCreadas.push(claveFilaCreada('usuario_criterio_opcion', { id_usuario: idUsuario, id_criterio: idCriterioR }));
    await apiPost('vivienda_criterio_opcion', 'updateOpcion', { id_vivienda: idVivienda, id_criterio: idCriterioR, id_opcion: idOpcionNorm });
    filasCreadas.push(claveFilaCreada('vivienda_criterio_opcion', { id_vivienda: idVivienda, id_criterio: idCriterioR }));

    res = await apiPost('matching', 'calcularAfinidad', { id_usuario: idUsuario, id_vivienda: idVivienda });
    const excluido = res.ok && res.resource ? res.resource.excluido : null;
    pct = res.ok && res.resource ? res.resource.porcentaje : null;
    pasos.push({
        paso: 'La vivienda elige la opción que el usuario marcó como excluyente',
        esperado: 'ok:true, excluido:true, porcentaje:0',
        obtenido: `ok:${res.ok}, excluido:${excluido}, porcentaje:${pct}`,
        resultado: (res.ok === true && excluido === true && pct === 0) ? 'OK' : 'FALLO'
    });

    res = await apiPost('matching', 'rankViviendasParaUsuario', { id_usuario: idUsuario });
    pasos.push({
        paso: 'Ranking de viviendas para el usuario', esperado: 'ok:true, code:RANK_VIVIENDAS_OK, resource es array',
        obtenido: `ok:${res.ok}, code:${res.code}, filas:${res.ok && Array.isArray(res.resource) ? res.resource.length : 'n/a'}`,
        resultado: (res.ok === true && res.code === 'RANK_VIVIENDAS_OK' && Array.isArray(res.resource)) ? 'OK' : 'FALLO'
    });

    return pasos;
}

const ESCENARIOS = {
    login: { nombre: 'Login', ejecutar: escenarioLogin },
    registro: { nombre: 'Registro', ejecutar: escenarioRegistro },
    recuperar_password: { nombre: 'Recuperar / restablecer contraseña', ejecutar: escenarioRecuperarPassword },
    matching: { nombre: 'Matching (afinidad + ranking)', ejecutar: escenarioMatching }
};
