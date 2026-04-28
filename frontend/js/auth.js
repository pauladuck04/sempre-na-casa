// Sistema de autenticación
const auth = {
    login: async (email, password) => {
        localStorage.setItem('user_email', email);
        localStorage.setItem('user_role', email.includes('admin') ? 'admin' : 'user');
        localStorage.setItem('user_token', 'token_' + Date.now());
    },

    logout: () => {
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_token');
        window.location.href = 'index.html';
    },

    getRole: () => {
        return localStorage.getItem('user_role') || 'user';
    },

    getEmail: () => {
        return localStorage.getItem('user_email') || 'usuario@ejemplo.com';
    },

    isLoggedIn: () => {
        return !!localStorage.getItem('user_token');
    },

    requireAdmin: () => {
        if (!auth.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }
};
