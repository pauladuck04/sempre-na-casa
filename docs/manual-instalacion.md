# Manual de instalación — Sempre na Casa

Guía para poner en marcha el proyecto sin Docker: backend en PHP conectado a una
base de datos MySQL que **ya existe en un servidor** (con el esquema y los datos
actualizados — no hace falta aplicar `dump.sql` ni las migraciones de
`backend/bd/migrations/`), y frontend HTML/JS estático servido aparte.

## 1. Requisitos previos

- **PHP 8.2 o superior** con las extensiones `pdo_mysql` y `mysqli` habilitadas.
  Comprueba con:
  ```bash
  php -v
  php -m | grep -i "pdo_mysql\|mysqli"
  ```
- Acceso a un **servidor MySQL/MariaDB** con la base de datos del proyecto ya creada
  y actualizada (host, puerto, usuario, contraseña y nombre de la base de datos).
- Un navegador moderno (Chrome, Firefox, Edge...).
- Para servir el frontend, cualquiera de estas opciones:
  - **Visual Studio Code** con la extensión **Live Server** (recomendado).
  - O Node.js instalado, para usar `npx serve`.
  - O Python instalado, para usar `python -m http.server`.

## 2. Instalación de las herramientas necesarias

A continuación, se describirá el proceso de instalación para todas las herramientas necesarias
para el correcto funcionamiento de la aplicación:

### PHP 8.2 o superior

- **Windows**: la forma más simple es descargar PHP de
  [windows.php.net/download](https://windows.php.net/download/) (versión *Thread Safe*),
  descomprime, añade la carpeta al `PATH` del sistema y habilita ambas extensiones en su
  `php.ini` (quita el `;` delante de `extension=pdo_mysql` y `extension=mysqli`).
- **macOS**: `brew install php`
- **Linux (Debian/Ubuntu)**: `sudo apt install php php-mysql`

Verifica la instalación:

```bash
php -v
php -m | grep -i "pdo_mysql\|mysqli"
```

Ambas extensiones deben aparecer en la segunda salida.

### Un editor y un servidor de archivos estáticos (para el frontend)

Elige una de estas opciones:

- **Visual Studio Code + Live Server** (recomendado, es como está montado el proyecto
  durante el desarrollo):
  1. Instala VS Code desde [code.visualstudio.com](https://code.visualstudio.com/).
  2. Abre la pestaña **Extensiones** (icono de cuadrados en la barra lateral, o
     `Ctrl+Shift+X`), busca **"Live Server"** (de Ritwick Dey) e instálala.
- **Node.js** (para usar `npx serve`): instala la versión LTS desde
  [nodejs.org](https://nodejs.org/). Verifica con `node -v` y `npm -v`.
- **Python** (para usar `python -m http.server`): suele venir preinstalado en macOS/Linux.
  En Windows, descárgalo de [python.org](https://www.python.org/downloads/) y marca
  **"Add python.exe to PATH"** durante la instalación. Verifica con `python --version`.

### Postman (opcional)

Solo necesario si quieres probar la API directamente, sin pasar por el frontend.
Descárgalo e instálalo desde [postman.com/downloads](https://www.postman.com/downloads/)
y luego importa la colección que hay en `postman/collections/`.

## 3. Estructura del proyecto

```
proyectos/
├── backend/          API en PHP (arquitectura propia por controlador/servicio/modelo)
│   ├── index.php       único punto de entrada de la API (recibe POST con controlador+action)
│   ├── Comun/config.php  credenciales de conexión a la base de datos
│   └── bd/migrations/    histórico de cambios de esquema (referencia; no hace falta aplicarlos)
├── frontend/         HTML + CSS + JS estático, sin build ni npm install
├── docs/              este manual y el manual de usuario
├── postman/           colección para probar la API directamente
└── dump.sql            volcado inicial de la base de datos (referencia/histórico)
```

## 4. Configurar la conexión a la base de datos

Edita `backend/Comun/config.php` con los datos del servidor MySQL donde ya está la
base de datos del proyecto:

```php
<?php
define('host', 'TU_HOST_MYSQL');       // p.ej. mysql.miempresa.com
define('user', 'TU_USUARIO');
define('pass', 'TU_CONTRASEÑA');
define('BD',   'TU_BASE_DE_DATOS');
define('BD_test', 'TU_BASE_DE_DATOS'); // el generador automático de la app va en modo test
```

`index.php` solo incluye `Comun/config.php`, así que basta con rellenar estos cinco
valores. No toques nada más en ese fichero.

> Existe también `backend/bd/DBCredentials.php`, con los mismos datos de conexión
> (el hosting de AwardSpace del proyecto). **No lo usa la aplicación** (`index.php`
> no lo incluye) — es solo una copia de referencia; el que hay que editar siempre
> es `Comun/config.php`.

## 5. Levantar el backend

Como `index.php` es el único punto de entrada (no hay rutas bonitas ni `.htaccess`
que resolver), sirve con cualquier servidor PHP. La opción más rápida sin instalar
nada más que PHP:

```bash
cd backend
php -S localhost:8081
```

Si prefieres Apache/Nginx (o el proyecto va a quedar desplegado de forma permanente),
apunta el docroot del vhost a la carpeta `backend/` y asegúrate de que PHP 8.2+ con
`pdo_mysql`/`mysqli` está activo en ese servidor.

Para comprobar que el backend responde y llega a la base de datos:

```bash
curl -X POST http://localhost:8081/index.php -d "controlador=rol&action=getAll"
```

Deberías recibir un JSON con `"ok":true`. Si da error de conexión, revisa las
credenciales del paso 4.

## 6. Servir el frontend

El frontend le habla al backend en la URL fija `API_URL` de
[`frontend/js/api.js`](../frontend/js/api.js):

```js
const API_URL = 'http://localhost:8081/index.php';
```

Si el backend no va a correr en `localhost:8081` (por ejemplo, está en un dominio o
puerto distinto), cambia esa línea antes de servir el frontend.

Con **Live Server** (VS Code): clic derecho sobre `frontend/public.html` →
**"Open with Live Server"**. Por defecto abre en `http://127.0.0.1:5500/...`.

Alternativas desde la carpeta `frontend/`:

```bash
npx serve .          # http://localhost:3000
# o
python -m http.server 5500
```

Cualquier puerto vale — el frontend no depende de en qué puerto se sirva a sí mismo,
solo de que `BASE_URL` apunte al backend correcto.

Abre `public.html` (la portada) para empezar a navegar la aplicación.

## 7. Comprobar que todo funciona

1. Desde la portada, **Registrarse** → elige un rol → completa el formulario y la
   encuesta de convivencia. Si falla aquí, probablemente la base de datos del
   servidor no tiene los criterios/opciones cargados (tablas `criterio` / `opcion`).
2. Inicia sesión con la cuenta que acabas de crear.
3. Si la base de datos del servidor ya trae usuarios de prueba, puedes iniciar
   sesión directamente con ellos para ver viviendas, solicitudes y convivencias
   ya cargadas.
4. Prueba **"¿Has olvidado tu contraseña?"** desde el login: al no haber un servicio
   de email configurado todavía, la propia página te muestra el enlace de
   restablecimiento en pantalla en vez de mandarlo por correo (es el comportamiento
   esperado, no un fallo).

Para el detalle de qué puede hacer cada tipo de usuario dentro de la aplicación, consulta
el [manual de usuario](./manual-usuario/README.md).

## 8. Parar

- Servidor PHP integrado (`php -S ...`): `Ctrl+C` en la terminal donde corre.
- Live Server: botón **"Port: xxxx"** en la barra inferior de VS Code, o clic derecho
  → **"Stop Live Server"**.
- `npx serve` / `python -m http.server`: `Ctrl+C` en su terminal.

La base de datos no se toca en ningún momento desde este flujo — vive en el servidor
y es responsabilidad de quien lo administre.

## 9. Problemas habituales

| Síntoma | Causa probable |
|---|---|
| La app se queda cargando / errores `Failed to fetch` en la consola | El backend no está levantado, o `BASE_URL` en `frontend/js/api.js` no apunta a donde realmente corre. |
| `curl` al backend devuelve error de conexión a MySQL | Credenciales incorrectas en `backend/Comun/config.php`, o el servidor MySQL no permite conexiones desde donde corre el backend (firewall/whitelist de IP). |
| Login o registro fallan con "criterio no encontrado" o similar | La base de datos del servidor no tiene cargadas las tablas `criterio`/`opcion` (ver `backend/bd/migrations/seed_criterio_opcion.sql` como referencia de qué debería contener). |
| Las preferencias de vivienda no muestran peso/restrictivo, o las solicitudes de vivienda/rol no aparecen | La base de datos del servidor no tiene aplicadas todas las migraciones de `backend/bd/migrations/`; habría que pedir que se pongan al día ahí. |
| La página se ve en blanco o con errores de `fetch` de traducciones/parciales | Se abrió el `.html` con doble clic (`file://`) en vez de servirlo por `http://`. |
| Puerto ocupado al hacer `php -S localhost:8081` | Otro proceso ya usa el 8081 — arranca con otro puerto (`php -S localhost:8091`) y actualiza `API_URL` en `frontend/js/api.js` a juego. |
