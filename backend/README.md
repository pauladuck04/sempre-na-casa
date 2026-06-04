# Backend

Primer esqueleto de modelos PHP para conectar el frontend actual con una API real.

## Modelos iniciales

- `User`: registro, login, perfiles y administracion de usuarios.
- `Role`: catalogo de roles visibles en administracion.
- `Vivienda`: vivienda del anfitrion, plazas y disponibilidad.
- `Criterio` y `OpcionCriterio`: criterios globales y opciones de encuesta.
- `Preferencia`: preferencias configuradas por el inquilino.
- `CriterioAnfitrion`: criterios configurados por el anfitrion.
- `Convivencia`: relacion entre vivienda, anfitrion e inquilino con estado y compatibilidad.
- `RespuestaEncuesta`: respuestas del formulario de encuesta.
- `PasswordResetToken`: soporte para recuperacion de contrasena.

Los modelos exponen `fromArray()` y `toArray()` para facilitar el uso posterior desde controladores, repositorios o una capa PDO.
