import { t } from './i18n.js';

// Única fuente de verdad para traducir los códigos "code" que devuelve el backend
// (ver backend/index.php y cada *_SERVICE.php) a claves de i18n registradas en
// assets/translations/{es,en,gal}.json. Evita que cada pantalla repita su propio
// mapa código -> texto con mensajes hardcodeados y duplicados.
const MAPA_ERRORES = {
    // Autenticación / cuenta (backend/app/auth/auth_SERVICE.php)
    USUARIO_LOGIN_KO:               'login.userNotFound',
    USUARIO_PASS_KO:                'login.wrongPassword',
    USUARIO_INACTIVO_KO:            'login.inactiveUser',
    USUARIO_YA_EXISTE_KO:           'register.emailOrDniTaken',
    USUARIO_NO_ENCONTRADO_KO:       'recoverPassword.userNotFound',
    PASSWORD_ACTUAL_INCORRECTA_KO:  'profile.currentPasswordIncorrect',
    CAMBIAR_PASSWORD_KO:            'profile.changePasswordError',
    TOKEN_INVALIDO_KO:              'resetPassword.invalidToken',
    TOKEN_EXPIRADO_KO:              'resetPassword.expiredToken',
    RESTABLECER_PASSWORD_KO:        'resetPassword.error',
    admin_no_se_puede_modificar_KO: 'errors.adminNoModificable',

    // Convivencias / solicitudes (backend/app/usuario_vivienda/usuario_vivienda_SERVICE.php)
    FECHA_INICIO_PASADA_KO:                 'huesped.candidates.expectedStartPast',
    FECHA_FIN_ANTERIOR_A_INICIO_KO:         'huesped.candidates.expectedEndInvalid',
    USUARIO_YA_TIENE_CONVIVENCIA_ACTIVA_KO: 'huesped.candidates.requestErrorActive',
    SOLICITUD_YA_EXISTE_KO:                 'huesped.candidates.requestErrorExists',
    SOLICITUD_NO_ENCONTRADA_KO:             'errors.solicitudNoEncontrada',
    SOLICITUD_YA_RESUELTA_KO:               'errors.solicitudYaResuelta',

    // Encuestas / criterios / matching
    UPSERT_RESPUESTA_KO:                         'errors.upsertRespuesta',
    EXCLUYENTE_REQUIERE_CRITERIO_RESTRICTIVO_KO: 'admin.criteria.excludingRequiresRestrictive',
    SIN_CRITERIOS_COMUNES_KO:                    'errors.sinCriteriosComunes',
    RANK_VIVIENDAS_KO:                           'errors.rankViviendas',

    // Genéricos de CRUD (backend/base/appServiceBase.php, usados por cualquier entidad)
    REGISTRO_NO_ENCONTRADO_KO: 'errors.registroNoEncontrado',
    REGISTRO_YA_ACTIVO_KO:     'errors.registroYaActivo',

    // Enrutado / infraestructura (backend/index.php, backend/base/*) — en condiciones
    // normales no deberían llegar al usuario, pero si el backend falla a ese nivel
    // (BD caída, despliegue roto...) hay que mostrar algo en vez de un código crudo.
    CONFIGURACION_NO_ENCONTRADA_KO:     'errors.generic',
    peticion_invalida:                  'errors.generic',
    controlador_vacio:                  'errors.generic',
    accion_vacia:                       'errors.generic',
    controlador_invalido_KO:            'errors.generic',
    definicion_controlador_invalida_KO: 'errors.generic',
    servicio_no_encontrado_KO:          'errors.generic',
    DB_CONNECTION_ERROR:                'errors.generic',
    QUERY_ERROR:                        'errors.generic'
};

// appServiceBase::comprobarnulos() genera dinámicamente un código "{atributo}_es_nulo_KO"
// por cada campo obligatorio que falte, para cualquier entidad (dni_es_nulo_KO,
// id_rol_es_nulo_KO, direccion_es_nulo_KO...). Son demasiados para listarlos uno a uno,
// así que se reconocen por patrón en vez de tener una entrada estática por campo.
const SUFIJO_CAMPO_OBLIGATORIO = '_es_nulo_KO';

/**
 * Traduce un código de error del backend a un mensaje para el usuario.
 * @param {string} code           Valor de resource.code devuelto por apiPost().
 * @param {string} claveFallback  Clave i18n a usar si el código no está mapeado
 *                                (por defecto 'errors.generic'; cada pantalla puede
 *                                pasar su propio mensaje genérico de página).
 */
export function mensajeError(code, claveFallback = 'errors.generic') {
    if (!code) return t(claveFallback);
    if (MAPA_ERRORES[code]) return t(MAPA_ERRORES[code]);
    if (code.endsWith(SUFIJO_CAMPO_OBLIGATORIO)) return t('errors.campoObligatorio');
    return t(claveFallback);
}
