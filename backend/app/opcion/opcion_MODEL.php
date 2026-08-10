<?php

include_once './base/modelBase.php';

class opcion_MODEL extends modelBase {

    function __construct() {
        $this->tabla         = 'opcion';
        $this->clave         = array('id_opcion');
        $this->foraneas      = array('id_criterio' => 'criterio');
        $this->autoincrement = array('id_opcion');
    }

}
?>