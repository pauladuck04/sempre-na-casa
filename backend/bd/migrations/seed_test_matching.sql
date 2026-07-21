-- Datos de prueba para testear el sistema de matching/scoring, criterios restrictivos,
-- solicitudes de vivienda y su ciclo de vida (PENDIENTE/ACEPTADA/ACTIVA/RECHAZADA).
--
-- Requiere que ya esten aplicadas: seed_criterio_opcion.sql, 20260718_peso_criterio.sql,
-- 20260718_criterios_restrictivos.sql y 20260718_solicitudes_vivienda.sql.
--
-- Usa IDs artificiales (9000+) para no chocar con datos reales. Contrasena de todos los
-- usuarios de prueba: "Test1234!" (password ya guardado en MD5 mas abajo).
--
-- Al final del fichero hay un bloque comentado con los DELETE para deshacer todo esto.

-- ---------------------------------------------------------------------------
-- 0. Roles (por si no existen ya con esos nombres exactos)
-- ---------------------------------------------------------------------------
INSERT INTO `rol` (`nombre_rol`, `fecha_alta_rol`, `fecha_modificacion_rol`, `activo_rol`)
SELECT 'anfitrion', NOW(), NOW(), 1
WHERE NOT EXISTS (SELECT 1 FROM `rol` WHERE LOWER(`nombre_rol`) IN ('anfitrion', 'anfitrión'));

INSERT INTO `rol` (`nombre_rol`, `fecha_alta_rol`, `fecha_modificacion_rol`, `activo_rol`)
SELECT 'huesped', NOW(), NOW(), 1
WHERE NOT EXISTS (SELECT 1 FROM `rol` WHERE LOWER(`nombre_rol`) IN ('huesped', 'huésped'));

-- ---------------------------------------------------------------------------
-- 1. Usuarios de prueba: 4 anfitriones + 5 huespedes
-- ---------------------------------------------------------------------------
INSERT INTO `usuario` (`id_usuario`, `dni`, `mail`, `nombre_usuario`, `apellidos`, `password`, `telefono`, `fecha_alta_usuario`, `fecha_modificacion_usuario`, `activo_usuario`, `id_rol`) VALUES
(9001, '90010001A', 'anfitrion1.test@example.com', 'Ana',    'Testola Anfitriona', 'ecc4208a7778c1d76e7e89c5253128c5', '600000001', NOW(), NOW(), 1, (SELECT id_rol FROM rol WHERE LOWER(nombre_rol) IN ('anfitrion','anfitrión') LIMIT 1)),
(9002, '90010002B', 'anfitrion2.test@example.com', 'Carlos', 'Testola Anfitrion',  'ecc4208a7778c1d76e7e89c5253128c5', '600000002', NOW(), NOW(), 1, (SELECT id_rol FROM rol WHERE LOWER(nombre_rol) IN ('anfitrion','anfitrión') LIMIT 1)),
(9003, '90010003H', 'anfitrion3.test@example.com', 'Marta',  'Testola Anfitriona', 'ecc4208a7778c1d76e7e89c5253128c5', '600000003', NOW(), NOW(), 1, (SELECT id_rol FROM rol WHERE LOWER(nombre_rol) IN ('anfitrion','anfitrión') LIMIT 1)),
(9004, '90010004I', 'anfitrion4.test@example.com', 'Pablo',  'Testola Anfitrion',  'ecc4208a7778c1d76e7e89c5253128c5', '600000004', NOW(), NOW(), 1, (SELECT id_rol FROM rol WHERE LOWER(nombre_rol) IN ('anfitrion','anfitrión') LIMIT 1)),
(9101, '90020001C', 'huesped1.test@example.com',   'Lucia',  'Testola Huesped',    'ecc4208a7778c1d76e7e89c5253128c5', '600000101', NOW(), NOW(), 1, (SELECT id_rol FROM rol WHERE LOWER(nombre_rol) IN ('huesped','huésped') LIMIT 1)),
(9102, '90020002D', 'huesped2.test@example.com',   'Marcos', 'Testola Huesped',    'ecc4208a7778c1d76e7e89c5253128c5', '600000102', NOW(), NOW(), 1, (SELECT id_rol FROM rol WHERE LOWER(nombre_rol) IN ('huesped','huésped') LIMIT 1)),
(9103, '90020003E', 'huesped3.test@example.com',   'Sara',   'Testola Huesped',    'ecc4208a7778c1d76e7e89c5253128c5', '600000103', NOW(), NOW(), 1, (SELECT id_rol FROM rol WHERE LOWER(nombre_rol) IN ('huesped','huésped') LIMIT 1)),
(9104, '90020004F', 'huesped4.test@example.com',   'Diego',  'Testola Huesped',    'ecc4208a7778c1d76e7e89c5253128c5', '600000104', NOW(), NOW(), 1, (SELECT id_rol FROM rol WHERE LOWER(nombre_rol) IN ('huesped','huésped') LIMIT 1)),
(9105, '90020005G', 'huesped5.test@example.com',   'Elena',  'Testola Huesped',    'ecc4208a7778c1d76e7e89c5253128c5', '600000105', NOW(), NOW(), 1, (SELECT id_rol FROM rol WHERE LOWER(nombre_rol) IN ('huesped','huésped') LIMIT 1));

-- ---------------------------------------------------------------------------
-- 2. Viviendas de prueba (4, con perfiles distintos para ver variedad de % en
--    "Recomendadas": una muy compatible, una moderada, una poco compatible)
-- ---------------------------------------------------------------------------
INSERT INTO `vivienda` (`id_vivienda`, `descripcion`, `plazas_libres`, `plazas_totales`, `id_anfitrion`, `direccion`, `ciudad`, `fecha_alta_vivienda`, `fecha_modificacion_vivienda`, `activo_vivienda`) VALUES
(9001, 'Piso de prueba, estricto con mascotas y tabaco', 2, 3, 9001, 'Rua de Proba 1', 'Santiago de Compostela', NOW(), NOW(), 1),
(9002, 'Piso de prueba, muy permisivo', 1, 3, 9002, 'Rua de Proba 2', 'Santiago de Compostela', NOW(), NOW(), 1),
(9003, 'Piso de prueba, perfil moderado/mixto', 2, 2, 9003, 'Rua de Proba 3', 'Santiago de Compostela', NOW(), NOW(), 1),
(9004, 'Piso de prueba, muy estricto en todo (baja compatibilidad esperada)', 1, 1, 9004, 'Rua de Proba 4', 'Santiago de Compostela', NOW(), NOW(), 1);

-- ---------------------------------------------------------------------------
-- 3. Ajustes en criterios: pesos variados + un criterio restrictivo con una
--    opcion marcada como excluyente (usa los IDs 1-30 del seed_criterio_opcion.sql)
-- ---------------------------------------------------------------------------
UPDATE `criterio` SET `peso_criterio` = 5 WHERE `id_criterio` = 1;  -- Nivel de ruido: mucho peso
UPDATE `criterio` SET `peso_criterio` = 5, `restrictivo` = 1 WHERE `id_criterio` = 4; -- Mascotas: restrictivo
UPDATE `criterio` SET `peso_criterio` = 1 WHERE `id_criterio` = 9;  -- Ayuda en tecnologia: poco peso

UPDATE `opcion` SET `excluyente` = 1 WHERE `id_opcion` = 10; -- "No acepto mascotas" (criterio 4)

-- ---------------------------------------------------------------------------
-- 4. Preferencias de las viviendas (vivienda_criterio_opcion)
-- ---------------------------------------------------------------------------
-- Vivienda 9001: estricta (no fumadores, NO acepta mascotas -> excluyente)
INSERT INTO `vivienda_criterio_opcion` (`id_vivienda`, `id_criterio`, `id_opcion`, `activo_vivienda_criterio_opcion`) VALUES
(9001, 1, 2, 1), (9001, 2, 4, 1), (9001, 3, 8, 1), (9001, 4, 10, 1), (9001, 5, 14, 1),
(9001, 6, 17, 1), (9001, 7, 20, 1), (9001, 8, 23, 1), (9001, 9, 26, 1), (9001, 10, 29, 1);

-- Vivienda 9002: permisiva (acepta mascotas, fumar, visitas libres...)
INSERT INTO `vivienda_criterio_opcion` (`id_vivienda`, `id_criterio`, `id_opcion`, `activo_vivienda_criterio_opcion`) VALUES
(9002, 1, 3, 1), (9002, 2, 6, 1), (9002, 3, 9, 1), (9002, 4, 12, 1), (9002, 5, 15, 1),
(9002, 6, 18, 1), (9002, 7, 21, 1), (9002, 8, 24, 1), (9002, 9, 27, 1), (9002, 10, 30, 1);

-- Vivienda 9003: perfil moderado/mixto, ni muy estricta ni muy permisiva (da compatibilidades
-- intermedias, ~50-70%, con casi todo el mundo)
INSERT INTO `vivienda_criterio_opcion` (`id_vivienda`, `id_criterio`, `id_opcion`, `activo_vivienda_criterio_opcion`) VALUES
(9003, 1, 2, 1), (9003, 2, 5, 1), (9003, 3, 8, 1), (9003, 4, 11, 1), (9003, 5, 13, 1),
(9003, 6, 17, 1), (9003, 7, 19, 1), (9003, 8, 23, 1), (9003, 9, 25, 1), (9003, 10, 28, 1);

-- Vivienda 9004: muy estricta en todo (todas las opciones "1", la mas restrictiva de cada
-- criterio) -> baja compatibilidad esperada con la mayoria + excluye a quien no elija
-- exactamente "no acepto mascotas" (criterio 4 es restrictivo)
INSERT INTO `vivienda_criterio_opcion` (`id_vivienda`, `id_criterio`, `id_opcion`, `activo_vivienda_criterio_opcion`) VALUES
(9004, 1, 1, 1), (9004, 2, 4, 1), (9004, 3, 7, 1), (9004, 4, 10, 1), (9004, 5, 13, 1),
(9004, 6, 16, 1), (9004, 7, 19, 1), (9004, 8, 22, 1), (9004, 9, 25, 1), (9004, 10, 28, 1);

-- ---------------------------------------------------------------------------
-- 5. Respuestas de los huespedes (usuario_criterio_opcion)
-- ---------------------------------------------------------------------------
-- Lucia (9101): perfil "permisivo", muy compatible con 9002, pero "adoro las mascotas"
-- (id_opcion 12) -> debe quedar EXCLUIDA de la vivienda 9001 (criterio restrictivo)
INSERT INTO `usuario_criterio_opcion` (`id_usuario`, `id_criterio`, `id_opcion`, `activo_usuario_criterio_opcion`) VALUES
(9101, 1, 3, 1), (9101, 2, 6, 1), (9101, 3, 9, 1), (9101, 4, 12, 1), (9101, 5, 15, 1),
(9101, 6, 18, 1), (9101, 7, 21, 1), (9101, 8, 24, 1), (9101, 9, 27, 1), (9101, 10, 30, 1);

-- Marcos (9102): perfil "estricto", muy compatible con 9001, y no excluido de ninguna
INSERT INTO `usuario_criterio_opcion` (`id_usuario`, `id_criterio`, `id_opcion`, `activo_usuario_criterio_opcion`) VALUES
(9102, 1, 2, 1), (9102, 2, 4, 1), (9102, 3, 8, 1), (9102, 4, 10, 1), (9102, 5, 14, 1),
(9102, 6, 17, 1), (9102, 7, 20, 1), (9102, 8, 23, 1), (9102, 9, 25, 1), (9102, 10, 28, 1);

-- Sara (9103): solo respondio a la mitad de los criterios (para probar puntuacion parcial)
INSERT INTO `usuario_criterio_opcion` (`id_usuario`, `id_criterio`, `id_opcion`, `activo_usuario_criterio_opcion`) VALUES
(9103, 1, 1, 1), (9103, 2, 5, 1), (9103, 3, 7, 1), (9103, 4, 11, 1), (9103, 5, 13, 1);

-- Diego (9104): perfil mixto, sin ninguna solicitud todavia (para probar el flujo "Solicitar" limpio)
INSERT INTO `usuario_criterio_opcion` (`id_usuario`, `id_criterio`, `id_opcion`, `activo_usuario_criterio_opcion`) VALUES
(9104, 1, 3, 1), (9104, 2, 5, 1), (9104, 3, 9, 1), (9104, 4, 11, 1), (9104, 5, 14, 1),
(9104, 6, 18, 1), (9104, 7, 20, 1), (9104, 8, 24, 1), (9104, 9, 26, 1), (9104, 10, 30, 1);

-- Elena (9105): perfil compatible con 9002 (companera de piso de Lucia mas abajo)
INSERT INTO `usuario_criterio_opcion` (`id_usuario`, `id_criterio`, `id_opcion`, `activo_usuario_criterio_opcion`) VALUES
(9105, 1, 3, 1), (9105, 2, 6, 1), (9105, 3, 9, 1), (9105, 4, 12, 1), (9105, 5, 15, 1),
(9105, 6, 18, 1), (9105, 7, 21, 1), (9105, 8, 24, 1), (9105, 9, 27, 1), (9105, 10, 30, 1);

-- ---------------------------------------------------------------------------
-- 6. Solicitudes de vivienda (usuario_vivienda) en distintos estados
-- ---------------------------------------------------------------------------

-- Marcos (9102) solicita la vivienda 9001 -> PENDIENTE, con fechas propuestas (inicio dentro
-- de 14 dias, fin a los ~200 dias). Ve a Admin > Solicitudes y prueba Aceptar/Rechazar; ahi se
-- ven las fechas propuestas en su propia columna.
INSERT INTO `usuario_vivienda` (`id_usuario`, `id_vivienda`, `activo_usuario_vivienda`, `estado_usuario_vivienda`, `fecha_solicitud`, `fecha_inicio`, `fecha_fin`)
VALUES (9102, 9001, 0, 'PENDIENTE', NOW(), NOW() + INTERVAL 14 DAY, NOW() + INTERVAL 200 DAY);

-- Sara (9103) solicito la vivienda 9002 pero ya fue RECHAZADA -> no debe aparecer en
-- Admin > Solicitudes (solo lista pendientes) ni en las recomendaciones de Sara.
INSERT INTO `usuario_vivienda` (`id_usuario`, `id_vivienda`, `activo_usuario_vivienda`, `estado_usuario_vivienda`, `fecha_solicitud`)
VALUES (9103, 9002, 0, 'RECHAZADA', NOW() - INTERVAL 3 DAY);

-- Lucia (9101): ACEPTADA con fecha_inicio en el futuro -> debe seguir en estado ACEPTADA
-- (todavia NO deberia pasar a ACTIVA). Como ya tiene convivencia aceptada, no puede
-- solicitar otra vivienda (prueba el error USUARIO_YA_TIENE_CONVIVENCIA_ACTIVA_KO).
INSERT INTO `usuario_vivienda` (`id_usuario`, `id_vivienda`, `activo_usuario_vivienda`, `estado_usuario_vivienda`, `fecha_solicitud`, `fecha_inicio`)
VALUES (9101, 9002, 1, 'ACEPTADA', NOW() - INTERVAL 1 DAY, NOW() + INTERVAL 5 DAY);

-- Elena (9105): ACEPTADA con fecha_inicio en el pasado y sin fecha_fin -> en la siguiente
-- peticion a usuario_vivienda deberia promocionar sola a ACTIVA. Al ser compañera de piso
-- de Lucia en la vivienda 9002, deberia aparecer en la lista de "companeros" de Lucia.
INSERT INTO `usuario_vivienda` (`id_usuario`, `id_vivienda`, `activo_usuario_vivienda`, `estado_usuario_vivienda`, `fecha_solicitud`, `fecha_inicio`)
VALUES (9105, 9002, 1, 'ACEPTADA', NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 8 DAY);


-- ---------------------------------------------------------------------------
-- LIMPIEZA: descomenta y ejecuta esto para borrar todos los datos de prueba
-- ---------------------------------------------------------------------------
-- DELETE FROM usuario_vivienda WHERE id_usuario IN (9101,9102,9103,9104,9105) OR id_vivienda IN (9001,9002,9003,9004);
-- DELETE FROM usuario_criterio_opcion WHERE id_usuario IN (9101,9102,9103,9104,9105);
-- DELETE FROM vivienda_criterio_opcion WHERE id_vivienda IN (9001,9002,9003,9004);
-- DELETE FROM vivienda WHERE id_vivienda IN (9001,9002,9003,9004);
-- DELETE FROM usuario WHERE id_usuario IN (9001,9002,9003,9004,9101,9102,9103,9104,9105);
-- UPDATE criterio SET peso_criterio = 1, restrictivo = 0 WHERE id_criterio IN (1,4,9);
-- UPDATE opcion SET excluyente = 0 WHERE id_opcion = 10;
