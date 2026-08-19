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

    function comprobarSesion(rolesPermitidos, basePath) {
        if (!getCookie('user_token')) {
            window.location.replace(basePath + 'login.html');
            return;
        }
        const rol = rolActual();
        if (!rolesPermitidos.includes(rol)) {
            window.location.replace(basePath + (DASHBOARD_POR_ROL[rol] || 'login.html'));
        }
    }

    window.protegerRuta = function (rolesPermitidos, basePath = '') {
        comprobarSesion(rolesPermitidos, basePath);

        // Si el navegador restaura esta página desde la bfcache (p.ej. pulsando "atrás"
        // tras cerrar sesión), los scripts no se vuelven a ejecutar por sí solos: hay que
        // revalidar la sesión en ese momento para que la redirección se aplique siempre.
        window.addEventListener('pageshow', function (event) {
            if (event.persisted) {
                comprobarSesion(rolesPermitidos, basePath);
            }
        });
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
