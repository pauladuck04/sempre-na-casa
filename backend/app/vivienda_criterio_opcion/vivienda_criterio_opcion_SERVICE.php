<?php

include_once './base/appServiceBase.php';

class vivienda_criterio_opcion_SERVICE extends appServiceBase {

    public $modelo;

    function __construct() {
        parent::__construct();
    }

    function inicializarRest() {

        $this->listaAtributos = array(
            'id_vivienda', 'id_criterio', 'id_opcion', 'peso', 'restrictivo', 'id_opcion_excluyente', 'activo_vivienda_criterio_opcion'
        );

        $this->listaAtributosSelect = array(
            'id_vivienda', 'id_criterio', 'id_opcion', 'peso', 'restrictivo', 'id_opcion_excluyente', 'activo_vivienda_criterio_opcion'
        );

        $this->notnull = array(
            'ADD'          => array('id_vivienda', 'id_criterio', 'id_opcion'),
            'EDIT'         => array('id_vivienda', 'id_criterio', 'id_opcion'),
            'DELETE'       => array('id_vivienda', 'id_criterio', 'id_opcion'),
            'REACTIVAR'    => array('id_vivienda', 'id_criterio', 'id_opcion'),
            'getByVivienda' => array('id_vivienda'),
            'updateOpcion'  => array('id_vivienda', 'id_criterio', 'id_opcion'),
        );

        $this->modelo = $this->crearModelOne('vivienda_criterio_opcion');
    }

    function modificacion_atributos() {
        if (isset($_POST['action']) && $_POST['action'] == 'ADD') {
            $_POST['activo_vivienda_criterio_opcion']     = 1;
        }
        if (empty($_POST['peso'])) {
            $_POST['peso'] = 3;
        }
        if (!isset($_POST['restrictivo']) || $_POST['restrictivo'] === '') {
            $_POST['restrictivo'] = 0;
        }
        // id_opcion_excluyente es un INT nullable: 'NULL' (sin comillas) es literalmente la
        // palabra clave SQL, no la cadena vacia que rompería el INSERT/UPDATE en una columna
        // numerica (ver mapping::ADD/EDIT, que vuelca los atributos numericos sin comillas).
        if (empty($_POST['id_opcion_excluyente'])) {
            $_POST['id_opcion_excluyente'] = 'NULL';
        }
    }

    function DELETE() {
        return $this->softDelete('activo_vivienda_criterio_opcion');
    }

    function REACTIVAR() {
        return $this->reactivarRegistro('activo_vivienda_criterio_opcion');
    }

    function ADD() {
        $errorExcluyente = $this->validarOpcionExcluyenteRequiereRestrictivo();
        if ($errorExcluyente !== true) return $errorExcluyente;
        return $this->modelo->ADD();
    }

    function EDIT() {
        $errorExcluyente = $this->validarOpcionExcluyenteRequiereRestrictivo();
        if ($errorExcluyente !== true) return $errorExcluyente;
        return $this->modelo->EDIT();
    }

    // solo se puede marcar una opcion a excluir si esa misma respuesta tambien es restrictiva
    function validarOpcionExcluyenteRequiereRestrictivo() {
        $tieneOpcionExcluyente = !empty($_POST['id_opcion_excluyente']) && $_POST['id_opcion_excluyente'] !== 'NULL';
        if (!$tieneOpcionExcluyente) return true;

        $esRestrictivo = isset($_POST['restrictivo']) && intval($_POST['restrictivo']) === 1;
        if (!$esRestrictivo) {
            return array('ok' => false, 'code' => 'EXCLUYENTE_REQUIERE_CRITERIO_RESTRICTIVO_KO');
        }

        return true;
    }

    function getAll() {
        $this->modelo->listaAtributos = [];
        $this->modelo->foraneas = [];
        return $this->modelo->SEARCH();
    }

    function getByVivienda() {
        $idVivienda = intval($_POST['id_vivienda']);
        include_once './base/mapping.php';
        $map = new mapping('vivienda_criterio_opcion');
        return $map->lanzarqueryconresults(
            "SELECT vco.id_vivienda, vco.id_criterio, vco.id_opcion,
                    c.nombre_criterio,
                    o.nombre_opcion,
                    vco.peso, vco.restrictivo, vco.id_opcion_excluyente
             FROM vivienda_criterio_opcion vco
             JOIN criterio c ON c.id_criterio = vco.id_criterio
             JOIN opcion   o ON o.id_opcion   = vco.id_opcion
             WHERE vco.id_vivienda = {$idVivienda}
               AND vco.activo_vivienda_criterio_opcion = 1
             ORDER BY c.id_criterio"
        );
    }

    function updateOpcion() {
        $errorExcluyente = $this->validarOpcionExcluyenteRequiereRestrictivo();
        if ($errorExcluyente !== true) return $errorExcluyente;

        $idVivienda         = intval($_POST['id_vivienda']);
        $idCriterio         = intval($_POST['id_criterio']);
        $idOpcion           = intval($_POST['id_opcion']);
        $peso               = !empty($_POST['peso']) ? intval($_POST['peso']) : 3;
        $restrictivo        = (isset($_POST['restrictivo']) && intval($_POST['restrictivo']) === 1) ? 1 : 0;
        $idOpcionExcluyente = !empty($_POST['id_opcion_excluyente']) ? intval($_POST['id_opcion_excluyente']) : null;

        include_once './base/mapping.php';
        $map = new mapping('vivienda_criterio_opcion');
        $map->lanzarquery(
            "DELETE FROM vivienda_criterio_opcion
             WHERE id_vivienda = {$idVivienda} AND id_criterio = {$idCriterio}"
        );
        $valorOpcionExcluyente = $idOpcionExcluyente !== null ? $idOpcionExcluyente : 'NULL';
        return $map->lanzarquery(
            "INSERT INTO vivienda_criterio_opcion
                (id_vivienda, id_criterio, id_opcion, peso, restrictivo, id_opcion_excluyente, activo_vivienda_criterio_opcion)
             VALUES ({$idVivienda}, {$idCriterio}, {$idOpcion}, {$peso}, {$restrictivo}, {$valorOpcionExcluyente}, 1)"
        );
    }

    function getById() {
        foreach ($this->modelo->valores as $key => $value) {
            $this->modelo->valores[$key] = '';
        }
        $this->modelo->valores['id_vivienda'] = $_POST['id_vivienda'];
        $this->modelo->valores['id_criterio'] = $_POST['id_criterio'];
        $this->modelo->valores['id_opcion']   = $_POST['id_opcion'];
        $this->modelo->foraneas = [];
        return $this->modelo->SEARCH_BY();
    }

}
?>
