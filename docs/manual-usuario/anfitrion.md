# Manual del Anfitrión

> Antes de seguir, revisa los pasos comunes de [registro e inicio de sesión](./README.md#1-antes-de-entrar-registro-e-inicio-de-sesión).

El panel de anfitrión (`dashboard-anfitrion.html`) tiene cuatro secciones en
la barra lateral: **Vista General**, **Mi Vivienda**, **Criterios** y
**Huéspedes**.

## 1. Vista General

Resumen rápido de tu situación:

- **Estado de la vivienda**: si aún no la has dado de alta, si está
  *Disponible* (tiene plazas libres) o *Completa*.
- **Plazas ocupadas**: huéspedes activos frente al total de plazas de tu
  vivienda.
- **Mi Convivencia Actual**: tabla con el histórico de huéspedes que han
  pasado (o están) en tu vivienda, con su fecha de inicio y estado.

## 2. Mi Vivienda

### Si todavía no tienes vivienda

Verás un aviso **"Todavía no tienes una vivienda registrada"** con el botón
**Dar de Alta Vivienda**. El alta se hace en dos pasos:

**Paso 1 — Datos de la vivienda**: dirección, ciudad, plazas totales, plazas
libres y una descripción opcional. Todos los campos excepto la descripción
son obligatorios.

**Paso 2 — Preferencias de Convivencia**: el mismo cuestionario de 10
preguntas de la encuesta inicial, pero esta vez define el **ambiente de esta
vivienda concreta** (nivel de ruido que se tolera, si se permiten mascotas,
horarios, etc.). Estas respuestas son las que el sistema compara con las
preferencias de cada huésped para calcular el porcentaje de compatibilidad
que ven los candidatos. Debes responder las 10 antes de poder guardar (una
barra de progreso te indica cuántas llevas). Al guardar, tu vivienda queda
activa y visible para los huéspedes.

### Si ya tienes vivienda

La sección muestra una ficha con dirección, ciudad, descripción, plazas
totales, plazas libres y estado (*Disponible*/*Completa*). El botón
**Editar**, arriba a la derecha de la ficha, abre un formulario para
modificar cualquiera de esos datos (no vuelve a pedirte el cuestionario de
criterios; eso se ajusta desde la sección **Criterios**).

## 3. Criterios

Tabla de solo lectura con las 10 preferencias que definiste para tu vivienda
(criterio, valor elegido y estado). Para cambiar la respuesta de **una**
pregunta concreta sin repetir todo el cuestionario:

1. Marca la casilla de esa fila.
2. Pulsa **Editar**.
3. Elige la nueva opción en el modal y guarda.

## 4. Huéspedes

Listado de las personas alojadas en tu vivienda (nombre, fecha de ingreso y
estado — *Activo*/*Inactivo*). Puedes filtrar por estado y buscar por texto.

Para dar de baja a un huésped que se marcha:

1. Marca su casilla.
2. Pulsa **Notificar Baja** (el botón rojo con el icono de salida).
3. Confirma en el modal que aparece con su nombre.

Esto libera una plaza en tu vivienda y pasa al huésped a estado *Inactivo*
(sigue apareciendo en el histórico de "Mi Convivencia Actual").

> Las solicitudes de nuevos huéspedes que quieren entrar en tu vivienda **no
> se aceptan desde este panel**: las revisa y aprueba el equipo de
> administración (ver [manual del administrador](./administrador.md#5-solicitudes)).
> Una vez aceptada una solicitud, el huésped aparece automáticamente aquí.

## 5. Mi Perfil

Ver [las funciones comunes de perfil](./README.md#2-lo-que-comparten-los-tres-paneles):
editar tus datos personales, cambiar la contraseña o eliminar tu cuenta.
