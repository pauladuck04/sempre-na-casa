<?php
include_once './Base/ModelBase.php';

class opcion_MODEL extends ModelBase{

    function __construct(){

        $this->tabla = 'opcion';
        $this->clave = array('id_opcion');
        $this->foraneas = array('menu'=>'id_menu');
        $this->autoincrement = array('id_opcion');
    }

    
    public $listaAtributos = [
        'id_opcion',
        'id_criterio',
        'nombre_opcion',
        'valor',
        'fecha_alta_opcion',
        'activo_opcion'
    ];

    public $valores = [
        'id_opcion'        => null,
        'id_criterio'      => null,
        'nombre_opcion'    => null,
        'valor'            => null,
        'fecha_alta_opcion'=> null,
        'activo_opcion'    => null
    ];

     // Setters
    public function setIdOpcion($value)         { $this->valores['id_opcion']         = $value; }
    public function setIdCriterio($value)       { $this->valores['id_criterio']        = $value; }
    public function setNombreOpcion($value)     { $this->valores['nombre_opcion']      = $value; }
    public function setValor($value)            { $this->valores['valor']              = $value; }
    public function setFechaAltaOpcion($value)  { $this->valores['fecha_alta_opcion']  = $value; }
    public function setActivoOpcion($value)     { $this->valores['activo_opcion']      = $value; }
 
    // Getters
    public function getIdOpcion()         { return $this->valores['id_opcion']; }
    public function getIdCriterio()       { return $this->valores['id_criterio']; }
    public function getNombreOpcion()     { return $this->valores['nombre_opcion']; }
    public function getValor()            { return $this->valores['valor']; }
    public function getFechaAltaOpcion()  { return $this->valores['fecha_alta_opcion']; }
    public function getActivoOpcion()     { return $this->valores['activo_opcion']; }

}
?>