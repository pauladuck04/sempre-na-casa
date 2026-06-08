<?php

include_once './Base/appServiceBase.php';

class usuario_SERVICE extends appServiceBase{

	public $modelo;

	//METODOS

	function __construct(){

		parent::__construct();

	}

	function inicializarRest(){

		$this->listaAtributos = array('dni', 'mail', 'nombre_usuario', 'apellidos', 'password', 'telefono', 'fecha_alta_usuario', 'activo_usuario', 'id_rol');

		$this->listaAtributosSelect = array('dni', 'mail', 'nombre_usuario', 'apellidos', 'password', 'telefono', 'fecha_alta_usuario', 'activo_usuario', 'id_rol');

		$this->notnull = array(
						'ADD'=>array('dni', 'mail', 'nombre_usuario', 'apellidos', 'password', 'telefono', 'fecha_alta_usuario', 'activo_usuario', 'id_rol'),
						'EDIT'=>array('dni', 'mail', 'nombre_usuario', 'apellidos', 'password', 'telefono', 'fecha_alta_usuario', 'activo_usuario', 'id_rol'),
						'DELETE'=>array('mail'),
						);

		$this->modelo = $this->crearModelOne('usuario');



	}


	function modificacion_atributos(){
		if ($_POST['action'] == 'ADD'){
			$_POST['fecha_alta_usuario'] = date(time());
		}
	}
	


}
?>
