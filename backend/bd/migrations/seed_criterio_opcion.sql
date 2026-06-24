-- Seed: criterios y opciones del perfil psicográfico
-- Matches hardcoded IDs in encuesta.html (criterios 1-10, opciones 1-30)

INSERT INTO `criterio` (`id_criterio`, `nombre_criterio`, `fecha_alta_criterio`, `fecha_modificacion_criterio`, `activo_criterio`) VALUES
(1,  'Nivel de ruido',        NOW(), NOW(), 1),
(2,  'Hábito de tabaco',      NOW(), NOW(), 1),
(3,  'Frecuencia de visitas', NOW(), NOW(), 1),
(4,  'Mascotas',              NOW(), NOW(), 1),
(5,  'Limpieza y orden',      NOW(), NOW(), 1),
(6,  'Horarios de vida',      NOW(), NOW(), 1),
(7,  'Uso de la cocina',      NOW(), NOW(), 1),
(8,  'Nivel de interacción',  NOW(), NOW(), 1),
(9,  'Ayuda en tecnología',   NOW(), NOW(), 1),
(10, 'Uso de zonas comunes',  NOW(), NOW(), 1);

INSERT INTO `opcion` (`id_opcion`, `id_criterio`, `nombre_opcion`, `valor`, `fecha_alta_opcion`, `fecha_modificacion_opcion`, `activo_opcion`) VALUES
-- Ruido (criterio 1)
(1,  1, 'Silencio absoluto',     '1', NOW(), NOW(), 1),
(2,  1, 'Ruido moderado',        '2', NOW(), NOW(), 1),
(3,  1, 'No me importa el ruido','3', NOW(), NOW(), 1),
-- Tabaco (criterio 2)
(4,  2, 'Prohibido totalmente',  '1', NOW(), NOW(), 1),
(5,  2, 'Solo en exteriores',    '2', NOW(), NOW(), 1),
(6,  2, 'Se permite fumar',      '3', NOW(), NOW(), 1),
-- Visitas (criterio 3)
(7,  3, 'Sin visitas',           '1', NOW(), NOW(), 1),
(8,  3, 'Visitas ocasionales',   '2', NOW(), NOW(), 1),
(9,  3, 'Visitas libres',        '3', NOW(), NOW(), 1),
-- Mascotas (criterio 4)
(10, 4, 'No acepto mascotas',    '1', NOW(), NOW(), 1),
(11, 4, 'Gatos/perros pequeños', '2', NOW(), NOW(), 1),
(12, 4, 'Adoro las mascotas',    '3', NOW(), NOW(), 1),
-- Limpieza (criterio 5)
(13, 5, 'Muy meticuloso',        '1', NOW(), NOW(), 1),
(14, 5, 'Estándar (semanal)',     '2', NOW(), NOW(), 1),
(15, 5, 'Relajado',              '3', NOW(), NOW(), 1),
-- Horarios (criterio 6)
(16, 6, 'Diurno (madrugador)',   '1', NOW(), NOW(), 1),
(17, 6, 'Mixto/flexible',        '2', NOW(), NOW(), 1),
(18, 6, 'Nocturno (trasnochador)','3', NOW(), NOW(), 1),
-- Cocina (criterio 7)
(19, 7, 'Independencia total',   '1', NOW(), NOW(), 1),
(20, 7, 'Compartir comidas',     '2', NOW(), NOW(), 1),
(21, 7, 'Siempre comer juntos',  '3', NOW(), NOW(), 1),
-- Interacción (criterio 8)
(22, 8, 'Solo saludo',           '1', NOW(), NOW(), 1),
(23, 8, 'Charlas ocasionales',   '2', NOW(), NOW(), 1),
(24, 8, 'Mucha interacción',     '3', NOW(), NOW(), 1),
-- Tecnología (criterio 9)
(25, 9, 'No necesito ayuda',     '1', NOW(), NOW(), 1),
(26, 9, 'Ayuda puntual',         '2', NOW(), NOW(), 1),
(27, 9, 'Aprender/enseñar tech', '3', NOW(), NOW(), 1),
-- Zonas comunes (criterio 10)
(28, 10, 'Uso compartido límit.','1', NOW(), NOW(), 1),
(29, 10, 'Compartido x horarios','2', NOW(), NOW(), 1),
(30, 10, 'Uso libre total',      '3', NOW(), NOW(), 1);
