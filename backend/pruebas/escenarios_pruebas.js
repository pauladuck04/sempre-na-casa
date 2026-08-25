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

    // -----------------------------------------------------------------------------------
    // Media ponderada: dos criterios con similitud opuesta (100% y 0%) pero pesos muy
    // distintos (5 y 1). Si calcularScore hiciera una media simple, el resultado sería 50%;
    // la media ponderada real debe acercarse mucho más al criterio de peso 5 (83.3%).
    // -----------------------------------------------------------------------------------
    const idCriterioPesoAlto = await crearRegistrado(filasCreadas, 'criterio', { nombre_criterio: 'QA Matching Peso Alto' });
    const idOpcionPA = await crearRegistrado(filasCreadas, 'opcion', { nombre_opcion: 'QA PesoAlto', valor: '1', id_criterio: idCriterioPesoAlto });
    await crearRegistrado(filasCreadas, 'opcion', { nombre_opcion: 'QA PesoAlto2', valor: '5', id_criterio: idCriterioPesoAlto });

    const idCriterioPesoBajo = await crearRegistrado(filasCreadas, 'criterio', { nombre_criterio: 'QA Matching Peso Bajo' });
    const idOpcionPB1 = await crearRegistrado(filasCreadas, 'opcion', { nombre_opcion: 'QA PesoBajo1', valor: '1', id_criterio: idCriterioPesoBajo });
    const idOpcionPB2 = await crearRegistrado(filasCreadas, 'opcion', { nombre_opcion: 'QA PesoBajo2', valor: '5', id_criterio: idCriterioPesoBajo });

    const idUsuarioPonderado = await crearRegistrado(filasCreadas, 'usuario', {
        dni: sufijo(8) + 'D', mail: `qa.match.h3.${sufijo(8)}@example.com`, nombre_usuario: 'QA',
        apellidos: 'MatchingPonderado', telefono: '6' + sufijo(8), password: 'Test1234!', id_rol: rol.id_rol || ''
    });
    const idAnfitrionPonderado = await crearRegistrado(filasCreadas, 'usuario', {
        dni: sufijo(8) + 'E', mail: `qa.match.a2.${sufijo(8)}@example.com`, nombre_usuario: 'QA',
        apellidos: 'MatchingPonderadoAnf', telefono: '6' + sufijo(8), password: 'Test1234!', id_rol: rol.id_rol || ''
    });
    const idViviendaPonderada = await crearRegistrado(filasCreadas, 'vivienda', {
        direccion: 'Rua QA Ponderado ' + sufijo(4), ciudad: 'Santiago', descripcion: 'QA ponderado',
        plazas_totales: '2', plazas_libres: '1', id_anfitrion: idAnfitrionPonderado
    });

    await apiPost('usuario_criterio_opcion', 'UPSERT_RESPUESTA', { id_usuario: idUsuarioPonderado, id_criterio: idCriterioPesoAlto, id_opcion: idOpcionPA, peso: '5', restrictivo: '0' });
    filasCreadas.push(claveFilaCreada('usuario_criterio_opcion', { id_usuario: idUsuarioPonderado, id_criterio: idCriterioPesoAlto }));
    await apiPost('vivienda_criterio_opcion', 'updateOpcion', { id_vivienda: idViviendaPonderada, id_criterio: idCriterioPesoAlto, id_opcion: idOpcionPA, peso: '5', restrictivo: '0' });
    filasCreadas.push(claveFilaCreada('vivienda_criterio_opcion', { id_vivienda: idViviendaPonderada, id_criterio: idCriterioPesoAlto }));

    await apiPost('usuario_criterio_opcion', 'UPSERT_RESPUESTA', { id_usuario: idUsuarioPonderado, id_criterio: idCriterioPesoBajo, id_opcion: idOpcionPB1, peso: '1', restrictivo: '0' });
    filasCreadas.push(claveFilaCreada('usuario_criterio_opcion', { id_usuario: idUsuarioPonderado, id_criterio: idCriterioPesoBajo }));
    await apiPost('vivienda_criterio_opcion', 'updateOpcion', { id_vivienda: idViviendaPonderada, id_criterio: idCriterioPesoBajo, id_opcion: idOpcionPB2, peso: '1', restrictivo: '0' });
    filasCreadas.push(claveFilaCreada('vivienda_criterio_opcion', { id_vivienda: idViviendaPonderada, id_criterio: idCriterioPesoBajo }));

    res = await apiPost('matching', 'calcularAfinidad', { id_usuario: idUsuarioPonderado, id_vivienda: idViviendaPonderada });
    pct = res.ok && res.resource ? res.resource.porcentaje : null;
    pasos.push({
        paso: 'Media ponderada: 100% con peso 5 + 0% con peso 1 (no la media simple, 50%)',
        esperado: 'ok:true, porcentaje:83.3',
        obtenido: `ok:${res.ok}, porcentaje:${pct}`,
        resultado: (res.ok === true && pct === 83.3) ? 'OK' : 'FALLO'
    });

    // -----------------------------------------------------------------------------------
    // Similitud parcial: ni misma respuesta (100%) ni extremos opuestos (0%). Con un rango
    // de 1 a 5 (amplitud 4) y una diferencia de 2, la similitud esperada es 1 - 2/4 = 50%.
    // -----------------------------------------------------------------------------------
    const idCriterioParcial = await crearRegistrado(filasCreadas, 'criterio', { nombre_criterio: 'QA Matching Parcial' });
    const idOpcionParcialBaja = await crearRegistrado(filasCreadas, 'opcion', { nombre_opcion: 'QA Parcial 1', valor: '1', id_criterio: idCriterioParcial });
    const idOpcionParcialMedia = await crearRegistrado(filasCreadas, 'opcion', { nombre_opcion: 'QA Parcial 3', valor: '3', id_criterio: idCriterioParcial });
    await crearRegistrado(filasCreadas, 'opcion', { nombre_opcion: 'QA Parcial 5', valor: '5', id_criterio: idCriterioParcial });

    await apiPost('usuario_criterio_opcion', 'UPSERT_RESPUESTA', { id_usuario: idUsuarioPonderado, id_criterio: idCriterioParcial, id_opcion: idOpcionParcialBaja, peso: '3', restrictivo: '0' });
    filasCreadas.push(claveFilaCreada('usuario_criterio_opcion', { id_usuario: idUsuarioPonderado, id_criterio: idCriterioParcial }));
    await apiPost('vivienda_criterio_opcion', 'updateOpcion', { id_vivienda: idViviendaPonderada, id_criterio: idCriterioParcial, id_opcion: idOpcionParcialMedia, peso: '3', restrictivo: '0' });
    filasCreadas.push(claveFilaCreada('vivienda_criterio_opcion', { id_vivienda: idViviendaPonderada, id_criterio: idCriterioParcial }));

    res = await apiPost('matching', 'calcularAfinidad', { id_usuario: idUsuarioPonderado, id_vivienda: idViviendaPonderada });
    const detalleParcial = res.ok && res.resource && Array.isArray(res.resource.detalle)
        ? res.resource.detalle.find(d => d.id_criterio === idCriterioParcial) : null;
    const similitudParcial = detalleParcial ? detalleParcial.similitud : null;
    pasos.push({
        paso: 'Similitud parcial (diferencia 2 sobre un rango de 4 → 50%)',
        esperado: 'ok:true, similitud:50',
        obtenido: `ok:${res.ok}, similitud:${similitudParcial}`,
        resultado: (res.ok === true && similitudParcial === 50) ? 'OK' : 'FALLO'
    });

    // -----------------------------------------------------------------------------------
    // Exclusión desde el lado de la vivienda (antes solo se probaba desde el usuario): la
    // vivienda marca su propia respuesta como imprescindible y excluye la opción que el
    // usuario elige.
    // -----------------------------------------------------------------------------------
    const idCriterioExclV = await crearRegistrado(filasCreadas, 'criterio', { nombre_criterio: 'QA Matching Restrictivo Vivienda' });
    const idOpcionExclV = await crearRegistrado(filasCreadas, 'opcion', { nombre_opcion: 'QA ExclV Excluyente', valor: '1', id_criterio: idCriterioExclV });
    const idOpcionNormV = await crearRegistrado(filasCreadas, 'opcion', { nombre_opcion: 'QA ExclV Normal', valor: '2', id_criterio: idCriterioExclV });

    await apiPost('vivienda_criterio_opcion', 'updateOpcion', {
        id_vivienda: idViviendaPonderada, id_criterio: idCriterioExclV, id_opcion: idOpcionExclV,
        restrictivo: '1', id_opcion_excluyente: idOpcionNormV
    });
    filasCreadas.push(claveFilaCreada('vivienda_criterio_opcion', { id_vivienda: idViviendaPonderada, id_criterio: idCriterioExclV }));
    await apiPost('usuario_criterio_opcion', 'UPSERT_RESPUESTA', { id_usuario: idUsuarioPonderado, id_criterio: idCriterioExclV, id_opcion: idOpcionNormV, restrictivo: '0' });
    filasCreadas.push(claveFilaCreada('usuario_criterio_opcion', { id_usuario: idUsuarioPonderado, id_criterio: idCriterioExclV }));

    res = await apiPost('matching', 'calcularAfinidad', { id_usuario: idUsuarioPonderado, id_vivienda: idViviendaPonderada });
    const excluidoPorVivienda = res.ok && res.resource ? res.resource.excluido : null;
    pct = res.ok && res.resource ? res.resource.porcentaje : null;
    pasos.push({
        paso: 'El usuario elige la opción que la vivienda marcó como excluyente',
        esperado: 'ok:true, excluido:true, porcentaje:0',
        obtenido: `ok:${res.ok}, excluido:${excluidoPorVivienda}, porcentaje:${pct}`,
        resultado: (res.ok === true && excluidoPorVivienda === true && pct === 0) ? 'OK' : 'FALLO'
    });

    // -----------------------------------------------------------------------------------
    // rankViviendasParaUsuario no debe incluir viviendas sin plazas libres, aunque serían
    // 100% compatibles.
    // -----------------------------------------------------------------------------------
    const idAnfitrionSinPlazas = await crearRegistrado(filasCreadas, 'usuario', {
        dni: sufijo(8) + 'F', mail: `qa.match.a3.${sufijo(8)}@example.com`, nombre_usuario: 'QA',
        apellidos: 'MatchingSinPlazasAnf', telefono: '6' + sufijo(8), password: 'Test1234!', id_rol: rol.id_rol || ''
    });
    const idViviendaSinPlazas = await crearRegistrado(filasCreadas, 'vivienda', {
        direccion: 'Rua QA SinPlazas ' + sufijo(4), ciudad: 'Santiago', descripcion: 'QA sin plazas',
        plazas_totales: '1', plazas_libres: '0', id_anfitrion: idAnfitrionSinPlazas
    });
    await apiPost('vivienda_criterio_opcion', 'updateOpcion', { id_vivienda: idViviendaSinPlazas, id_criterio: idCriterioPesoAlto, id_opcion: idOpcionPA, peso: '3', restrictivo: '0' });
    filasCreadas.push(claveFilaCreada('vivienda_criterio_opcion', { id_vivienda: idViviendaSinPlazas, id_criterio: idCriterioPesoAlto }));

    res = await apiPost('matching', 'rankViviendasParaUsuario', { id_usuario: idUsuarioPonderado });
    const apareceSinPlazas = res.ok && Array.isArray(res.resource)
        ? res.resource.some(v => v.id_vivienda === idViviendaSinPlazas) : null;
    pasos.push({
        paso: 'El ranking no incluye viviendas con plazas_libres = 0',
        esperado: 'ok:true, aparece:false',
        obtenido: `ok:${res.ok}, aparece:${apareceSinPlazas}`,
        resultado: (res.ok === true && apareceSinPlazas === false) ? 'OK' : 'FALLO'
    });

    // -----------------------------------------------------------------------------------
    // rankViviendasParaUsuario no debe incluir una vivienda con la que el usuario ya tiene
    // una relación en usuario_vivienda (solicitada, aceptada o rechazada, da igual el
    // estado): ya no es una "candidata nueva". Vivienda dedicada y sin exclusiones previas
    // (idViviendaPonderada ya quedó excluida por el test anterior; reutilizarla no
    // distinguiría si lo que filtra es esto o aquello).
    // -----------------------------------------------------------------------------------
    const idAnfitrionYaSolicitada = await crearRegistrado(filasCreadas, 'usuario', {
        dni: sufijo(8) + 'G', mail: `qa.match.a4.${sufijo(8)}@example.com`, nombre_usuario: 'QA',
        apellidos: 'MatchingYaSolicitadaAnf', telefono: '6' + sufijo(8), password: 'Test1234!', id_rol: rol.id_rol || ''
    });
    const idViviendaYaSolicitada = await crearRegistrado(filasCreadas, 'vivienda', {
        direccion: 'Rua QA YaSolicitada ' + sufijo(4), ciudad: 'Santiago', descripcion: 'QA ya solicitada',
        plazas_totales: '2', plazas_libres: '1', id_anfitrion: idAnfitrionYaSolicitada
    });
    await apiPost('vivienda_criterio_opcion', 'updateOpcion', { id_vivienda: idViviendaYaSolicitada, id_criterio: idCriterioPesoAlto, id_opcion: idOpcionPA, peso: '3', restrictivo: '0' });
    filasCreadas.push(claveFilaCreada('vivienda_criterio_opcion', { id_vivienda: idViviendaYaSolicitada, id_criterio: idCriterioPesoAlto }));

    await apiPost('usuario_vivienda', 'ADD', {
        id_usuario: idUsuarioPonderado, id_vivienda: idViviendaYaSolicitada, fecha_inicio: fechaOffset(7)
    });
    filasCreadas.push(claveFilaCreada('usuario_vivienda', { id_usuario: idUsuarioPonderado, id_vivienda: idViviendaYaSolicitada }));

    res = await apiPost('matching', 'rankViviendasParaUsuario', { id_usuario: idUsuarioPonderado });
    const apareceYaSolicitada = res.ok && Array.isArray(res.resource)
        ? res.resource.some(v => v.id_vivienda === idViviendaYaSolicitada) : null;
    pasos.push({
        paso: 'El ranking no incluye una vivienda con la que el usuario ya tiene relación (usuario_vivienda)',
        esperado: 'ok:true, aparece:false',
        obtenido: `ok:${res.ok}, aparece:${apareceYaSolicitada}`,
        resultado: (res.ok === true && apareceYaSolicitada === false) ? 'OK' : 'FALLO'
    });

    // -----------------------------------------------------------------------------------
    // Validaciones de campos obligatorios
    // -----------------------------------------------------------------------------------
    res = await apiPost('matching', 'calcularAfinidad', { id_usuario: '', id_vivienda: idVivienda });
    registrarPaso(pasos, 'calcularAfinidad sin id_usuario', "ok:false, code:id_usuario_es_nulo_KO", res,
        res.ok === false && res.code === 'id_usuario_es_nulo_KO');

    res = await apiPost('matching', 'calcularAfinidad', { id_usuario: idUsuario, id_vivienda: '' });
    registrarPaso(pasos, 'calcularAfinidad sin id_vivienda', "ok:false, code:id_vivienda_es_nulo_KO", res,
        res.ok === false && res.code === 'id_vivienda_es_nulo_KO');

    res = await apiPost('matching', 'rankViviendasParaUsuario', { id_usuario: '' });
    registrarPaso(pasos, 'rankViviendasParaUsuario sin id_usuario', "ok:false, code:id_usuario_es_nulo_KO", res,
        res.ok === false && res.code === 'id_usuario_es_nulo_KO');

    return pasos;
}

const ESCENARIOS = {
    login: { nombre: 'Login', ejecutar: escenarioLogin },
    registro: { nombre: 'Registro', ejecutar: escenarioRegistro },
    recuperar_password: { nombre: 'Recuperar / restablecer contraseña', ejecutar: escenarioRecuperarPassword },
    matching: { nombre: 'Matching (afinidad + ranking)', ejecutar: escenarioMatching },
};
