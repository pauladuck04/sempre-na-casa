<?php

include_once './base/ModelBase.php';

class usuario_vivienda_MODEL extends ModelBase {

    protected $tabla = 'usuario_vivienda';
    protected $autoincrement = false; // Tabla relacional sin PK explícita definida
    protected $clave = ['id_usuario', 'id_vivienda'];
    protected $foraneas = [
        'id_usuario'  => 'usuario',
        'id_vivienda' => 'vivienda'
    ];

    protected $listaAtributos = [
        'id_usuario',
        'id_vivienda',
        'activo_usuario_vivienda'
    ];

    protected $valores = [
        'id_usuario'              => null,
        'id_vivienda'             => null,
        'activo_usuario_vivienda' => null
    ];

    // Setters
    public function setIdUsuario($value)             { $this->valores['id_usuario']              = $value; }
    public function setIdVivienda($value)            { $this->valores['id_vivienda']             = $value; }
    public function setActivoUsuarioVivienda($value) { $this->valores['activo_usuario_vivienda'] = $value; }

    // Getters
    public function getIdUsuario()             { return $this->valores['id_usuario']; }
    public function getIdVivienda()            { return $this->valores['id_vivienda']; }
    public function getActivoUsuarioVivienda() { return $this->valores['activo_usuario_vivienda']; }
}

?>