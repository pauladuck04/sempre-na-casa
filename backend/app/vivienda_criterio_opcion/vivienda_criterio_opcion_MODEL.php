<?php

include_once './base/ModelBase.php';

class vivienda_criterio_opcion_MODEL extends ModelBase {

    public $tabla = 'vivienda_criterio_opcion';
    public $autoincrement = false; // PK compuesta, sin autoincremento
    public $clave = ['id_vivienda', 'id_criterio'];
    public $foraneas = [
        'id_vivienda' => 'vivienda',
        'id_criterio' => 'criterio',
        'id_opcion'   => 'opcion'
    ];

    public $listaAtributos = [
        'id_vivienda',
        'id_criterio',
        'id_opcion',
        'activo_vivienda_criterio_opcion'
    ];

    public $valores = [
        'id_vivienda'                     => null,
        'id_criterio'                     => null,
        'id_opcion'                       => null,
        'activo_vivienda_criterio_opcion' => null
    ];

    // Setters
    public function setIdVivienda($value)                    { $this->valores['id_vivienda']                     = $value; }
    public function setIdCriterio($value)                    { $this->valores['id_criterio']                     = $value; }
    public function setIdOpcion($value)                      { $this->valores['id_opcion']                       = $value; }
    public function setActivoViviendaCriterioOpcion($value)  { $this->valores['activo_vivienda_criterio_opcion'] = $value; }

    // Getters
    public function getIdVivienda()                    { return $this->valores['id_vivienda']; }
    public function getIdCriterio()                    { return $this->valores['id_criterio']; }
    public function getIdOpcion()                      { return $this->valores['id_opcion']; }
    public function getActivoViviendaCriterioOpcion()  { return $this->valores['activo_vivienda_criterio_opcion']; }
}

?>