function registrarPaso(pasos, paso, esperado, res, cumple) {
    pasos.push({
        paso,
        esperado,
        obtenido: res ? `ok:${res.ok}, code:${res.code}` : 'sin respuesta (red/backend caído)',
        resultado: cumple ? 'OK' : 'FALLO'
    });
}

// =====================================================================================
// LOGIN
// =====================================================================================
async function escenarioLogin() {
    const pasos = [];
    const rol = (await primeraFila('rol')) || {};
    const mail = `qa.login.${sufijo(8)}@example.com`;
    const passwordCorrecta = 'Test1234!';

    const idUsuario = await crear('usuario', {
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
async function escenarioRegistro() {
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
async function escenarioRecuperarPassword() {
    const pasos = [];
    const rol = (await primeraFila('rol')) || {};
    const mail = `qa.recuperar.${sufijo(8)}@example.com`;

    await crear('usuario', {
        dni: sufijo(8) + 'A', mail, nombre_usuario: 'QA', apellidos: 'RecuperarEscenario',
        telefono: '6' + sufijo(8), password: 'Test1234!', id_rol: rol.id_rol || ''
    });

    let res = await apiPost('auth', 'RECUPERAR_PASSWORD', { mail });
    const token = (res.ok && res.resource) ? res.resource.token : null;
    registrarPaso(pasos, 'Solicitar recuperación con mail existente', "ok:true, code:RECUPERAR_PASSWORD_OK, token presente", res,
        res.ok === true && res.code === 'RECUPERAR_PASSWORD_OK' && !!token);

    res = await apiPost('auth', 'RECUPERAR_PASSWORD', { mail: `no.existe.${sufijo(6)}@example.com` });
    registrarPaso(pasos, 'Solicitar recuperación con mail inexistente', "ok:false, code:USUARIO_NO_ENCONTRADO_KO", res,
        res.ok === false && res.code === 'USUARIO_NO_ENCONTRADO_KO');

    if (!token) {
        pasos.push({
            paso: 'Restablecer con el token del paso 1', esperado: 'ok:true, code:RESTABLECER_PASSWORD_OK',
            obtenido: 'no se obtuvo token en el paso 1, se omiten los pasos siguientes', resultado: 'FALLO'
        });
        return pasos;
    }

    const nuevaPassword = 'NuevaSegura2!';
    res = await apiPost('auth', 'RESTABLECER_PASSWORD', { token, password: nuevaPassword });
    registrarPaso(pasos, 'Restablecer con el token del paso 1', "ok:true, code:RESTABLECER_PASSWORD_OK", res,
        res.ok === true && res.code === 'RESTABLECER_PASSWORD_OK');

    res = await apiPost('auth', 'RESTABLECER_PASSWORD', { token, password: 'OtraMas3!' });
    registrarPaso(pasos, 'Reutilizar el mismo token ya usado', "ok:false, code:TOKEN_EXPIRADO_KO", res,
        res.ok === false && res.code === 'TOKEN_EXPIRADO_KO');

    res = await apiPost('auth', 'RESTABLECER_PASSWORD', { token: 'token-invalido-' + sufijo(6), password: 'Otra4!' });
    registrarPaso(pasos, 'Restablecer con un token inválido', "ok:false, code:TOKEN_INVALIDO_KO", res,
        res.ok === false && res.code === 'TOKEN_INVALIDO_KO');

    res = await apiPost('auth', 'LOGIN', { mail, password: nuevaPassword });
    registrarPaso(pasos, 'Login con la nueva contraseña tras restablecer', "ok:true, code:LOGIN_OK", res,
        res.ok === true && res.code === 'LOGIN_OK');

    return pasos;
}

// =====================================================================================
// MATCHING (calcularAfinidad / rankViviendasParaUsuario)
// =====================================================================================
async function escenarioMatching() {
    const pasos = [];
    const rol = (await primeraFila('rol')) || {};

    const idUsuario = await crear('usuario', {
        dni: sufijo(8) + 'A', mail: `qa.match.h.${sufijo(8)}@example.com`, nombre_usuario: 'QA',
        apellidos: 'MatchingHuesped', telefono: '6' + sufijo(8), password: 'Test1234!', id_rol: rol.id_rol || ''
    });
    const idAnfitrion = await crear('usuario', {
        dni: sufijo(8) + 'B', mail: `qa.match.a.${sufijo(8)}@example.com`, nombre_usuario: 'QA',
        apellidos: 'MatchingAnfitrion', telefono: '6' + sufijo(8), password: 'Test1234!', id_rol: rol.id_rol || ''
    });
    const idVivienda = await crear('vivienda', {
        direccion: 'Rua QA Matching ' + sufijo(4), ciudad: 'Santiago', descripcion: 'QA matching',
        plazas_totales: '2', plazas_libres: '1', id_anfitrion: idAnfitrion
    });

    // Criterio normal (no restrictivo), 2 opciones en los extremos de su rango (1 y 5)
    const idCriterio = await crear('criterio', { nombre_criterio: 'QA Matching Criterio' });
    const idOpcionBaja = await crear('opcion', { nombre_opcion: 'QA Baja', valor: '1', id_criterio: idCriterio });
    const idOpcionAlta = await crear('opcion', { nombre_opcion: 'QA Alta', valor: '5', id_criterio: idCriterio });

    await apiPost('usuario_criterio_opcion', 'UPSERT_RESPUESTA', { id_usuario: idUsuario, id_criterio: idCriterio, id_opcion: idOpcionBaja, peso: '1', restrictivo: '0' });
    await apiPost('vivienda_criterio_opcion', 'updateOpcion', { id_vivienda: idVivienda, id_criterio: idCriterio, id_opcion: idOpcionBaja, peso: '1', restrictivo: '0' });

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

    const idUsuarioSinRespuestas = await crear('usuario', {
        dni: sufijo(8) + 'C', mail: `qa.match.h2.${sufijo(8)}@example.com`, nombre_usuario: 'QA',
        apellidos: 'MatchingSinResp', telefono: '6' + sufijo(8), password: 'Test1234!', id_rol: rol.id_rol || ''
    });
    res = await apiPost('matching', 'calcularAfinidad', { id_usuario: idUsuarioSinRespuestas, id_vivienda: idVivienda });
    registrarPaso(pasos, 'Usuario sin respuestas a ningún criterio común', "ok:false, code:SIN_CRITERIOS_COMUNES_KO", res,
        res.ok === false && res.code === 'SIN_CRITERIOS_COMUNES_KO');

    // Criterio con una respuesta que el propio usuario marca como imprescindible, señalando una
    // opción específica ("Normal") como innegociable: si la vivienda elige justo esa, se excluye.
    const idCriterioR = await crear('criterio', { nombre_criterio: 'QA Matching Restrictivo' });
    const idOpcionExcl = await crear('opcion', { nombre_opcion: 'QA Excluyente', valor: '1', id_criterio: idCriterioR });
    const idOpcionNorm = await crear('opcion', { nombre_opcion: 'QA Normal', valor: '2', id_criterio: idCriterioR });

    await apiPost('usuario_criterio_opcion', 'UPSERT_RESPUESTA', {
        id_usuario: idUsuario, id_criterio: idCriterioR, id_opcion: idOpcionExcl,
        restrictivo: '1', id_opcion_excluyente: idOpcionNorm
    });
    await apiPost('vivienda_criterio_opcion', 'updateOpcion', { id_vivienda: idVivienda, id_criterio: idCriterioR, id_opcion: idOpcionNorm });

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
