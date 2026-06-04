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

## Servicios iniciales

La carpeta `Services` contiene una primera capa de casos de uso:

- `UserService`: alta de usuarios, autenticacion, busqueda por email y cambio de estado.
- `RoleService`: alta y activacion/desactivacion de roles.
- `ViviendaService`: alta, disponibilidad y gestion de plazas.
- `CriterioService`: criterios globales y sus opciones.
- `PreferenciaService`: preferencias de inquilinos.
- `CriterioAnfitrionService`: criterios propios de anfitriones.
- `ConvivenciaService`: creacion, estado y consultas por anfitrion o inquilino.
- `EncuestaService`: guardado de respuestas de encuesta.
- `PasswordResetService`: creacion y consumo de tokens de recuperacion.

Actualmente guardan datos en memoria para arrancar la arquitectura. El siguiente paso natural es extraer repositorios y conectar los servicios a una base de datos.
