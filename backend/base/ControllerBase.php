<?php

abstract class ControllerBase{

	function __construct(){

		$temp = 'app/'.get_class($this).'/'.get_class($this).'_SERVICE.php';
		$clase = get_class($this).'_SERVICE';
		//include_once $temp;
		
		$existefichero = comprobar_si_existe_fichero($temp);
		if ($existefichero['ok']){
			
		}
		else{
			echo 'no hay fichero service';
			exit();
		}
		
		$existeclase = comprobar_si_existe_clase($clase);
		if ($existeclase['ok']){}
		else{
			echo 'no hay clase service';
			exit();
		}

		$_POST = $this->sanitize($_POST);
		//var_dump($_POST);
		
		$service = new $clase;
		$respuesta = $service->ejecutar();
		
		$this->devolverRest($respuesta);

	}

	function enviarAVista($vista, $data='', $controlador, $action){
		$data = array('vista'=>$vista, 'data'=>$data, 'controlador'=>$controlador, 'action'=>$action);
		$_SESSION['data'] = $data;
		new PorDefecto;
	}

	function devolverRest($respuesta){
	    
	    header('Content-type: application/json;charset=utf-8');
		echo(json_encode($respuesta));
		exit();

	}

	const FILTERS = [
		'string' => FILTER_SANITIZE_STRING,
		'string[]' => [
			'filter' => FILTER_SANITIZE_STRING,
			'flags' => FILTER_REQUIRE_ARRAY
		],
		'email' => FILTER_SANITIZE_EMAIL,
		'int' => [
			'filter' => FILTER_SANITIZE_NUMBER_INT,
			'flags' => FILTER_REQUIRE_SCALAR
		],
		'int[]' => [
			'filter' => FILTER_SANITIZE_NUMBER_INT,
			'flags' => FILTER_REQUIRE_ARRAY
		],
		'float' => [
			'filter' => FILTER_SANITIZE_NUMBER_FLOAT,
			'flags' => FILTER_FLAG_ALLOW_FRACTION
		],
		'float[]' => [
			'filter' => FILTER_SANITIZE_NUMBER_FLOAT,
			'flags' => FILTER_REQUIRE_ARRAY
		],
		'url' => FILTER_SANITIZE_URL,
	];

	/**
	* Sanitize the inputs based on the rules an optionally trim the string
	* @param array $inputs
	* @param array $fields
	* @param int $default_filter FILTER_SANITIZE_STRING
	* @param array $filters FILTERS
	* @param bool $trim
	* @return array
	*/

	function sanitize(array $inputs)
	{
		
		$default_filter = FILTER_SANITIZE_SPECIAL_CHARS;
		
		$data = filter_var_array($inputs, $default_filter);
		
		return $data;
		
	}

	/*

		EJEMPLO SANITIZE DE DATOS
		
			const FILTERS = [
			'string' => FILTER_SANITIZE_STRING,
			'string[]' => [
				'filter' => FILTER_SANITIZE_STRING,
				'flags' => FILTER_REQUIRE_ARRAY
			],
			'email' => FILTER_SANITIZE_EMAIL,
			'int' => [
				'filter' => FILTER_SANITIZE_NUMBER_INT,
				'flags' => FILTER_REQUIRE_SCALAR
			],
			'int[]' => [
				'filter' => FILTER_SANITIZE_NUMBER_INT,
				'flags' => FILTER_REQUIRE_ARRAY
			],
			'float' => [
				'filter' => FILTER_SANITIZE_NUMBER_FLOAT,
				'flags' => FILTER_FLAG_ALLOW_FRACTION
			],
			'float[]' => [
				'filter' => FILTER_SANITIZE_NUMBER_FLOAT,
				'flags' => FILTER_REQUIRE_ARRAY
			],
			'url' => FILTER_SANITIZE_URL,
		];

		
		// Recursively trim strings in an array
		// @param array $items
		// @return array
		
		function array_trim(array $items): array
		{
			return array_map(function ($item) {
				if (is_string($item)) {
					return trim($item);
				} elseif (is_array($item)) {
					return array_trim($item);
				} else
					return $item;
			}, $items);
		}

		
		// Sanitize the inputs based on the rules an optionally trim the string
		// @param array $inputs
		// @param array $fields
		// @param int $default_filter FILTER_SANITIZE_STRING
		// @param array $filters FILTERS
		// @param bool $trim
		// @return array
		
		function sanitize(array $inputs, array $fields = [], int $default_filter = FILTER_SANITIZE_STRING, array $filters = FILTERS, bool $trim = true): array
		{
			if ($fields) {
				$options = array_map(fn($field) => $filters[$field], $fields);
				$data = filter_var_array($inputs, $options);
			} else {
				$data = filter_var_array($inputs, $default_filter);
			}

			return $trim ? array_trim($data) : $data;
		}

		$fields = [
			'name' => 'string',
			'email' => 'email',
			'age' => 'int',
			'weight' => 'float',
			'github' => 'url',
			'hobbies' => 'string[]'
		];

		$data = sanitize($inputs,$fields);

	*/
	
}

?>
