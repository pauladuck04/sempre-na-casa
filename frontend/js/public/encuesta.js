// js/public/encuesta.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('encuesta-form');
    const errorMessage = document.getElementById('error-message');
    const barra = document.getElementById('encuestaProgress');
    const btnFinalizar = document.getElementById('btnFinalizar');
    const inputs = document.querySelectorAll('.btn-check');
    const totalPreguntas = 10;
    
    // Obtener datos del usuario registrado
    const userDataStr = sessionStorage.getItem('newUser');
    if (!userDataStr) {
        window.location.href = 'registro.html';
        return;
    }
    
    const userData = JSON.parse(userDataStr);
    console.log('Datos del usuario:', userData);
    
    /**
     * Actualizar barra de progreso
     */
    function actualizarProgreso() {
        // Obtenemos todos los nombres únicos de los radios
        const nombres = new Set();
        inputs.forEach(input => nombres.add(input.name));

        let respondidas = 0;
        
        // Verificamos cuántos grupos tienen al menos un check
        nombres.forEach(nombre => {
            if (document.querySelector(`input[name="${nombre}"]:checked`)) {
                respondidas++;
            }
        });

        // Calculamos el porcentaje
        const porcentaje = (respondidas / totalPreguntas) * 100;
        
        // Actualizamos la barra con una transición suave
        barra.style.width = porcentaje + '%';
        barra.setAttribute('aria-valuenow', porcentaje);
    }

    // Escuchamos el cambio en cualquier radio button
    inputs.forEach(input => {
        input.addEventListener('change', actualizarProgreso);
    });

    // Ejecutar una vez al cargar
    actualizarProgreso();
    
    /**
     * Enviar formulario
     */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        errorMessage.classList.add('d-none');
        
        // Validar que todas las preguntas estén respondidas
        const nombres = new Set();
        inputs.forEach(input => nombres.add(input.name));
        
        let allAnswered = true;
        nombres.forEach(nombre => {
            if (!document.querySelector(`input[name="${nombre}"]:checked`)) {
                allAnswered = false;
            }
        });
        
        if (!allAnswered) {
            errorMessage.textContent = 'Por favor responde todas las preguntas de la encuesta.';
            errorMessage.classList.remove('d-none');
            window.scrollTo(0, 0);
            return;
        }
        
        // Recopilar respuestas de la encuesta
        const encuestaData = {
            userId: userData.userId,
            rol: userData.rol,
            respuestas: {}
        };
        
        nombres.forEach(nombre => {
            const valor = document.querySelector(`input[name="${nombre}"]:checked`).value;
            encuestaData.respuestas[nombre] = parseInt(valor);
        });
        
        console.log('Datos de la encuesta:', encuestaData);
        
        // Cambiar estado del botón
        btnFinalizar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Procesando...';
        btnFinalizar.disabled = true;
        
        try {
            // Llamar a la API para guardar la encuesta
            const response = await api.request('/auth/survey', {
                method: 'POST',
                body: JSON.stringify(encuestaData)
            });
            
            console.log('Encuesta guardada:', response);
            
            // Limpiar sessionStorage
            sessionStorage.removeItem('newUser');
            
            // Simular pequeño delay para que se vea natural
            setTimeout(() => {
                // Redirigir según el rol
                if (userData.rol === 'anfitrion') {
                    window.location.href = 'dashboard-administrador.html';
                } else {
                    window.location.href = 'dashboard-administrador.html';
                }
            }, 1500);
            
        } catch (error) {
            console.error('Error guardando encuesta:', error);
            errorMessage.textContent = error.message || 'Error al guardar la encuesta.';
            errorMessage.classList.remove('d-none');
            
            // Restaurar botón
            btnFinalizar.innerHTML = 'Crear cuenta';
            btnFinalizar.disabled = false;
            
            window.scrollTo(0, 0);
        }
    });
});