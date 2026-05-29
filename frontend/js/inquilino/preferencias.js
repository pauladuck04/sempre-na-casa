// js/inquilino/preferencias.js

export let listaPreferenciasMemoria = [];

export function cargarPreferencias() {
    if (listaPreferenciasMemoria.length === 0) {
        listaPreferenciasMemoria = [
            { id: 1, preferencia: 'Rango de edad anfitrión', valor: '50-70 años',   estado: 'activo'   },
            { id: 2, preferencia: 'Ambiente de la vivienda', valor: 'Tranquilo',     estado: 'activo'   },
            { id: 3, preferencia: 'Mascotas',                valor: 'Sin mascotas',  estado: 'inactivo' },
        ];
    }
    renderizarPreferencias(listaPreferenciasMemoria);
}

export function reactivarPreferencias(ids) {
    listaPreferenciasMemoria.forEach(p => {
        if (ids.includes(String(p.id))) p.estado = 'activo';
    });
}

export function desactivarPreferencias(ids) {
    listaPreferenciasMemoria.forEach(p => {
        if (ids.includes(String(p.id))) p.estado = 'inactivo';
    });
}

export function renderizarPreferencias(lista) {
    const tbody = document.getElementById('tabla-preferencias');
    if (!tbody) return;

    tbody.innerHTML = '';

    lista.forEach(p => {
        const row = document.createElement('tr');
        const esActivo = p.estado === 'activo';

        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center gap-2">
                    <input class="form-check-input preferencia-checkbox align-self-start mt-1" type="checkbox" value="${p.id}">
                    <div>
                        <span class="fw-semibold d-block">${p.preferencia}</span>
                    </div>
                </div>
            </td>
            <td>${p.valor}</td>
            <td>
                <span class="badge ${esActivo ? 'bg-success' : 'bg-secondary'} rounded-pill px-3">
                    ${esActivo ? 'Activo' : 'Inactivo'}
                </span>
            </td>
        `;
        tbody.appendChild(row);
    });
}
