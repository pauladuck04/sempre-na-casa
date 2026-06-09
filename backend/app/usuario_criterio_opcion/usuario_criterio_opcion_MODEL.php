<?php

include_once './Base/ModelBase.php';

class usuario_criterio_opcion_MODEL extends ModelBase {

    function __construct() {
        $this->tabla         = 'usuario_criterio_opcion';
        $this->clave         = array('id_usuario', 'id_criterio', 'id_opcion');
        $this->foraneas      = array('usuario' => 'id_usuario', 'criterio' => 'id_criterio', 'opcion' => 'id_opcion');
        $this->autoincrement = array();
    }

}
?>