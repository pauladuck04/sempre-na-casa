<?php

include_once './base/ModelBase.php';

class usuario_criterio_opcion_MODEL extends ModelBase {

    public $tabla = 'usuario_criterio_opcion';
    public $autoincrement = false; // PK compuesta, sin autoincremento
    public $clave = ['id_usuario', 'id_criterio'];
    public $foraneas = [
        'id_criterio' => 'criterio',
        'id_opcion'   => 'opcion',
        'id_usuario'  => 'usuario'
    ];

    public $listaAtributos = [
        'id_usuario',
        'id_criterio',
        'id_opcion',
        'activo_usuario_criterio_opcion'
    ];

    public $valores = [
        'id_usuario'                     => null,
        'id_criterio'                    => null,
        'id_opcion'                      => null,
        'activo_usuario_criterio_opcion' => null
    ];

    // Setters
    public function setIdUsuario($value)                    { $this->valores['id_usuario']                     = $value; }
    public function setIdCriterio($value)                   { $this->valores['id_criterio']                    = $value; }
    public function setIdOpcion($value)                     { $this->valores['id_opcion']                      = $value; }
    public function setActivoUsuarioCriterioOpcion($value)  { $this->valores['activo_usuario_criterio_opcion'] = $value; }

    // Getters
    public function getIdUsuario()                    { return $this->valores['id_usuario']; }
    public function getIdCriterio()                   { return $this->valores['id_criterio']; }
    public function getIdOpcion()                     { return $this->valores['id_opcion']; }
    public function getActivoUsuarioCriterioOpcion()  { return $this->valores['activo_usuario_criterio_opcion']; }
}

?>