<?php

include_once './Base/appServiceBase.php';

class AUTH_SERVICE extends appServiceBase{

	public $modelo;

	function __construct(){
		parent::__construct();
	}

	function inicializarRest(){

		$this->normalizarAtributos();

		$this->listaAtributos = array(
			'id_usuario','dni','mail','nombre_usuario','apellidos','password',
			'telefono','fecha_alta_usuario','fecha_modificacion_usuario','activo_usuario','id_rol'
		);

		$this->listaAtributosSelect = array(
			'id_usuario','dni','mail','nombre_usuario','apellidos','telefono',
			'fecha_alta_usuario','fecha_modificacion_usuario','activo_usuario','id_rol'
		);

		$this->notnull = array(
			'LOGIN' => array('mail', 'password'),
			'DESCONECTAR' => array('mail'),
			'CAMBIAR_CONTRASENA' => array('mail', 'password_actual', 'password'),
			'CAMBIAR_PASSWORD' => array('id_usuario', 'password'),
			'REGISTRAR' => array('dni','mail','nombre_usuario','apellidos','password','telefono','id_rol')
		);

		$this->modelo = $this->crearModelOne('usuario');
	}

	function normalizarAtributos(){

		if (isset($_POST['email']) && !isset($_POST['mail'])){
			$_POST['mail'] = $_POST['email'];
		}

		if (isset($_POST['nombre']) && !isset($_POST['nombre_usuario'])){
			$_POST['nombre_usuario'] = $_POST['nombre'];
		}

		if (isset($_POST['contrasena']) && !isset($_POST['password'])){
			$_POST['password'] = $_POST['contrasena'];
		}

		if (isset($_POST['usuario']) && !isset($_POST['mail'])){
			$_POST['mail'] = $_POST['usuario'];
		}

if ((!isset($_POST['id_rol']) || $_POST['id_rol'] === '') && isset($_POST['rol'])){
		$_POST['id_rol'] = $this->mapRolToId($_POST['rol']);
	}
}

function mapRolToId($rol){
	if (is_numeric($rol)){
		return intval($rol);
	}

	$rolLower = mb_strtolower(trim($rol), 'UTF-8');
	include_once './Base/mapping.php';
	$mapRol = new mapping('rol');
	$query = "SELECT id_rol, nombre_rol FROM rol";
	$resRole = $mapRol->lanzarqueryconresults($query);

	if ($resRole['ok'] && !empty($resRole['resource'])) {
		foreach ($resRole['resource'] as $row) {
			if (mb_strtolower(trim($row['nombre_rol']), 'UTF-8') === $rolLower) {
				return intval($row['id_rol']);
			}
		}
	}

	if ($rolLower === 'anfitrion' || $rolLower === 'host') {
		return 3;
	}

	if ($rolLower === 'huesped' || $rolLower === 'huésped' || $rolLower === 'guest') {
		return 4;
	}

	return 4;
	}

	function cargarTokenCabecera(){

		$tokenFront = '';

		if (function_exists('apache_request_headers')){
			foreach(apache_request_headers() as $header => $value){
				if(strtolower($header) == 'authorization'){
					$tokenFront = $value;
				}
			}
		}

		return $tokenFront;
	}

	function LOGIN(){

		$mail = $_POST['mail'];
		$password = $_POST['password'];
		$postOriginal = $_POST;

		include_once './app/usuario/usuario_SERVICE.php';
		$_POST = array(
			'controlador' => 'usuario',
			'action' => 'SEARCH_BY',
			'mail' => $mail
		);

		$usuario = new usuario_SERVICE;
		$respuesta = $usuario->ejecutar();
		$_POST = $postOriginal;

		if (empty($respuesta['resource'])){
			return array(
				'ok' => false,
				'code' => 'USUARIO_LOGIN_KO',
				'resource' => array('mail' => $mail)
			);
		}

		$fila = $respuesta['resource'][0];

		if ($fila['password'] != md5($password)){
			return array(
				'ok' => false,
				'code' => 'USUARIO_PASS_KO',
				'resource' => array('mail' => $mail)
			);
		}

		if (isset($fila['activo_usuario']) && $fila['activo_usuario'] != 1){
			return array(
				'ok' => false,
				'code' => 'USUARIO_INACTIVO_KO',
				'resource' => array('mail' => $mail)
			);
		}

		// Obtener nombre del rol
		$nombreRol = '';
		include_once './Base/mapping.php';
		$mapRol = new mapping('rol');
		$resRol = $mapRol->lanzarqueryconresults(
			"SELECT nombre_rol FROM rol WHERE id_rol = " . intval($fila['id_rol']) . " LIMIT 1"
		);
		if ($resRol['ok'] && !empty($resRol['resource'])) {
			$nombreRol = $resRol['resource'][0]['nombre_rol'];
		}
		if (empty($nombreRol)) {
			if (intval($fila['id_rol']) === 4) {
				$nombreRol = 'anfitrion';
			} elseif (intval($fila['id_rol']) === 5) {
				$nombreRol = 'huesped';
			}
		}

		include_once './Base/JWT/token.php';
		$datosUsuario = array(
			'id_usuario' => $fila['id_usuario'],
			'mail' => $fila['mail'],
			'nombre_usuario' => $fila['nombre_usuario'],
			'apellidos' => $fila['apellidos'],
			'id_rol' => $fila['id_rol']
		);
		$token = MiToken::creaToken($fila['mail'], '', $datosUsuario);

		return array(
			'ok' => true,
			'code' => 'LOGIN_OK',
			'resource' => array(
				'token' => $token,
				'usuario' => array(
					'id_usuario' => $fila['id_usuario'],
					'dni' => $fila['dni'],
					'mail' => $fila['mail'],
					'nombre_usuario' => $fila['nombre_usuario'],
					'apellidos' => $fila['apellidos'],
					'telefono' => $fila['telefono'],
					'id_rol' => $fila['id_rol'],
					'nombre_rol' => $nombreRol
				)
			)
		);
	}

	function REGISTRAR(){

		if (!isset($_POST['id_rol']) || $_POST['id_rol'] == ''){
			$_POST['id_rol'] = 5;
		}

		$postOriginal = $_POST;

		include_once './app/usuario/usuario_SERVICE.php';
		$_POST['controlador'] = 'usuario';
		$_POST['action'] = 'ADD';

		$usuario = new usuario_SERVICE;
		$res = $usuario->ejecutar();
		$_POST = $postOriginal;

		if ($res['ok'] === true){
			$res['code'] = 'REGISTRAR_OK';
		}

		return $res;
	}

	function CAMBIAR_CONTRASENA(){
		$mail           = addslashes($_POST['mail']);
		$passwordActual = $_POST['password_actual'];

		include_once './Base/mapping.php';
		$map = new mapping('usuario');

		$res = $map->lanzarqueryconresults(
			"SELECT id_usuario, password FROM usuario WHERE mail = '{$mail}' LIMIT 1"
		);

		if (!$res['ok'] || empty($res['resource'])) {
			return array('ok' => false, 'code' => 'USUARIO_NO_ENCONTRADO_KO');
		}

		if ($res['resource'][0]['password'] !== md5($passwordActual)) {
			return array('ok' => false, 'code' => 'PASSWORD_ACTUAL_INCORRECTA_KO');
		}

		$idUsuario = intval($res['resource'][0]['id_usuario']);
		$nuevaHash = md5($_POST['password']);
		$res2 = $map->lanzarquery(
			"UPDATE usuario SET password = '{$nuevaHash}', fecha_modificacion_usuario = '" . date('Y-m-d H:i:s') . "' WHERE id_usuario = {$idUsuario}"
		);

		if ($res2['ok']) {
			return array('ok' => true, 'code' => 'CAMBIAR_PASSWORD_OK');
		}
		return array('ok' => false, 'code' => 'CAMBIAR_PASSWORD_KO');
	}

	function CAMBIAR_PASSWORD(){

		if (isset($_POST['dni']) && $_POST['dni'] == '11111111H'){
			return array(
				'ok' => false,
				'code' => 'admin_no_se_puede_modificar_KO',
				'resource' => ''
			);
		}

		$idUsuario = intval($_POST['id_usuario']);
		$password = md5($_POST['password']);

		include_once './Base/mapping.php';
		$map = new mapping('usuario');
		$res = $map->lanzarquery("UPDATE usuario SET password = '".$password."', fecha_modificacion_usuario = '".date('Y-m-d H:i:s')."' WHERE id_usuario = ".$idUsuario);

		if ($res['ok'] === true){
			$res['code'] = 'CAMBIAR_PASSWORD_OK';
		}
		else{
			$res['code'] = 'CAMBIAR_PASSWORD_KO';
		}

		return $res;
	}

	function validar_token(){

		include_once './Base/JWT/token.php';
		$current_token = $this->cargarTokenCabecera();
		$resultado = MiToken::devuelveToken($current_token);

		return $resultado->data;
	}
}

?>
