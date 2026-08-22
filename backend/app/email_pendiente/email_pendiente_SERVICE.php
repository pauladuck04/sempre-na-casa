<?php

include_once './base/appServiceBase.php';

// Cola de correos pendientes: el backend (AwardSpace) no puede enviar nada directamente (sin
// salida de red), asi que aqui solo se encolan y un proceso externo (GitHub Actions programado,
// con salida a internet normal) los recoge por LISTAR_PENDIENTES y los marca por MARCAR_ENVIADO.
// LISTAR_PENDIENTES y MARCAR_ENVIADO exigen 'secret' == RELAY_SECRET (bd/EmailCredentials.php):
// sin eso, cualquiera podria leer el contenido de los correos pendientes (incluidos enlaces de
// restablecimiento de contrasena) desde fuera.
class email_pendiente_SERVICE extends appServiceBase{

	public $modelo;

	function __construct(){
		parent::__construct();
	}

	function inicializarRest(){

		$this->listaAtributos = array(
			'id_email_pendiente', 'destinatario', 'asunto', 'cuerpo', 'fecha_creacion', 'enviado', 'fecha_envio'
		);

		$this->listaAtributosSelect = $this->listaAtributos;

		$this->notnull = array(
			'LISTAR_PENDIENTES' => array('secret'),
			'MARCAR_ENVIADO'    => array('secret', 'id_email_pendiente'),
		);

		$this->modelo = $this->crearModelOne('email_pendiente');
	}

	function autorizado(){
		return defined('RELAY_SECRET') && isset($_POST['secret']) && hash_equals(RELAY_SECRET, $_POST['secret']);
	}

	function LISTAR_PENDIENTES(){
		if (!$this->autorizado()) {
			return array('ok' => false, 'code' => 'NO_AUTORIZADO_KO');
		}

		$map = new mapping('email_pendiente');
		return $map->lanzarqueryconresults(
			"SELECT id_email_pendiente, destinatario, asunto, cuerpo " .
			"FROM email_pendiente WHERE enviado = 0 ORDER BY fecha_creacion ASC LIMIT 20"
		);
	}

	function MARCAR_ENVIADO(){
		if (!$this->autorizado()) {
			return array('ok' => false, 'code' => 'NO_AUTORIZADO_KO');
		}

		$id = intval($_POST['id_email_pendiente']);
		$map = new mapping('email_pendiente');
		$res = $map->lanzarquery(
			"UPDATE email_pendiente SET enviado = 1, fecha_envio = '" . date('Y-m-d H:i:s') . "' " .
			"WHERE id_email_pendiente = {$id}"
		);

		if ($res['ok']) {
			$res['code'] = 'MARCAR_ENVIADO_OK';
		}
		return $res;
	}

}
?>
