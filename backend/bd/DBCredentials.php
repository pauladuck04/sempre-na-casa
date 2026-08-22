<?php
//cambiar bd por: 
define('host', 'fdb1032.awardspace.net');
define ('user', '4740201_semprenacasa');
define ('pass', 'SempreNaCasa_2026');
define ('BD', '4740201_semprenacasa');
define ('BD_test', '4740201_semprenacasa'); //el generador automatico de app esta en modo test

// URL publica del frontend estatico, para construir enlaces (recuperar contrasena) dentro de emails
define('FRONTEND_URL', 'http://semprenacasa.atwebpages.com/');

// URL publica de este backend. El remitente de los correos (mail()) tiene que pertenecer a este
// dominio: en hosting gratuito tipo AwardSpace, un From con un dominio distinto al de la cuenta
// que ejecuta el script se rechaza como suplantacion y mail() devuelve false (ENVIO_EMAIL_KO).
define('BACKEND_URL', 'http://backsemprenacasa.atwebpages.com/');

?>