<?php

include_once './Base/ModelBase.php';

class usuario_MODEL extends ModelBase{


	//METODOS
	// tabla tabla
	// clave array(clavestabla)
	// foraneas array(clavetablaforanea => tablaforanea) -- ver mapping::SEARCH()/SEARCH_BY()
    // autoincrement array(atributos autoincrementales)
    // unicos array(atributos unique)
	function __construct(){

		$this->tabla = 'usuario';
		$this->clave = array('id_usuario');
		$this->foraneas = array();
		$this->autoincrement = array('id_usuario');
        $this->unicos = array('mail');

	}

}