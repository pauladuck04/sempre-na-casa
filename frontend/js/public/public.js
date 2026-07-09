import { initI18n, applyTranslations, initLangDropdown } from '../i18n.js';
import { cargarPartials } from '../partials.js';

await cargarPartials();
await initI18n();
applyTranslations();
initLangDropdown();

if (document.body.hasAttribute('data-hide-nav-auth')) {
    document.getElementById('navbar-btn-register')?.remove();
    document.getElementById('navbar-btn-login')?.remove();
}
