// API Simulada - Sin backend real
const api = {
    login: async (email, password) => {
        // Simular respuesta exitosa
        return {
            success: true,
            userId: 'user123',
            email: email,
            role: email.includes('admin') ? 'anfitrion' : 'inquilino'
        };
    },

    register: async (data) => {
        // Simular registro exitoso
        return {
            success: true,
            userId: 'user' + Date.now(),
            message: 'Registrado exitosamente'
        };
    },

    request: async (endpoint, options = {}) => {
        // Simular peticiones genéricas
        console.log(`API Request: ${endpoint}`, options);
        return { success: true, data: {} };
    }
};

// Autenticación simulada
const auth = {
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
