-- Solicitudes de cambio de rol: se reutiliza la tabla usuario en vez de crear una tabla nueva,
-- siguiendo el mismo patron que las solicitudes de vivienda (ver 20260718_solicitudes_vivienda.sql).
-- estado_cambio_rol se guarda en MAYUSCULAS: NULL | 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA'.
-- Un usuario solo puede tener una solicitud PENDIENTE a la vez (usuario_SERVICE lo valida).

ALTER TABLE `usuario`
    ADD COLUMN `id_rol_solicitado` INT NULL AFTER `id_rol`,
    ADD COLUMN `estado_cambio_rol` VARCHAR(20) NULL DEFAULT NULL AFTER `id_rol_solicitado`,
    ADD COLUMN `fecha_solicitud_rol` DATETIME NULL AFTER `estado_cambio_rol`;
