<?php

include_once './base/ModelBase.php';

class vivienda_MODEL extends ModelBase {

    public $tabla = 'vivienda';
    public $autoincrement = true;
    public $clave = ['id_vivienda'];
    public $foraneas = [
        'id_anfitrion' => 'usuario'
    ];

    public $listaAtributos = [
        'id_vivienda',
        'descripcion',
        'plazas_libres',
        'plazas_totales',
        'direccion',
        'ciudad',
        'fecha_alta_vivienda',
        'id_anfitrion',
        'activo_vivienda'
    ];

    public $valores = [
        'id_vivienda'         => null,
        'descripcion'         => null,
        'plazas_libres'       => null,
        'plazas_totales'      => null,
        'direccion'           => null,
        'ciudad'              => null,
        'fecha_alta_vivienda' => null,
        'id_anfitrion'        => null,
        'activo_vivienda'     => null
    ];

    // Setters
    public function setIdVivienda($value)        { $this->valores['id_vivienda']         = $value; }
    public function setDescripcion($value)       { $this->valores['descripcion']         = $value; }
    public function setPlazasLibres($value)      { $this->valores['plazas_libres']       = $value; }
    public function setPlazasTotales($value)     { $this->valores['plazas_totales']      = $value; }
    public function setDireccion($value)         { $this->valores['direccion']           = $value; }
    public function setCiudad($value)            { $this->valores['ciudad']              = $value; }
    public function setFechaAltaVivienda($value) { $this->valores['fecha_alta_vivienda'] = $value; }
    public function setIdAnfitrion($value)       { $this->valores['id_anfitrion']        = $value; }
    public function setActivoVivienda($value)    { $this->valores['activo_vivienda']     = $value; }

    // Getters
    public function getIdVivienda()        { return $this->valores['id_vivienda']; }
    public function getDescripcion()       { return $this->valores['descripcion']; }
    public function getPlazasLibres()      { return $this->valores['plazas_libres']; }
    public function getPlazasTotales()     { return $this->valores['plazas_totales']; }
    public function getDireccion()         { return $this->valores['direccion']; }
    public function getCiudad()            { return $this->valores['ciudad']; }
    public function getFechaAltaVivienda() { return $this->valores['fecha_alta_vivienda']; }
    public function getIdAnfitrion()       { return $this->valores['id_anfitrion']; }
    public function getActivoVivienda()    { return $this->valores['activo_vivienda']; }
}

?>