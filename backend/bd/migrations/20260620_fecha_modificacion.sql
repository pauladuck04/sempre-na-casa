ALTER TABLE `criterio`
  ADD COLUMN `fecha_modificacion_criterio` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `fecha_alta_criterio`;

ALTER TABLE `opcion`
  ADD COLUMN `fecha_modificacion_opcion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `fecha_alta_opcion`;

ALTER TABLE `rol`
  MODIFY COLUMN `fecha_alta_rol` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN `fecha_modificacion_rol` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `fecha_alta_rol`;

ALTER TABLE `usuario`
  ADD COLUMN `fecha_modificacion_usuario` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `fecha_alta_usuario`;

ALTER TABLE `vivienda`
  ADD COLUMN `fecha_modificacion_vivienda` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `fecha_alta_vivienda`;

UPDATE `criterio` SET `fecha_modificacion_criterio` = `fecha_alta_criterio`;
UPDATE `opcion` SET `fecha_modificacion_opcion` = `fecha_alta_opcion`;
UPDATE `rol` SET `fecha_modificacion_rol` = `fecha_alta_rol`;
UPDATE `usuario` SET `fecha_modificacion_usuario` = `fecha_alta_usuario`;
UPDATE `vivienda` SET `fecha_modificacion_vivienda` = `fecha_alta_vivienda`;
