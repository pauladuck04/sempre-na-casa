-- Recuperacion de contrasena: token de un solo uso con expiracion, guardado en la propia fila
-- del usuario (mismo patron que las demas solicitudes de este proyecto: sin tabla nueva).
-- El backend todavia no envia email real (no hay infraestructura SMTP configurada): el endpoint
-- RECUPERAR_PASSWORD devuelve el token al frontend, que construye y muestra el enlace directamente
-- en vez de mandarlo por correo. El dia que se configure un servicio de email, solo hace falta
-- enviar ese mismo enlace por correo en vez de mostrarlo en pantalla.

ALTER TABLE `usuario`
    ADD COLUMN `token_recuperacion` VARCHAR(64) NULL AFTER `password`,
    ADD COLUMN `token_recuperacion_expira` DATETIME NULL AFTER `token_recuperacion`;
