# Manual de usuario — Sempre na Casa

Sempre na Casa es una plataforma de convivencia intergeneracional que conecta a
**anfitriones** con una habitación libre en su vivienda con **huéspedes**
(principalmente estudiantes y jóvenes) que buscan alojamiento, a través de un
sistema de compatibilidad basado en preferencias de convivencia.

Este manual explica cómo usar la aplicación de forma eficiente según tu rol:

- [**Anfitrión**](./anfitrion.md) — tienes una vivienda con plazas libres.
- [**Huésped**](./huesped.md) — buscas alojamiento y compañía.
- [**Administrador**](./administrador.md) — gestionas la plataforma (usuarios, viviendas, criterios y solicitudes).

Si no sabes qué rol te corresponde, la página **"¿Cómo quieres unirte?"**
(`tipos-usuarios.html`, enlazada desde "Registrarse" en la portada) explica las
posibilidades de cada uno antes de registrarte.

---

## 1. Antes de entrar: registro e inicio de sesión

### Crear una cuenta (anfitrión o huésped)

1. Desde la portada, pulsa **Registrarse** y elige tu rol (anfitrión o huésped),
   o entra directamente en `registro.html?rol=anfitrion` / `?rol=huesped`.
2. Rellena el formulario: DNI, nombre, apellidos, email, teléfono y contraseña.
   - El DNI debe tener 8 dígitos y una letra mayúscula (ej. `12345678A`).
   - El teléfono debe tener 9 dígitos.
   - La contraseña necesita al menos 8 caracteres, y debes repetirla igual en el segundo campo.
3. Al continuar, la aplicación te lleva a la **encuesta de convivencia**: 10
   preguntas sobre tus hábitos (ruido, tabaco, visitas, mascotas, limpieza,
   horarios, cocina, interacción social, tecnología y zonas comunes). Tienes
   que responder las 10 antes de poder terminar el registro — una barra de
   progreso en la parte superior te indica cuántas llevas.
   - Si eres **huésped**, estas respuestas son tus preferencias personales y
     se usan para calcular tu compatibilidad con cada vivienda.
   - Si eres **anfitrión**, estas primeras respuestas se guardan en tu perfil
     de usuario; más adelante, al dar de alta tu vivienda, volverás a
     responder el mismo cuestionario, pero esta vez para definir el
     ambiente de **esa vivienda concreta** (ver [manual del anfitrión](./anfitrion.md)).
4. Al terminar la encuesta se crea la cuenta y vuelves a la pantalla de inicio
   de sesión.

> Las cuentas de **administrador** no se crean desde este formulario público:
> las da de alta otro administrador desde el panel (ver
> [manual del administrador](./administrador.md)).

### Iniciar sesión

Entra en `login.html`, escribe tu email y contraseña y pulsa **Entrar**. Según
tu rol, la aplicación te lleva automáticamente a:

| Rol | Panel |
|---|---|
| Anfitrión | Panel Anfitrión |
| Huésped | Panel Huésped (o a la encuesta, si aún no la completaste) |
| Administrador | Panel Administrador |

Si intentas entrar a una URL de un panel que no te corresponde (por ejemplo,
un huésped escribiendo la URL del panel de administrador), la aplicación te
redirige automáticamente a tu propio panel.

Si olvidaste tu contraseña, usa el enlace **"¿Has olvidado tu contraseña?"**
desde la pantalla de inicio de sesión.

### Cerrar sesión

El enlace **"Salir"**, al final de la barra lateral de cualquier panel, cierra
tu sesión por completo y te lleva a la portada.

### Cambiar el idioma

El desplegable con el icono 🌐, arriba a la derecha en las páginas públicas
(portada, login, registro...), permite cambiar entre **Español**, **English**
y **Galego** en cualquier momento; la app recuerda tu elección.

---

## 2. Lo que comparten los tres paneles

Independientemente de tu rol, cada panel tiene:

- Una **barra lateral** con las secciones disponibles para tu rol.
- Un **avatar con tus iniciales** arriba a la derecha: pulsándolo entras en
  tu **Perfil**, donde puedes:
  - Editar tus datos personales (pulsa **Editar**, cambia lo que necesites y
    **Guardar Cambios**).
  - Cambiar tu contraseña (te pide la actual y la nueva dos veces; un
    indicador de color te muestra su fortaleza).
  - **Eliminar tu cuenta** desde la "Zona de peligro" — esta acción es
    permanente.
- En las secciones con listados (usuarios, criterios, viviendas...), una
  **casilla de verificación** en cada fila habilita los botones de arriba
  (Editar, Eliminar/Desactivar, Reactivar) y un buscador para filtrar por
  texto o por estado.
- Los mensajes de error de un formulario aparecen junto al campo que falla
  (borde rojo); los errores generales (fallo de guardado, contraseña
  incorrecta...) aparecen en una franja roja arriba del formulario. Las
  confirmaciones de una acción (guardado correcto, etc.) aparecen como un
  aviso ("toast") en la esquina inferior derecha.

Consulta el manual específico de tu rol para el detalle de cada sección.
