-- "Excluyente" deja de ser un simple booleano ("mi propia respuesta es innegociable, tienen que
-- coincidir exactamente conmigo") y pasa a ser una opcion especifica, distinta de la respuesta
-- propia: permite decir "mi respuesta preferida es A, pero si la otra parte elige Z esto es un
-- dealbreaker", en vez de exigir que la otra parte coincida exactamente con la respuesta propia.
--
-- Nota: las filas que ya tuvieran excluyente = 1 pierden ese comportamiento tras esta migracion
-- (no hay forma de inferir automaticamente cual seria "la opcion especifica que excluyen" a
-- partir del booleano anterior); quien lo marco tendria que volver a editarlo desde la encuesta.

ALTER TABLE usuario_criterio_opcion
    ADD COLUMN id_opcion_excluyente INT NULL DEFAULT NULL AFTER restrictivo;

ALTER TABLE vivienda_criterio_opcion
    ADD COLUMN id_opcion_excluyente INT NULL DEFAULT NULL AFTER restrictivo;

ALTER TABLE usuario_criterio_opcion DROP COLUMN excluyente;
ALTER TABLE vivienda_criterio_opcion DROP COLUMN excluyente;
