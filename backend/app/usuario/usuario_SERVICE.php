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

        $result = $this->modelo->foraneas  = [];

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

    function ADD() {
        $this->modelo->valores['fecha_alta_usuario'] = date('Y-m-d H:i:s');
        $this->modelo->valores['activo_usuario'] = 1;
        return $this->modelo->ADD();
    }

    function modificacion_atributos(){
		if ($_POST['action'] == 'ADD'){
			$_POST['fecha_alta_usuario'] = date(time());
            $_POST['activo_usuario'] = 1;
		}
	}

}

?>