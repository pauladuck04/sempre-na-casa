<?php

include_once './base/appServiceBase.php';

class opcion_SERVICE extends appServiceBase {

    public $modelo;

    function __construct() {
        parent::__construct();
    }

    function inicializarRest() {

        $this->listaAtributos = array(
            'id_opcion', 'id_criterio', 'nombre_opcion', 'valor', 'fecha_alta_opcion', 'fecha_modificacion_opcion', 'activo_opcion'
        );

        $this->listaAtributosSelect = array(
            'id_opcion', 'id_criterio', 'nombre_opcion', 'valor', 'fecha_alta_opcion', 'fecha_modificacion_opcion', 'activo_opcion'
        );

        $this->notnull = array(
            'ADD'    => array('nombre_opcion', 'valor' ,'id_criterio'),
            'EDIT'   => array('id_opcion', 'nombre_opcion', 'valor', 'id_criterio'),
            'DELETE'       => array('id_opcion'),
            'REACTIVAR'    => array('id_opcion'),
            'getByCriterio' => array('id_criterio'),
        );

        $this->modelo = $this->crearModelOne('opcion');
    }

    function modificacion_atributos() {
        if (isset($_POST['action']) && $_POST['action'] == 'ADD') {
            $_POST['fecha_alta_opcion'] = date('Y-m-d H:i:s');
            $_POST['fecha_modificacion_opcion'] = date('Y-m-d H:i:s');
            $_POST['activo_opcion']     = 1;
        }
    }

    // Un criterio no puede tener mas de 3 opciones activas (el motor de matching asume un rango
    // de opciones acotado por criterio). Cuenta solo opciones activas: una desactivada no ocupa
    // hueco.
    const MAX_OPCIONES_POR_CRITERIO = 3;

    function opcionesActivasEnCriterio($idCriterio) {
        include_once './base/mapping.php';
        $map = new mapping('opcion');
        $res = $map->lanzarqueryconresults(
            "SELECT COUNT(*) AS total FROM opcion WHERE id_criterio = {$idCriterio} AND activo_opcion = 1"
        );
        return ($res['ok'] && !empty($res['resource'])) ? intval($res['resource'][0]['total']) : 0;
    }

    function ADD() {
        $idCriterio = intval($_POST['id_criterio']);
        if ($this->opcionesActivasEnCriterio($idCriterio) >= self::MAX_OPCIONES_POR_CRITERIO) {
            return array('ok' => false, 'code' => 'LIMITE_OPCIONES_KO');
        }
        return $this->modelo->ADD();
    }

    function getAll() {
        $this->modelo->listaAtributos = [];
        $this->modelo->foraneas = [];
        return $this->modelo->SEARCH();
    }

    function getByCriterio() {
        foreach ($this->modelo->valores as $key => $value) {
            $this->modelo->valores[$key] = '';
        }
        $this->modelo->valores['id_criterio']  = $_POST['id_criterio'];
        $this->modelo->valores['activo_opcion'] = '1';
        $this->modelo->foraneas = [];
        return $this->modelo->SEARCH_BY();
    }

    function DELETE() {
        return $this->softDelete('activo_opcion', 'fecha_modificacion_opcion');
    }

    function REACTIVAR() {
        include_once './base/mapping.php';
        $map = new mapping('opcion');
        $idOpcion = intval($_POST['id_opcion']);
        $res = $map->lanzarqueryconresults(
            "SELECT id_criterio FROM opcion WHERE id_opcion = {$idOpcion} LIMIT 1"
        );
        if ($res['ok'] && !empty($res['resource'])) {
            $idCriterio = intval($res['resource'][0]['id_criterio']);
            if ($this->opcionesActivasEnCriterio($idCriterio) >= self::MAX_OPCIONES_POR_CRITERIO) {
                return array('ok' => false, 'code' => 'LIMITE_OPCIONES_KO');
            }
        }
        return $this->reactivarRegistro('activo_opcion', 'fecha_modificacion_opcion');
    }

    function EDIT() {
        // Si se reasigna la opcion a otro criterio, ese otro criterio tambien tiene que respetar
        // el maximo de 3 (editar el nombre/valor sin cambiar de criterio no toca el recuento).
        include_once './base/mapping.php';
        $map = new mapping('opcion');
        $idOpcion = intval($_POST['id_opcion']);
        $idCriterioNuevo = intval($_POST['id_criterio']);
        $res = $map->lanzarqueryconresults(
            "SELECT id_criterio FROM opcion WHERE id_opcion = {$idOpcion} LIMIT 1"
        );
        if ($res['ok'] && !empty($res['resource'])) {
            $idCriterioActual = intval($res['resource'][0]['id_criterio']);
            if ($idCriterioNuevo !== $idCriterioActual && $this->opcionesActivasEnCriterio($idCriterioNuevo) >= self::MAX_OPCIONES_POR_CRITERIO) {
                return array('ok' => false, 'code' => 'LIMITE_OPCIONES_KO');
            }
        }

        unset($this->modelo->valores['fecha_alta_opcion']);
        unset($this->modelo->valores['activo_opcion']);
        $this->modelo->valores['fecha_modificacion_opcion'] = date('Y-m-d H:i:s');
        return $this->modelo->EDIT();
    }

    function getById() {
        foreach ($this->modelo->valores as $key => $value) {
            $this->modelo->valores[$key] = '';
        }
        $primaryKey = $this->modelo->clave[0];
        $this->modelo->valores[$primaryKey] = $_POST['id_opcion'];
        $this->modelo->foraneas = [];
        return $this->modelo->SEARCH_BY();
    }

}
?>
