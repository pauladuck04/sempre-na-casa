<?php

include_once './Base/appServiceBase.php';

class vivienda_criterio_opcion_SERVICE extends appServiceBase {

    public $modelo;

    function __construct() {
        parent::__construct();
    }

    function inicializarRest() {

        $this->listaAtributos = array(
            'id_vivienda', 'id_criterio', 'id_opcion', 'activo_vivienda_criterio_opcion'
        );

        $this->listaAtributosSelect = array(
            'id_vivienda', 'id_criterio', 'id_opcion', 'activo_vivienda_criterio_opcion'
        );

        $this->notnull = array(
            'ADD'    => array('id_vivienda', 'id_criterio', 'id_opcion'),
            'EDIT'   => array('id_vivienda', 'id_criterio', 'id_opcion'),
            'DELETE' => array('id_vivienda', 'id_criterio', 'id_opcion'),
        );

        $this->modelo = $this->crearModelOne('opcion');
    }

    function modificacion_atributos() {
        if (isset($_POST['action']) && $_POST['action'] == 'ADD') {
            $_POST['activo_vivienda_criterio_opcion']     = 1;
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