<?php

include_once './Base/appServiceBase.php';

class usuario_SERVICE extends appServiceBase{

	public $modelo;

	//METODOS

	function __construct(){

		parent::__construct();

	}

	function inicializarRest(){

		$this->listaAtributos = array('id_usuario','dni','mail','nombre_usuario','apellidos','password','telefono','fecha_alta_usuario','fecha_modificacion_usuario','activo_usuario','id_rol');

		$this->listaAtributosSelect = array('id_usuario','dni','mail','nombre_usuario','apellidos','telefono','fecha_alta_usuario','fecha_modificacion_usuario','activo_usuario','id_rol');

		$this->notnull = array(
						'ADD'    => array('dni','mail','nombre_usuario','apellidos','password','telefono','id_rol'),
						'EDIT'   => array('id_usuario','dni','mail','nombre_usuario','apellidos','telefono','id_rol'),
						'DELETE'    => array('id_usuario'),
						'REACTIVAR' => array('id_usuario'),
						'SOLICITAR_CAMBIO_ROL' => array('id_usuario', 'id_rol_solicitado'),
						'ACEPTAR_CAMBIO_ROL'   => array('id_usuario'),
						'RECHAZAR_CAMBIO_ROL'  => array('id_usuario')
						);

		$this->modelo = $this->crearModelOne('usuario');

	}

	function modificacion_atributos() {
        if (isset($_POST['action']) && $_POST['action'] == 'ADD') {
            $_POST['activo_usuario']     = 1;
            $_POST['fecha_alta_usuario'] = date('Y-m-d H:i:s');
            $_POST['fecha_modificacion_usuario'] = date('Y-m-d H:i:s');
        }
        if (!empty($_POST['password'])) {
            $_POST['password'] = md5($_POST['password']);
        }
    }

    function DELETE() {
        return $this->softDelete('activo_usuario', 'fecha_modificacion_usuario');
    }

    function REACTIVAR() {
        return $this->reactivarRegistro('activo_usuario', 'fecha_modificacion_usuario');
    }

    function EDIT() {
        unset($this->modelo->valores['fecha_alta_usuario']);
        unset($this->modelo->valores['activo_usuario']);
        $this->modelo->valores['fecha_modificacion_usuario'] = date('Y-m-d H:i:s');
        if (empty($this->modelo->valores['password'])) {
            unset($this->modelo->valores['password']);
        }
        return $this->modelo->EDIT();
    }

    function getAll() {
        $this->modelo->listaAtributos = [];
        $this->modelo->foraneas = [];
        return $this->modelo->SEARCH();
    }

    function getById() {
        foreach ($this->modelo->valores as $key => $value) {
            $this->modelo->valores[$key] = '';
        }
        $primaryKey = $this->modelo->clave[0];
        $this->modelo->valores[$primaryKey] = $_POST['id_usuario'];
        $this->modelo->foraneas = [];
        return $this->modelo->SEARCH_BY();
    }

    function getByMail() {
        foreach ($this->modelo->valores as $key => $value) {
            $this->modelo->valores[$key] = '';
        }
        $this->modelo->foraneas = [];
        if (isset($_POST['mail'])) {
            $this->modelo->valores['mail'] = $_POST['mail'];
            return $this->modelo->SEARCH();
        }
        return array('ok' => false, 'error' => 'mail_not_provided');
    }

    // Solicitudes de cambio de rol: se guardan como columnas en la propia fila del usuario (igual
    // que las solicitudes de vivienda reutilizan usuario_vivienda) en vez de una tabla aparte, ya
    // que cada usuario solo puede tener una solicitud pendiente a la vez.
    function SOLICITAR_CAMBIO_ROL() {
        $idUsuario       = intval($_POST['id_usuario']);
        $idRolSolicitado = intval($_POST['id_rol_solicitado']);

        include_once './Base/mapping.php';
        $map = new mapping('usuario');

        $res = $map->lanzarqueryconresults(
            "SELECT id_rol, estado_cambio_rol FROM usuario WHERE id_usuario = {$idUsuario} LIMIT 1"
        );
        if (!$res['ok'] || empty($res['resource'])) {
            return array('ok' => false, 'code' => 'USUARIO_NO_ENCONTRADO_KO');
        }

        $fila = $res['resource'][0];
        if (intval($fila['id_rol']) === $idRolSolicitado) {
            return array('ok' => false, 'code' => 'MISMO_ROL_KO');
        }
        if ($fila['estado_cambio_rol'] === 'PENDIENTE') {
            return array('ok' => false, 'code' => 'SOLICITUD_CAMBIO_ROL_YA_EXISTE_KO');
        }

        $resUpdate = $map->lanzarquery(
            "UPDATE usuario
             SET id_rol_solicitado = {$idRolSolicitado}, estado_cambio_rol = 'PENDIENTE', fecha_solicitud_rol = '" . date('Y-m-d H:i:s') . "'
             WHERE id_usuario = {$idUsuario}"
        );
        if ($resUpdate['ok']) {
            $resUpdate['code'] = 'SOLICITUD_CAMBIO_ROL_OK';
        }
        return $resUpdate;
    }

    function ACEPTAR_CAMBIO_ROL() {
        return $this->resolverCambioRol('ACEPTADA');
    }

    function RECHAZAR_CAMBIO_ROL() {
        return $this->resolverCambioRol('RECHAZADA');
    }

    // solo se puede resolver una solicitud que siga pendiente. Al aceptar, id_rol pasa a valer
    // el rol solicitado; al rechazar, id_rol no se toca (se deja id_rol_solicitado para que la
    // fila conserve constancia de que fue rechazado y a que rol).
    function resolverCambioRol($nuevoEstado) {
        $idUsuario = intval($_POST['id_usuario']);

        include_once './Base/mapping.php';
        $map = new mapping('usuario');

        $res = $map->lanzarqueryconresults(
            "SELECT id_rol_solicitado, estado_cambio_rol FROM usuario WHERE id_usuario = {$idUsuario} LIMIT 1"
        );
        if (!$res['ok'] || empty($res['resource'])) {
            return array('ok' => false, 'code' => 'USUARIO_NO_ENCONTRADO_KO');
        }
        if ($res['resource'][0]['estado_cambio_rol'] !== 'PENDIENTE') {
            return array('ok' => false, 'code' => 'SOLICITUD_CAMBIO_ROL_NO_PENDIENTE_KO');
        }

        $idRolSolicitado = intval($res['resource'][0]['id_rol_solicitado']);

        $set = "estado_cambio_rol = '{$nuevoEstado}', fecha_modificacion_usuario = '" . date('Y-m-d H:i:s') . "'";
        if ($nuevoEstado === 'ACEPTADA') {
            $set .= ", id_rol = {$idRolSolicitado}";
        }

        $resUpdate = $map->lanzarquery("UPDATE usuario SET {$set} WHERE id_usuario = {$idUsuario}");
        if ($resUpdate['ok']) {
            $resUpdate['code'] = $nuevoEstado === 'ACEPTADA' ? 'CAMBIO_ROL_ACEPTADO_OK' : 'CAMBIO_ROL_RECHAZADO_OK';
        }
        return $resUpdate;
    }

    // listado para el panel de administrador: usuarios con una solicitud de cambio de rol pendiente,
    // con el nombre del rol actual y del solicitado ya resueltos para pintar la tabla de un tiro.
    function getSolicitudesCambioRol() {
        include_once './Base/mapping.php';
        $map = new mapping('usuario');
        return $map->lanzarqueryconresults(
            "SELECT u.id_usuario, u.nombre_usuario, u.apellidos, u.mail, u.fecha_solicitud_rol,
                    u.id_rol, u.id_rol_solicitado,
                    r1.nombre_rol AS rol_actual, r2.nombre_rol AS rol_solicitado
             FROM usuario u
             JOIN rol r1 ON r1.id_rol = u.id_rol
             JOIN rol r2 ON r2.id_rol = u.id_rol_solicitado
             WHERE u.estado_cambio_rol = 'PENDIENTE'
             ORDER BY u.fecha_solicitud_rol DESC"
        );
    }

}
