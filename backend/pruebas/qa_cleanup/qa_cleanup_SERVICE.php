<?php

include_once './base/appServiceBase.php';

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
