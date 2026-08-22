<?php

include_once './base/modelBase.php';

class email_pendiente_MODEL extends modelBase {

    function __construct() {
        $this->tabla         = 'email_pendiente';
        $this->clave         = array('id_email_pendiente');
        $this->foraneas      = array();
        $this->autoincrement = array('id_email_pendiente');
    }

}
?>
