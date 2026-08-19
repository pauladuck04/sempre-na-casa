<?php

include_once './base/appServiceBase.php';

class matching_SERVICE extends appServiceBase {

    public $modelo;

    function __construct() {
        parent::__construct();
    }

    function inicializarRest() {

        $this->notnull = array(
            'calcularAfinidad'         => array('id_usuario', 'id_vivienda'),
            'rankViviendasParaUsuario' => array('id_usuario'),
        );

        // no hay tabla propia: matching es un calculo sobre criterio/opcion/usuario_criterio_opcion/vivienda_criterio_opcion
        $this->modelo = new stdClass();
        $this->modelo->tabla = 'matching';
    }

    // Compatibilidad ponderada entre un usuario y una vivienda concretos
    function calcularAfinidad() {
        $idUsuario  = intval($_POST['id_usuario']);
        $idVivienda = intval($_POST['id_vivienda']);

        include_once './base/mapping.php';
        $map = new mapping('');

        $nombres = $this->cargarNombresCriterios($map);
        $rangos  = $this->cargarRangosCriterios($map);

        $respuestasUsuario  = $this->cargarRespuestas($map, 'usuario_criterio_opcion', 'id_usuario', $idUsuario, 'activo_usuario_criterio_opcion');
        $respuestasVivienda = $this->cargarRespuestas($map, 'vivienda_criterio_opcion', 'id_vivienda', $idVivienda, 'activo_vivienda_criterio_opcion');

        $exclusion = $this->detectarExclusion($nombres, $respuestasUsuario, $respuestasVivienda);
        if ($exclusion !== null) {
            return array('ok' => true, 'code' => 'CALCULO_AFINIDAD_OK', 'resource' => array(
                'porcentaje'           => 0,
                'excluido'             => true,
                'criterio_excluyente'  => $exclusion,
                'criterios_comparados' => 0,
                'detalle'              => array()
            ));
        }

        $resultado = $this->calcularScore($nombres, $rangos, $respuestasUsuario, $respuestasVivienda);
        $resultado['excluido'] = false;

        if ($resultado['porcentaje'] === null) {
            return array('ok' => false, 'code' => 'SIN_CRITERIOS_COMUNES_KO', 'resource' => $resultado);
        }

        return array('ok' => true, 'code' => 'CALCULO_AFINIDAD_OK', 'resource' => $resultado);
    }

    // Ranking de viviendas activas con plazas libres, ordenado por compatibilidad con el usuario.
    // Las viviendas descartadas por un criterio restrictivo no aparecen en el ranking.
    function rankViviendasParaUsuario() {
        $idUsuario = intval($_POST['id_usuario']);

        include_once './base/mapping.php';
        $map = new mapping('');

        $nombres = $this->cargarNombresCriterios($map);
        $rangos  = $this->cargarRangosCriterios($map);

        $respuestasUsuario = $this->cargarRespuestas($map, 'usuario_criterio_opcion', 'id_usuario', $idUsuario, 'activo_usuario_criterio_opcion');

        $resViviendas = $map->lanzarqueryconresults(
            "SELECT v.id_vivienda, v.descripcion, v.direccion, v.ciudad, v.plazas_libres, v.id_anfitrion,
                    u.nombre_usuario, u.apellidos
             FROM vivienda v
             JOIN usuario u ON u.id_usuario = v.id_anfitrion
             WHERE v.activo_vivienda = 1 AND v.plazas_libres > 0
               AND NOT EXISTS (
                   SELECT 1 FROM usuario_vivienda uv
                   WHERE uv.id_vivienda = v.id_vivienda AND uv.id_usuario = {$idUsuario}
               )"
        );

        if (!$resViviendas['ok']) {
            return array('ok' => false, 'code' => 'RANK_VIVIENDAS_KO');
        }

        $ranking = array();
        foreach ($resViviendas['resource'] as $vivienda) {
            $respuestasVivienda = $this->cargarRespuestas(
                $map, 'vivienda_criterio_opcion', 'id_vivienda', intval($vivienda['id_vivienda']), 'activo_vivienda_criterio_opcion'
            );

            if ($this->detectarExclusion($nombres, $respuestasUsuario, $respuestasVivienda) !== null) continue;

            $score = $this->calcularScore($nombres, $rangos, $respuestasUsuario, $respuestasVivienda);
            if ($score['porcentaje'] === null) continue;

            $ranking[] = array(
                'id_vivienda'    => intval($vivienda['id_vivienda']),
                'descripcion'    => $vivienda['descripcion'],
                'direccion'      => $vivienda['direccion'],
                'ciudad'         => $vivienda['ciudad'],
                'plazas_libres'  => intval($vivienda['plazas_libres']),
                'id_anfitrion'   => intval($vivienda['id_anfitrion']),
                'anfitrion'      => trim($vivienda['nombre_usuario'] . ' ' . $vivienda['apellidos']),
                'compatibilidad' => $score['porcentaje']
            );
        }

        usort($ranking, function($a, $b) { return $b['compatibilidad'] <=> $a['compatibilidad']; });

        return array('ok' => true, 'code' => 'RANK_VIVIENDAS_OK', 'resource' => $ranking);
    }

    // nombres de los criterios activos, solo para etiquetar exclusiones y el detalle del score
    // (peso/restrictivo ya no son globales: viven en la propia respuesta de cada parte, ver cargarRespuestas())
    function cargarNombresCriterios($map) {
        $res = $map->lanzarqueryconresults(
            "SELECT id_criterio, nombre_criterio FROM criterio WHERE activo_criterio = 1"
        );
        $nombres = array();
        if ($res['ok'] && !empty($res['resource'])) {
            foreach ($res['resource'] as $fila) {
                $nombres[intval($fila['id_criterio'])] = $fila['nombre_criterio'];
            }
        }
        return $nombres;
    }

    // rango de valores (min/max) de las opciones de cada criterio, para normalizar la distancia
    function cargarRangosCriterios($map) {
        $res = $map->lanzarqueryconresults(
            "SELECT id_criterio, MIN(CAST(valor AS UNSIGNED)) AS minv, MAX(CAST(valor AS UNSIGNED)) AS maxv
             FROM opcion WHERE activo_opcion = 1 GROUP BY id_criterio"
        );
        $rangos = array();
        if ($res['ok'] && !empty($res['resource'])) {
            foreach ($res['resource'] as $fila) {
                $rangos[intval($fila['id_criterio'])] = array(
                    'min' => intval($fila['minv']),
                    'max' => intval($fila['maxv'])
                );
            }
        }
        return $rangos;
    }

    // respuestas de un usuario/vivienda por criterio: la opcion elegida (id + su valor en la
    // escala compartida, que sigue viviendo en opcion) y el peso/restrictivo/opcion-a-excluir que
    // ESA parte declaro para su propia respuesta a ese criterio
    function cargarRespuestas($map, $tabla, $campoId, $idValor, $campoActivo) {
        $res = $map->lanzarqueryconresults(
            "SELECT tco.id_criterio, tco.id_opcion, o.valor, tco.peso, tco.restrictivo, tco.id_opcion_excluyente
             FROM {$tabla} tco
             JOIN opcion o ON o.id_opcion = tco.id_opcion
             WHERE tco.{$campoId} = {$idValor} AND tco.{$campoActivo} = 1"
        );
        $respuestas = array();
        if ($res['ok'] && !empty($res['resource'])) {
            foreach ($res['resource'] as $fila) {
                $respuestas[intval($fila['id_criterio'])] = array(
                    'id_opcion'            => intval($fila['id_opcion']),
                    'valor'                => intval($fila['valor']),
                    'peso'                 => intval($fila['peso']),
                    'restrictivo'          => intval($fila['restrictivo']) === 1,
                    'id_opcion_excluyente' => $fila['id_opcion_excluyente'] !== null ? intval($fila['id_opcion_excluyente']) : null
                );
            }
        }
        return $respuestas;
    }

    // por cada criterio respondido por las dos partes, cada parte decide su propia exclusion con
    // sus propios campos: si marco esa respuesta como restrictiva y señalo una opcion concreta
    // como excluyente, y la otra parte eligio justamente esa opcion, el match se descarta sin
    // comprobar el resto (la opcion a excluir puede ser distinta de la propia respuesta: "prefiero
    // A, pero si eligen Z para mi es un dealbreaker")
    function detectarExclusion($nombres, $respuestasA, $respuestasB) {
        foreach ($respuestasA as $idCriterio => $rA) {
            if (!isset($respuestasB[$idCriterio])) continue;
            $rB = $respuestasB[$idCriterio];

            $excluyeA = $rA['restrictivo'] && $rA['id_opcion_excluyente'] !== null && $rA['id_opcion_excluyente'] === $rB['id_opcion'];
            $excluyeB = $rB['restrictivo'] && $rB['id_opcion_excluyente'] !== null && $rB['id_opcion_excluyente'] === $rA['id_opcion'];

            if ($excluyeA || $excluyeB) {
                return array(
                    'id_criterio'     => $idCriterio,
                    'nombre_criterio' => isset($nombres[$idCriterio]) ? $nombres[$idCriterio] : ''
                );
            }
        }
        return null;
    }

    // media ponderada de similitud (1 - distancia normalizada) sobre los criterios respondidos
    // por ambas partes; el peso de cada criterio para el par es la media de lo que cada parte le
    // dio de importancia a su propia respuesta
    function calcularScore($nombres, $rangos, $respuestasA, $respuestasB) {
        $sumaPesos     = 0;
        $sumaPonderada = 0;
        $detalle       = array();

        foreach ($respuestasA as $idCriterio => $rA) {
            if (!isset($respuestasB[$idCriterio])) continue;
            $rB = $respuestasB[$idCriterio];

            $rango = isset($rangos[$idCriterio]) ? max($rangos[$idCriterio]['max'] - $rangos[$idCriterio]['min'], 1) : 1;
            $diff  = abs($rA['valor'] - $rB['valor']);
            $similitud = max(0, 1 - ($diff / $rango));

            $peso = ($rA['peso'] + $rB['peso']) / 2;
            $sumaPonderada += $similitud * $peso;
            $sumaPesos     += $peso;

            $detalle[] = array(
                'id_criterio'     => $idCriterio,
                'nombre_criterio' => isset($nombres[$idCriterio]) ? $nombres[$idCriterio] : '',
                'peso_efectivo'   => $peso,
                'similitud'       => round($similitud * 100, 1)
            );
        }

        if ($sumaPesos == 0) {
            return array('porcentaje' => null, 'criterios_comparados' => 0, 'detalle' => array());
        }

        return array(
            'porcentaje'           => round(($sumaPonderada / $sumaPesos) * 100, 1),
            'criterios_comparados' => count($detalle),
            'detalle'              => $detalle
        );
    }

}
?>
