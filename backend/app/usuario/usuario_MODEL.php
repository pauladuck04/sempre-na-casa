<?php

include_once './Base/ModelBase.php';

class usuario_MODEL extends ModelBase{

	function __construct(){

		$this->tabla = 'usuario';
		$this->clave = array('id_usuario');
		$this->foraneas = array();
		$this->autoincrement = array('id_usuario');
        $this->unicos = array('mail');

	}

}