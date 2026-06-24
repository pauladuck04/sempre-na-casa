<?php

include_once './Base/appServiceBase.php';

class usuario_vivienda_SERVICE extends appServiceBase {

    public $modelo;

    function __construct() {
        parent::__construct();
    }

    function inicializarRest() {

        $this->listaAtributos = array(
            'id_usuario', 'id_vivienda', 'activo_usuario_vivienda'
        );

        $this->listaAtributosSelect = array(
            'id_usuario', 'id_vivienda', 'activo_usuario_vivienda', 'fecha_inicio', 'fecha_fin'
        );

        $this->notnull = array(
            'ADD'    => array('id_usuario', 'id_vivienda'),
            'EDIT'   => array('id_usuario', 'id_vivienda'),
            'DELETE'    => array('id_usuario', 'id_vivienda'),
            'REACTIVAR' => array('id_usuario', 'id_vivienda'),
            'getHuespedesByAnfitrion' => array('id_anfitrion'),
            'getHuespedesByVivienda'  => array('id_vivienda'),
        );

        $this->modelo = $this->crearModelOne('usuario_vivienda');
    }

    function modificacion_atributos() {
        if (isset($_POST['action']) && $_POST['action'] == 'ADD') {
            $_POST['activo_usuario_vivienda']     = 1;
        }
    }

    function DELETE() {
        return $this->softDelete('activo_usuario_vivienda');
    }

    function REACTIVAR() {
        return $this->reactivarRegistro('activo_usuario_vivienda');
    }

    function getAll() {
        $this->modelo->listaAtributos = [];
        $this->modelo->foraneas = [];
        return $this->modelo->SEARCH();
    }

    function getHuespedesByVivienda() {
        $idVivienda = intval($_POST['id_vivienda']);
        include_once './Base/mapping.php';
        $map = new mapping('usuario_vivienda');
        return $map->lanzarqueryconresults(
            "SELECT uv.id_usuario, uv.activo_usuario_vivienda, uv.fecha_inicio,
                    u.nombre_usuario, u.apellidos, u.mail, u.telefono
             FROM usuario_vivienda uv
             JOIN usuario u ON u.id_usuario = uv.id_usuario
             WHERE uv.id_vivienda = {$idVivienda}
             ORDER BY uv.activo_usuario_vivienda DESC, uv.fecha_inicio"
        );
    }

    function getHuespedesByAnfitrion() {
        $idAnfitrion = intval($_POST['id_anfitrion']);
        include_once './Base/mapping.php';
        $map = new mapping('usuario_vivienda');
        return $map->lanzarqueryconresults(
            "SELECT uv.id_usuario, uv.fecha_inicio,
                    u.nombre_usuario, u.apellidos, u.mail, u.telefono
             FROM usuario_vivienda uv
             JOIN usuario u  ON u.id_usuario   = uv.id_usuario
             JOIN vivienda v ON v.id_vivienda   = uv.id_vivienda
             WHERE v.id_anfitrion = {$idAnfitrion}
               AND uv.activo_usuario_vivienda = 1
             ORDER BY uv.fecha_inicio"
        );
    }

    function getById() {
        foreach ($this->modelo->valores as $key => $value) {
            $this->modelo->valores[$key] = '';
        }
        $primaryKey = $this->modelo->clave[0];
        $this->modelo->valores[$primaryKey] = $_POST['id'];
        $this->modelo->foraneas = [];
        return $this->modelo->SEARCH_BY();
    }

}
?>