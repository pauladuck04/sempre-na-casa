// js/public/recuperar-password.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('recuperar-form');
    const emailInput = document.getElementById('email');
    const successMessage = document.getElementById('success-message');
    const errorMessage = document.getElementById('error-message');
    const btnRecuperar = document.getElementById('btn-recuperar');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        
        // Limpiar mensajes previos
        successMessage.classList.add('d-none');
        errorMessage.classList.add('d-none');
        
        // Validar email
        if (!email) {
            errorMessage.textContent = 'Por favor introduce tu email.';
            errorMessage.classList.remove('d-none');
            return;
        }
        
        // Cambiar estado del botón
        btnRecuperar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Enviando...';
        btnRecuperar.disabled = true;
        
        try {
            // Llamar a la API para enviar email de recuperación
            const response = await api.request('/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ email })
            });
            
            console.log('Email enviado:', response);
            
            // Mostrar mensaje de éxito
            successMessage.classList.remove('d-none');
            form.reset();
            
            // Deshabilitar formulario durante unos segundos
            setTimeout(() => {
                emailInput.disabled = false;
                btnRecuperar.innerHTML = 'Recuperar contraseña';
                btnRecuperar.disabled = false;
            }, 5000);
            
            emailInput.disabled = true;
            
        } catch (error) {
            console.error('Error en recuperar contraseña:', error);
            errorMessage.textContent = error.message || 'Error al enviar el email. Intenta de nuevo.';
            errorMessage.classList.remove('d-none');
            
            // Restaurar botón
            btnRecuperar.innerHTML = 'Recuperar contraseña';
            btnRecuperar.disabled = false;
            
            window.scrollTo(0, 0);
        }
    });
});