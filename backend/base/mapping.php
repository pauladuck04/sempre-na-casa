<?php

include_once './base/MappingBase.php';

class mapping extends MappingBase{

	var $tabla;

	function __construct($tabla){
		$this->tabla = $tabla;
	}

	function lanzarquery($query){

		$this->query = $query;
		$this->execute_single_query();
		return $this->feedback;

	}

	function lanzarqueryconresults($query){

		$this->query = $query;
		$this->get_results_from_query();
		return $this->feedback;

	}

	function construirCondicionesWhereLIKE($valores){

		$cadena = '';
		$primero = true;

		foreach ($valores as $key => $value){

			if ($primero){
				$primero = false;
			}
			else{
				$cadena = $cadena . ' AND ';
			}

			$cadena = $cadena . "(" . $key . " LIKE " . "'%". $value . "%')";

		}

		return $cadena;
	}

	function construirCondicionesWhereEQUALS($valores){

		$cadena = '';
		$primero = true;

		$atributosnumericos = $this->formatonumericoatributos($this->tabla);

		foreach ($valores as $key => $value){

			if (strlen($value)!=0){

				if ($primero){
					$primero = false;
					$insertarand = '';
				}
				else{
					$insertarand = ' AND ';
					$cadena = $cadena . $insertarand;
				}

				if (empty($atributosnumericos)){
					$cadena = $cadena . "(" . $key . "=" . "'". $value . "')";
				}
				else{
					if (in_array($key, $atributosnumericos)){
						$cadena = $cadena . "(" . $key . "=" . $value . ")";
					}
					else{
						$cadena = $cadena . "(" . $key . "=" . "'". $value . "')";
					}
				}
			}
			
		}

		return $cadena;
	}

	function construirCondicionesWhereEQUALSclaves($clave, $valores){

		$cadena = '';
		$primero = true;

		$atributosnumericos = $this->formatonumericoatributos($this->tabla);

		foreach ($valores as $key => $value){

			if (in_array($key, $clave)){

				if ($primero){
					$primero = false;
				}
				else{
					if (strlen($value)!=0){
						$cadena = $cadena . ' AND ';
					}
				}

				if (strlen($value)!=0){
					if (empty($atributosnumericos)){
						$cadena = $cadena . "(" . $key . "=" . "'". $value . "')";
					}
					else{
						if (in_array($key, $atributosnumericos)){
							$cadena = $cadena . "(" . $key . "=" . $value . ")";
						}
						else{
							$cadena = $cadena . "(" . $key . "=" . "'". $value . "')";
						}
					}
				}
			}

		}

		return $cadena;
	}

	function formatonumericoatributos($tabla){


		$mapping1 = new mapping($tabla);

		$mapping1->query = "SHOW COLUMNS FROM " . $tabla;
		$res = $mapping1->get_results_from_query();
		if ($mapping1->feedback['ok']){

			$respuesta = $mapping1->feedback['resource'];

			$atributosnumericos = array();
			foreach ($respuesta as $atributo){
				$tiposnumericos = array('int', 'float');
				if (in_array(substr($atributo['Type'], 0, strpos($atributo['Type'], '(')), $tiposnumericos)){
					array_push($atributosnumericos, $atributo['Field']); //creo array con los atributos que son numericos
				}
			}
			return $atributosnumericos;
		}
		else{
			return $res;
		}


	}

	// Columnas DATE/DATETIME/TIMESTAMP de $tabla: un valor vacío ('') en una de estas columnas
	// no puede insertarse/actualizarse tal cual -- MySQL en modo estricto lo rechaza con
	// "Incorrect datetime value" en vez de tratarlo como "sin fecha". Se usa en ADD()/EDIT()
	// para mandar NULL (sin comillas) en su lugar cuando el campo es opcional y viene vacío
	// (p.ej. fecha_fin de una convivencia sin fecha de fin todavía).
	function formatofechaatributos($tabla){

		$mapping1 = new mapping($tabla);

		$mapping1->query = "SHOW COLUMNS FROM " . $tabla;
		$res = $mapping1->get_results_from_query();
		if ($mapping1->feedback['ok']){

			$respuesta = $mapping1->feedback['resource'];

			$atributosfecha = array();
			$tiposfecha = array('date', 'datetime', 'timestamp');
			foreach ($respuesta as $atributo){
				$parentesis = strpos($atributo['Type'], '(');
				$tipobase = $parentesis !== false ? substr($atributo['Type'], 0, $parentesis) : $atributo['Type'];
				if (in_array($tipobase, $tiposfecha)){
					array_push($atributosfecha, $atributo['Field']);
				}
			}
			return $atributosfecha;
		}
		else{
			return $res;
		}

	}


	function buscarforaneas($tabla){

		$mapping1 = new mapping($tabla);
		$respuesta = $mapping1->SEARCH($tabla,'','','nulo','nulo','');
		return $respuesta;

	}

	function incluirforaneas($principal=null, $tabla, $clave){

		$filasforaneas = $this->buscarforaneas($tabla); //obtener filas de tabla principal de las claves foraneas de esta entidad

		$auxiliar = array();

		if (empty($principal) || ($principal === null) || ($principal== '')) {}
		else{

			foreach ($principal as $fila) { //recorro array recordset fila a fila

				if ($filasforaneas['code'] == 'RECORDSET_VACIO') {} //sino no hay foraneas por fallo en la integridad de los datos
				else{

					foreach ($filasforaneas['resource'] as $filasforanea) { //recorro array foraneas fila a fila

						if ($fila[$clave] == $filasforanea[$clave]){ // si el valor de la clave en la fila del recordset es igual a la clave del array de foraneas

							$fila[$clave] = $filasforanea; // cambio el valor de la clave por el array de atriburos de la fila en la tabla foranea con esa clave

						}

					}

				}

				array_push($auxiliar, $fila); //almaceno la fila en el array de respuesta
			}

		}

		return $auxiliar;
	}


	function SEARCH($tabla, $atributos = null, $valores, $empieza, $filaspagina, $foraneas=null){


		$query = "SELECT * FROM ".$tabla;

		if (!empty($atributos)){

			$query = $query." WHERE (";

			$condiciones = $this->construirCondicionesWhereLIKE($valores);

			$query = $query . $condiciones;

			$query = $query . ')';

		}


		if (($empieza == 'nulo') and ($filaspagina == 'nulo')) {}
		else {

			$query = $query . ' LIMIT ' . $empieza . ',' . $filaspagina;

		}

		$this->query = $query;


		$this->get_results_from_query();

		if (empty($this->feedback['resource'])){}
		else{

			if (!empty($foraneas)){
				foreach ($foraneas as $key => $value) {
					$this->feedback['resource'] = $this->incluirforaneas($this->feedback['resource'], $value, $key);
				}
			}
		}

		return $this->feedback;


	}

	function COUNT($tabla){

		$this->query = "SELECT COUNT(*) FROM ". $tabla;

		$this->get_one_result_from_query();

		return $this->feedback;
	}

	function ADD($tabla, $atributos, $valores, $autoincrement){

		$query = "INSERT INTO ".$tabla. "(";

		$primero = true;
		foreach ($atributos as $atributo){
			
			if (!(in_array($atributo, $autoincrement))){
				
				if ($primero){
					$primero = false;
				}
				else{
					$query = $query . ',';
				}

				$query = $query . $atributo;

			}
		}

		$query = $query . ')  VALUES (';

		$atributosnumericos = $this->formatonumericoatributos($tabla); //obtengo atributos de show columns de la $tabla
		$atributosfecha = $this->formatofechaatributos($tabla);

		$primero = true;
		foreach ($atributos as $atributo){

			if (!(in_array($atributo, $autoincrement))){

				if ($primero){
					$primero = false;
				}
				else{
					$query = $query . ',';
				}

				if (in_array($atributo, $atributosnumericos)){//numerico
					$query = $query . $valores[$atributo];
				}
				elseif (in_array($atributo, $atributosfecha) && $valores[$atributo] === ''){ //fecha opcional sin valor
					$query = $query . 'NULL';
				}
				else{
					$query = $query . '\''. $valores[$atributo] . '\'';
				}
			}
		}

		$query = $query . ')';

		$this->query = $query;

		$this->execute_single_query();

		return $this->feedback;

	}

	function DELETE($tabla, $clave, $valor){

		$this->query = "DELETE FROM " . $tabla . " WHERE (";

		$cadena = $this->construirCondicionesWhereEQUALSclaves($clave,$valor);

		$this->query = $this->query . $cadena . ")";

		$this->execute_single_query();

		return $this->feedback;

	}

	function EDIT($tabla, $atributos, $valores, $clave){

		$atributosnumericos = $this->formatonumericoatributos($this->tabla);
		$atributosfecha = $this->formatofechaatributos($this->tabla);

		$this->query = "UPDATE " . $tabla . " SET ";

		$cadena = '';

		$primero = true;
		foreach ($valores as $key => $value) {
			if (!(in_array($key, $clave))){
				if ($primero){
					$primero = false;
				}
				else{
					$cadena .= ', ';
				}
				if (in_array($key, $atributosnumericos)){
					$cadena .= $key . ' = '.$value;
				}
				elseif (in_array($key, $atributosfecha) && $value === ''){ //fecha opcional sin valor
					$cadena .= $key . ' = NULL';
				}
				else{
					$cadena .= $key . ' = '.'\''.$value.'\'';
				}
			}
		}

		$this->query .= $cadena;
		$this->query .= ' WHERE (';

		// construir condicion claves

		$cadena = '';
		$primero = true;
		foreach ($valores as $key => $value) {
			if (in_array($key, $clave)){
				if ($primero){
					$primero = false;
				}
				else{
					$cadena .= ' AND ';
				}
				if (in_array($key, $atributosnumericos)){
					$cadena .= $key. ' = '.$value;
				}
				else{
					$cadena .= $key. ' = '.'\''.$value.'\'';
				}
			}
		}

		$this->query .= $cadena;
		$this->query .= ')';

		$this->execute_single_query();

		return $this->feedback;

	}

	//busca sobre los ids de la tabla

	function SEARCH_BY($tabla, $clave, $valores, $foraneas=null){


		$query = "SELECT * FROM ".$tabla;

		if (!empty($valores)){

			$query = $query." WHERE (";

			$condiciones = $this->construirCondicionesWhereEQUALS($valores);

			$query = $query . $condiciones;

			$query = $query . ')';

		}

		$this->query = $query;

		$this->get_results_from_query();


		if (!empty($foraneas)){
			foreach ($foraneas as $key => $value) {

				$aux = 	$this->feedback['resource'];
				if (is_array($aux)){
					$this->feedback['resource'] = $this->incluirforaneas($aux, $value, $key);
				}

			}
		}

		return $this->feedback;

	}


}






?>
