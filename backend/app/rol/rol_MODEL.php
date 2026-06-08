<?php
 
include_once './base/ModelBase.php';
 
class rol_MODEL extends ModelBase {
 
    protected $tabla = 'rol';
    protected $autoincrement = true;
    protected $clave = ['id_rol'];
    protected $foraneas = [];
 
    protected $listaAtributos = [
        'id_rol',
        'nombre_rol',
        'fecha_alta_rol',
        'activo_rol'
    ];
 
    protected $valores = [
        'id_rol'         => null,
        'nombre_rol'     => null,
        'fecha_alta_rol' => null,
        'activo_rol'     => null
    ];
 
    // Setters
    public function setIdRol($value)        { $this->valores['id_rol']         = $value; }
    public function setNombreRol($value)    { $this->valores['nombre_rol']      = $value; }
    public function setFechaAltaRol($value) { $this->valores['fecha_alta_rol']  = $value; }
    public function setActivoRol($value)    { $this->valores['activo_rol']      = $value; }
 
    // Getters
    public function getIdRol()        { return $this->valores['id_rol']; }
    public function getNombreRol()    { return $this->valores['nombre_rol']; }
    public function getFechaAltaRol() { return $this->valores['fecha_alta_rol']; }
    public function getActivoRol()    { return $this->valores['activo_rol']; }
}
 
?>
 
