// js/public/registro.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registro-form');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    const rolInput = document.getElementById('rol');
    const rolLabel = document.getElementById('rol-label');
    const password = document.getElementById('password');
    const password2 = document.getElementById('password2');
    const passError = document.getElementById('pass-error');
    const togglePassword = document.querySelector('.toggle-password');
    const togglePassword2 = document.querySelector('.toggle-password2');
    const iconPass = document.getElementById('icon-pass');
    const iconPass2 = document.getElementById('icon-pass2');
    
    // Obtener rol de URL
    const urlParams = new URLSearchParams(window.location.search);
    const rolParam = urlParams.get('rol');
    if (rolParam === 'anfitrion') {
        rolInput.value = 'anfitrion';
        rolLabel.textContent = '🏠 Anfitrión';
    }
    
    // Toggle mostrar/ocultar contraseña
    togglePassword.addEventListener('click', () => {
        if (password.type === 'password') {
            password.type = 'text';
            iconPass.classList.remove('bi-eye');
            iconPass.classList.add('bi-eye-slash');
        } else {
            password.type = 'password';
            iconPass.classList.remove('bi-eye-slash');
            iconPass.classList.add('bi-eye');
        }
    });
    
    togglePassword2.addEventListener('click', () => {
        if (password2.type === 'password') {
            password2.type = 'text';
            iconPass2.classList.remove('bi-eye');
            iconPass2.classList.add('bi-eye-slash');
        } else {
            password2.type = 'password';
            iconPass2.classList.remove('bi-eye-slash');
            iconPass2.classList.add('bi-eye');
        }
    });
    
    // Validar que las contraseñas coincidan
    password2.addEventListener('input', () => {
        if (password.value !== password2.value) {
            passError.classList.remove('d-none');
        } else {
            passError.classList.add('d-none');
        }
    });
    
    // Enviar formulario
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Validaciones básicas
        if (password.value !== password2.value) {
            passError.classList.remove('d-none');
            return;
        }

        // Recopilar datos del formulario
        const formData = {
            dni: document.getElementById('dni').value,
            nombre: document.getElementById('nombre').value,
            apellidos: document.getElementById('apellidos').value,
            email: document.getElementById('email').value,
            telefono: document.getElementById('telefono').value,
            password: password.value,
            rol: rolInput.value
        };

        // Guardar datos en sessionStorage
        sessionStorage.setItem('newUser', JSON.stringify(formData));

        // Redirigir a encuesta
        window.location.href = `encuesta.html?rol=${formData.rol}`;
    });
});