-- peso_criterio y restrictivo dejan de ser globales en `criterio`, y excluyente deja de ser
-- global en `opcion`: pasan a ser una decision propia de cada respuesta (usuario_criterio_opcion /
-- vivienda_criterio_opcion), para que cada huesped y cada anfitrion pueda fijar su propia
-- importancia/restriccion/exclusion al responder la encuesta en vez de heredar un valor fijado
-- por el administrador para todo el mundo.

ALTER TABLE usuario_criterio_opcion
    ADD COLUMN peso TINYINT NOT NULL DEFAULT 3 AFTER id_opcion,
    ADD COLUMN restrictivo TINYINT(1) NOT NULL DEFAULT 0 AFTER peso,
    ADD COLUMN excluyente TINYINT(1) NOT NULL DEFAULT 0 AFTER restrictivo;

ALTER TABLE vivienda_criterio_opcion
    ADD COLUMN peso TINYINT NOT NULL DEFAULT 3 AFTER id_opcion,
    ADD COLUMN restrictivo TINYINT(1) NOT NULL DEFAULT 0 AFTER peso,
    ADD COLUMN excluyente TINYINT(1) NOT NULL DEFAULT 0 AFTER restrictivo;

-- backfill: las respuestas ya existentes heredan el valor global que tenian hasta ahora,
-- para no cambiar de golpe el resultado del matching de datos ya introducidos
UPDATE usuario_criterio_opcion uco
    JOIN criterio c ON c.id_criterio = uco.id_criterio
    SET uco.peso = c.peso_criterio, uco.restrictivo = c.restrictivo;

UPDATE usuario_criterio_opcion uco
    JOIN opcion o ON o.id_opcion = uco.id_opcion
    SET uco.excluyente = o.excluyente;

UPDATE vivienda_criterio_opcion vco
    JOIN criterio c ON c.id_criterio = vco.id_criterio
    SET vco.peso = c.peso_criterio, vco.restrictivo = c.restrictivo;

UPDATE vivienda_criterio_opcion vco
    JOIN opcion o ON o.id_opcion = vco.id_opcion
    SET vco.excluyente = o.excluyente;

ALTER TABLE criterio
    DROP COLUMN peso_criterio,
    DROP COLUMN restrictivo;

ALTER TABLE opcion
    DROP COLUMN excluyente;
