<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

// Los errores se registran en el servidor: no deben mezclarse con las
// respuestas JSON que consume el frontend.
error_reporting(E_ALL);
ini_set('display_errors', '0');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

$basePath = __DIR__;
$configPath = $basePath . '/bd/DBCredentials.php';

if (!is_file($configPath)) {
    http_response_code(500);
    echo json_encode(array(
        'ok' => false,
        'code' => 'CONFIGURACION_NO_ENCONTRADA_KO',
        'resource' => 'Falta bd/DBCredentials.php'
    ));
    exit();
}

include_once $configPath;
include_once $basePath . '/comun/literalesbase.php';
include_once $basePath . '/comun/funcionesGenerales.php';
include_once $basePath . '/comun/logHelper.php';


if (isset($_POST['managementCore'])){
	if ($_POST['managementCore']=='crear'){
		include_once './core/crearGestionEntidad.php';
		$managementCore = new managementCore();
		$respuesta = $managementCore->ejecutarmanagementCore();
		header('Content-type: application/json');
		echo(json_encode($respuesta));
		exit();
	}
	else{
		 
	}
}

/*

// peticion con upload

if ((isset($_POST['formulario'])) || (isset($_POST['upload']))){ 
	
	if (isset($_POST['formulario'])){

		$pares = explode("&", $_POST['formulario']);

		$lista = array();

		foreach ($pares as $par) {

			$duo = explode('=', $par);	
			$lista[$duo[0]] = $duo[1];
			
		}

		$_POST = $lista;
	}

	if (count($_FILES)>0) {
		$_FILES = $_FILES['upload'];
	}
	else{
		unset($_FILES);
	}
}
else{ //peticion sin upload
	
	// peticion invalida

	if (!isset($_POST['controlador']) or !($_POST['action'])){
		header('Content-type: application/json');
		$resp = array('ok' => 'false', 'code' => 'peticion_invalida','resource' => $_POST);
		echo(json_encode($resp));
		exit();
}
}

*/


// control peticion valida

if (isset($_POST['controlador'])){
	$rest = $_POST['controlador'];
/*	if ($rest == 'funcionesesquema'){
		include './Comun/funcionesEsquema.php';
		funcionesesquema();
	}*/
}
else{
	$mensaje = '';
	$respuesta = array('ok' => false, 'code' => 'controlador_vacio', 'resource' => $mensaje);
	header('Content-type: application/json');
	echo(json_encode($respuesta));
	exit();
}

if (isset($_POST['action'])){
	if ($_POST['action']==''){
		$mensaje = '';
		$respuesta = array('ok' => false, 'code' => 'accion_vacia', 'resource' => $mensaje);
		header('Content-type: application/json');
		echo(json_encode($respuesta));
		exit();
	}
	else{
		$action = $_POST['action'];
	}
}
else{
	$mensaje = '';
	$respuesta = array('ok' => false, 'code' => 'accion_vacia', 'resource' => $mensaje);
	header('Content-type: application/json');
	echo(json_encode($respuesta));
	exit();
}

$fichero = './app/'.$rest.'/'.$rest.'_CONTROLLER.php';
$res = comprobar_si_existe_fichero($fichero);
if ($res['ok']){
	$res = comprobar_si_existe_clase($rest);
	if ($res['ok']){
		$nombrerest = new $rest;
	}
	else{
		$mensaje = 'No existe el controlador indicado : '.$rest;
		$respuesta = array('ok' => false, 'code' => 'controlador_invalido_KO', 'resource' => $mensaje);
		header('Content-type: application/json');
		echo(json_encode($respuesta));
		exit();
	}

}else{
	$mensaje = 'No existe la definición del controlador indicada : '.$fichero;
	$respuesta = array('ok' => false, 'code' => 'definicion_controlador_invalida_KO', 'resource' => $mensaje);
	header('Content-type: application/json');
	echo(json_encode($respuesta));
	exit();
}



?>
