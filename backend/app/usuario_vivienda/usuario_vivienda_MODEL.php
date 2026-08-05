<?php

include_once './Base/ModelBase.php';

class usuario_vivienda_MODEL extends ModelBase {

    function __construct() {
        $this->tabla         = 'usuario_vivienda';
        $this->clave         = array('id_usuario', 'id_vivienda');
        $this->foraneas      = array('id_usuario' => 'usuario', 'id_vivienda' => 'vivienda');
        $this->autoincrement = array();
    }

}
?>