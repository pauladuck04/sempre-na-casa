//cambiar url de la api según el entorno
const API_URL = 'http://localhost:8081/index.php';

async function apiPost(controlador, action, params = {}) {
    const body = new URLSearchParams({ controlador, action, ...params });
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}

async function hashPassword(password) {
    return CryptoJS.SHA256(password).toString();
}

async function loginUser(mail, password) {
    return apiPost('auth', 'LOGIN', { usuario: mail, contrasena: await hashPassword(password) });
}

async function registerUser(userData) {
    return apiPost('auth', 'REGISTRAR', { ...userData, password: await hashPassword(userData.password) });
}

async function requestPasswordReset(email) {
    return apiPost('auth', 'RECUPERAR_PASSWORD', { mail: email });
}

async function resetPassword(token, password) {
    return apiPost('auth', 'RESTABLECER_PASSWORD', { token, password: await hashPassword(password) });
}
