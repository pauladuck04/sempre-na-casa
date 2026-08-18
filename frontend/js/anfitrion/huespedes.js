import { t } from '../i18n.js';

export let listaHuespedesMemoria = [];

export async function cargarHuespedes(idVivienda) {
    const tbody = document.getElementById('tabla-huespedes');
    if (!tbody) return;

    if (!idVivienda) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted py-3">${t('anfitrion.tenants.noVivienda')}</td></tr>`;
        return;
    }

    tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted py-3"><span class="spinner-border spinner-border-sm me-2"></span></td></tr>`;

    const res = await apiPost('usuario_vivienda', 'getHuespedesByVivienda', { id_vivienda: idVivienda });

    listaHuespedesMemoria = (res.ok && Array.isArray(res.resource))
        ? res.resource.map(r => ({
            id:          String(r.id_usuario),
            nombre:      `${r.nombre_usuario || ''} ${r.apellidos || ''}`.trim(),
            email:       r.mail || '',
            telefono:    r.telefono || '-',
            fechaIngreso: r.fecha_inicio ? r.fecha_inicio.split(' ')[0] : null,
            estado:      r.activo_usuario_vivienda == 1 ? 'activo' : 'inactivo'
          }))
        : [];

    renderizarHuespedes(listaHuespedesMemoria);
}

export function renderizarHuespedes(lista) {
    const tbody = document.getElementById('tabla-huespedes');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!lista || lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted py-3">${t('anfitrion.tenants.noTenants')}</td></tr>`;
        return;
    }

    lista.forEach(i => {
        const row = document.createElement('tr');
        row.className = 'huesped-row';
        row.style.cursor = 'pointer';
        row.innerHTML = `
            <input class="form-check-input huesped-checkbox" type="checkbox" value="${i.id}" style="display: none;">
            <td data-label="${t('anfitrion.table.tenant')}">
                <div class="d-flex align-items-center gap-2">
                    <div>
                        <span class="fw-semibold d-block huesped-nombre" data-id="${i.id}" style="cursor:pointer;">${i.nombre}</span>
                        <span class="text-muted small d-block">${i.email.replace('@', '@<wbr>')}</span>
                    </div>
                </div>
            </td>
            <td data-label="${t('anfitrion.table.startDate')}">${i.fechaIngreso || '-'}</td>
            <td data-label="${t('anfitrion.table.status')}">${badgeEstado(i.estado)}</td>
        `;
        tbody.appendChild(row);
    });

    // Click en la fila para seleccionar (mismo patrón que las tablas del panel admin:
    // checkbox oculto + borde azul .row-selected, ver components.css); clic en el nombre
    // sigue abriendo el detalle en vez de seleccionar la fila.
    tbody.querySelectorAll('.huesped-row').forEach(row => {
        row.addEventListener('click', function(e) {
            if (e.target.closest('.huesped-nombre')) {
                e.stopPropagation();
                if (typeof verHuesped === 'function') verHuesped(this.querySelector('.huesped-nombre').getAttribute('data-id'));
                return;
            }
            const checkbox = this.querySelector('.huesped-checkbox');
            checkbox.checked = !checkbox.checked;
            this.classList.toggle('row-selected');
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        });
    });
}

function badgeEstado(estado) {
    const labels = {
        activo:   t('anfitrion.tenants.statusActive'),
        inactivo: t('anfitrion.tenants.statusInactive')
    };
    const colors = {
        activo:   ['#D1E7DD', '#0F5132'],
        inactivo: ['#F8D7DA', '#842029']
    };
    const [bg, fg] = colors[estado] || ['#e2e3e5', '#383d41'];
    return `<span class="badge rounded-pill px-3" style="background-color:${bg};color:${fg};">${labels[estado] || estado}</span>`;
}
