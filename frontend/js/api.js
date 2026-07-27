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

// Hash SHA-256 del password antes de enviarlo. El backend le aplica su propio md5() tanto al
// guardar (usuario_SERVICE::modificacion_atributos) como al comparar en el login (auth_SERVICE::LOGIN),
// así que basta con que loginUser/registerUser/resetPassword manden siempre esta misma transformación
// para que cuadre en las dos puntas — no hace falta que el backend sepa nada de este hash extra.
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
