<?php

include_once './base/modelBase.php';

class criterio_MODEL extends modelBase {

    function __construct() {
        $this->tabla         = 'criterio';
        $this->clave         = array('id_criterio');
        $this->foraneas      = array();
        $this->autoincrement = array('id_criterio');
    }

}
?>