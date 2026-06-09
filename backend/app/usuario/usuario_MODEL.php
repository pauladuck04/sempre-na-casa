<?php

include_once './Base/ModelBase.php';

class usuario_MODEL extends ModelBase{


	public $tabla = 'usuario';
    public $autoincrement = [];
    public $clave = ['mail'];
    public $foraneas = [
        'id_rol' => 'rol'
    ];

	public $listaAtributos = [
        'dni',
        'mail',
        'nombre_usuario',
        'apellidos',
        'password',
        'telefono',
        'fecha_alta_usuario',
        'activo_usuario',
        'id_rol'
    ];

	public $valores = [
        'dni'                => null,
        'mail'               => null,
        'nombre_usuario'     => null,
        'apellidos'          => null,
        'password'           => null,
        'telefono'           => null,
        'fecha_alta_usuario' => null,
        'activo_usuario'     => null,
        'id_rol'             => null
    ];

	// Setters
    public function setDni($value)               { $this->valores['dni']                = $value; }
    public function setMail($value)              { $this->valores['mail']               = $value; }
    public function setNombreUsuario($value)     { $this->valores['nombre_usuario']     = $value; }
    public function setApellidos($value)         { $this->valores['apellidos']          = $value; }
    public function setPassword($value)          { $this->valores['password']           = $value; }
    public function setTelefono($value)          { $this->valores['telefono']           = $value; }
    public function setFechaAltaUsuario($value)  { $this->valores['fecha_alta_usuario'] = $value; }
    public function setActivoUsuario($value)     { $this->valores['activo_usuario']     = $value; }
    public function setIdRol($value)             { $this->valores['id_rol']             = $value; }
 
    // Getters
    public function getDni()               { return $this->valores['dni']; }
    public function getMail()              { return $this->valores['mail']; }
    public function getNombreUsuario()     { return $this->valores['nombre_usuario']; }
    public function getApellidos()         { return $this->valores['apellidos']; }
    public function getPassword()          { return $this->valores['password']; }
    public function getTelefono()          { return $this->valores['telefono']; }
    public function getFechaAltaUsuario()  { return $this->valores['fecha_alta_usuario']; }
    public function getActivoUsuario()     { return $this->valores['activo_usuario']; }
    public function getIdRol()             { return $this->valores['id_rol']; }
}

?>