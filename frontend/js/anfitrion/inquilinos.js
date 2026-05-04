// js/anfitrion/inquilinos.js

export let listaInquilinosMemoria = [];

export function cargarInquilinos() {
    if (listaInquilinosMemoria.length === 0) {
        listaInquilinosMemoria = [
            { id: 1, nombre: 'Luis Martínez', compatibilidad: 92, estado: 'activo',     email: 'luis.m@email.com',  telefono: '666 111 222', fechaIngreso: '01/02/2026' },
            { id: 2, nombre: 'Marta Soto',    compatibilidad: 85, estado: 'entrevista', email: 'marta.s@email.com', telefono: '666 333 444', fechaIngreso: null         },
        ];
    }
    renderizarInquilinos(listaInquilinosMemoria);
}

export function renderizarInquilinos(lista) {
    const tbody = document.getElementById('tabla-inquilinos');
    if (!tbody) return;

    tbody.innerHTML = '';

    lista.forEach(i => {
        const row = document.createElement('tr');
        const pctColor = i.compatibilidad >= 85 ? 'success' : i.compatibilidad >= 65 ? 'warning' : 'danger';

        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center gap-2">
                    <input class="form-check-input inquilino-checkbox align-self-start mt-1" type="checkbox" value="${i.id}">
                    <div>
                        <span class="fw-semibold d-block inquilino-nombre" data-id="${i.id}" style="cursor:pointer;">${i.nombre}</span>
                        <span class="text-muted small d-block">${i.email}</span>
                    </div>
                </div>
            </td>
            <td style="min-width:140px;">
                <div class="d-flex align-items-center gap-2">
                    <div class="progress flex-grow-1" style="height:6px;">
                        <div class="progress-bar bg-${pctColor}" style="width:${i.compatibilidad}%;"></div>
                    </div>
                    <small class="fw-bold text-${pctColor}">${i.compatibilidad}%</small>
                </div>
            </td>
            <td>${badgeEstado(i.estado)}</td>
        `;
        tbody.appendChild(row);
    });

    tbody.querySelectorAll('.inquilino-nombre').forEach(span => {
        span.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = Number(this.getAttribute('data-id'));
            if (typeof verInquilino === 'function') verInquilino(id);
        });
    });
}

function badgeEstado(estado) {
    const badges = {
        activo:     `<span class="badge rounded-pill px-3" style="background-color:#D1E7DD;color:#0F5132;">✓ Activo</span>`,
        entrevista: `<span class="badge rounded-pill px-3" style="background-color:#FFF3CD;color:#856404;">⏳ En Entrevista</span>`,
        prueba:     `<span class="badge rounded-pill px-3" style="background-color:#CFE2FF;color:#084298;">⚠️ Prueba</span>`,
        inactivo:   `<span class="badge rounded-pill px-3" style="background-color:#F8D7DA;color:#842029;">✕ Inactivo</span>`,
    };
    return badges[estado] || `<span class="badge bg-secondary rounded-pill">${estado}</span>`;
}