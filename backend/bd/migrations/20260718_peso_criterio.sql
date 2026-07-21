-- Peso (importancia) de cada criterio para el calculo de afinidad ponderada
-- Escala 1-5, por defecto 1 (todos los criterios pesan igual hasta que el admin los ajuste)

ALTER TABLE `criterio`
    ADD COLUMN `peso_criterio` INT NOT NULL DEFAULT 1 AFTER `nombre_criterio`;

UPDATE `criterio` SET `peso_criterio` = 1 WHERE `peso_criterio` IS NULL;
