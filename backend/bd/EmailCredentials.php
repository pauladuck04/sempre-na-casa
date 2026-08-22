<?php
// Secreto real de la cola de correo. No se sube al repositorio (ver .gitignore). Tiene que
// coincidir exactamente con el secreto RELAY_SECRET del repositorio de GitHub (lo usa el
// workflow que envia los correos pendientes).

define('RELAY_SECRET', '824c956505c5a3af581ce86322619b8614d821771605f503');

?>
