<?php

include_once './Base/appServiceBase.php';

class usuario_SERVICE extends appServiceBase {

    public $modelo;

    function __construct() {
        parent::__construct();
    }

    function inicializarRest() {

        $this->listaAtributos = array(
            'dni', 'mail', 'nombre_usuario', 'apellidos',
            'password', 'telefono', 'fecha_alta_usuario',
            'activo_usuario', 'id_rol'
        );

        $this->listaAtributosSelect = array(
            'dni', 'mail', 'nombre_usuario', 'apellidos',
            'password', 'telefono', 'fecha_alta_usuario',
            'activo_usuario', 'id_rol'
        );

        $this->notnull = array(
            'ADD'    => array('dni', 'mail', 'nombre_usuario', 'apellidos', 'password', 'telefono', 'id_rol'),
            'EDIT'   => array('mail', 'nombre_usuario', 'apellidos', 'id_rol'),
            'DELETE' => array('mail'),
        );

        $this->modelo = $this->crearModelOne('usuario');
    }

    function modificacion_atributos() {
        if (isset($_POST['action']) && $_POST['action'] == 'ADD') {
            $_POST['fecha_alta_usuario'] = date('Y-m-d H:i:s');
            $_POST['activo_usuario']     = 1;
        }
    }

    function getAll() {
        foreach ($this->modelo->valores as $key => $value) {
            $this->modelo->valores[$key] = '';
        }
        $this->modelo->foraneas = [];
        return $this->modelo->SEARCH();
    }

    function getByMail() {
        foreach ($this->modelo->valores as $key => $value) {
            $this->modelo->valores[$key] = '';
        }
        $this->modelo->valores['mail'] = $_POST['mail'];
        $this->modelo->foraneas = [];
        return $this->modelo->SEARCH_BY();
    }

}
?>