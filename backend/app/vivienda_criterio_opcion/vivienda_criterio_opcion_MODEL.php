<?php

include_once './Base/ModelBase.php';

class vivienda_criterio_opcion_MODEL extends ModelBase {

    function __construct() {
        $this->tabla         = 'vivienda_criterio_opcion';
        $this->clave         = array('id_vivienda', 'id_criterio', 'id_opcion');
        $this->foraneas      = array('id_vivienda' => 'vivienda', 'id_criterio' => 'criterio', 'id_opcion' => 'opcion');
        $this->autoincrement = array();
    }

}
?>