<?php

include_once './Base/appServiceBase.php';

class opcion_SERVICE extends appServiceBase {

    public $modelo;

    function __construct() {
        parent::__construct();
    }

    function inicializarRest() {

        $this->listaAtributos = array(
            'id_opcion', 'id_criterio', 'nombre_opcion', 'valor', 'fecha_alta_opcion', 'activo_opcion'
        );

        $this->listaAtributosSelect = array(
            'id_opcion', 'id_criterio', 'nombre_opcion', 'valor', 'fecha_alta_opcion', 'activo_opcion'
        );

        $this->notnull = array(
            'ADD'    => array('nombre_opcion', 'valor' ,'id_criterio'),
            'EDIT'   => array('nombre_opcion', 'valor' ,'id_criterio'),
            'DELETE' => array('id_opcion'),
        );

        $this->modelo = $this->crearModelOne('opcion');
    }

    function modificacion_atributos() {
        if (isset($_POST['action']) && $_POST['action'] == 'ADD') {
            $_POST['fecha_alta_opcion'] = date('Y-m-d H:i:s');
            $_POST['activo_opcion']     = 1;
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