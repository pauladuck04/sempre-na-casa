<?php

include_once './Base/appServiceBase.php';

class usuario_SERVICE extends appServiceBase{

	public $modelo;

	//METODOS

	function __construct(){

		parent::__construct();

	}

	function inicializarRest(){

		$this->listaAtributos = array('id_usuario','dni','mail','nombre_usuario','apellidos','password','telefono','fecha_alta_usuario','fecha_modificacion_usuario','activo_usuario','id_rol');

		$this->listaAtributosSelect = array('id_usuario','dni','mail','nombre_usuario','apellidos','telefono','fecha_alta_usuario','fecha_modificacion_usuario','activo_usuario','id_rol');

		$this->notnull = array(
						'ADD'    => array('dni','mail','nombre_usuario','apellidos','password','telefono','id_rol'),
						'EDIT'   => array('id_usuario','dni','mail','nombre_usuario','apellidos','telefono','id_rol'),
						'DELETE'    => array('id_usuario'),
						'REACTIVAR' => array('id_usuario')
						);

		$this->modelo = $this->crearModelOne('usuario');

	}

	function modificacion_atributos() {
        if (isset($_POST['action']) && $_POST['action'] == 'ADD') {
            $_POST['activo_usuario']     = 1;
            $_POST['fecha_alta_usuario'] = date('Y-m-d H:i:s');
            $_POST['fecha_modificacion_usuario'] = date('Y-m-d H:i:s');
        }
        if (!empty($_POST['password'])) {
            $_POST['password'] = md5($_POST['password']);
        }
    }

    function DELETE() {
        return $this->softDelete('activo_usuario', 'fecha_modificacion_usuario');
    }

    function REACTIVAR() {
        return $this->reactivarRegistro('activo_usuario', 'fecha_modificacion_usuario');
    }

    function EDIT() {
        unset($this->modelo->valores['fecha_alta_usuario']);
        unset($this->modelo->valores['activo_usuario']);
        $this->modelo->valores['fecha_modificacion_usuario'] = date('Y-m-d H:i:s');
        if (empty($this->modelo->valores['password'])) {
            unset($this->modelo->valores['password']);
        }
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
        $this->modelo->valores[$primaryKey] = $_POST['id_usuario'];
        $this->modelo->foraneas = [];
        return $this->modelo->SEARCH_BY();
    }

    function getByMail() {
        foreach ($this->modelo->valores as $key => $value) {
            $this->modelo->valores[$key] = '';
        }
        $this->modelo->foraneas = [];
        if (isset($_POST['mail'])) {
            $this->modelo->valores['mail'] = $_POST['mail'];
            return $this->modelo->SEARCH();
        }
        return array('ok' => false, 'error' => 'mail_not_provided');
    }

}
