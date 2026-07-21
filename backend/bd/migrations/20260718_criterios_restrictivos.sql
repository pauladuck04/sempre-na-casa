-- Criterios restrictivos (dealbreakers): si el criterio es restrictivo y cualquiera de las
-- dos partes (usuario o vivienda) eligio una opcion marcada como excluyente, el match se
-- descarta directamente sin calcular el resto de la puntuacion ponderada.

ALTER TABLE `criterio`
    ADD COLUMN `restrictivo` TINYINT(1) NOT NULL DEFAULT 0 AFTER `peso_criterio`;

ALTER TABLE `opcion`
    ADD COLUMN `excluyente` TINYINT(1) NOT NULL DEFAULT 0 AFTER `valor`;

UPDATE `criterio` SET `restrictivo` = 0 WHERE `restrictivo` IS NULL;
UPDATE `opcion` SET `excluyente` = 0 WHERE `excluyente` IS NULL;
