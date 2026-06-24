<?php

include_once './Base/appServiceBase.php';

class rol_SERVICE extends appServiceBase {

    public $modelo;

    function __construct() {
        parent::__construct();
    }

    function inicializarRest() {

        $this->listaAtributos = array(
            'id_rol', 'nombre_rol', 'fecha_alta_rol', 'fecha_modificacion_rol', 'activo_rol'
        );

        $this->listaAtributosSelect = array(
            'id_rol', 'nombre_rol', 'fecha_alta_rol', 'fecha_modificacion_rol', 'activo_rol'
        );

        $this->notnull = array(
            'ADD'    => array('nombre_rol'),
            'EDIT'   => array('id_rol', 'nombre_rol'),
            'DELETE'    => array('id_rol'),
            'REACTIVAR' => array('id_rol'),
        );

        $this->modelo = $this->crearModelOne('rol');
    }

    function modificacion_atributos() {
        if (isset($_POST['action']) && $_POST['action'] == 'ADD') {
            $_POST['fecha_alta_rol'] = date('Y-m-d H:i:s');
            $_POST['fecha_modificacion_rol'] = date('Y-m-d H:i:s');
            $_POST['activo_rol']     = 1;
        }
    }

    function DELETE() {
        $res = $this->softDelete('activo_rol', 'fecha_modificacion_rol');
        if ($res['ok']) {
            $id_rol = intval($this->modelo->valores['id_rol']);
            $fecha  = date('Y-m-d H:i:s');
            $map    = new mapping('usuario');
            $map->lanzarquery(
                "UPDATE `usuario` SET `activo_usuario` = 0, `fecha_modificacion_usuario` = '{$fecha}' WHERE `id_rol` = {$id_rol} AND `activo_usuario` = 1"
            );
        }
        return $res;
    }

    function REACTIVAR() {
        return $this->reactivarRegistro('activo_rol', 'fecha_modificacion_rol');
    }

    function EDIT() {
        unset($this->modelo->valores['fecha_alta_rol']);
        unset($this->modelo->valores['activo_rol']);
        $this->modelo->valores['fecha_modificacion_rol'] = date('Y-m-d H:i:s');
        return $this->modelo->EDIT();
    }

    function getAll() {
        $this->modelo->listaAtributos = [];
        $this->modelo->foraneas = [];
        return $this->modelo->SEARCH();
    }

    function getById() {
        foreach ($this->modelo->valores as $key => $value) {
            $this->modelo->valores[$key] = '';
        }
        $primaryKey = $this->modelo->clave[0];
        $this->modelo->valores[$primaryKey] = $_POST['id_rol'];
        $this->modelo->foraneas = [];
        return $this->modelo->SEARCH_BY();
    }

}
?>
