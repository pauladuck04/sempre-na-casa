// Protección de rutas basada en la sesión guardada en cookies (cookies.js) al hacer login.
// Se carga como <script> clásico (no type="module") al principio de <head>, después de
// cookies.js y antes de pintar nada, para redirigir de inmediato si el usuario no debería
// estar aquí.

(function () {
    const DASHBOARD_POR_ROL = {
        admin:     'dashboard-administrador.html',
        anfitrion: 'dashboard-anfitrion.html',
        huesped:   'dashboard-huesped.html'
    };

    function normalizarRol(nombreRol) {
        return (nombreRol || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '');
    }

    function rolActual() {
        const rol = normalizarRol(getCookie('user_rol'));
        if (rol.includes('admin')) return 'admin';
        if (rol.includes('anfitrion')) return 'anfitrion';
        if (getCookie('user_token')) return 'huesped';
        return null;
    }

    // Redirige fuera de la página actual si el usuario no ha iniciado sesión
    // o su rol no está entre los permitidos para esta página.
    // `basePath` es el prefijo relativo hasta frontend/ desde donde se llama: '' para las
    // páginas que ya viven en frontend/ (las 3 dashboard-*.html), o p.ej. '../../frontend/'
    // para páginas fuera de esa carpeta (ver pruebas/frontend/test_runner.html y
    // pruebas/backend/backend_runner.html, protegidas con rol admin).
    window.protegerRuta = function (rolesPermitidos, basePath = '') {
        if (!getCookie('user_token')) {
            window.location.replace(basePath + 'login.html');
            return;
        }
        const rol = rolActual();
        if (!rolesPermitidos.includes(rol)) {
            window.location.replace(basePath + (DASHBOARD_POR_ROL[rol] || 'login.html'));
        }
    };

    // Borra todos los datos de sesión sin redirigir (útil tras eliminar/desactivar la cuenta).
    window.limpiarSesion = function () {
        ['user_token', 'user_id', 'user_email', 'user_nombre', 'user_id_rol', 'user_rol'].forEach(k => eraseCookie(k));
    };

    window.cerrarSesion = function () {
        window.limpiarSesion();
        window.location.href = 'public.html';
    };

    document.addEventListener('DOMContentLoaded', function () {
        document.getElementById('btnLogout')?.addEventListener('click', function (e) {
            e.preventDefault();
            window.cerrarSesion();
        });
    });
})();

// Aclaración importante: estas son cookies propias del cliente (document.cookie vía cookies.js), no
// cookies de sesión HttpOnly gestionadas por el servidor — el fetch al backend ni siquiera manda
// credentials. Ojo: esto sigue siendo protección de navegación en el cliente, no seguridad real —
// cualquiera con la consola del navegador puede escribir document.cookie = 'user_rol=Administrador'
// y saltárselo. Si el backend PHP no está ya validando el rol en cada petición de usuario/vivienda/etc.
// por su cuenta, ahí sigue habiendo un agujero de verdad.
