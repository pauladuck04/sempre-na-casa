<?php

include_once './Base/appServiceBase.php';

class usuario_SERVICE extends appServiceBase {

    public $modelo;

    function __construct() {
        parent::__construct();
    }

    function inicializarRest() {

        $this->listaAtributos = array(
            'dni',
            'mail',
            'nombre_usuario',
            'apellidos',
            'password',
            'telefono',
            'fecha_alta_usuario',
            'activo_usuario',
            'id_rol'
        );

        $this->listaAtributosSelect = array(
            'dni',
            'mail',
            'nombre_usuario',
            'apellidos',
            'password',
            'telefono',
            'fecha_alta_usuario',
            'activo_usuario',
            'id_rol'
        );

        $this->notnull = array(
            'ADD'  => array('dni', 'mail', 'nombre_usuario', 'apellidos', 'password', 'telefono', 'id_rol'),
            'EDIT' => array('mail', 'nombre_usuario', 'apellidos', 'id_rol'),
        );

        $this->modelo = $this->crearModelOne('usuario');
    }

    function getAll() {
        $this->modelo->valores['dni']                = '';
        $this->modelo->valores['mail']               = '';
        $this->modelo->valores['nombre_usuario']     = '';
        $this->modelo->valores['apellidos']          = '';
        $this->modelo->valores['password']           = '';
        $this->modelo->valores['telefono']           = '';
        $this->modelo->valores['fecha_alta_usuario'] = '';
        $this->modelo->valores['activo_usuario']     = '';
        $this->modelo->valores['id_rol']             = '';

        $result = $this->modelo->SEARCH();
        return $result;
    }

}

?>