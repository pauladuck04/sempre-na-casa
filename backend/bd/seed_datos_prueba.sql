-- =====================================================================================
-- Datos de prueba realistas para Sempre na Casa
-- =====================================================================================
-- Asume que la tabla `rol` YA tiene admin=2, anfitrion=3, huesped=4 (confirmado). No toca
-- la tabla `rol`. Todos los IDs se generan por AUTO_INCREMENT y se encadenan con variables
-- de sesion, así que es seguro ejecutarlo contra una BD que ya tenga datos: no pisa nada
-- existente ni asume que las tablas están vacías.
--
-- Contraseña de todos los usuarios creados: Test1234!  (hasheada con MD5(), igual que hace
-- usuario_SERVICE::modificacion_atributos() en el backend real)
--
-- Requiere que backend/bd/migrations/20260818_peso_restrictivo_excluyente_por_respuesta.sql
-- y 20260818_opcion_excluyente_especifica.sql ya estén aplicadas (columnas peso/restrictivo/
-- id_opcion_excluyente en usuario_criterio_opcion y vivienda_criterio_opcion).
--
-- NOTA: este script asume que tu BD real ya tiene las columnas estado_usuario_vivienda/
-- fecha_solicitud_usuario_vivienda/fecha_inicio/fecha_fin en `usuario_vivienda` (ver migración
-- backend/bd/migrations/20260819_estado_solicitud_usuario_vivienda.sql).
-- =====================================================================================

START TRANSACTION;

-- ---------------------------------------------------------------------------
-- 1. CRITERIOS Y OPCIONES (catálogo de la encuesta de convivencia)
-- ---------------------------------------------------------------------------

INSERT INTO criterio (nombre_criterio) VALUES ('Nivel de ruido');
SET @c_ruido = LAST_INSERT_ID();
INSERT INTO opcion (id_criterio, nombre_opcion, valor) VALUES
    (@c_ruido, 'Silencio absoluto', '1'),
    (@c_ruido, 'Ruido moderado', '2'),
    (@c_ruido, 'No me importa el ruido', '3');
SET @o_ruido_1 = (SELECT id_opcion FROM opcion WHERE id_criterio = @c_ruido AND valor = '1');
SET @o_ruido_2 = (SELECT id_opcion FROM opcion WHERE id_criterio = @c_ruido AND valor = '2');
SET @o_ruido_3 = (SELECT id_opcion FROM opcion WHERE id_criterio = @c_ruido AND valor = '3');

INSERT INTO criterio (nombre_criterio) VALUES ('Habito de tabaco');
SET @c_tabaco = LAST_INSERT_ID();
INSERT INTO opcion (id_criterio, nombre_opcion, valor) VALUES
    (@c_tabaco, 'Prohibido totalmente', '1'),
    (@c_tabaco, 'Solo en exteriores', '2'),
    (@c_tabaco, 'Se permite fumar', '3');
SET @o_tabaco_1 = (SELECT id_opcion FROM opcion WHERE id_criterio = @c_tabaco AND valor = '1');
SET @o_tabaco_2 = (SELECT id_opcion FROM opcion WHERE id_criterio = @c_tabaco AND valor = '2');
SET @o_tabaco_3 = (SELECT id_opcion FROM opcion WHERE id_criterio = @c_tabaco AND valor = '3');

INSERT INTO criterio (nombre_criterio) VALUES ('Mascotas');
SET @c_mascotas = LAST_INSERT_ID();
INSERT INTO opcion (id_criterio, nombre_opcion, valor) VALUES
    (@c_mascotas, 'No acepto mascotas', '1'),
    (@c_mascotas, 'Acepto mascotas pequenas', '2'),
    (@c_mascotas, 'Adoro las mascotas', '3');
SET @o_mascotas_1 = (SELECT id_opcion FROM opcion WHERE id_criterio = @c_mascotas AND valor = '1');
SET @o_mascotas_2 = (SELECT id_opcion FROM opcion WHERE id_criterio = @c_mascotas AND valor = '2');
SET @o_mascotas_3 = (SELECT id_opcion FROM opcion WHERE id_criterio = @c_mascotas AND valor = '3');

INSERT INTO criterio (nombre_criterio) VALUES ('Limpieza y orden');
SET @c_limpieza = LAST_INSERT_ID();
INSERT INTO opcion (id_criterio, nombre_opcion, valor) VALUES
    (@c_limpieza, 'Muy meticuloso', '1'),
    (@c_limpieza, 'Estandar', '2'),
    (@c_limpieza, 'Relajado', '3');
SET @o_limpieza_1 = (SELECT id_opcion FROM opcion WHERE id_criterio = @c_limpieza AND valor = '1');
SET @o_limpieza_2 = (SELECT id_opcion FROM opcion WHERE id_criterio = @c_limpieza AND valor = '2');
SET @o_limpieza_3 = (SELECT id_opcion FROM opcion WHERE id_criterio = @c_limpieza AND valor = '3');

INSERT INTO criterio (nombre_criterio) VALUES ('Horario de vida');
SET @c_horario = LAST_INSERT_ID();
INSERT INTO opcion (id_criterio, nombre_opcion, valor) VALUES
    (@c_horario, 'Diurno madrugador', '1'),
    (@c_horario, 'Mixto flexible', '2'),
    (@c_horario, 'Nocturno trasnochador', '3');
SET @o_horario_1 = (SELECT id_opcion FROM opcion WHERE id_criterio = @c_horario AND valor = '1');
SET @o_horario_2 = (SELECT id_opcion FROM opcion WHERE id_criterio = @c_horario AND valor = '2');
SET @o_horario_3 = (SELECT id_opcion FROM opcion WHERE id_criterio = @c_horario AND valor = '3');

INSERT INTO criterio (nombre_criterio) VALUES ('Visitas');
SET @c_visitas = LAST_INSERT_ID();
INSERT INTO opcion (id_criterio, nombre_opcion, valor) VALUES
    (@c_visitas, 'Sin visitas', '1'),
    (@c_visitas, 'Visitas ocasionales', '2'),
    (@c_visitas, 'Visitas libres', '3');
SET @o_visitas_1 = (SELECT id_opcion FROM opcion WHERE id_criterio = @c_visitas AND valor = '1');
SET @o_visitas_2 = (SELECT id_opcion FROM opcion WHERE id_criterio = @c_visitas AND valor = '2');
SET @o_visitas_3 = (SELECT id_opcion FROM opcion WHERE id_criterio = @c_visitas AND valor = '3');

-- ---------------------------------------------------------------------------
-- 2. USUARIOS — 3 anfitriones + 6 huespedes. Password de todos: Test1234!
-- ---------------------------------------------------------------------------

-- Anfitriones (id_rol = 3)
INSERT INTO usuario (dni, mail, nombre_usuario, apellidos, password, telefono, id_rol)
VALUES ('30000001A', 'xoan.perez@example.com', 'Xoan', 'Perez Vazquez', MD5('Test1234!'), '611000001', 3);
SET @u_xoan = LAST_INSERT_ID();

INSERT INTO usuario (dni, mail, nombre_usuario, apellidos, password, telefono, id_rol)
VALUES ('30000002B', 'lucia.fernandez@example.com', 'Lucia', 'Fernandez Rey', MD5('Test1234!'), '611000002', 3);
SET @u_lucia = LAST_INSERT_ID();

INSERT INTO usuario (dni, mail, nombre_usuario, apellidos, password, telefono, id_rol)
VALUES ('30000003C', 'marcos.iglesias@example.com', 'Marcos', 'Iglesias Blanco', MD5('Test1234!'), '611000003', 3);
SET @u_marcos = LAST_INSERT_ID();

-- Huespedes (id_rol = 4)
INSERT INTO usuario (dni, mail, nombre_usuario, apellidos, password, telefono, id_rol)
VALUES ('30000004D', 'ana.rodriguez@example.com', 'Ana', 'Rodriguez Souto', MD5('Test1234!'), '611000004', 4);
SET @u_ana = LAST_INSERT_ID();

INSERT INTO usuario (dni, mail, nombre_usuario, apellidos, password, telefono, id_rol)
VALUES ('30000005E', 'carlos.diaz@example.com', 'Carlos', 'Diaz Novo', MD5('Test1234!'), '611000005', 4);
SET @u_carlos = LAST_INSERT_ID();

INSERT INTO usuario (dni, mail, nombre_usuario, apellidos, password, telefono, id_rol)
VALUES ('30000006F', 'sofia.martinez@example.com', 'Sofia', 'Martinez Lago', MD5('Test1234!'), '611000006', 4);
SET @u_sofia = LAST_INSERT_ID();

INSERT INTO usuario (dni, mail, nombre_usuario, apellidos, password, telefono, id_rol)
VALUES ('30000007G', 'diego.alvarez@example.com', 'Diego', 'Alvarez Castro', MD5('Test1234!'), '611000007', 4);
SET @u_diego = LAST_INSERT_ID();

INSERT INTO usuario (dni, mail, nombre_usuario, apellidos, password, telefono, id_rol)
VALUES ('30000008H', 'elena.castro@example.com', 'Elena', 'Castro Moure', MD5('Test1234!'), '611000008', 4);
SET @u_elena = LAST_INSERT_ID();

INSERT INTO usuario (dni, mail, nombre_usuario, apellidos, password, telefono, id_rol)
VALUES ('30000009I', 'pablo.vidal@example.com', 'Pablo', 'Vidal Otero', MD5('Test1234!'), '611000009', 4);
SET @u_pablo = LAST_INSERT_ID();

-- ---------------------------------------------------------------------------
-- 3. VIVIENDAS — una por anfitrion
-- ---------------------------------------------------------------------------

INSERT INTO vivienda (descripcion, plazas_libres, plazas_totales, direccion, ciudad, fecha_alta_vivienda, id_anfitrion)
VALUES ('Piso reformado en pleno casco historico, luminoso y tranquilo', 2, 3, 'Rua do Franco 15', 'Santiago de Compostela', NOW(), @u_xoan);
SET @v_xoan = LAST_INSERT_ID();

INSERT INTO vivienda (descripcion, plazas_libres, plazas_totales, direccion, ciudad, fecha_alta_vivienda, id_anfitrion)
VALUES ('Apartamento cerca del campus sur, ideal para estudiantes', 1, 2, 'Rua da Basquina 8', 'Santiago de Compostela', NOW(), @u_lucia);
SET @v_lucia = LAST_INSERT_ID();

INSERT INTO vivienda (descripcion, plazas_libres, plazas_totales, direccion, ciudad, fecha_alta_vivienda, id_anfitrion)
VALUES ('Piso amplio y comodo en el centro, ambiente relajado', 4, 4, 'Rua Real 22', 'A Coruna', NOW(), @u_marcos);
SET @v_marcos = LAST_INSERT_ID();

-- ---------------------------------------------------------------------------
-- 4. RESPUESTAS DE LOS ANFITRIONES A LA ENCUESTA (vivienda_criterio_opcion)
-- ---------------------------------------------------------------------------

-- Xoan (vivienda 1): perfil moderado en todo
INSERT INTO vivienda_criterio_opcion (id_vivienda, id_criterio, id_opcion, peso, restrictivo, id_opcion_excluyente) VALUES
    (@v_xoan, @c_ruido,    @o_ruido_2,    3, 0, NULL),
    (@v_xoan, @c_tabaco,   @o_tabaco_2,   4, 0, NULL),
    (@v_xoan, @c_mascotas, @o_mascotas_2, 3, 0, NULL),
    (@v_xoan, @c_limpieza, @o_limpieza_2, 3, 0, NULL),
    (@v_xoan, @c_horario,  @o_horario_2,  2, 0, NULL),
    (@v_xoan, @c_visitas,  @o_visitas_2,  3, 0, NULL);

-- Lucia (vivienda 2): exigente con ruido y tabaco (imprescindibles)
INSERT INTO vivienda_criterio_opcion (id_vivienda, id_criterio, id_opcion, peso, restrictivo, id_opcion_excluyente) VALUES
    (@v_lucia, @c_ruido,    @o_ruido_1,    5, 1, @o_ruido_3),
    (@v_lucia, @c_tabaco,   @o_tabaco_1,   5, 1, @o_tabaco_3),
    (@v_lucia, @c_mascotas, @o_mascotas_2, 2, 0, NULL),
    (@v_lucia, @c_limpieza, @o_limpieza_1, 4, 0, NULL),
    (@v_lucia, @c_horario,  @o_horario_1,  3, 0, NULL),
    (@v_lucia, @c_visitas,  @o_visitas_2,  2, 0, NULL);

-- Marcos (vivienda 3): ambiente relajado y flexible
INSERT INTO vivienda_criterio_opcion (id_vivienda, id_criterio, id_opcion, peso, restrictivo, id_opcion_excluyente) VALUES
    (@v_marcos, @c_ruido,    @o_ruido_3,    2, 0, NULL),
    (@v_marcos, @c_tabaco,   @o_tabaco_3,   2, 0, NULL),
    (@v_marcos, @c_mascotas, @o_mascotas_3, 3, 0, NULL),
    (@v_marcos, @c_limpieza, @o_limpieza_3, 2, 0, NULL),
    (@v_marcos, @c_horario,  @o_horario_3,  3, 0, NULL),
    (@v_marcos, @c_visitas,  @o_visitas_3,  3, 0, NULL);

-- ---------------------------------------------------------------------------
-- 5. RESPUESTAS DE LOS HUESPEDES A LA ENCUESTA (usuario_criterio_opcion)
-- ---------------------------------------------------------------------------

-- Ana: ama las mascotas, es su imprescindible (excluye "no acepto mascotas") -> encaja bien con Xoan
INSERT INTO usuario_criterio_opcion (id_usuario, id_criterio, id_opcion, peso, restrictivo, id_opcion_excluyente) VALUES
    (@u_ana, @c_ruido,    @o_ruido_2,    3, 0, NULL),
    (@u_ana, @c_tabaco,   @o_tabaco_2,   3, 0, NULL),
    (@u_ana, @c_mascotas, @o_mascotas_3, 5, 1, @o_mascotas_1),
    (@u_ana, @c_limpieza, @o_limpieza_2, 3, 0, NULL),
    (@u_ana, @c_horario,  @o_horario_2,  2, 0, NULL),
    (@u_ana, @c_visitas,  @o_visitas_3,  2, 0, NULL);

-- Carlos: bastante meticuloso, sin exclusiones
INSERT INTO usuario_criterio_opcion (id_usuario, id_criterio, id_opcion, peso, restrictivo, id_opcion_excluyente) VALUES
    (@u_carlos, @c_ruido,    @o_ruido_2,    3, 0, NULL),
    (@u_carlos, @c_tabaco,   @o_tabaco_1,   3, 0, NULL),
    (@u_carlos, @c_mascotas, @o_mascotas_2, 2, 0, NULL),
    (@u_carlos, @c_limpieza, @o_limpieza_1, 4, 0, NULL),
    (@u_carlos, @c_horario,  @o_horario_1,  3, 0, NULL),
    (@u_carlos, @c_visitas,  @o_visitas_1,  2, 0, NULL);

-- Sofia: perfil tranquilo, compatible con Lucia
INSERT INTO usuario_criterio_opcion (id_usuario, id_criterio, id_opcion, peso, restrictivo, id_opcion_excluyente) VALUES
    (@u_sofia, @c_ruido,    @o_ruido_1,    4, 0, NULL),
    (@u_sofia, @c_tabaco,   @o_tabaco_1,   4, 0, NULL),
    (@u_sofia, @c_mascotas, @o_mascotas_2, 2, 0, NULL),
    (@u_sofia, @c_limpieza, @o_limpieza_1, 3, 0, NULL),
    (@u_sofia, @c_horario,  @o_horario_1,  3, 0, NULL),
    (@u_sofia, @c_visitas,  @o_visitas_2,  2, 0, NULL);

-- Diego: necesita silencio absoluto como imprescindible (excluye "no me importa el ruido")
-- -> caso de EXCLUSION real de matching: Marcos (vivienda 3) responde justo esa opcion excluida
INSERT INTO usuario_criterio_opcion (id_usuario, id_criterio, id_opcion, peso, restrictivo, id_opcion_excluyente) VALUES
    (@u_diego, @c_ruido,    @o_ruido_1,    5, 1, @o_ruido_3),
    (@u_diego, @c_tabaco,   @o_tabaco_1,   3, 0, NULL),
    (@u_diego, @c_mascotas, @o_mascotas_2, 2, 0, NULL),
    (@u_diego, @c_limpieza, @o_limpieza_1, 3, 0, NULL),
    (@u_diego, @c_horario,  @o_horario_1,  2, 0, NULL),
    (@u_diego, @c_visitas,  @o_visitas_1,  2, 0, NULL);

-- Elena: perfil intermedio en todo
INSERT INTO usuario_criterio_opcion (id_usuario, id_criterio, id_opcion, peso, restrictivo, id_opcion_excluyente) VALUES
    (@u_elena, @c_ruido,    @o_ruido_2,    2, 0, NULL),
    (@u_elena, @c_tabaco,   @o_tabaco_2,   2, 0, NULL),
    (@u_elena, @c_mascotas, @o_mascotas_2, 2, 0, NULL),
    (@u_elena, @c_limpieza, @o_limpieza_2, 2, 0, NULL),
    (@u_elena, @c_horario,  @o_horario_2,  2, 0, NULL),
    (@u_elena, @c_visitas,  @o_visitas_2,  2, 0, NULL);

-- Pablo: flexible, sin solicitud todavia -> buen candidato para probar ranking/matching
INSERT INTO usuario_criterio_opcion (id_usuario, id_criterio, id_opcion, peso, restrictivo, id_opcion_excluyente) VALUES
    (@u_pablo, @c_ruido,    @o_ruido_2,    3, 0, NULL),
    (@u_pablo, @c_tabaco,   @o_tabaco_2,   3, 0, NULL),
    (@u_pablo, @c_mascotas, @o_mascotas_3, 3, 0, NULL),
    (@u_pablo, @c_limpieza, @o_limpieza_2, 3, 0, NULL),
    (@u_pablo, @c_horario,  @o_horario_2,  3, 0, NULL),
    (@u_pablo, @c_visitas,  @o_visitas_2,  3, 0, NULL);

-- ---------------------------------------------------------------------------
-- 6. SOLICITUDES / CONVIVENCIAS (usuario_vivienda) — variedad de estados para
--    probar el panel de solicitudes, el seguimiento de convivencias y el
--    matching. Pablo se deja sin solicitud a proposito.
-- ---------------------------------------------------------------------------

-- Ana -> vivienda de Xoan: convivencia ya ACTIVA (empezo hace 2 meses)
INSERT INTO usuario_vivienda (id_usuario, id_vivienda, activo_usuario_vivienda, estado_usuario_vivienda, fecha_solicitud_usuario_vivienda, fecha_inicio, fecha_fin)
VALUES (@u_ana, @v_xoan, 1, 'ACTIVA', DATE_SUB(NOW(), INTERVAL 10 WEEK), DATE_SUB(CURDATE(), INTERVAL 2 MONTH), NULL);

-- Carlos -> vivienda de Xoan: solicitud PENDIENTE (para el panel de admin)
INSERT INTO usuario_vivienda (id_usuario, id_vivienda, activo_usuario_vivienda, estado_usuario_vivienda, fecha_solicitud_usuario_vivienda, fecha_inicio, fecha_fin)
VALUES (@u_carlos, @v_xoan, 1, 'PENDIENTE', NOW(), DATE_ADD(CURDATE(), INTERVAL 3 WEEK), NULL);

-- Sofia -> vivienda de Lucia: ACEPTADA, todavia no ha llegado la fecha de inicio
INSERT INTO usuario_vivienda (id_usuario, id_vivienda, activo_usuario_vivienda, estado_usuario_vivienda, fecha_solicitud_usuario_vivienda, fecha_inicio, fecha_fin)
VALUES (@u_sofia, @v_lucia, 1, 'ACEPTADA', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(CURDATE(), INTERVAL 2 WEEK), NULL);

-- Diego -> vivienda de Lucia: RECHAZADA
INSERT INTO usuario_vivienda (id_usuario, id_vivienda, activo_usuario_vivienda, estado_usuario_vivienda, fecha_solicitud_usuario_vivienda, fecha_inicio, fecha_fin)
VALUES (@u_diego, @v_lucia, 0, 'RECHAZADA', DATE_SUB(NOW(), INTERVAL 1 WEEK), DATE_ADD(CURDATE(), INTERVAL 1 MONTH), NULL);

-- Elena -> vivienda de Marcos: PENDIENTE, con fecha de fin propuesta (estancia con limite)
INSERT INTO usuario_vivienda (id_usuario, id_vivienda, activo_usuario_vivienda, estado_usuario_vivienda, fecha_solicitud_usuario_vivienda, fecha_inicio, fecha_fin)
VALUES (@u_elena, @v_marcos, 1, 'PENDIENTE', NOW(), DATE_ADD(CURDATE(), INTERVAL 1 MONTH), DATE_ADD(CURDATE(), INTERVAL 7 MONTH));

COMMIT;

-- =====================================================================================
-- Escenarios que quedan listos para probar:
--  - Panel "Solicitudes" del admin: Carlos y Elena aparecen como PENDIENTE.
--  - Panel "Seguimiento de Convivencias" del admin: Ana (ACTIVA), Sofia (ACEPTADA).
--  - plazas_libres ya cuadra con lo anterior: vivienda de Xoan 2/3, de Lucia 1/2, de Marcos 4/4.
--  - matching.calcularAfinidad(Ana, vivienda de Xoan): compatibilidad alta, sin exclusion.
--  - matching.calcularAfinidad(Diego, vivienda de Marcos): EXCLUIDO (Diego exige silencio
--    absoluto como imprescindible y Marcos responde "no me importa el ruido").
--  - matching.rankViviendasParaUsuario(Pablo): Pablo no tiene convivencia ni solicitud,
--    así que debería aparecer rankeado contra las 3 viviendas.
-- =====================================================================================
