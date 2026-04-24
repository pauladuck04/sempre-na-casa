// js/public/login.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('toggleIcon');
    
    // Toggle mostrar/ocultar contraseña
    togglePassword.addEventListener('click', () => {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.classList.remove('bi-eye');
            toggleIcon.classList.add('bi-eye-slash');
        } else {
            passwordInput.type = 'password';
            toggleIcon.classList.remove('bi-eye-slash');
            toggleIcon.classList.add('bi-eye');
        }
    });
    
    // Manejar envío del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            // Limpiar mensaje de error previo
            errorMessage.classList.add('d-none');
            errorMessage.textContent = '';
            
            // Llamar a la API de login
            const response = await api.login(email, password);
            
            // Guardar datos del usuario
            await auth.login(email, password);
            
            // Redirigir según rol
            const role = auth.getRole();
            if (role === 'anfitrion') {
                window.location.href = 'anfitrion.html';
            } else if (role === 'inquilino') {
                window.location.href = 'inquilino.html';
            }
            
        } catch (error) {
            console.error('Error en login:', error);
            errorMessage.textContent = error.message || 'Error al iniciar sesión. Verifica tus credenciales.';
            errorMessage.classList.remove('d-none');
        }
    });
});