<?php

include_once './base/modelBase.php';

class vivienda_criterio_opcion_MODEL extends modelBase {

    function __construct() {
        $this->tabla         = 'vivienda_criterio_opcion';
        $this->clave         = array('id_vivienda', 'id_criterio', 'id_opcion');
        $this->foraneas      = array('id_vivienda' => 'vivienda', 'id_criterio' => 'criterio', 'id_opcion' => 'opcion');
        $this->autoincrement = array();
    }

}
?>