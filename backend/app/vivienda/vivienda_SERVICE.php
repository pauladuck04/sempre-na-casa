<?php

include_once './Base/appServiceBase.php';

class vivienda_SERVICE extends appServiceBase {

    public $modelo;

    function __construct() {
        parent::__construct();
    }

    function inicializarRest() {

        $this->listaAtributos = array(
            'id_vivienda',
            'descripcion',
            'plazas_libres',
            'plazas_totales',
            'direccion',
            'ciudad',
            'fecha_alta_vivienda',
            'id_anfitrion',
            'activo_vivienda'
        );

        $this->listaAtributosSelect = array(
            'id_vivienda',
            'descripcion',
            'plazas_libres',
            'plazas_totales',
            'direccion',
            'ciudad',
            'fecha_alta_vivienda',
            'id_anfitrion',
            'activo_vivienda'
        );

        $this->notnull = array(
            'ADD'  => array('descripcion', 'plazas_totales', 'direccion', 'ciudad', 'fecha_alta_vivienda', 'id_anfitrion'),
            'EDIT' => array('id_vivienda', 'descripcion', 'plazas_totales', 'direccion', 'ciudad', 'id_anfitrion'),
        );

        $this->modelo = $this->crearModelOne('vivienda');
    }

    function getAll() {
        $this->modelo->valores['id_vivienda']         = '';
        $this->modelo->valores['descripcion']         = '';
        $this->modelo->valores['plazas_libres']       = '';
        $this->modelo->valores['plazas_totales']      = '';
        $this->modelo->valores['direccion']           = '';
        $this->modelo->valores['ciudad']              = '';
        $this->modelo->valores['fecha_alta_vivienda'] = '';
        $this->modelo->valores['id_anfitrion']        = '';
        $this->modelo->valores['activo_vivienda']     = '';

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