const ITEMS_POR_PAGINA = 7;
const _estado = new Map();

function _get(tablaId) {
    if (!_estado.has(tablaId)) _estado.set(tablaId, { pagina: 1, lista: [], fn: null });
    return _estado.get(tablaId);
}

export function resetPagina(tablaId) {
    _get(tablaId).pagina = 1;
}

export function aplicarPaginacion(tablaId, lista, fn) {
    const e = _get(tablaId);
    e.lista = lista;
    e.fn = fn;
    const total = lista.length;
    const totalPags = Math.max(1, Math.ceil(total / ITEMS_POR_PAGINA));
    if (e.pagina > totalPags) e.pagina = totalPags;
    fn(lista.slice((e.pagina - 1) * ITEMS_POR_PAGINA, e.pagina * ITEMS_POR_PAGINA));
    _controles(tablaId, e.pagina, totalPags, total);
}

function _controles(tablaId, pagina, totalPags, total) {
    const el = document.getElementById(`paginacion-${tablaId}`);
    if (!el) return;
    if (totalPags <= 1) { el.innerHTML = ''; return; }

    const desde = (pagina - 1) * ITEMS_POR_PAGINA + 1;
    const hasta = Math.min(pagina * ITEMS_POR_PAGINA, total);
    const pMin = Math.max(1, pagina - 2);
    const pMax = Math.min(totalPags, pagina + 2);
    const paginas = Array.from({ length: pMax - pMin + 1 }, (_, i) => pMin + i);

    el.innerHTML = `
        <small class="text-muted">${desde}–${hasta} de ${total}</small>
        <ul class="pagination pagination-sm mb-0">
            <li class="page-item${pagina === 1 ? ' disabled' : ''}">
                <button class="page-link" data-p="${pagina - 1}" ${pagina === 1 ? 'disabled' : ''}>&laquo;</button>
            </li>
            ${paginas.map(p => `<li class="page-item${p === pagina ? ' active' : ''}"><button class="page-link" data-p="${p}">${p}</button></li>`).join('')}
            <li class="page-item${pagina === totalPags ? ' disabled' : ''}">
                <button class="page-link" data-p="${pagina + 1}" ${pagina === totalPags ? 'disabled' : ''}>&raquo;</button>
            </li>
        </ul>
    `;

    el.querySelectorAll('[data-p]').forEach(btn => {
        btn.addEventListener('click', () => {
            const np = parseInt(btn.dataset.p);
            if (np < 1 || np > totalPags) return;
            const e = _get(tablaId);
            e.pagina = np;
            e.fn(e.lista.slice((np - 1) * ITEMS_POR_PAGINA, np * ITEMS_POR_PAGINA));
            _controles(tablaId, np, totalPags, total);
        });
    });
}
