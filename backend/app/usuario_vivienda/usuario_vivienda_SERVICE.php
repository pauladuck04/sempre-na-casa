<?php

include_once './Base/appServiceBase.php';

class usuario_vivienda_SERVICE extends appServiceBase {

    public $modelo;

    function __construct() {
        parent::__construct();
    }

    function inicializarRest() {

        $this->listaAtributos = array(
            'id_usuario', 'id_vivienda', 'activo_usuario_vivienda'
        );

        $this->listaAtributosSelect = array(
            'id_usuario', 'id_vivienda', 'activo_usuario_vivienda'
        );

        $this->notnull = array(
            'ADD'    => array('id_usuario', 'id_vivienda'),
            'EDIT'   => array('id_usuario', 'id_vivienda'),
            'DELETE' => array('id_usuario', 'id_vivienda'),
        );

        $this->modelo = $this->crearModelOne('usuario_vivienda');
    }

    function modificacion_atributos() {
        if (isset($_POST['action']) && $_POST['action'] == 'ADD') {
            $_POST['activo_usuario_vivienda']     = 1;
        }
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