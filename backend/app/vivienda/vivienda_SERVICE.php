<?php

include_once './base/appServiceBase.php';

class vivienda_SERVICE extends appServiceBase {

    public $modelo;

    function __construct() {
        parent::__construct();
    }

    function inicializarRest() {

        $this->listaAtributos = array(
            'id_vivienda', 'descripcion', 'plazas_libres', 'plazas_totales', 'id_anfitrion', 'direccion', 'ciudad', 'fecha_alta_vivienda', 'fecha_modificacion_vivienda', 'activo_vivienda'
        );

        $this->listaAtributosSelect = array(
            'id_vivienda', 'descripcion', 'plazas_libres', 'plazas_totales', 'id_anfitrion', 'direccion', 'ciudad', 'fecha_alta_vivienda', 'fecha_modificacion_vivienda', 'activo_vivienda'
        );

        $this->notnull = array(
            'ADD'    => array('descripcion', 'plazas_libres', 'plazas_totales', 'id_anfitrion', 'direccion', 'ciudad'),
            'EDIT'   => array('id_vivienda', 'descripcion', 'plazas_libres', 'plazas_totales', 'id_anfitrion', 'direccion', 'ciudad'),
            'DELETE'    => array('id_vivienda'),
            'REACTIVAR' => array('id_vivienda'),
        );

        $this->modelo = $this->crearModelOne('vivienda');
    }

    function modificacion_atributos() {
        if (isset($_POST['action']) && $_POST['action'] == 'ADD') {
            $_POST['fecha_alta_vivienda'] = date('Y-m-d H:i:s');
            $_POST['fecha_modificacion_vivienda'] = date('Y-m-d H:i:s');
            $_POST['activo_vivienda']     = 1;
        }
    }

    function DELETE() {
        return $this->softDelete('activo_vivienda', 'fecha_modificacion_vivienda');
    }

    function REACTIVAR() {
        return $this->reactivarRegistro('activo_vivienda', 'fecha_modificacion_vivienda');
    }

    function EDIT() {
        unset($this->modelo->valores['fecha_alta_vivienda']);
        unset($this->modelo->valores['activo_vivienda']);
        $this->modelo->valores['fecha_modificacion_vivienda'] = date('Y-m-d H:i:s');
        return $this->modelo->EDIT();
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
