<?php

include_once './Base/ModelBase.php';

class vivienda_MODEL extends ModelBase {

    function __construct() {
        $this->tabla         = 'vivienda';
        $this->clave         = array('id_vivienda');
        $this->foraneas      = array('id_anfitrion' => 'usuario');
        $this->autoincrement = array('id_vivienda');
    }

}
?>