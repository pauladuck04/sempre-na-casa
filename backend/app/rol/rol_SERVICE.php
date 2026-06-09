<?php

include_once './Base/appServiceBase.php';

class rol_SERVICE extends appServiceBase {

    public $modelo;

    function __construct() {
        parent::__construct();
    }

    function inicializarRest() {

        $this->listaAtributos = array(
            'id_rol',
            'nombre_rol',
            'fecha_alta_rol',
            'activo_rol'
        );

        $this->listaAtributosSelect = array(
            'id_rol',
            'nombre_rol',
            'fecha_alta_rol',
            'activo_rol'
        );

        $this->notnull = array(
            'ADD'  => array('nombre_rol', 'fecha_alta_rol'),
            'EDIT' => array('id_rol', 'nombre_rol'),
        );

        $this->modelo = $this->crearModelOne('rol');
    }

    function getAll() {
        $this->modelo->valores['id_rol']         = '';
        $this->modelo->valores['nombre_rol']     = '';
        $this->modelo->valores['fecha_alta_rol'] = '';
        $this->modelo->valores['activo_rol']     = '';

        $result = $this->modelo->SEARCH();
        return $result;
    }

    function getById() {
        $id = $_POST['id'];

        foreach ($this->modelo->valores as $key => $value) {
            $this->modelo->valores[$key] = '';
        }

        $primaryKey = $this->modelo->clave[0];
        $this->modelo->valores[$primaryKey] = $id;

        $this->modelo->foraneas = [];
        $result = $this->modelo->SEARCH_BY();

        return $result;
    }

}

?>