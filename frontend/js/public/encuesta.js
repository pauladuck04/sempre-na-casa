import { initI18n, t, applyTranslations } from '../i18n.js';

await initI18n();
applyTranslations();

const form         = document.getElementById('encuesta-form');
const errorMessage = document.getElementById('error-message');
const barra        = document.getElementById('encuestaProgress');
const btnFinalizar = document.getElementById('btnFinalizar');
const inputs       = document.querySelectorAll('.btn-check');
const totalPreguntas = 10;

const userDataStr = sessionStorage.getItem('newUser');
if (!userDataStr) {
    window.location.href = 'registro.html';
}

const userData = JSON.parse(userDataStr);

function actualizarProgreso() {
    const nombres = new Set();
    inputs.forEach(input => nombres.add(input.name));

    let respondidas = 0;
    nombres.forEach(nombre => {
        if (document.querySelector(`input[name="${nombre}"]:checked`)) respondidas++;
    });

    const porcentaje = (respondidas / totalPreguntas) * 100;
    barra.style.width = porcentaje + '%';
    barra.setAttribute('aria-valuenow', porcentaje);
}

inputs.forEach(input => input.addEventListener('change', actualizarProgreso));
actualizarProgreso();

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    errorMessage.classList.add('d-none');

    const nombres = new Set();
    inputs.forEach(input => nombres.add(input.name));

    let allAnswered = true;
    nombres.forEach(nombre => {
        if (!document.querySelector(`input[name="${nombre}"]:checked`)) allAnswered = false;
    });

    if (!allAnswered) {
        errorMessage.textContent = t('survey.allRequired');
        errorMessage.classList.remove('d-none');
        window.scrollTo(0, 0);
        return;
    }

    const encuestaData = {
        userId:    userData.userId,
        rol:       userData.rol,
        respuestas: {}
    };

    nombres.forEach(nombre => {
        encuestaData.respuestas[nombre] = parseInt(
            document.querySelector(`input[name="${nombre}"]:checked`).value
        );
    });

    btnFinalizar.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> ${t('survey.processing')}`;
    btnFinalizar.disabled  = true;

    try {
        await api.request('/auth/survey', {
            method: 'POST',
            body: JSON.stringify(encuestaData)
        });

        sessionStorage.removeItem('newUser');

        setTimeout(() => {
            window.location.href = userData.rol === 'anfitrion'
                ? 'dashboard-administrador.html'
                : 'dashboard-administrador.html';
        }, 1500);

    } catch (error) {
        console.error('Error guardando encuesta:', error);
        errorMessage.textContent = error.message || t('survey.error');
        errorMessage.classList.remove('d-none');

        btnFinalizar.textContent = t('survey.finishBtn');
        btnFinalizar.disabled    = false;

        window.scrollTo(0, 0);
    }
});
