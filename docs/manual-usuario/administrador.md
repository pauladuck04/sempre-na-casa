# Manual del Administrador

> Antes de seguir, revisa los pasos comunes de [inicio de sesión](./README.md#1-antes-de-entrar-registro-e-inicio-de-sesión).
> Las cuentas de administrador no se autorregistran: las crea otro
> administrador desde **Gestión Usuarios** (ver más abajo).

El panel de administrador (`dashboard-administrador.html`) es el centro de
control de la plataforma: **Vista General**, **Gestión Usuarios**, **Roles y
Permisos**, **Gestión Viviendas**, **Criterios Match** y **Solicitudes**.

En las secciones con listado (todas salvo Vista General y Solicitudes), la
barra de acciones de arriba funciona igual en todas:

1. Marca una o varias casillas de la tabla.
2. **Crear** da de alta un elemento nuevo (no requiere selección).
   **Editar** (requiere exactamente 1 seleccionado), **Eliminar** y
   **Reactivar** (requieren 1 o más) actúan sobre lo marcado.
3. El buscador de texto y los filtros de estado, arriba a la derecha, acotan
   la tabla en tiempo real.

**Eliminar** aquí es una baja lógica: el elemento pasa a *Inactivo* y puede
recuperarse con **Reactivar** en cualquier momento; no se borra de la base de
datos.

## 1. Vista General

Tabla de **seguimiento de convivencias**: todas las relaciones
huésped–vivienda del sistema (anfitrión, huésped, estado, fecha de inicio y
fecha de fin), activas e históricas. Es de solo lectura, sin filtros ni
acciones — es el panel de control global antes de entrar a gestionar algo en
concreto.

## 2. Gestión Usuarios

Listado de todas las cuentas (anfitriones, huéspedes y administradores) con
su rol, fecha de registro, DNI, teléfono y estado (*Activo* / *Inactivo* /
*Pendiente*).

**Crear un usuario nuevo:**

1. Pulsa **Crear**.
2. Rellena nombre, apellidos, email, DNI (8 dígitos + letra), teléfono,
   contraseña (obligatoria solo al crear) y elige su **rol**.
3. Guarda. Esta es la forma de dar de alta, por ejemplo, a otro
   administrador.

**Editar** un usuario existente reutiliza el mismo formulario (la contraseña
queda vacía; solo se cambia si escribes una nueva). No puedes eliminar un
usuario que tenga una convivencia activa (ni como huésped ni como anfitrión
de una vivienda con huéspedes activos) — la aplicación lo bloquea con un
aviso.

## 3. Roles y Permisos

Listado simple de los roles del sistema (Anfitrión, Huésped, Administrador…).
**Crear** da de alta un rol nuevo con solo su nombre; **Editar** permite
renombrarlo. Los roles activos son los que aparecen como opción al crear o
editar un usuario.

## 4. Gestión Viviendas

Listado de todas las viviendas con dirección, plazas libres/totales,
anfitrión asignado y estado (*Disponible* / *Ocupada* / *Inactiva*). Las
filas con 0 plazas libres se resaltan en rojo.

**Crear/Editar una vivienda** desde aquí (además de que el propio anfitrión
puede darla de alta desde su panel) pide: dirección, ciudad, descripción,
plazas libres, plazas totales y el **anfitrión** al que se asigna — el
desplegable solo ofrece anfitriones activos que todavía no tienen otra
vivienda activa. Las plazas libres no pueden superar a las totales.

No puedes eliminar una vivienda con convivencias activas asociadas.

## 5. Criterios Match

Esta sección tiene dos pestañas:

### Criterios

El catálogo de las 10 preguntas de la encuesta de convivencia. Cada criterio
tiene:

- Un **peso / importancia** del 1 (baja) al 5 (alta), que pondera cuánto
  influye esa pregunta en el cálculo de compatibilidad.
- Un marcador opcional **restrictivo**: si se activa, ese criterio puede
  descartar una convivencia por completo (no solo restar puntos de
  compatibilidad) cuando la respuesta del huésped y de la vivienda no
  encajan. En la tabla, los criterios restrictivos llevan una insignia roja
  **R**.

### Opciones

Las respuestas posibles de cada criterio (por ejemplo, para "Nivel de
ruido": Silencio absoluto / Ruido moderado / No me importa), cada una con su
**valor** asociado. Una opción puede marcarse como **excluyente** — esto solo
tiene efecto si su criterio es restrictivo, y significa que elegir
justamente esa opción descarta el match si no coincide con la de la otra
parte. En la tabla, las opciones excluyentes llevan una insignia roja **X**.

> Cambiar el catálogo de criterios/opciones afecta a **todas** las viviendas
> y huéspedes de la plataforma (es el cuestionario que responden al
> registrarse), no a una convivencia en concreto.

## 6. Solicitudes

Todas las solicitudes de convivencia que los huéspedes envían al pulsar
"Solicitar" sobre una vivienda (ver
[manual del huésped](./huesped.md#2-buscar-vivienda-recomendadas)): huésped,
vivienda, anfitrión, fecha de la solicitud, fechas propuestas y estado.

| Estado | Significado |
|---|---|
| Pendiente | Recién enviada, esperando revisión. |
| Aceptada | Aprobada — pasa a ser una convivencia activa. |
| Rechazada | Denegada. |

Cada solicitud **Pendiente** tiene sus propios botones en la fila:

- **Aceptar** — activa la convivencia (aparecerá en "Mi Convivencia" del
  huésped y en "Huéspedes"/"Vista General" del anfitrión).
- **Rechazar** — la descarta.

Esta sección no tiene casillas de selección múltiple ni filtros: cada
solicitud se resuelve individualmente desde su fila.

## 7. Mi Perfil

Ver [las funciones comunes de perfil](./README.md#2-lo-que-comparten-los-tres-paneles):
editar tus datos personales, cambiar la contraseña o eliminar tu cuenta.
