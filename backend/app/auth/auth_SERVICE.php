<?php

include_once './base/appServiceBase.php';

class auth_SERVICE extends appServiceBase{

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
			'CAMBIAR_CONTRASENA' => array('mail', 'password_actual', 'password'),
			'REGISTRAR' => array('dni','mail','nombre_usuario','apellidos','password','telefono','id_rol'),
			'RECUPERAR_PASSWORD' => array('mail'),
			'RESTABLECER_PASSWORD' => array('token', 'password')
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
	include_once './base/mapping.php';
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
		include_once './base/mapping.php';
		$mapRol = new mapping('rol');
		$resRol = $mapRol->lanzarqueryconresults(
			"SELECT nombre_rol FROM rol WHERE id_rol = " . intval($fila['id_rol']) . " LIMIT 1"
		);
		if ($resRol['ok'] && !empty($resRol['resource'])) {
			$nombreRol = $resRol['resource'][0]['nombre_rol'];
		}
		if (empty($nombreRol)) {
			if (intval($fila['id_rol']) === 3) {
				$nombreRol = 'anfitrion';
			} elseif (intval($fila['id_rol']) === 4) {
				$nombreRol = 'huesped';
			}
		}

		include_once './base/JWT/token.php';
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
			$_POST['id_rol'] = 4; // huesped por defecto
		}

		include_once './base/mapping.php';
		$map = new mapping('usuario');
		$mail = addslashes($_POST['mail']);
		$dni  = addslashes($_POST['dni']);
		$existente = $map->lanzarqueryconresults(
			"SELECT id_usuario FROM usuario WHERE mail = '{$mail}' OR dni = '{$dni}' LIMIT 1"
		);
		if ($existente['ok'] && !empty($existente['resource'])){
			return array('ok' => false, 'code' => 'USUARIO_YA_EXISTE_KO');
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

		include_once './base/mapping.php';
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

	function RECUPERAR_PASSWORD(){
		$mail = addslashes(trim($_POST['mail']));

		include_once './base/mapping.php';
		$map = new mapping('usuario');

		$res = $map->lanzarqueryconresults(
			"SELECT id_usuario, password FROM usuario WHERE mail = '{$mail}' LIMIT 1"
		);
		if (!$res['ok'] || empty($res['resource'])) {
			return array('ok' => false, 'code' => 'USUARIO_NO_ENCONTRADO_KO');
		}

		$fila = $res['resource'][0];

		include_once './base/JWT/token.php';
		$datosToken = array(
			'purpose'    => 'reset_password',
			'id_usuario' => intval($fila['id_usuario']),
			'pwd_fp'     => $this->huellaPassword($fila['password'])
		);
		$token = MiToken::creaToken($mail, '', $datosToken);

		$enlace = rtrim(FRONTEND_URL, '/') . '/restablecer-password.html?token=' . urlencode($token);

		if (!$this->enviarCorreoRecuperacion($mail, $enlace)) {
			return array('ok' => false, 'code' => 'ENVIO_EMAIL_KO');
		}

		return array('ok' => true, 'code' => 'RECUPERAR_PASSWORD_OK');
	}

	function enviarCorreoRecuperacion($destinatario, $enlace){
		$asunto = 'Recupera tu contraseña - Sempre na Casa';

		$cuerpo  = '<p>Hola,</p>';
		$cuerpo .= '<p>Hemos recibido una solicitud para restablecer tu contraseña en Sempre na Casa.</p>';
		$cuerpo .= '<p><a href="' . htmlspecialchars($enlace) . '">Restablecer mi contraseña</a></p>';
		$cuerpo .= '<p>Si tú no has solicitado esto, puedes ignorar este correo. El enlace caduca en 2 horas.</p>';

		include_once './base/mapping.php';
		$map = new mapping('email_pendiente');

		$destinatarioEsc = addslashes($destinatario);
		$asuntoEsc        = addslashes($asunto);
		$cuerpoEsc        = addslashes($cuerpo);
		$fecha            = date('Y-m-d H:i:s');

		$res = $map->lanzarquery(
			"INSERT INTO email_pendiente (destinatario, asunto, cuerpo, fecha_creacion, enviado) " .
			"VALUES ('{$destinatarioEsc}', '{$asuntoEsc}', '{$cuerpoEsc}', '{$fecha}', 0)"
		);

		return $res['ok'];
	}

	function huellaPassword($passwordHashActual){
		include_once './base/JWT/token.php';
		return substr(hash('sha256', $passwordHashActual . SECRET_KEY), 0, 16);
	}

	function RESTABLECER_PASSWORD(){
		include_once './base/JWT/token.php';

		try {
			$payload = MiToken::devuelveToken($_POST['token']);
		} catch (Exception $e) {
			$codigo = ($e->getMessage() === 'TOKEN_CADUCADO') ? 'TOKEN_EXPIRADO_KO' : 'TOKEN_INVALIDO_KO';
			return array('ok' => false, 'code' => $codigo);
		}

		if (empty($payload->data->purpose) || $payload->data->purpose !== 'reset_password') {
			return array('ok' => false, 'code' => 'TOKEN_INVALIDO_KO');
		}

		$idUsuario = intval($payload->data->id_usuario);

		include_once './base/mapping.php';
		$map = new mapping('usuario');

		$res = $map->lanzarqueryconresults(
			"SELECT password FROM usuario WHERE id_usuario = {$idUsuario} LIMIT 1"
		);
		if (!$res['ok'] || empty($res['resource'])) {
			return array('ok' => false, 'code' => 'TOKEN_INVALIDO_KO');
		}

		$huellaActual = $this->huellaPassword($res['resource'][0]['password']);
		if (!hash_equals($huellaActual, (string) $payload->data->pwd_fp)) {
			return array('ok' => false, 'code' => 'TOKEN_EXPIRADO_KO');
		}

		$nuevaHash = md5($_POST['password']);
		$resUpdate = $map->lanzarquery(
			"UPDATE usuario SET password = '{$nuevaHash}', fecha_modificacion_usuario = '" . date('Y-m-d H:i:s') . "' WHERE id_usuario = {$idUsuario}"
		);

		if ($resUpdate['ok']) {
			return array('ok' => true, 'code' => 'RESTABLECER_PASSWORD_OK');
		}
		return array('ok' => false, 'code' => 'RESTABLECER_PASSWORD_KO');
	}

}

?>
