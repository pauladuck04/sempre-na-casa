<?php

include_once './Base/appServiceBase.php';

class criterio_SERVICE extends appServiceBase {

    public $modelo;

    function __construct() {
        parent::__construct();
    }

    function inicializarRest() {

        $this->listaAtributos = array(
            'id_criterio', 'nombre_criterio', 'fecha_alta_criterio', 'activo_criterio'
        );

        $this->listaAtributosSelect = array(
            'id_criterio', 'nombre_criterio', 'fecha_alta_criterio', 'activo_criterio'
        );

        $this->notnull = array(
            'ADD'    => array('nombre_criterio'),            
            'EDIT'   => array('id_criterio', 'nombre_criterio'),
            'DELETE' => array('id_criterio'),
        );

        $this->modelo = $this->crearModelOne('criterio');
    }

    function modificacion_atributos() {
        if (isset($_POST['action']) && $_POST['action'] == 'ADD') {
            $_POST['fecha_alta_criterio'] = date('Y-m-d H:i:s');
            $_POST['activo_criterio']     = 1;
        }
    }

    function getAll() {
        foreach ($this->modelo->valores as $key => $value) {
            $this->modelo->valores[$key] = '';
        }
        $this->modelo->foraneas = [];
        return $this->modelo->SEARCH();
    }

    function EDIT() {
        unset($this->modelo->valores['fecha_alta_criterio']);
        unset($this->modelo->valores['activo_criterio']);
        return $this->modelo->EDIT();
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