<?php

include_once './base/appServiceBase.php';

class usuario_criterio_opcion_SERVICE extends appServiceBase {

    public $modelo;

    function __construct() {
        parent::__construct();
    }

    function inicializarRest() {

        $this->listaAtributos = array(
            'id_usuario', 'id_criterio', 'id_opcion', 'activo_usuario_criterio_opcion'
        );

        $this->listaAtributosSelect = array(
            'id_usuario', 'id_criterio', 'id_opcion', 'activo_usuario_criterio_opcion'
        );

        $this->notnull = array(
            'ADD'  => array('id_usuario', 'id_criterio', 'id_opcion'),
            'EDIT' => array('id_usuario', 'id_criterio', 'id_opcion'),
            'DELETE'    => array('id_usuario', 'id_criterio', 'id_opcion'),
            'REACTIVAR' => array('id_usuario', 'id_criterio', 'id_opcion'),
            'UPSERT_RESPUESTA'   => array('id_usuario', 'id_criterio', 'id_opcion'),
            'getByUsuario'       => array('id_usuario'),
            'getResumenByUsuario' => array('id_usuario'),
        );

        $this->modelo = $this->crearModelOne('usuario_criterio_opcion');
    }

    function modificacion_atributos() {
        if (isset($_POST['action']) && $_POST['action'] == 'ADD') {
            $_POST['activo_usuario_criterio_opcion'] = 1;
        }
    }

    function DELETE() {
        return $this->softDelete('activo_usuario_criterio_opcion');
    }

    function REACTIVAR() {
        return $this->reactivarRegistro('activo_usuario_criterio_opcion');
    }

    function getAll() {
        foreach ($this->modelo->valores as $key => $value) {
            $this->modelo->valores[$key] = '';
        }
        $this->modelo->foraneas = [];
        return $this->modelo->SEARCH();
    }

    function getById() {
        foreach ($this->modelo->valores as $key => $value) {
            $this->modelo->valores[$key] = '';
        }
        $this->modelo->valores['id_usuario']  = $_POST['id_usuario'];
        $this->modelo->valores['id_criterio'] = $_POST['id_criterio'];
        $this->modelo->valores['id_opcion']   = $_POST['id_opcion'];
        $this->modelo->foraneas = [];
        return $this->modelo->SEARCH_BY();
    }

    function getByUsuario() {
        foreach ($this->modelo->valores as $key => $value) {
            $this->modelo->valores[$key] = '';
        }
        $this->modelo->valores['id_usuario'] = $_POST['id_usuario'];
        $this->modelo->foraneas = [];
        return $this->modelo->SEARCH_BY();
    }

    public function getResumenByUsuario() {
        $idUsuario = intval($_POST['id_usuario']);

        include_once './Base/mapping.php';
        $map = new mapping('usuario_criterio_opcion');

        $res = $map->lanzarqueryconresults(
            "SELECT c.id_criterio, c.nombre_criterio, uco.id_opcion, o.nombre_opcion
             FROM criterio c
             LEFT JOIN usuario_criterio_opcion uco
                ON uco.id_criterio = c.id_criterio
               AND uco.id_usuario  = {$idUsuario}
               AND uco.activo_usuario_criterio_opcion = 1
             LEFT JOIN opcion o ON o.id_opcion = uco.id_opcion
             WHERE c.activo_criterio = 1
             ORDER BY c.id_criterio"
        );

        return $res;
    }

    function UPSERT_RESPUESTA() {
        $idUsuario  = intval($_POST['id_usuario']);
        $idCriterio = intval($_POST['id_criterio']);
        $idOpcion   = intval($_POST['id_opcion']);

        include_once './Base/mapping.php';
        $map = new mapping('usuario_criterio_opcion');

        $map->lanzarquery(
            "DELETE FROM usuario_criterio_opcion WHERE id_usuario = {$idUsuario} AND id_criterio = {$idCriterio}"
        );

        $res = $map->lanzarquery(
            "INSERT INTO usuario_criterio_opcion (id_usuario, id_criterio, id_opcion, activo_usuario_criterio_opcion) VALUES ({$idUsuario}, {$idCriterio}, {$idOpcion}, 1)"
        );

        if ($res['ok']) return array('ok' => true,  'code' => 'UPSERT_RESPUESTA_OK');
        return array('ok' => false, 'code' => 'UPSERT_RESPUESTA_KO');
    }

}
?>