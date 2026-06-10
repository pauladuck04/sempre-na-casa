<?php

include_once './Base/ModelBase.php';

class criterio_MODEL extends ModelBase {

    function __construct() {
        $this->tabla         = 'criterio';
        $this->clave         = array('id_criterio');
        $this->foraneas      = array();
        $this->autoincrement = array('id_criterio');
    }

}
?>