<?php

include_once './Base/appServiceBase.php';

class usuario_criterio_opcion_SERVICE extends appServiceBase {

    public $modelo;

    function __construct() {
        parent::__construct();
    }

    function inicializarRest() {

        $this->listaAtributos = array(
            'id_usuario',
            'id_criterio',
            'id_opcion',
            'activo_usuario_criterio_opcion'
        );

        $this->listaAtributosSelect = array(
            'id_usuario',
            'id_criterio',
            'id_opcion',
            'activo_usuario_criterio_opcion'
        );

        $this->notnull = array(
            'ADD'  => array('id_usuario', 'id_criterio', 'id_opcion'),
            'EDIT' => array('id_usuario', 'id_criterio', 'id_opcion'),
        );

        $this->modelo = $this->crearModelOne('usuario_criterio_opcion');
    }

    function getAll() {
        $this->modelo->valores['id_usuario']                     = '';
        $this->modelo->valores['id_criterio']                    = '';
        $this->modelo->valores['id_opcion']                      = '';
        $this->modelo->valores['activo_usuario_criterio_opcion'] = '';

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