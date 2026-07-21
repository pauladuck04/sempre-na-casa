CREATE TABLE `log_excepciones` (
  `id_log_excepcion` int NOT NULL AUTO_INCREMENT,
  `fecha_log_excepcion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `controlador` varchar(100) NOT NULL,
  `accion` varchar(100) NOT NULL,
  `codigo_error` varchar(100) NOT NULL,
  `id_usuario` int DEFAULT NULL,
  PRIMARY KEY (`id_log_excepcion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
