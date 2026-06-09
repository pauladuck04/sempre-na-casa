<?php

include_once './Base/ModelBase.php';

class usuario_vivienda_MODEL extends ModelBase {

    //revisar si hay que meter un campo para guardar la fecha de inicio y la de fin
    //revisar añadir estado de la relacion (pendiente, aceptada, activa, inactiva)
    function __construct() {
        $this->tabla         = 'usuario_vivienda';
        $this->clave         = array('id_usuario', 'id_vivienda');
        $this->foraneas      = array('usuario' => 'id_usuario', 'vivienda' => 'id_vivienda');
        $this->autoincrement = array();
    }

}
?>