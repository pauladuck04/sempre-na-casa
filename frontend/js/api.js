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
        setCookie('user_email', email, 7);
        setCookie('user_role', email.includes('admin') ? 'anfitrion' : 'huesped', 7);
        setCookie('user_token', 'token_' + Date.now(), 7);
    },

    logout: () => {
        eraseCookie('user_email');
        eraseCookie('user_role');
        eraseCookie('user_token');
    },

    getRole: () => {
        return getCookie('user_role') || 'huesped';
    },

    getEmail: () => {
        return getCookie('user_email');
    },

    isLoggedIn: () => {
        return !!getCookie('user_token');
    }
};
