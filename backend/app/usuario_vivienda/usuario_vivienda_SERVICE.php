<?php

include_once './base/appServiceBase.php';

class usuario_vivienda_SERVICE extends appServiceBase {

    public $modelo;

    function __construct() {
        parent::__construct();
    }

    function inicializarRest() {

        $this->listaAtributos = array(
            'id_usuario', 'id_vivienda', 'activo_usuario_vivienda', 'estado_usuario_vivienda', 'fecha_solicitud', 'fecha_inicio', 'fecha_fin'
        );

        $this->listaAtributosSelect = array(
            'id_usuario', 'id_vivienda', 'activo_usuario_vivienda', 'estado_usuario_vivienda', 'fecha_solicitud', 'fecha_inicio', 'fecha_fin'
        );

        $this->notnull = array(
            'ADD'    => array('id_usuario', 'id_vivienda', 'fecha_inicio'),
            'EDIT'   => array('id_usuario', 'id_vivienda'),
            'DELETE'    => array('id_usuario', 'id_vivienda'),
            'REACTIVAR' => array('id_usuario', 'id_vivienda'),
            'ACEPTAR'   => array('id_usuario', 'id_vivienda'),
            'RECHAZAR'  => array('id_usuario', 'id_vivienda'),
            'getHuespedesByAnfitrion' => array('id_anfitrion'),
            'getHuespedesByVivienda'  => array('id_vivienda'),
            'getConvivenciaByUsuario' => array('id_usuario'),
        );

        $this->modelo = $this->crearModelOne('usuario_vivienda');
    }

    function modificacion_atributos() {
        // cada peticion promociona ACEPTADA -> ACTIVA si toca,
        // asi que cualquier lectura ve siempre el estado al dia.
        $this->promoverConvivenciasActivas();

        if (isset($_POST['action']) && $_POST['action'] == 'ADD') {
            // un ADD siempre nace como solicitud pendiente; solo se activa cuando el admin la acepta
            $_POST['activo_usuario_vivienda'] = 0;
            $_POST['estado_usuario_vivienda'] = 'PENDIENTE';
            $_POST['fecha_solicitud']         = date('Y-m-d H:i:s');
        }
    }

    // una convivencia ACEPTADA pasa a ACTIVA en cuanto la fecha actual supera la fecha_inicio
    // esperada y todavia no llega a la fecha_fin. Si no hay fecha_fin definida se considera
    // activa sin limite.
    function promoverConvivenciasActivas() {
        include_once './Base/mapping.php';
        $map = new mapping('usuario_vivienda');
        $ahora = date('Y-m-d H:i:s');
        $map->lanzarquery(
            "UPDATE usuario_vivienda
             SET estado_usuario_vivienda = 'ACTIVA'
             WHERE estado_usuario_vivienda = 'ACEPTADA'
               AND fecha_inicio IS NOT NULL
               AND fecha_inicio < '{$ahora}'
               AND (fecha_fin IS NULL OR fecha_fin > '{$ahora}')"
        );
    }

    // una solicitud es unica por (usuario, vivienda). Tampoco se puede solicitar una vivienda 
    // nueva si ya se tiene una convivencia activa en otra. La solicitud incluye fecha_inicio
    //  (obligatoria) y fecha_fin (opcional, estancia abierta) que el huesped propone; si se acepta, 
    // esas son las fechas reales de la convivencia.
    function ADD() {
        $idUsuario  = intval($_POST['id_usuario']);
        $idVivienda = intval($_POST['id_vivienda']);
        $fechaInicio = substr($_POST['fecha_inicio'], 0, 10);
        $fechaFin    = isset($_POST['fecha_fin']) ? substr($_POST['fecha_fin'], 0, 10) : '';

        if ($fechaInicio < date('Y-m-d')) {
            return array('ok' => false, 'code' => 'FECHA_INICIO_PASADA_KO');
        }
        if ($fechaFin !== '' && $fechaFin <= $fechaInicio) {
            return array('ok' => false, 'code' => 'FECHA_FIN_ANTERIOR_A_INICIO_KO');
        }

        include_once './Base/mapping.php';
        $map = new mapping('usuario_vivienda');

        $yaActivo = $map->lanzarqueryconresults(
            "SELECT id_vivienda FROM usuario_vivienda WHERE id_usuario = {$idUsuario} AND activo_usuario_vivienda = 1 LIMIT 1"
        );
        if ($yaActivo['ok'] && !empty($yaActivo['resource'])) {
            return array('ok' => false, 'code' => 'USUARIO_YA_TIENE_CONVIVENCIA_ACTIVA_KO');
        }

        $existente = $map->lanzarqueryconresults(
            "SELECT estado_usuario_vivienda FROM usuario_vivienda
             WHERE id_usuario = {$idUsuario} AND id_vivienda = {$idVivienda} LIMIT 1"
        );
        if ($existente['ok'] && !empty($existente['resource'])) {
            return array('ok' => false, 'code' => 'SOLICITUD_YA_EXISTE_KO');
        }

        return $this->modelo->ADD();
    }

    function ACEPTAR() {
        return $this->cambiarEstadoSolicitud('ACEPTADA');
    }

    function RECHAZAR() {
        return $this->cambiarEstadoSolicitud('RECHAZADA');
    }

    // solo se puede resolver una solicitud que siga pendiente. Al aceptar, se activa la
    // convivencia usando la fecha_inicio/fecha_fin que el huesped ya propuso al solicitar.
    function cambiarEstadoSolicitud($nuevoEstado) {
        $idUsuario  = intval($_POST['id_usuario']);
        $idVivienda = intval($_POST['id_vivienda']);

        include_once './Base/mapping.php';
        $map = new mapping('usuario_vivienda');

        $res = $map->lanzarqueryconresults(
            "SELECT estado_usuario_vivienda FROM usuario_vivienda
             WHERE id_usuario = {$idUsuario} AND id_vivienda = {$idVivienda} LIMIT 1"
        );
        if (!$res['ok'] || empty($res['resource'])) {
            return array('ok' => false, 'code' => 'SOLICITUD_NO_ENCONTRADA_KO');
        }
        if ($res['resource'][0]['estado_usuario_vivienda'] !== 'PENDIENTE') {
            return array('ok' => false, 'code' => 'SOLICITUD_YA_RESUELTA_KO');
        }

        $set = "estado_usuario_vivienda = '{$nuevoEstado}'";
        if ($nuevoEstado === 'ACEPTADA') {
            $set .= ", activo_usuario_vivienda = 1";
        }

        $resUpdate = $map->lanzarquery(
            "UPDATE usuario_vivienda SET {$set} WHERE id_usuario = {$idUsuario} AND id_vivienda = {$idVivienda}"
        );

        if ($resUpdate['ok']) {
            $resUpdate['code'] = $nuevoEstado === 'ACEPTADA' ? 'SOLICITUD_ACEPTADA_OK' : 'SOLICITUD_RECHAZADA_OK';
        }
        return $resUpdate;
    }

    // listado para el panel de administrador: solo las solicitudes pendientes de resolver, con
    // los datos de huesped, vivienda y anfitrion
    function getSolicitudes() {
        include_once './Base/mapping.php';
        $map = new mapping('usuario_vivienda');
        return $map->lanzarqueryconresults(
            "SELECT uv.id_usuario, uv.id_vivienda, uv.estado_usuario_vivienda, uv.fecha_solicitud,
                    uv.fecha_inicio, uv.fecha_fin,
                    u.nombre_usuario, u.apellidos, u.mail,
                    v.direccion, v.ciudad, v.id_anfitrion,
                    ua.nombre_usuario AS anfitrion_nombre, ua.apellidos AS anfitrion_apellidos
             FROM usuario_vivienda uv
             JOIN usuario  u  ON u.id_usuario  = uv.id_usuario
             JOIN vivienda v  ON v.id_vivienda = uv.id_vivienda
             JOIN usuario  ua ON ua.id_usuario  = v.id_anfitrion
             WHERE uv.estado_usuario_vivienda = 'PENDIENTE'
             ORDER BY uv.fecha_solicitud DESC"
        );
    }

    function DELETE() {
        return $this->softDelete('activo_usuario_vivienda');
    }

    function REACTIVAR() {
        return $this->reactivarRegistro('activo_usuario_vivienda');
    }

    function getAll() {
        $this->modelo->listaAtributos = [];
        $this->modelo->foraneas = [];
        return $this->modelo->SEARCH();
    }

    function getHuespedesByVivienda() {
        $idVivienda = intval($_POST['id_vivienda']);
        include_once './Base/mapping.php';
        $map = new mapping('usuario_vivienda');
        return $map->lanzarqueryconresults(
            "SELECT uv.id_usuario, uv.activo_usuario_vivienda, uv.fecha_inicio,
                    u.nombre_usuario, u.apellidos, u.mail, u.telefono
             FROM usuario_vivienda uv
             JOIN usuario u ON u.id_usuario = uv.id_usuario
             WHERE uv.id_vivienda = {$idVivienda}
             ORDER BY uv.activo_usuario_vivienda DESC, uv.fecha_inicio"
        );
    }

    function getHuespedesByAnfitrion() {
        $idAnfitrion = intval($_POST['id_anfitrion']);
        include_once './Base/mapping.php';
        $map = new mapping('usuario_vivienda');
        return $map->lanzarqueryconresults(
            "SELECT uv.id_usuario, uv.fecha_inicio,
                    u.nombre_usuario, u.apellidos, u.mail, u.telefono
             FROM usuario_vivienda uv
             JOIN usuario u  ON u.id_usuario   = uv.id_usuario
             JOIN vivienda v ON v.id_vivienda   = uv.id_vivienda
             WHERE v.id_anfitrion = {$idAnfitrion}
               AND uv.activo_usuario_vivienda = 1
             ORDER BY uv.fecha_inicio"
        );
    }

    // Convivencia activa de un huesped: vivienda + anfitrion + companeros (otros huespedes
    // activos en la misma vivienda) + % de afinidad real con esa vivienda. Se considera que el
    // huesped "tiene vivienda" desde que su solicitud esta ACEPTADA (activo_usuario_vivienda = 1),
    // aunque el estado real pueda ser ACEPTADA (todavia no llega la fecha_inicio) o ACTIVA
    // (dentro del rango fecha_inicio/fecha_fin)
    function getConvivenciaByUsuario() {
        $idUsuario = intval($_POST['id_usuario']);

        include_once './Base/mapping.php';
        $map = new mapping('usuario_vivienda');

        $res = $map->lanzarqueryconresults(
            "SELECT uv.id_vivienda, uv.fecha_inicio,
                    v.direccion, v.ciudad, v.plazas_totales, v.id_anfitrion,
                    ua.nombre_usuario AS anfitrion_nombre, ua.apellidos AS anfitrion_apellidos,
                    ua.mail AS anfitrion_mail, ua.telefono AS anfitrion_telefono
             FROM usuario_vivienda uv
             JOIN vivienda v  ON v.id_vivienda = uv.id_vivienda
             JOIN usuario  ua ON ua.id_usuario  = v.id_anfitrion
             WHERE uv.id_usuario = {$idUsuario} AND uv.activo_usuario_vivienda = 1
             LIMIT 1"
        );

        if (!$res['ok'] || empty($res['resource'])) {
            return array('ok' => true, 'code' => 'SIN_CONVIVENCIA_ACTIVA', 'resource' => null);
        }

        $fila = $res['resource'][0];
        $idVivienda = intval($fila['id_vivienda']);

        return array('ok' => true, 'code' => 'CONVIVENCIA_OK', 'resource' => array(
            'estado'            => 'activo',
            'anfitrion'         => trim($fila['anfitrion_nombre'] . ' ' . $fila['anfitrion_apellidos']),
            'direccion'         => $fila['direccion'],
            'ciudad'            => $fila['ciudad'],
            'emailAnfitrion'    => $fila['anfitrion_mail'],
            'telefonoAnfitrion' => $fila['anfitrion_telefono'],
            'plazasTotales'     => intval($fila['plazas_totales']),
            'fechaInicio'       => $fila['fecha_inicio'],
            'companeros'        => $this->cargarCompaneros($map, $idVivienda, $idUsuario),
            'compatibilidad'    => $this->calcularCompatibilidadConVivienda($map, $idUsuario, $idVivienda)
        ));
    }

    // otros huespedes activos en la misma vivienda (excluyendo al propio usuario)
    function cargarCompaneros($map, $idVivienda, $idUsuarioExcluir) {
        $idRolHuesped = $this->resolverIdRolHuesped($map);
        $condicionRol = $idRolHuesped !== null ? "AND u.id_rol = {$idRolHuesped}" : '';

        $res = $map->lanzarqueryconresults(
            "SELECT u.nombre_usuario, u.apellidos, uv.fecha_inicio
             FROM usuario_vivienda uv
             JOIN usuario u ON u.id_usuario = uv.id_usuario
             WHERE uv.id_vivienda = {$idVivienda}
               AND uv.activo_usuario_vivienda = 1
               AND uv.id_usuario != {$idUsuarioExcluir}
               {$condicionRol}
             ORDER BY uv.fecha_inicio"
        );

        $companeros = array();
        if ($res['ok'] && !empty($res['resource'])) {
            foreach ($res['resource'] as $fila) {
                $companeros[] = array(
                    'nombre'       => trim($fila['nombre_usuario'] . ' ' . $fila['apellidos']),
                    'fechaIngreso' => $fila['fecha_inicio']
                );
            }
        }
        return $companeros;
    }

    function resolverIdRolHuesped($map) {
        $res = $map->lanzarqueryconresults("SELECT id_rol, nombre_rol FROM rol");
        if ($res['ok'] && !empty($res['resource'])) {
            foreach ($res['resource'] as $fila) {
                $nombre = mb_strtolower(trim($fila['nombre_rol']), 'UTF-8');
                if ($nombre === 'huesped' || $nombre === 'huésped') {
                    return intval($fila['id_rol']);
                }
            }
        }
        return null;
    }

    function calcularCompatibilidadConVivienda($map, $idUsuario, $idVivienda) {
        include_once './app/matching/matching_SERVICE.php';
        $matching = new matching_SERVICE();

        $pesos  = $matching->cargarPesosCriterios($map);
        $rangos = $matching->cargarRangosCriterios($map);

        $respuestasUsuario  = $matching->cargarRespuestas($map, 'usuario_criterio_opcion', 'id_usuario', $idUsuario, 'activo_usuario_criterio_opcion');
        $respuestasVivienda = $matching->cargarRespuestas($map, 'vivienda_criterio_opcion', 'id_vivienda', $idVivienda, 'activo_vivienda_criterio_opcion');

        if ($matching->detectarExclusion($pesos, $respuestasUsuario, $respuestasVivienda) !== null) {
            return 0;
        }

        $score = $matching->calcularScore($pesos, $rangos, $respuestasUsuario, $respuestasVivienda);
        return $score['porcentaje'] !== null ? $score['porcentaje'] : 0;
    }

    function getById() {
        foreach ($this->modelo->valores as $key => $value) {
            $this->modelo->valores[$key] = '';
        }
        $primaryKey = $this->modelo->clave[0];
        $this->modelo->valores[$primaryKey] = $_POST['id'];
        $this->modelo->foraneas = [];
        return $this->modelo->SEARCH_BY();
    }

}
?>