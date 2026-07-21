<?php

include_once './Base/appServiceBase.php';

class log_excepciones_SERVICE extends appServiceBase {

    public $modelo;

    function __construct() {
        parent::__construct();
    }

    function inicializarRest() {
        $this->listaAtributos = array(
            'id_log_excepcion',
            'fecha_log_excepcion',
            'controlador',
            'accion',
            'codigo_error',
            'id_usuario'
        );

        $this->listaAtributosSelect = array(
            'id_log_excepcion',
            'fecha_log_excepcion',
            'controlador',
            'accion',
            'codigo_error',
            'id_usuario'
        );

        $this->notnull = array(
            'DELETE' => array('id_log_excepcion')
        );

        $this->modelo = $this->crearModelOne('log_excepciones');
    }

}

?>
