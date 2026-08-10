//cambiar url de la api según el entorno
const API_URL = 'http://backsemprenacasa.atwebpages.com/index.php'; // Cambiar a la URL de tu API

async function apiPost(controlador, action, params = {}) {
    const body = new URLSearchParams({ controlador, action, ...params });
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
    });
    const responseText = await response.text();
    let data;
    try {
        data = JSON.parse(responseText);
    } catch (error) {
        const detail = responseText.replace(/\s+/g, ' ').trim().slice(0, 300);
        throw new Error(`La API no devolvió JSON (HTTP ${response.status}): ${detail || 'respuesta vacía'}`);
    }
    if (!response.ok) throw new Error(data.code || `HTTP ${response.status}`);
    return data;
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
