import { initI18n, t, applyTranslations } from './i18n.js';
import { mostrarErrorFormulario, ocultarErrorFormulario } from './form-errors.js';
import { renderPreguntasEncuesta } from './encuesta-criterios.js';

await renderPreguntasEncuesta(document.getElementById('preguntas-encuesta'));

await initI18n();
applyTranslations();

const form         = document.getElementById('encuesta-form');
const errorMessage = document.getElementById('error-message');
const barra        = document.getElementById('encuestaProgress');
const btnFinalizar = document.getElementById('btnFinalizar');
const inputs       = document.querySelectorAll('.btn-check');
const totalPreguntas = document.querySelectorAll('[data-criterio]').length;

const userDataStr       = sessionStorage.getItem('newUser');
const usuarioLogueadoId = getCookie('user_id');

if (!userDataStr && !usuarioLogueadoId) {
    window.location.href = 'registro.html';
}

const userData = userDataStr ? JSON.parse(userDataStr) : null;

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

    ocultarErrorFormulario(errorMessage);

    const nombres = new Set();
    inputs.forEach(input => nombres.add(input.name));

    let allAnswered = true;
    nombres.forEach(nombre => {
        if (!document.querySelector(`input[name="${nombre}"]:checked`)) allAnswered = false;
    });

    if (!allAnswered) {
        mostrarErrorFormulario(errorMessage, t('survey.allRequired') || 'Debes responder todas las preguntas.');
        window.scrollTo(0, 0);
        return;
    }

    btnFinalizar.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> ${t('survey.processing') || 'Procesando...'}`;
    btnFinalizar.disabled  = true;

    try {
        let idUsuario;

        if (usuarioLogueadoId) {
            // Usuario ya registrado que no ha rellenado la encuesta aún
            idUsuario = usuarioLogueadoId;
        } else {
            // Flujo normal de registro: crear la cuenta primero
            const resRegistro = await apiPost('auth', 'REGISTRAR', {
                nombre:    userData.nombre,
                apellidos: userData.apellidos,
                email:     userData.email,
                telefono:  userData.telefono,
                dni:       userData.dni,
                password:  userData.password,
                rol:       userData.rol,
                id_rol:    userData.id_rol
            });

            if (!resRegistro.ok) {
                throw new Error(resRegistro.code === 'USUARIO_YA_EXISTE_KO'
                    ? 'Ya existe una cuenta con ese email o DNI.'
                    : 'Error al crear la cuenta. Inténtalo de nuevo.');
            }

            idUsuario = resRegistro.resource;
        }

        // Guardar respuestas de la encuesta
        const secciones = document.querySelectorAll('[data-criterio]');
        const promesas = [];

        secciones.forEach(seccion => {
            const idCriterio = seccion.getAttribute('data-criterio');
            const radioMarcado = seccion.querySelector('.btn-check:checked');
            if (radioMarcado) {
                promesas.push(
                    apiPost('usuario_criterio_opcion', 'ADD', {
                        id_usuario:  idUsuario,
                        id_criterio: idCriterio,
                        id_opcion:   radioMarcado.value
                    })
                );
            }
        });

        await Promise.all(promesas);

        if (usuarioLogueadoId) {
            window.location.href = 'dashboard-huesped.html';
        } else {
            sessionStorage.removeItem('newUser');
            window.location.href = 'login.html';
        }

    } catch (error) {
        console.error('Error en encuesta:', error);
        mostrarErrorFormulario(errorMessage, error.message || t('survey.error') || 'Error al completar el registro.');
        window.scrollTo(0, 0);

        btnFinalizar.textContent = t('survey.finishBtn') || 'Crear cuenta';
        btnFinalizar.disabled    = false;
    }
});
