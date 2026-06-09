<?php

include_once './Base/appServiceBase.php';

class opcion_SERVICE extends appServiceBase {

    public $modelo;

    function __construct() {
        parent::__construct();
    }

    function inicializarRest() {

        $this->listaAtributos = array(
            'id_opcion',
            'id_criterio',
            'nombre_opcion',
            'valor',
            'fecha_alta_opcion',
            'activo_opcion'
        );

        $this->listaAtributosSelect = array(
            'id_opcion',
            'id_criterio',
            'nombre_opcion',
            'valor',
            'fecha_alta_opcion',
            'activo_opcion'
        );

        $this->notnull = array(
            'ADD'  => array('id_criterio', 'nombre_opcion', 'valor'),
            'EDIT' => array('id_opcion', 'id_criterio', 'nombre_opcion', 'valor'),
        );

        $this->modelo = $this->crearModelOne('opcion');
    }

    function getAll() {
        $this->modelo->valores['id_opcion']         = '';
        $this->modelo->valores['id_criterio']       = '';
        $this->modelo->valores['nombre_opcion']     = '';
        $this->modelo->valores['valor']             = '';
        $this->modelo->valores['fecha_alta_opcion'] = '';
        $this->modelo->valores['activo_opcion']     = '';

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