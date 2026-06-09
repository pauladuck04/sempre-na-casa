<?php

include_once './Base/ModelBase.php';

//revisar la opcion de volver a incluir el id_usuario como clave primaria
class usuario_MODEL extends ModelBase {

    function __construct() {
        $this->tabla         = 'usuario';
        $this->clave         = array('mail');
        $this->foraneas      = array('rol' => 'id_rol');
        $this->autoincrement = array();
    }

}
?>