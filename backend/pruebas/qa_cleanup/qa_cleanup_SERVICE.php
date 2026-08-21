<?php

include_once './base/appServiceBase.php';

// Controlador dedicado exclusivamente a borrar de verdad (DELETE fisico, no baja logica) las
// filas "QA..." que crean los runners de pruebas de caja negra (backend/pruebas/), para que no
// se acumulen indefinidamente en la base de datos real (no hay BD de pruebas separada).
//
// Por seguridad NO es un borrado fisico generico: solo opera sobre una lista fija de tablas
// (nunca elegida por quien llama, ver $tablasPermitidas) y, antes de borrar cada fila, comprueba
// que su campo identificativo empiece por "QA" -o que la fila padre a la que apunta lo cumpla, en
// las tablas de relacion sin campo de texto propio-. Si no lo cumple, se omite en vez de borrarse.
class qa_cleanup_SERVICE extends appServiceBase {

    // tabla => columna que debe empezar por 'QA', o null si hay que mirar la tabla padre
    private $tablasPermitidas = array(
        'usuario_criterio_opcion'  => null,
        'vivienda_criterio_opcion' => null,
        'usuario_vivienda'         => null,
        'opcion'   => 'nombre_opcion',
        'criterio' => 'nombre_criterio',
        'vivienda' => 'descripcion',
        'usuario'  => 'nombre_usuario',
        'rol'      => 'nombre_rol'
    );

    // tabla de relacion => de que fila padre depende y que columna de esa fila hay que comprobar
    private $padresRelacion = array(
        'usuario_vivienda'         => array('campoFk' => 'id_usuario',  'tablaPadre' => 'usuario',  'claveP' => 'id_usuario',  'columnaP' => 'nombre_usuario'),
        'usuario_criterio_opcion'  => array('campoFk' => 'id_usuario',  'tablaPadre' => 'usuario',  'claveP' => 'id_usuario',  'columnaP' => 'nombre_usuario'),
        'vivienda_criterio_opcion' => array('campoFk' => 'id_vivienda', 'tablaPadre' => 'vivienda', 'claveP' => 'id_vivienda', 'columnaP' => 'descripcion')
    );

    function inicializarRest() {
        $this->notnull = array('LIMPIAR' => array('filas'));
        $this->modelo = new stdClass();
        $this->modelo->tabla = 'qa_cleanup';
    }

    // $_POST['filas']: JSON de [{tabla, valores:{campo:valor,...}}, ...], en el orden en que se
    // deben borrar (quien llama es responsable de poner las tablas de relacion antes que sus
    // padres, para no dejar filas huerfanas si algo falla a mitad).
    function LIMPIAR() {
        $filas = json_decode($_POST['filas'], true);
        if (!is_array($filas)) {
            return array('ok' => false, 'code' => 'FILAS_INVALIDAS_KO');
        }

        include_once './base/mapping.php';
        $map = new mapping('');

        $borradas = array();
        $omitidas = array();

        foreach ($filas as $fila) {
            $tabla   = isset($fila['tabla']) ? $fila['tabla'] : '';
            $valores = (isset($fila['valores']) && is_array($fila['valores'])) ? $fila['valores'] : array();

            if (!array_key_exists($tabla, $this->tablasPermitidas)) {
                $omitidas[] = "{$tabla}: tabla no permitida";
                continue;
            }

            $where = $this->construirWhere($valores);
            if ($where === null) {
                $omitidas[] = "{$tabla}: sin condiciones validas";
                continue;
            }

            if (!$this->esFilaQA($map, $tabla, $valores)) {
                $omitidas[] = "{$tabla} ({$where}): no parece una fila QA, se omite por seguridad";
                continue;
            }

            $res = $map->lanzarquery("DELETE FROM `{$tabla}` WHERE {$where}");
            if ($res['ok']) {
                $borradas[] = "{$tabla} ({$where})";
            } else {
                $omitidas[] = "{$tabla} ({$where}): " . (isset($res['code']) ? $res['code'] : 'error');
            }
        }

        return array('ok' => true, 'code' => 'LIMPIEZA_QA_OK', 'resource' => array(
            'borradas' => $borradas,
            'omitidas' => $omitidas
        ));
    }

    // Solo nombres de columna simples (letras minusculas y guion bajo) y valores forzados a
    // entero: todas las claves de estas tablas son IDs numericos, asi que no hace falta admitir
    // nada mas y esto evita cualquier posibilidad de inyeccion via nombre de columna.
    private function construirWhere($valores) {
        $condiciones = array();
        foreach ($valores as $campo => $valor) {
            if (!preg_match('/^[a-z_]+$/', $campo)) continue;
            $condiciones[] = "`{$campo}` = " . intval($valor);
        }
        if (empty($condiciones)) return null;
        return implode(' AND ', $condiciones);
    }

    private function esFilaQA($map, $tabla, $valores) {
        $columna = $this->tablasPermitidas[$tabla];

        if ($columna !== null) {
            $where = $this->construirWhere($valores);
            if ($where === null) return false;
            $res = $map->lanzarqueryconresults("SELECT `{$columna}` FROM `{$tabla}` WHERE {$where} LIMIT 1");
            if (!$res['ok'] || empty($res['resource'])) return false;
            return strpos($res['resource'][0][$columna], 'QA') === 0;
        }

        if (!isset($this->padresRelacion[$tabla])) return false;
        $cfg = $this->padresRelacion[$tabla];
        if (!isset($valores[$cfg['campoFk']])) return false;

        $idPadre = intval($valores[$cfg['campoFk']]);
        $res = $map->lanzarqueryconresults(
            "SELECT `{$cfg['columnaP']}` FROM `{$cfg['tablaPadre']}` WHERE `{$cfg['claveP']}` = {$idPadre} LIMIT 1"
        );
        if (!$res['ok'] || empty($res['resource'])) return false;
        return strpos($res['resource'][0][$cfg['columnaP']], 'QA') === 0;
    }
}
?>
