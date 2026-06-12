<?php

include_once './Base/appServiceBase.php';

class rol_SERVICE extends appServiceBase {

    public $modelo;

    function __construct() {
        parent::__construct();
    }

    function inicializarRest() {

        $this->listaAtributos = array(
            'id_rol', 'nombre_rol', 'fecha_alta_rol', 'activo_rol'
        );

        $this->listaAtributosSelect = array(
            'id_rol', 'nombre_rol', 'fecha_alta_rol', 'activo_rol'
        );

        $this->notnull = array(
            'ADD'    => array('nombre_rol'),
            'EDIT'   => array('id_rol', 'nombre_rol'),
            'DELETE' => array('id_rol'),
        );

        $this->modelo = $this->crearModelOne('rol');
    }

    function modificacion_atributos() {
        if (isset($_POST['action']) && $_POST['action'] == 'ADD') {
            $_POST['fecha_alta_rol'] = date('Y-m-d H:i:s');
            $_POST['activo_rol']     = 1;
        }
    }

    function EDIT() {
        unset($this->modelo->valores['fecha_alta_rol']);
        unset($this->modelo->valores['activo_rol']);
        return $this->modelo->EDIT();
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
        $primaryKey = $this->modelo->clave[0];
        $this->modelo->valores[$primaryKey] = $_POST['id'];
        $this->modelo->foraneas = [];
        return $this->modelo->SEARCH_BY();
    }

}
?>