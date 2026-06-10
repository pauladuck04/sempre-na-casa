const BASE_URL = 'http://localhost:8081/index.php';

async function apiPost(controlador, action, params = {}) {
    const body = new URLSearchParams({ controlador, action, ...params });
    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}

window.apiPost = apiPost;

// Autenticación simulada
window.auth = {
    login: async (email, password) => {
        localStorage.setItem('user_email', email);
        localStorage.setItem('user_role', email.includes('admin') ? 'anfitrion' : 'inquilino');
        localStorage.setItem('user_token', 'token_' + Date.now());
    },

    logout: () => {
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_token');
    },

    getRole: () => {
        return localStorage.getItem('user_role') || 'inquilino';
    },

    getEmail: () => {
        return localStorage.getItem('user_email');
    },

    isLoggedIn: () => {
        return !!localStorage.getItem('user_token');
    }
};
