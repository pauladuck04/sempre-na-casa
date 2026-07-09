// Lógica de "Perfil" compartida por los 3 dashboards (anfitrión, huésped, administrador):
// carga de datos por email, toast, medidor de fortaleza de contraseña, toggle mostrar/ocultar
// contraseña y el formulario de cambio de contraseña. Antes estaba copiada literalmente en
// cada dashboard-*.js (y en el caso del administrador, el medidor de fortaleza directamente
// no estaba conectado).

import { t } from './i18n.js';
import { mostrarErrorFormulario, ocultarErrorFormulario, mostrarErrorCampo, ocultarErrorCampo } from './form-errors.js';

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
    const email = (window.auth && typeof window.auth.getEmail === 'function') ? window.auth.getEmail() : localStorage.getItem('user_email');
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
        if (nuevaInput.value.length < 8) { mostrarErrorCampo(nuevaInput, t('profile.passwordTooShort')); return; }
        if (nuevaInput.value !== confirmaInput.value) { mostrarErrorCampo(confirmaInput, t('profile.passwordMismatch')); return; }
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalConfirmarPassword')).show();
    });

    document.getElementById('btnConfirmarPassword')?.addEventListener('click', async () => {
        const mail   = obtenerEmail();
        const actual = actualInput.value;
        const nueva  = nuevaInput.value;

        const res = await apiPost('auth', 'CAMBIAR_CONTRASENA', { mail, password_actual: actual, password: nueva });

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
