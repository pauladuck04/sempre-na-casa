# Manual de instalación — Sempre na Casa

Guía para poner en marcha el proyecto en local desde cero: backend (PHP + MySQL,
vía Docker) y frontend (HTML/JS estático, sin build).

## 1. Requisitos previos

- **Docker Desktop** (incluye Docker Compose) — es lo único imprescindible para el backend.
- Un navegador moderno (Chrome, Firefox, Edge...).
- Para servir el frontend, cualquiera de estas opciones:
  - **Visual Studio Code** con la extensión **Live Server** (es como está montado el
    proyecto durante el desarrollo — recomendado).
  - O Node.js instalado, para usar `npx serve`.
  - O Python instalado, para usar `python -m http.server`.
- Opcional: [Postman](https://www.postman.com/) si quieres probar la API directamente
  (hay una colección en `postman/collections/`).

> ⚠️ El frontend **no se puede abrir haciendo doble clic** en los archivos `.html`.
> Los módulos JavaScript (`type="module"`) y las llamadas `fetch()` a las traducciones
> y a los parciales HTML necesitan que la página se sirva por `http://`, no por `file://`.
> Usa siempre Live Server o uno de los servidores estáticos de abajo.

## 2. Estructura del proyecto

```
proyectos/
├── backend/          API en PHP (arquitectura propia por controlador/servicio/modelo)
│   └── bd/migrations/  cambios de esquema posteriores al dump.sql inicial
├── frontend/         HTML + CSS + JS estático, sin build ni npm install
├── docs/              este manual y el manual de usuario
├── postman/           colección para probar la API directamente
├── docker-compose.yaml
├── Dockerfile          imagen del backend (PHP 8.2 + Apache)
└── dump.sql            volcado inicial de la base de datos
```

## 3. Levantar el backend y la base de datos

Desde la raíz del proyecto:

```bash
docker-compose up -d
```

Esto levanta tres servicios:

| Servicio | URL | Qué es |
|---|---|---|
| `web` | http://localhost:8081 | API PHP (el frontend le habla a `http://localhost:8081/index.php`) |
| `db` | localhost:3307 (dentro de Docker: `db:3306`) | MySQL 8.0, con el volcado `dump.sql` cargado automáticamente en el primer arranque |
| `phpmyadmin` | http://localhost:8082 | Interfaz web para inspeccionar/editar la base de datos |

La primera vez que se crea el contenedor `db`, MySQL carga automáticamente
`dump.sql` (Docker lo monta en `/docker-entrypoint-initdb.d/`). Esto **solo pasa la
primera vez**: si el volumen `db_data` ya existe de un arranque anterior, el dump no
se vuelve a aplicar aunque cambies el fichero.

Para comprobar que el backend responde:

```bash
curl -X POST http://localhost:8081/index.php -d "controlador=rol&action=getAll"
```

Deberías recibir un JSON con `"ok":true`.

### Credenciales de la base de datos

No hay que configurar nada a mano: `backend/Comun/config.php` ya apunta al host `db`
(el nombre del servicio de Docker) con el mismo usuario/contraseña/base de datos que
define `docker-compose.yaml`. Es autocontenido mientras uses Docker Compose.

> Existe también `backend/bd/DBCredentials.php`, que apunta a un hosting externo
> (AwardSpace). Es un resto de otra configuración y **no lo usa la aplicación**
> (`index.php` solo incluye `Comun/config.php`); ignóralo salvo que vayáis a desplegar
> ahí en el futuro.

## 4. Aplicar las migraciones

`dump.sql` deja la base de datos en el estado inicial del proyecto, pero varias
funcionalidades que ya están en el frontend (peso y restricción de criterios,
solicitudes de vivienda, cambio de rol, recuperación de contraseña...) necesitan
columnas/tablas que se añadieron **después**, en `backend/bd/migrations/`. Sin
aplicarlas, esas pantallas fallarán.

Aplícalas **en este orden** (son incrementales):

1. `20260620_fecha_modificacion.sql`
2. `20260707_log_excepciones.sql`
3. `20260718_criterios_restrictivos.sql`
4. `20260718_peso_criterio.sql`
5. `20260718_solicitudes_vivienda.sql`
6. `20260722_solicitudes_cambio_rol.sql`
7. `20260723_recuperacion_password.sql`
8. `seed_criterio_opcion.sql` — **obligatorio**: crea los 10 criterios y sus opciones
   con los IDs exactos (1-10 / 1-30) que la encuesta de convivencia tiene
   hardcodeados en el frontend. Sin esto, el registro y la encuesta no funcionan.
9. `seed_test_matching.sql` — **opcional**: datos de prueba (usuarios, viviendas y
   solicitudes ficticias con IDs a partir de 9000) para ver el sistema de
   compatibilidad funcionando sin tener que crear todo a mano. Usuarios de prueba con
   contraseña `Test1234!`. Trae al final un bloque de `DELETE` comentado para deshacerlo.

### Opción A — phpMyAdmin (más sencillo)

1. Abre http://localhost:8082 y entra con el usuario/contraseña de
   `docker-compose.yaml` (`4740201_semprenacasa` / `SempreNaCasa_2026`).
2. Selecciona la base de datos `4740201_semprenacasa`.
3. Pestaña **SQL** → pega el contenido de cada fichero (en el orden de arriba) → **Continuar**.

### Opción B — línea de comandos

```bash
for f in backend/bd/migrations/20260620_fecha_modificacion.sql \
         backend/bd/migrations/20260707_log_excepciones.sql \
         backend/bd/migrations/20260718_criterios_restrictivos.sql \
         backend/bd/migrations/20260718_peso_criterio.sql \
         backend/bd/migrations/20260718_solicitudes_vivienda.sql \
         backend/bd/migrations/20260722_solicitudes_cambio_rol.sql \
         backend/bd/migrations/20260723_recuperacion_password.sql \
         backend/bd/migrations/seed_criterio_opcion.sql; do
  docker exec -i $(docker compose ps -q db) \
    mysql -u4740201_semprenacasa -pSempreNaCasa_2026 4740201_semprenacasa < "$f"
done
```

(Añade `backend/bd/migrations/seed_test_matching.sql` a la lista si también quieres los datos de prueba.)

## 5. Servir el frontend

Con **Live Server** (VS Code): clic derecho sobre `frontend/public.html` →
**"Open with Live Server"**. Por defecto abre en `http://127.0.0.1:5500/...`.

Alternativas desde la carpeta `frontend/`:

```bash
npx serve .          # http://localhost:3000
# o
python -m http.server 5500
```

Cualquier puerto vale — el frontend no depende de en qué puerto se sirva a sí mismo,
solo de que el backend siga en `http://localhost:8081` (definido en `frontend/js/api.js`).

Abre `public.html` (la portada) para empezar a navegar la aplicación.

## 6. Comprobar que todo funciona

1. Desde la portada, **Registrarse** → elige un rol → completa el formulario y la
   encuesta de 10 preguntas. Si falla aquí, seguramente falta aplicar
   `seed_criterio_opcion.sql` (paso 4).
2. Inicia sesión con la cuenta que acabas de crear.
3. Si usaste `seed_test_matching.sql`, puedes iniciar sesión directamente con
   cualquiera de sus usuarios de prueba (contraseña `Test1234!`) para ver viviendas,
   solicitudes y convivencias ya cargadas.
4. Prueba **"¿Has olvidado tu contraseña?"** desde el login: al no haber un servicio
   de email configurado todavía, la propia página te muestra el enlace de
   restablecimiento en pantalla en vez de mandarlo por correo (es el comportamiento
   esperado, no un fallo).

Para el detalle de qué puede hacer cada tipo de usuario dentro de la aplicación, consulta
el [manual de usuario](./manual-usuario/README.md).

## 7. Parar y limpiar

```bash
docker-compose down          # para los contenedores, conserva los datos
docker-compose down -v       # además borra el volumen db_data (vuelves a empezar de cero)
```

## 8. Problemas habituales

| Síntoma | Causa probable |
|---|---|
| La app se queda cargando / errores `Failed to fetch` en la consola | El backend no está levantado, o `docker-compose up` no ha terminado de arrancar `db` todavía. |
| Login o registro fallan con "criterio no encontrado" o similar | Falta aplicar `seed_criterio_opcion.sql`. |
| Las preferencias de vivienda no muestran peso/restrictivo, o las solicitudes de vivienda/rol no aparecen | Faltan una o varias migraciones del paso 4. |
| La página se ve en blanco o con errores de `fetch` de traducciones/parciales | Se abrió el `.html` con doble clic (`file://`) en vez de servirlo por `http://`. |
| Puerto ocupado al hacer `docker-compose up` | Otro proceso ya usa el 8081, 3307 u 8082 — cambia el puerto izquierdo (host) en `docker-compose.yaml`, p. ej. `"8091:80"`. |
