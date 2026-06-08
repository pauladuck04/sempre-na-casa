<?php

include_once './Base/appServiceBase.php';

class usuario_vivienda_SERVICE extends appServiceBase {

    public $modelo;

    function __construct() {
        parent::__construct();
    }

    function inicializarRest() {

        $this->listaAtributos = array(
            'id_usuario',
            'id_vivienda',
            'activo_usuario_vivienda'
        );

        $this->listaAtributosSelect = array(
            'id_usuario',
            'id_vivienda',
            'activo_usuario_vivienda'
        );

        $this->notnull = array(
            'ADD'  => array('id_usuario', 'id_vivienda'),
            'EDIT' => array('id_usuario', 'id_vivienda'),
        );

        $this->modelo = $this->crearModelOne('usuario_vivienda');
    }

    function getAll() {
        $this->modelo->valores['id_usuario']              = '';
        $this->modelo->valores['id_vivienda']             = '';
        $this->modelo->valores['activo_usuario_vivienda'] = '';

        $result = $this->modelo->SEARCH();
        return $result;
    }

}

?>