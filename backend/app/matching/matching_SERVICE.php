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

        include_once './Base/mapping.php';
        $map = new mapping('');

        $pesos  = $this->cargarPesosCriterios($map);
        $rangos = $this->cargarRangosCriterios($map);

        $respuestasUsuario  = $this->cargarRespuestas($map, 'usuario_criterio_opcion', 'id_usuario', $idUsuario, 'activo_usuario_criterio_opcion');
        $respuestasVivienda = $this->cargarRespuestas($map, 'vivienda_criterio_opcion', 'id_vivienda', $idVivienda, 'activo_vivienda_criterio_opcion');

        $exclusion = $this->detectarExclusion($pesos, $respuestasUsuario, $respuestasVivienda);
        if ($exclusion !== null) {
            return array('ok' => true, 'code' => 'CALCULO_AFINIDAD_OK', 'resource' => array(
                'porcentaje'           => 0,
                'excluido'             => true,
                'criterio_excluyente'  => $exclusion,
                'criterios_comparados' => 0,
                'detalle'              => array()
            ));
        }

        $resultado = $this->calcularScore($pesos, $rangos, $respuestasUsuario, $respuestasVivienda);
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

        include_once './Base/mapping.php';
        $map = new mapping('');

        $pesos  = $this->cargarPesosCriterios($map);
        $rangos = $this->cargarRangosCriterios($map);

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

            if ($this->detectarExclusion($pesos, $respuestasUsuario, $respuestasVivienda) !== null) continue;

            $score = $this->calcularScore($pesos, $rangos, $respuestasUsuario, $respuestasVivienda);
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

    function cargarPesosCriterios($map) {
        $res = $map->lanzarqueryconresults(
            "SELECT id_criterio, nombre_criterio, peso_criterio, restrictivo FROM criterio WHERE activo_criterio = 1"
        );
        $pesos = array();
        if ($res['ok'] && !empty($res['resource'])) {
            foreach ($res['resource'] as $fila) {
                $pesos[intval($fila['id_criterio'])] = array(
                    'peso'        => intval($fila['peso_criterio']),
                    'nombre'      => $fila['nombre_criterio'],
                    'restrictivo' => intval($fila['restrictivo']) === 1
                );
            }
        }
        return $pesos;
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

    // respuestas de un usuario/vivienda por criterio, con el valor de la opcion elegida y si esa opcion es excluyente
    function cargarRespuestas($map, $tabla, $campoId, $idValor, $campoActivo) {
        $res = $map->lanzarqueryconresults(
            "SELECT tco.id_criterio, o.valor, o.excluyente
             FROM {$tabla} tco
             JOIN opcion o ON o.id_opcion = tco.id_opcion
             WHERE tco.{$campoId} = {$idValor} AND tco.{$campoActivo} = 1"
        );
        $respuestas = array();
        if ($res['ok'] && !empty($res['resource'])) {
            foreach ($res['resource'] as $fila) {
                $respuestas[intval($fila['id_criterio'])] = array(
                    'valor'      => intval($fila['valor']),
                    'excluyente' => intval($fila['excluyente']) === 1
                );
            }
        }
        return $respuestas;
    }

    // recorre los criterios restrictivos: si cualquiera de las dos partes eligio la opcion
    // excluyente de uno de ellos Y la otra parte no eligio esa misma opcion, el match se 
    // descarta sin comprobar el resto
    function detectarExclusion($pesos, $respuestasA, $respuestasB) {
        foreach ($pesos as $idCriterio => $infoCriterio) {
            if (!$infoCriterio['restrictivo']) continue;
            if (!isset($respuestasA[$idCriterio]) || !isset($respuestasB[$idCriterio])) continue;

            $valorA = $respuestasA[$idCriterio]['valor'];
            $valorB = $respuestasB[$idCriterio]['valor'];

            $excluyeA = $respuestasA[$idCriterio]['excluyente'] && $valorA !== $valorB;
            $excluyeB = $respuestasB[$idCriterio]['excluyente'] && $valorB !== $valorA;

            if ($excluyeA || $excluyeB) {
                return array(
                    'id_criterio'     => $idCriterio,
                    'nombre_criterio' => $infoCriterio['nombre']
                );
            }
        }
        return null;
    }

    // media ponderada de similitud (1 - distancia normalizada) sobre los criterios respondidos por ambas partes
    function calcularScore($pesos, $rangos, $respuestasA, $respuestasB) {
        $sumaPesos     = 0;
        $sumaPonderada = 0;
        $detalle       = array();

        foreach ($pesos as $idCriterio => $infoCriterio) {
            if (!isset($respuestasA[$idCriterio]) || !isset($respuestasB[$idCriterio])) continue;

            $valorA = $respuestasA[$idCriterio]['valor'];
            $valorB = $respuestasB[$idCriterio]['valor'];

            $rango = isset($rangos[$idCriterio]) ? max($rangos[$idCriterio]['max'] - $rangos[$idCriterio]['min'], 1) : 1;
            $diff  = abs($valorA - $valorB);
            $similitud = max(0, 1 - ($diff / $rango));

            $peso = $infoCriterio['peso'];
            $sumaPonderada += $similitud * $peso;
            $sumaPesos     += $peso;

            $detalle[] = array(
                'id_criterio'     => $idCriterio,
                'nombre_criterio' => $infoCriterio['nombre'],
                'peso_criterio'   => $peso,
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
