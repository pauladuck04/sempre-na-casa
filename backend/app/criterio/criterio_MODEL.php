<?php

include_once './Base/ModelBase.php';

class criterio_MODEL extends ModelBase{
    protected $tabla = 'criterio';
    protected $autoincrement = true;
    protected $clave = ['id_criterio'];
    protected $foraneas = [];

    protected $listaAtributos = ['id_criterio', 'nombre_criterio', 'descripcion_criterio', 'peso_criterio'];

    protected $valores = [
        'id_criterio' => null,
        'nombre_criterio' => null,
        'descripcion_criterio' => null,
        'peso_criterio' => null
    ];
    

    // Setters
    public function setIdCriterio($value)         { $this->valores['id_criterio']         = $value; }
    public function setNombreCriterio($value)     { $this->valores['nombre_criterio']      = $value; }
    public function setFechaAltaCriterio($value)  { $this->valores['fecha_alta_criterio']  = $value; }
    public function setActivoCriterio($value)     { $this->valores['activo_criterio']      = $value; }
 
    // Getters
    public function getIdCriterio()         { return $this->valores['id_criterio']; }
    public function getNombreCriterio()     { return $this->valores['nombre_criterio']; }
    public function getFechaAltaCriterio()  { return $this->valores['fecha_alta_criterio']; }
    public function getActivoCriterio()     { return $this->valores['activo_criterio']; }
}

?>