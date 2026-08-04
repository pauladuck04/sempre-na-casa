<?php

include_once './Base/ModelBase.php';

class usuario_criterio_opcion_MODEL extends ModelBase {

    function __construct() {
        $this->tabla         = 'usuario_criterio_opcion';
        $this->clave         = array('id_usuario', 'id_criterio', 'id_opcion');
        $this->foraneas      = array('id_usuario' => 'usuario', 'id_criterio' => 'criterio', 'id_opcion' => 'opcion');
        $this->autoincrement = array();
    }

}
?>