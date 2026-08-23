<?php
// Plantilla de credenciales para la cola de correo. Copia este fichero como EmailCredentials.php
// (mismo directorio) y rellena el valor real. EmailCredentials.php esta en .gitignore: no se
// sube al repositorio.
//
// RELAY_SECRET protege los endpoints LISTAR_PENDIENTES y MARCAR_ENVIADO (controlador
// email_pendiente): sin el, cualquiera podria leer el contenido de los correos en cola
// (incluidos enlaces de restablecimiento de contrasena). Tiene que ser exactamente el mismo
// valor que el secreto RELAY_SECRET configurado en el repositorio de GitHub (Settings > Secrets
// and variables > Actions), que es quien llama a estos endpoints. Genera uno nuevo con:
//   php -r "echo bin2hex(random_bytes(24));"

define('RELAY_SECRET', 'CAMBIAME');

?>
