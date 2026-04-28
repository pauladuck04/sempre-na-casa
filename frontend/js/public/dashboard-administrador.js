// js/admin/dashboard.js
// Script para el dashboard del administrador

import * as usuarios from './usuarios.js';
import * as roles from './roles.js';
import * as criterios from './criterios.js';
import * as viviendas from './viviendas.js';

document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard administrador cargado');
    
    // Verificar autenticación
    //verificarAutenticacion();
    
    // Cargar datos
    cargarSeguimientoConvivencias();

    const sectionLinks = document.querySelectorAll('.section-link');
    const sectionContents = document.querySelectorAll('.section-content');

    // Textos para cada sección
    const sectionTitles = {
        general: 'Panel de Control',
        usuarios: 'Gestión de Usuarios',
        roles: 'Roles y Permisos',
        viviendas: 'Gestión de Viviendas',
        criterios: 'Criterios de Compatibilidad'
    };

    const sectionDescriptions = {
        general: 'Gestión global de usuarios, viviendas y algoritmos de compatibilidad',
        usuarios: 'Administra y gestiona todos los usuarios del sistema',
        roles: 'Configura roles y permisos de acceso',
        viviendas: 'Gestiona el catálogo de viviendas disponibles',
        criterios: 'Define criterios de compatibilidad para el matching'
    };

    // Event listeners para cada enlace
    sectionLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            const sectionName = link.getAttribute('data-section');

            // Ocultar todas las secciones
            sectionContents.forEach(content => {
                content.classList.remove('active');
            });

            // Mostrar la sección seleccionada
            const activeSection = document.querySelector(`.section-content[data-section="${sectionName}"]`);
            if (activeSection) {
                activeSection.classList.add('active');
            }

            switch(sectionName) {
                case 'general':
                    cargarSeguimientoConvivencias();
                    break;
                case 'usuarios':
                    if (usuarios && typeof usuarios.cargarUsuarios === 'function') {
                        usuarios.cargarUsuarios();
                    }
                    break;
                case 'roles':
                    if (roles && typeof roles.cargarRoles === 'function') {
                        roles.cargarRoles();
                    }
                    break;
                case 'viviendas':
                    if (viviendas && typeof viviendas.cargarViviendas === 'function') {
                    viviendas.cargarViviendas();
                    }
                    break;
                case 'criterios':
                    if (criterios && typeof criterios.cargarCriterios === 'function') {
                        criterios.cargarCriterios();
                    }
                    break;
            }

            // Actualizar título y descripción
            document.getElementById('section-title').textContent = sectionTitles[sectionName] || 'Panel de Control';
            document.getElementById('section-description').textContent = sectionDescriptions[sectionName] || '';

            // Actualizar estilos de los enlaces
            sectionLinks.forEach(l => {
                l.classList.remove('active-custom');
                l.classList.add('text-muted');
            });
            link.classList.add('active-custom');
            link.classList.remove('text-muted');
        });
    });
});

/**
 * Verificar si el usuario está autenticado y es administrador
 */
function verificarAutenticacion() {
    // Verificar si está autenticado usando auth.js
    if (!auth.isLoggedIn()) {
        window.location.href = '../../index.html';
        return;
    }

    // Obtener datos del usuario
    const email = auth.getEmail();
    const role = auth.getRole();

    // Actualizar nombre de usuario en el header (si existe el elemento)
    const userNameElement = document.querySelector('[data-user-name]');
    if (userNameElement) {
        userNameElement.textContent = email || 'Admin';
    }
}

/**
 * Cargar y mostrar seguimiento de convivencias
 */
function cargarSeguimientoConvivencias() {
    const convivencias = [
        {
            id: 1,
            anfitrion: 'Mercedes Rosas',
            inquilino: 'Luis Martínez',
            inicio: '01/02/2026',
            estado: 'activa'
        },
        {
            id: 2,
            anfitrion: 'Ramón Vázquez',
            inquilino: 'Marta Soto',
            inicio: null,
            estado: 'entrevista'
        },
        {
            id: 3,
            anfitrion: 'Carmen Cid',
            inquilino: 'Javier López',
            inicio: '15/03/2026',
            estado: 'prueba'
        }
    ];
    
    renderizarConvivencias(convivencias);
}

/**
 * Renderizar tabla de convivencias
 */
function renderizarConvivencias(convivencias) {
    const tbody = document.getElementById('tabla-convivencias');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    convivencias.forEach(convivencia => {
        const row = document.createElement('tr');
        let estadoBadge = '';
        
        switch(convivencia.estado) {
            case 'activa':
                estadoBadge = `<span class="badge rounded-pill px-3 py-2" style="background-color: #D1E7DD; color: #0F5132;">✓ Activa</span>`;
                break;
            case 'entrevista':
                estadoBadge = `<span class="badge rounded-pill px-3 py-2" style="background-color: #FFF3CD; color: #856404;">⏳ En Entrevista</span>`;
                break;
            case 'prueba':
                estadoBadge = `<span class="badge rounded-pill px-3 py-2" style="background-color: #CFE2FF; color: #084298;">⚠️ Periodo de Prueba</span>`;
                break;
        }
        
        row.innerHTML = `
            <td class="fw-semibold">${convivencia.anfitrion}</td>
            <td>${convivencia.inquilino}</td>
            <td>${convivencia.inicio || '-'}</td>
            <td>${estadoBadge}</td>
        `;
        tbody.appendChild(row);
    });
}