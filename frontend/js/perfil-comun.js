// Lógica de "Perfil" compartida por los 3 dashboards (anfitrión, huésped, administrador):
// carga de datos por email, toast, medidor de fortaleza de contraseña, toggle mostrar/ocultar
// contraseña y el formulario de cambio de contraseña. Antes estaba copiada literalmente en
// cada dashboard-*.js (y en el caso del administrador, el medidor de fortaleza directamente
// no estaba conectado).

import { t } from './i18n.js';
import { mostrarErrorFormulario, ocultarErrorFormulario, mostrarErrorCampo, ocultarErrorCampo } from './form-errors.js';
import { REGLAS_CAMPOS } from './validaciones-campos.js';
import { validarTexto } from './validadores.js';

/** Muestra un toast en el `#toastDashboard` de la página actual. */
export function mostrarToast(mensaje, tipo = 'success') {
    const toast = document.getElementById('toastDashboard');
    if (!toast) return;
    toast.className = `toast align-items-center border-0 text-bg-${tipo}`;
    document.getElementById('toastDashboardMsg').textContent = mensaje;
    bootstrap.Toast.getOrCreateInstance(toast, { delay: 3000 }).show();
}

/**
 * Busca el usuario logueado por email y rellena la tarjeta de "Perfil" (nombre, dni, email,
 * teléfono, fecha de alta, avatar con iniciales). Devuelve los datos cargados (o null).
 *
 * @param {Object}   opciones
 * @param {Function} [opciones.onDatos]        Callback(u) para que la página guarde lo que necesite (p.ej. su propio `usuarioActual`).
 * @param {Function} [opciones.colorAvatar]    (u) => color CSS del avatar. Por defecto siempre el color primario.
 * @param {boolean}  [opciones.conFallbackLocal] Si no se encuentra el usuario en el backend, rellena la tarjeta con datos derivados del email en vez de dejarla vacía.
 */
export async function cargarPerfilPorMail(opciones = {}) {
    const { onDatos, colorAvatar = () => 'var(--color-primario)', conFallbackLocal = false } = opciones;
    const email = (window.auth && typeof window.auth.getEmail === 'function') ? window.auth.getEmail() : getCookie('user_email');
    const initialsFrom = name => (name || '').split(' ').map(n => n[0] || '').join('').toUpperCase().slice(0, 2);
    if (!email) return null;

    const pintarPerfil = (nombre, correo, dni, telefono, fechaRegistro, color) => {
        const displayNombre = document.getElementById('perfil-display-nombre'); if (displayNombre) displayNombre.textContent = nombre || '';
        const inpNombre = document.getElementById('perfil-nombre'); if (inpNombre) inpNombre.value = nombre || '';
        const inpEmail = document.getElementById('perfil-email'); if (inpEmail) inpEmail.value = correo || '';
        const inpDni = document.getElementById('perfil-dni'); if (inpDni) inpDni.value = dni || '';
        const inpTel = document.getElementById('perfil-telefono'); if (inpTel) inpTel.value = telefono || '';
        const fecha = document.getElementById('perfil-fecha-alta'); if (fecha) fecha.textContent = fechaRegistro || '-';
        const initials = initialsFrom(nombre);
        const avatar = document.getElementById('perfil-avatar'); if (avatar) { avatar.textContent = initials; avatar.style.backgroundColor = color; }
        const btn = document.getElementById('btnPerfil'); if (btn) { btn.textContent = initials; btn.style.backgroundColor = color; }
    };

    try {
        const res = await apiPost('usuario', 'getByMail', { mail: email });
        if (res.ok && Array.isArray(res.resource) && res.resource.length > 0) {
            const ures = res.resource[0];
            const u = {
                id: ures.id_usuario,
                nombre: `${ures.nombre_usuario} ${ures.apellidos}`.trim(),
                email: ures.mail,
                dni: ures.dni,
                telefono: ures.telefono,
                ciudad: ures.ciudad || '',
                id_rol: ures.id_rol,
                id_rol_solicitado: ures.id_rol_solicitado || null,
                estado_cambio_rol: ures.estado_cambio_rol || null,
                fechaSolicitudRol: ures.fecha_solicitud_rol ? ures.fecha_solicitud_rol.split(' ')[0] : null,
                fechaRegistro: ures.fecha_alta_usuario ? ures.fecha_alta_usuario.split(' ')[0] : '-'
            };
            pintarPerfil(u.nombre, u.email, u.dni, u.telefono, u.fechaRegistro, colorAvatar(u));
            onDatos?.(u);
            return u;
        }
    } catch (err) {
        console.warn('Error cargando perfil por mail:', err);
    }

    if (conFallbackLocal) {
        const fallbackNombre = email.split('@')[0];
        pintarPerfil(fallbackNombre, email, '', '', '-', colorAvatar({ id_rol: null }));
    }
    return null;
}

function calcularFortaleza(pwd) {
    let p = 0;
    if (pwd.length >= 8)          p++;
    if (/[A-Z]/.test(pwd))        p++;
    if (/[0-9]/.test(pwd))        p++;
    if (/[^A-Za-z0-9]/.test(pwd)) p++;
    return Math.max(1, p);
}

/** Conecta el medidor visual de fortaleza bajo el campo #pwd-nueva. */
export function inicializarMedidorFortaleza() {
    document.getElementById('pwd-nueva')?.addEventListener('input', function() {
        const wrap = document.getElementById('pwd-strength-wrap');
        const bar  = document.getElementById('pwd-strength-bar');
        const txt  = document.getElementById('pwd-strength-text');
        if (!wrap || !bar || !txt) return;
        if (!this.value) { wrap.style.display = 'none'; return; }
        wrap.style.display = 'block';
        const cfg = {
            1: [25, '#dc3545', t('profile.strengthVeryWeak')],
            2: [50, '#fd7e14', t('profile.strengthWeak')],
            3: [75, '#ffc107', t('profile.strengthModerate')],
            4: [100, '#28a745', t('profile.strengthStrong')]
        }[calcularFortaleza(this.value)];
        bar.style.width = cfg[0] + '%'; bar.style.backgroundColor = cfg[1];
        txt.textContent = cfg[2]; txt.style.color = cfg[1];
    });
}

/** Conecta los botones de mostrar/ocultar contraseña (`[data-toggle-pwd]`). */
export function inicializarTogglePassword() {
    document.querySelectorAll('[data-toggle-pwd]').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = document.getElementById(btn.dataset.togglePwd);
            const icon  = btn.querySelector('i');
            input.type     = input.type === 'password' ? 'text' : 'password';
            icon.className = input.type === 'password' ? 'bi bi-eye' : 'bi bi-eye-slash';
        });
    });
}

/**
 * Conecta el formulario de cambio de contraseña (#perfil-form-pwd) y su modal de confirmación.
 * @param {Function} obtenerEmail () => email del usuario que va a cambiar su contraseña.
 */
export function inicializarCambioPassword(obtenerEmail) {
    const form = document.getElementById('perfil-form-pwd');
    if (!form) return;

    const actualInput   = document.getElementById('pwd-actual');
    const nuevaInput    = document.getElementById('pwd-nueva');
    const confirmaInput = document.getElementById('pwd-confirmar');
    const feedback      = document.getElementById('pwd-feedback');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        ocultarErrorFormulario(feedback);
        [actualInput, nuevaInput, confirmaInput].forEach(ocultarErrorCampo);

        if (!actualInput.value) { mostrarErrorCampo(actualInput, t('profile.passwordRequired')); return; }
        const motivoPassword = validarTexto(nuevaInput.value, REGLAS_CAMPOS.usuario.password);
        if (motivoPassword === 'min_size') { mostrarErrorCampo(nuevaInput, t('profile.passwordTooShort')); return; }
        if (motivoPassword === 'max_size') { mostrarErrorCampo(nuevaInput, t('profile.passwordTooLong')); return; }
        if (nuevaInput.value !== confirmaInput.value) { mostrarErrorCampo(confirmaInput, t('profile.passwordMismatch')); return; }
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalConfirmarPassword')).show();
    });

    document.getElementById('btnConfirmarPassword')?.addEventListener('click', async () => {
        const mail   = obtenerEmail();
        const actual = actualInput.value;
        const nueva  = nuevaInput.value;

        const res = await apiPost('auth', 'CAMBIAR_CONTRASENA', {
            mail,
            password_actual: await hashPassword(actual),
            password: await hashPassword(nueva)
        });

        bootstrap.Modal.getInstance(document.getElementById('modalConfirmarPassword')).hide();

        if (!res.ok) {
            const msg = res.code === 'PASSWORD_ACTUAL_INCORRECTA_KO'
                ? 'La contraseña actual no es correcta.'
                : 'Error al cambiar la contraseña.';
            mostrarErrorFormulario(feedback, msg);
            return;
        }

        form.reset();
        const strengthWrap = document.getElementById('pwd-strength-wrap');
        if (strengthWrap) strengthWrap.style.display = 'none';
        ocultarErrorFormulario(feedback);
        mostrarToast(t('profile.passwordUpdated'), 'success');
    });
}

/**
 * Conecta la tarjeta "Solicitar cambio de rol" del perfil (ver partials/perfil-cambio-rol.html):
 * carga los roles disponibles, muestra el estado si ya hay una solicitud pendiente, y envía la
 * solicitud nueva al backend.
 * @param {Object} usuario  el objeto `u` que devuelve cargarPerfilPorMail (id, id_rol, id_rol_solicitado, estado_cambio_rol, fechaSolicitudRol).
 */
export async function inicializarCambioRol(usuario) {
    const form   = document.getElementById('perfil-form-cambio-rol');
    const select = document.getElementById('cambio-rol-select');
    const aviso  = document.getElementById('cambio-rol-pendiente');
    if (!form || !select || !usuario) return;

    const res = await apiPost('rol', 'getAll');
    const roles = (res.ok && Array.isArray(res.resource)) ? res.resource.filter(r => r.activo_rol == 1) : [];

    const mostrarPendiente = () => {
        const rol = roles.find(r => String(r.id_rol) === String(usuario.id_rol_solicitado));
        const nombreRol = rol ? rol.nombre_rol : `#${usuario.id_rol_solicitado}`;
        aviso.innerHTML = `<i class="bi bi-hourglass-split me-1"></i>${t('profile.changeRole.pendingPrefix')} <strong>${nombreRol}</strong>` +
            (usuario.fechaSolicitudRol ? ` <span class="text-muted">(${t('profile.changeRole.pendingSince')} ${usuario.fechaSolicitudRol})</span>` : '');
        aviso.classList.remove('d-none');
        form.classList.add('d-none');
    };

    const mostrarFormulario = () => {
        aviso.classList.add('d-none');
        form.classList.remove('d-none');
        select.innerHTML = `<option value="">${t('profile.changeRole.selectPlaceholder')}</option>` +
            roles.filter(r => String(r.id_rol) !== String(usuario.id_rol))
                 .map(r => `<option value="${r.id_rol}">${r.nombre_rol}</option>`)
                 .join('');
    };

    if (usuario.estado_cambio_rol === 'PENDIENTE') {
        mostrarPendiente();
    } else {
        mostrarFormulario();
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!select.value) {
            mostrarToast(t('profile.changeRole.errorSelectRole'), 'danger');
            return;
        }

        const btn = document.getElementById('btnSolicitarCambioRol');
        btn.disabled = true;

        const res = await apiPost('usuario', 'SOLICITAR_CAMBIO_ROL', {
            id_usuario: usuario.id,
            id_rol_solicitado: select.value
        });

        btn.disabled = false;

        if (!res.ok) {
            const mensajes = {
                MISMO_ROL_KO: t('profile.changeRole.errorSameRole'),
                SOLICITUD_CAMBIO_ROL_YA_EXISTE_KO: t('profile.changeRole.errorAlreadyPending')
            };
            mostrarToast(mensajes[res.code] || t('profile.changeRole.errorGeneric'), 'danger');
            return;
        }

        usuario.id_rol_solicitado = select.value;
        usuario.estado_cambio_rol = 'PENDIENTE';
        usuario.fechaSolicitudRol = new Date().toISOString().split('T')[0];
        mostrarPendiente();
        mostrarToast(t('profile.changeRole.success'), 'success');
    });
}
