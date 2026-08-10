<?php

include_once './base/modelBase.php';

class log_excepciones_MODEL extends modelBase {

    function __construct() {
        $this->tabla         = 'log_excepciones';
        $this->clave         = array('id_log_excepcion');
        $this->foraneas      = array();
        $this->autoincrement = array('id_log_excepcion');
    }

}
?>