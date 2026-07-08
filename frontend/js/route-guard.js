// Protección de rutas basada en la sesión guardada en localStorage al hacer login.
// Se carga como <script> clásico (no type="module") al principio de <head>, antes
// de pintar nada, para redirigir de inmediato si el usuario no debería estar aquí.

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
        const rol = normalizarRol(localStorage.getItem('user_rol'));
        if (rol.includes('admin')) return 'admin';
        if (rol.includes('anfitrion')) return 'anfitrion';
        if (localStorage.getItem('user_token')) return 'huesped';
        return null;
    }

    // Redirige fuera de la página actual si el usuario no ha iniciado sesión
    // o su rol no está entre los permitidos para esta página.
    window.protegerRuta = function (rolesPermitidos) {
        if (!localStorage.getItem('user_token')) {
            window.location.replace('login.html');
            return;
        }
        const rol = rolActual();
        if (!rolesPermitidos.includes(rol)) {
            window.location.replace(DASHBOARD_POR_ROL[rol] || 'login.html');
        }
    };

    // Borra todos los datos de sesión sin redirigir (útil tras eliminar/desactivar la cuenta).
    window.limpiarSesion = function () {
        ['user_token', 'user_id', 'user_email', 'user_nombre', 'user_id_rol', 'user_rol'].forEach(k => localStorage.removeItem(k));
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

// Aclaración importante: la app no usa cookies de sesión (el fetch al backend ni siquiera manda credentials), 
// así que la protección se basa en lo que realmente persiste la sesión hoy: localStorage (user_token + user_rol). 
// Ojo: esto es protección de navegación en el cliente, no seguridad real — cualquiera con la consola del navegador 
// puede escribir localStorage.setItem('user_rol','Administrador') y saltárselo. Si el backend PHP no está ya validando 
// el rol en cada petición de usuario/vivienda/etc. por su cuenta, ahí sigue habiendo un agujero de verdad. 
