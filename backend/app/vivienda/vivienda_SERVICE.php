<?php

include_once './Base/appServiceBase.php';

class vivienda_SERVICE extends appServiceBase {

    public $modelo;

    function __construct() {
        parent::__construct();
    }

    function inicializarRest() {

        $this->listaAtributos = array(
            'id_vivienda', 'id_usuario', 'direccion', 'ciudad', 'pais', 'codigo_postal', 'fecha_alta_vivienda', 'activo_vivienda'
        );

        $this->listaAtributosSelect = array(
            'id_usuario', 'direccion', 'ciudad', 'pais', 'codigo_postal', 'fecha_alta_vivienda', 'activo_vivienda'
        );

        $this->notnull = array(
            'ADD'    => array('direccion', 'ciudad', 'pais', 'codigo_postal', 'id_usuario'),
            'EDIT'   => array('direccion', 'ciudad', 'pais', 'codigo_postal', 'id_usuario'),
            'DELETE' => array('id_vivienda'),
        );

        $this->modelo = $this->crearModelOne('vivienda');
    }

    function modificacion_atributos() {
        if (isset($_POST['action']) && $_POST['action'] == 'ADD') {
            $_POST['fecha_alta_vivienda'] = date('Y-m-d H:i:s');
            $_POST['activo_vivienda']     = 1;
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