-- Solicitudes de vivienda: se reutiliza usuario_vivienda en vez de crear una tabla nueva.
-- estado_usuario_vivienda se guarda siempre en MAYUSCULAS: 'PENDIENTE' | 'ACEPTADA' | 'ACTIVA' | 'RECHAZADA'.
-- ACEPTADA -> ACTIVA se promociona automaticamente (sin cron) cuando la fecha actual entra en el
-- rango [fecha_inicio, fecha_fin) -- ver usuario_vivienda_SERVICE::promoverConvivenciasActivas().
-- activo_usuario_vivienda solo pasa a 1 cuando el admin acepta la solicitud (o para las filas
-- historicas que ya representaban una convivencia real, ver UPDATE de abajo).

ALTER TABLE `usuario_vivienda`
    ADD COLUMN `estado_usuario_vivienda` VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE' AFTER `activo_usuario_vivienda`,
    ADD COLUMN `fecha_solicitud` DATETIME NULL AFTER `estado_usuario_vivienda`;

-- las filas ya activas de antes de esta migracion representan convivencias reales, no solicitudes
UPDATE `usuario_vivienda` SET `estado_usuario_vivienda` = 'ACEPTADA' WHERE `activo_usuario_vivienda` = 1;
UPDATE `usuario_vivienda` SET `fecha_solicitud` = `fecha_inicio` WHERE `fecha_solicitud` IS NULL AND `fecha_inicio` IS NOT NULL;

-- normaliza a mayusculas cualquier valor que se haya podido guardar en minuscula (ej. si esta
-- migracion ya se aplico antes de fijar la convencion en mayusculas)
UPDATE `usuario_vivienda` SET `estado_usuario_vivienda` = UPPER(`estado_usuario_vivienda`);
