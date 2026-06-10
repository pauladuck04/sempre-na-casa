<?php

include_once './Base/ModelBase.php';

class opcion_MODEL extends ModelBase {

    function __construct() {
        $this->tabla         = 'opcion';
        $this->clave         = array('id_opcion');
        $this->foraneas      = array('criterio' => 'id_criterio');
        $this->autoincrement = array('id_opcion');
    }

}
?>