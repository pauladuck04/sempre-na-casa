-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: fdb1032.awardspace.net
-- Tiempo de generación: 09-06-2026 a las 11:24:28
-- Versión del servidor: 8.0.32
-- Versión de PHP: 8.1.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `4740201_semprenacasa`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `criterio`
--

CREATE TABLE `criterio` (
  `id_criterio` int NOT NULL,
  `nombre_criterio` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `fecha_alta_criterio` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion_criterio` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `activo_criterio` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `opcion`
--

CREATE TABLE `opcion` (
  `id_opcion` int NOT NULL,
  `id_criterio` int NOT NULL,
  `nombre_opcion` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `valor` varchar(25) NOT NULL,
  `fecha_alta_opcion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion_opcion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `activo_opcion` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

CREATE TABLE `rol` (
  `id_rol` int NOT NULL,
  `nombre_rol` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `fecha_alta_rol` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion_rol` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `activo_rol` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `rol`
--

INSERT INTO `rol` (`id_rol`, `nombre_rol`, `fecha_alta_rol`, `fecha_modificacion_rol`, `activo_rol`) VALUES
(1, '1', '2026-06-03 00:00:00', '2026-06-03 00:00:00', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL,
  `dni` varchar(9) NOT NULL,
  `mail` varchar(100) NOT NULL,
  `nombre_usuario` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `apellidos` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `telefono` varchar(9) NOT NULL,
  `fecha_alta_usuario` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion_usuario` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `activo_usuario` tinyint(1) NOT NULL DEFAULT '1',
  `id_rol` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`dni`, `mail`, `nombre_usuario`, `apellidos`, `password`, `telefono`, `fecha_alta_usuario`, `fecha_modificacion_usuario`, `activo_usuario`, `id_rol`) VALUES
('1', '1', '1', '1', '1', '1', '2026-06-03 17:58:11', '2026-06-03 17:58:11', 1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario_criterio_opcion`
--

CREATE TABLE `usuario_criterio_opcion` (
  `id_usuario` int NOT NULL,
  `id_criterio` int NOT NULL,
  `id_opcion` int NOT NULL,
  `peso` tinyint NOT NULL DEFAULT '3',
  `restrictivo` tinyint(1) NOT NULL DEFAULT '0',
  `id_opcion_excluyente` int DEFAULT NULL,
  `activo_usuario_criterio_opcion` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario_vivienda`
--

CREATE TABLE `usuario_vivienda` (
  `id_usuario` int NOT NULL,
  `id_vivienda` int NOT NULL,
  `activo_usuario_vivienda` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vivienda`
--

CREATE TABLE `vivienda` (
  `id_vivienda` int NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `plazas_libres` int NOT NULL,
  `plazas_totales` int NOT NULL,
  `direccion` varchar(150) NOT NULL,
  `ciudad` varchar(100) NOT NULL,
  `fecha_alta_vivienda` datetime NOT NULL,
  `fecha_modificacion_vivienda` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `id_anfitrion` int NOT NULL,
  `activo_vivienda` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vivienda_criterio_opcion`
--

CREATE TABLE `vivienda_criterio_opcion` (
  `id_vivienda` int NOT NULL,
  `id_criterio` int NOT NULL,
  `id_opcion` int NOT NULL,
  `peso` tinyint NOT NULL DEFAULT '3',
  `restrictivo` tinyint(1) NOT NULL DEFAULT '0',
  `id_opcion_excluyente` int DEFAULT NULL,
  `activo_vivienda_criterio_opcion` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `criterio`
--
ALTER TABLE `criterio`
  ADD PRIMARY KEY (`id_criterio`);

--
-- Indices de la tabla `opcion`
--
ALTER TABLE `opcion`
  ADD PRIMARY KEY (`id_opcion`),
  ADD KEY `id_criterio` (`id_criterio`);

--
-- Indices de la tabla `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`id_rol`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `mail` (`mail`),
  ADD KEY `id_rol` (`id_rol`);

--
-- Indices de la tabla `usuario_criterio_opcion`
--
ALTER TABLE `usuario_criterio_opcion`
  ADD PRIMARY KEY (`id_usuario`,`id_criterio`),
  ADD KEY `id_opcion` (`id_opcion`),
  ADD KEY `id_criterio` (`id_criterio`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `usuario_vivienda`
--
ALTER TABLE `usuario_vivienda`
  ADD KEY `id_vivienda` (`id_vivienda`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `vivienda`
--
ALTER TABLE `vivienda`
  ADD PRIMARY KEY (`id_vivienda`),
  ADD KEY `id_anfitrion` (`id_anfitrion`);

--
-- Indices de la tabla `vivienda_criterio_opcion`
--
ALTER TABLE `vivienda_criterio_opcion`
  ADD PRIMARY KEY (`id_vivienda`,`id_criterio`),
  ADD KEY `id_opcion` (`id_opcion`),
  ADD KEY `id_vivienda` (`id_vivienda`,`id_criterio`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `criterio`
--
ALTER TABLE `criterio`
  MODIFY `id_criterio` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `opcion`
--
ALTER TABLE `opcion`
  MODIFY `id_opcion` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `rol`
--
ALTER TABLE `rol`
  MODIFY `id_rol` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `vivienda`
--
ALTER TABLE `vivienda`
  MODIFY `id_vivienda` int NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
