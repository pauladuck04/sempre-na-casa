<?php

include_once './base/appServiceBase.php';

class criterio_SERVICE extends appServiceBase {

    public $modelo;

    function __construct() {
        parent::__construct();
    }

    function inicializarRest() {

        $this->listaAtributos = array(
            'id_criterio', 'nombre_criterio', 'fecha_alta_criterio', 'fecha_modificacion_criterio', 'activo_criterio'
        );

        $this->listaAtributosSelect = array(
            'id_criterio', 'nombre_criterio', 'fecha_alta_criterio', 'fecha_modificacion_criterio', 'activo_criterio'
        );

        $this->notnull = array(
            'ADD'    => array('nombre_criterio'),
            'EDIT'   => array('id_criterio', 'nombre_criterio'),
            'DELETE'    => array('id_criterio'),
            'REACTIVAR' => array('id_criterio'),
        );

        $this->modelo = $this->crearModelOne('criterio');
    }

    function modificacion_atributos() {
        if (isset($_POST['action']) && $_POST['action'] == 'ADD') {
            $_POST['fecha_alta_criterio'] = date('Y-m-d H:i:s');
            $_POST['fecha_modificacion_criterio'] = date('Y-m-d H:i:s');
            $_POST['activo_criterio']     = 1;
        }
    }

    function DELETE() {
        return $this->softDelete('activo_criterio', 'fecha_modificacion_criterio');
    }

    function REACTIVAR() {
        return $this->reactivarRegistro('activo_criterio', 'fecha_modificacion_criterio');
    }

    function EDIT() {
        unset($this->modelo->valores['fecha_alta_criterio']);
        unset($this->modelo->valores['activo_criterio']);
        $this->modelo->valores['fecha_modificacion_criterio'] = date('Y-m-d H:i:s');
        return $this->modelo->EDIT();
    }

}
?>
