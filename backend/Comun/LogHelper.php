<?php

include_once dirname(__DIR__) . '/base/mapping.php';

function guardarLogExcepcion($controlador, $accion, $codigo, $id_usuario = null) {
    $map   = new mapping('log_excepciones');
    $fecha = date('Y-m-d H:i:s');
    $ctrl  = addslashes($controlador);
    $acc   = addslashes($accion);
    $cod   = addslashes($codigo);
    $uid   = ($id_usuario !== null) ? intval($id_usuario) : 'NULL';
    $map->lanzarquery(
        "INSERT INTO log_excepciones (fecha_log_excepcion, controlador, accion, codigo_error, id_usuario) " .
        "VALUES ('$fecha', '$ctrl', '$acc', '$cod', $uid)"
    );
}

?>
