<?php

include_once './base/modelBase.php';

class rol_MODEL extends modelBase {

    function __construct() {
        $this->tabla         = 'rol';
        $this->clave         = array('id_rol');
        $this->foraneas      = array();
        $this->autoincrement = array('id_rol');
    }

}
?>