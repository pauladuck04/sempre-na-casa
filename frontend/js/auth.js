import { initI18n, t, applyTranslations, initLangDropdown } from './i18n.js';
import { mostrarErrorFormulario, ocultarErrorFormulario, mostrarErrorCampo, ocultarErrorCampo, validarCampoTexto } from './form-errors.js';
import { inicializarTogglePassword, inicializarMedidorFortaleza } from './perfil-comun.js';
import { renderPreguntasEncuesta, leerRespuestaCriterio } from './encuesta-criterios.js';
import { REGLAS_CAMPOS } from './validaciones-campos.js';
import { mensajeError } from './error-codes.js';

const contenedorPreguntas = document.getElementById('preguntas-encuesta');
if (contenedorPreguntas) {
    await renderPreguntasEncuesta(contenedorPreguntas);
}

await initI18n();
applyTranslations();
if (document.getElementById('langDropdown')) initLangDropdown();

// ================== LOGIN (login.html) ==================
const loginForm = document.getElementById('login-form');
if (loginForm) {
    const errorMessage   = document.getElementById('error-message');
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput  = document.getElementById('password');
    const toggleIcon     = document.getElementById('toggleIcon');

    togglePassword.addEventListener('click', () => {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.classList.replace('bi-eye', 'bi-eye-slash');
        } else {
            passwordInput.type = 'password';
            toggleIcon.classList.replace('bi-eye-slash', 'bi-eye');
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email    = document.getElementById('email').value;
        const password = passwordInput.value;

        ocultarErrorFormulario(errorMessage);

        try {
            const res = await loginUser(email, password);

            if (!res.ok) {
                mostrarErrorFormulario(errorMessage, mensajeError(res.code, 'login.error'));
                return;
            }

            const usuario = res.resource.usuario;
            setCookie('user_token',  res.resource.token, 7);
            setCookie('user_id',     usuario.id_usuario, 7);
            setCookie('user_email',  usuario.mail, 7);
            setCookie('user_nombre', usuario.nombre_usuario + ' ' + usuario.apellidos, 7);
            setCookie('user_id_rol', usuario.id_rol, 7);
            setCookie('user_rol',    usuario.nombre_rol || '', 7);

            const rol = (usuario.nombre_rol || '').toLowerCase()
                .normalize('NFD').replace(/[̀-ͯ]/g, '');

            if (rol.includes('admin')) {
                window.location.href = 'dashboard-administrador.html';
            } else if (rol.includes('anfitrion')) {
                window.location.href = 'dashboard-anfitrion.html';
            } else {
                const resRespuestas = await apiPost('usuario_criterio_opcion', 'getByUsuario', { id_usuario: usuario.id_usuario });
                const tieneRespuestas = resRespuestas.ok && Array.isArray(resRespuestas.resource) && resRespuestas.resource.length > 0;
                window.location.href = tieneRespuestas ? 'dashboard-huesped.html' : 'encuesta.html';
            }

        } catch (error) {
            console.error('Error en login:', error);
            mostrarErrorFormulario(errorMessage, 'Error técnico: ' + error.message);
        }
    });
}

// ================== REGISTRO, paso 1: datos (registro.html) ==================
const registroForm = document.getElementById('registro-form');
if (registroForm) {
    const errorMessage    = document.getElementById('error-message');
    const rolInput        = document.getElementById('rol');
    const rolLabel        = document.getElementById('rol-label');
    const dniInput        = document.getElementById('dni');
    const nombreInput     = document.getElementById('nombre');
    const apellidosInput  = document.getElementById('apellidos');
    const telefonoInput   = document.getElementById('telefono');
    const emailInput      = document.getElementById('email');
    const password        = document.getElementById('password');
    const password2       = document.getElementById('password2');
    const togglePassword  = document.querySelector('.toggle-password');
    const togglePassword2 = document.querySelector('.toggle-password2');
    const iconPass        = document.getElementById('icon-pass');
    const iconPass2       = document.getElementById('icon-pass2');

    const mensajesDni       = { min_size: t('register.dniMinSize'),      max_size: t('register.dniMaxSize'),      format: t('register.dniFormat') };
    const mensajesNombre    = { min_size: t('register.nameMinSize'),     max_size: t('register.nameMaxSize'),     format: t('register.nameFormat') };
    const mensajesApellidos = { min_size: t('register.surnamesMinSize'), max_size: t('register.surnamesMaxSize'), format: t('register.surnamesFormat') };
    const mensajesTelefono  = { min_size: t('register.phoneMinSize'),    max_size: t('register.phoneMaxSize'),    format: t('register.phoneFormat') };
    const mensajesEmail     = { min_size: t('register.emailMinSize'),    max_size: t('register.emailMaxSize'),    format: t('register.emailFormat') };
    const mensajesPassword  = { min_size: t('register.passwordMinSize'), max_size: t('register.passwordMaxSize') };

    // Validación en vivo al salir de cada campo
    dniInput.addEventListener('blur',       () => validarCampoTexto(dniInput,       REGLAS_CAMPOS.usuario.dni,            mensajesDni));
    nombreInput.addEventListener('blur',    () => validarCampoTexto(nombreInput,    REGLAS_CAMPOS.usuario.nombre_usuario, mensajesNombre));
    apellidosInput.addEventListener('blur', () => validarCampoTexto(apellidosInput, REGLAS_CAMPOS.usuario.apellidos,      mensajesApellidos));
    telefonoInput.addEventListener('blur',  () => validarCampoTexto(telefonoInput,  REGLAS_CAMPOS.usuario.telefono,       mensajesTelefono));
    emailInput.addEventListener('blur',     () => validarCampoTexto(emailInput,     REGLAS_CAMPOS.usuario.mail,           mensajesEmail));
    password.addEventListener('blur',       () => validarCampoTexto(password,       REGLAS_CAMPOS.usuario.password,       mensajesPassword));

    const urlParams = new URLSearchParams(window.location.search);
    const rolParam  = (urlParams.get('rol') || '').toLowerCase();
    if (rolParam === 'anfitrion') {
        rolInput.value = 'anfitrion';
        rolLabel.textContent = t('register.roleAnfitrion');
    } else {
        rolInput.value = 'huesped';
        rolLabel.textContent = t('register.studentRole');
    }

    togglePassword.addEventListener('click', () => {
        if (password.type === 'password') {
            password.type = 'text';
            iconPass.classList.replace('bi-eye', 'bi-eye-slash');
        } else {
            password.type = 'password';
            iconPass.classList.replace('bi-eye-slash', 'bi-eye');
        }
    });

    togglePassword2.addEventListener('click', () => {
        if (password2.type === 'password') {
            password2.type = 'text';
            iconPass2.classList.replace('bi-eye', 'bi-eye-slash');
        } else {
            password2.type = 'password';
            iconPass2.classList.replace('bi-eye-slash', 'bi-eye');
        }
    });

    password2.addEventListener('input', () => {
        if (password.value !== password2.value) {
            mostrarErrorCampo(password2, t('register.passwordMismatch'));
        } else {
            ocultarErrorCampo(password2);
        }
    });

    registroForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        ocultarErrorFormulario(errorMessage);
        [dniInput, nombreInput, apellidosInput, telefonoInput, emailInput, password, password2].forEach(ocultarErrorCampo);

        let valido = true;
        if (!validarCampoTexto(dniInput,       REGLAS_CAMPOS.usuario.dni,            mensajesDni))       valido = false;
        if (!validarCampoTexto(nombreInput,    REGLAS_CAMPOS.usuario.nombre_usuario, mensajesNombre))    valido = false;
        if (!validarCampoTexto(apellidosInput, REGLAS_CAMPOS.usuario.apellidos,      mensajesApellidos)) valido = false;
        if (!validarCampoTexto(telefonoInput,  REGLAS_CAMPOS.usuario.telefono,       mensajesTelefono))  valido = false;
        if (!validarCampoTexto(emailInput,     REGLAS_CAMPOS.usuario.mail,           mensajesEmail))     valido = false;
        if (!validarCampoTexto(password,       REGLAS_CAMPOS.usuario.password,       mensajesPassword))  valido = false;
        if (password.value !== password2.value) {
            mostrarErrorCampo(password2, t('register.passwordMismatch'));
            valido = false;
        }

        if (!valido) return;

        const rolSeleccionado   = rolInput.value === 'anfitrion' ? 'anfitrion' : 'huesped';
        const idRolSeleccionado = rolSeleccionado === 'anfitrion' ? 3 : 4;

        const formData = {
            dni:       dniInput.value,
            nombre:    nombreInput.value,
            apellidos: apellidosInput.value,
            email:     emailInput.value,
            telefono:  telefonoInput.value,
            password:  password.value,
            rol:       rolSeleccionado,
            id_rol:    idRolSeleccionado
        };

        ['user_token', 'user_id', 'user_email', 'user_nombre', 'user_id_rol', 'user_rol'].forEach(eraseCookie);

        if (rolSeleccionado === 'anfitrion') {
            const submitBtn = registroForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;

            try {
                const resRegistro = await registerUser(formData);

                if (!resRegistro.ok) {
                    throw new Error(mensajeError(resRegistro.code, 'errors.generic'));
                }

                window.location.href = 'login.html';
            } catch (error) {
                console.error('Error en registro de anfitrión:', error);
                mostrarErrorFormulario(errorMessage, error.message || 'Error al crear la cuenta.');
                submitBtn.disabled = false;
            }
            return;
        }

        sessionStorage.setItem('newUser', JSON.stringify(formData));
        window.location.href = `encuesta.html?rol=${formData.rol}`;
    });
}

// ================== RECUPERAR CONTRASEÑA (recuperar-password.html) ==================
const recuperarForm = document.getElementById('recuperar-form');
if (recuperarForm) {
    const emailInput     = document.getElementById('email');
    const successMessage = document.getElementById('success-message');
    const errorMessage   = document.getElementById('error-message');
    const btnRecuperar   = document.getElementById('btn-recuperar');

    recuperarForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();

        successMessage.classList.add('d-none');
        ocultarErrorFormulario(errorMessage);

        if (!email) {
            mostrarErrorFormulario(errorMessage, t('recoverPassword.emailRequired'));
            return;
        }

        btnRecuperar.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> ${t('recoverPassword.sending')}`;
        btnRecuperar.disabled  = true;

        try {
            const res = await requestPasswordReset(email);

            if (!res.ok) {
                mostrarErrorFormulario(errorMessage, mensajeError(res.code, 'recoverPassword.error'));
                return;
            }

            successMessage.classList.remove('d-none');
            recuperarForm.reset();

        } catch (error) {
            console.error('Error en recuperar contraseña:', error);
            mostrarErrorFormulario(errorMessage, error.message || t('recoverPassword.error'));
            window.scrollTo(0, 0);
        } finally {
            btnRecuperar.textContent = t('recoverPassword.submit');
            btnRecuperar.disabled    = false;
        }
    });
}

// ================== RESTABLECER CONTRASEÑA (restablecer-password.html) ==================
const resetForm = document.getElementById('reset-form');
if (resetForm) {
    inicializarTogglePassword();
    inicializarMedidorFortaleza();

    const errorMessage  = document.getElementById('error-message');
    const successBlock  = document.getElementById('success-block');
    const btn            = document.getElementById('btn-restablecer');
    const nuevaInput     = document.getElementById('pwd-nueva');
    const confirmaInput  = document.getElementById('pwd-confirmar');

    const token = new URLSearchParams(window.location.search).get('token');

    function mostrarSoloError(mensaje, { conEnlaceNuevo = false } = {}) {
        resetForm.classList.add('d-none');
        let html = mensaje;
        if (conEnlaceNuevo) {
            html += ` <a href="recuperar-password.html">${t('resetPassword.requestNewLink')}</a>`;
        }
        mostrarErrorFormulario(errorMessage, html);
    }

    if (!token) {
        mostrarSoloError(t('resetPassword.noToken'), { conEnlaceNuevo: true });
    }

    resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        ocultarErrorFormulario(errorMessage);
        [nuevaInput, confirmaInput].forEach(ocultarErrorCampo);

        if (nuevaInput.value.length < 8) { mostrarErrorCampo(nuevaInput, t('profile.passwordTooShort')); return; }
        if (nuevaInput.value !== confirmaInput.value) { mostrarErrorCampo(confirmaInput, t('profile.passwordMismatch')); return; }

        btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> ${t('resetPassword.processing')}`;
        btn.disabled  = true;

        try {
            const res = await resetPassword(token, nuevaInput.value);

            if (!res.ok) {
                const esTokenInvalidoOCaducado = res.code === 'TOKEN_INVALIDO_KO' || res.code === 'TOKEN_EXPIRADO_KO';
                mostrarSoloError(mensajeError(res.code, 'resetPassword.error'), { conEnlaceNuevo: esTokenInvalidoOCaducado });
                return;
            }

            resetForm.classList.add('d-none');
            successBlock.classList.remove('d-none');

        } catch (error) {
            console.error('Error al restablecer contraseña:', error);
            mostrarErrorFormulario(errorMessage, error.message || t('resetPassword.error'));
        } finally {
            btn.textContent = t('resetPassword.submit');
            btn.disabled    = false;
        }
    });
}

// ================== ENCUESTA, paso 2: crea la cuenta + guarda respuestas (encuesta.html) ==================
const encuestaForm = document.getElementById('encuesta-form');
if (encuestaForm) {
    const errorMessage   = document.getElementById('error-message');
    const barra          = document.getElementById('encuestaProgress');
    const btnFinalizar   = document.getElementById('btnFinalizar');
    const inputs         = document.querySelectorAll('.btn-check');
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

    encuestaForm.addEventListener('submit', async (e) => {
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

            if (userData) {
                const resRegistro = await registerUser({
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
                    throw new Error(mensajeError(resRegistro.code, 'errors.generic'));
                }

                idUsuario = resRegistro.resource;
            } else if (usuarioLogueadoId) {
                // Usuario ya registrado (login) que no ha rellenado la encuesta aún
                idUsuario = usuarioLogueadoId;
            }

            if (!userData || userData.rol !== 'anfitrion') {
                const secciones = document.querySelectorAll('[data-criterio]');
                const promesas = [];

                secciones.forEach(seccion => {
                    const idCriterio = seccion.getAttribute('data-criterio');
                    const respuesta  = leerRespuestaCriterio(seccion);
                    if (respuesta) {
                        promesas.push(
                            apiPost('usuario_criterio_opcion', 'ADD', {
                                id_usuario:           idUsuario,
                                id_criterio:          idCriterio,
                                id_opcion:            respuesta.idOpcion,
                                peso:                 respuesta.peso,
                                restrictivo:          respuesta.restrictivo,
                                id_opcion_excluyente: respuesta.idOpcionExcluyente
                            })
                        );
                    }
                });

                await Promise.all(promesas);
            }

            if (userData) {
                sessionStorage.removeItem('newUser');
                window.location.href = 'login.html';
            } else if (usuarioLogueadoId) {
                window.location.href = 'dashboard-huesped.html';
            }

        } catch (error) {
            console.error('Error en encuesta:', error);
            mostrarErrorFormulario(errorMessage, error.message || t('survey.error') || 'Error al completar el registro.');
            window.scrollTo(0, 0);

            btnFinalizar.textContent = t('survey.finishBtn') || 'Crear cuenta';
            btnFinalizar.disabled    = false;
        }
    });
}
