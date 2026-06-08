<?php

include_once './Base/appServiceBase.php';

class vivienda_criterio_opcion_SERVICE extends appServiceBase {

    public $modelo;

    function __construct() {
        parent::__construct();
    }

    function inicializarRest() {

        $this->listaAtributos = array(
            'id_vivienda',
            'id_criterio',
            'id_opcion',
            'activo_vivienda_criterio_opcion'
        );

        $this->listaAtributosSelect = array(
            'id_vivienda',
            'id_criterio',
            'id_opcion',
            'activo_vivienda_criterio_opcion'
        );

        $this->notnull = array(
            'ADD'  => array('id_vivienda', 'id_criterio', 'id_opcion'),
            'EDIT' => array('id_vivienda', 'id_criterio', 'id_opcion'),
        );

        $this->modelo = $this->crearModelOne('vivienda_criterio_opcion');
    }

    function getAll() {
        $this->modelo->valores['id_vivienda']                     = '';
        $this->modelo->valores['id_criterio']                     = '';
        $this->modelo->valores['id_opcion']                       = '';
        $this->modelo->valores['activo_vivienda_criterio_opcion'] = '';

        $result = $this->modelo->SEARCH();
        return $result;
    }

}

?>