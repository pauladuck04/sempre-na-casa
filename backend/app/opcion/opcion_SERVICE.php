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
        return $this->reactivarRegistro('activo_opcion', 'fecha_modificacion_opcion');
    }

    function EDIT() {
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
