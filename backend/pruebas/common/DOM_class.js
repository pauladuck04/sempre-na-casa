class DOM_class {

    showData(containerId, filas, marcados) {
        const contenedor = document.getElementById(containerId);
        if (!contenedor) return;

        if (!filas || filas.length === 0) {
            contenedor.innerHTML = '<p class="text-muted text-center py-3 mb-0">No hay resultados.</p>';
            return;
        }

        const columnas = Object.keys(filas[0]);
        let html = '<div class="table-responsive"><table class="table table-hover align-middle table-sm">';

        html += '<colgroup>' + columnas.map(c => `<col style="width:${this._anchoColumna(c)}">`).join('') + '</colgroup>';

        html += '<thead class="table-light"><tr>' + columnas.map(c => `<th>${this._etiquetaColumna(c)}</th>`).join('') + '</tr></thead><tbody>';

        filas.forEach(fila => {
            let claseFila = '';
            for (const clave in marcados) {
                if (fila[clave] === marcados[clave].value) claseFila = marcados[clave].clase;
            }
            html += `<tr class="${claseFila}">` +
                columnas.map(c => `<td>${this._celda(c, fila[c])}</td>`).join('') +
                '</tr>';
        });

        html += '</tbody></table></div>';
        contenedor.innerHTML = html;
    }

    _celda(columna, valor) {
        if (columna === 'pruebastatus') {
            const esCorrecto = valor === 'CORRECTO';
            return `<span class="badge rounded-pill px-3 ${esCorrecto ? 'bg-success' : 'bg-danger'}">${valor}</span>`;
        }
        if (columna === 'backend_status') {
            const clases = {
                OK: 'bg-success',
                DIVERGENCIA: 'bg-warning text-dark',
                BACKEND_MAS_ESTRICTO: 'bg-danger',
                SIN_CONEXION: 'bg-secondary',
                'N/A': 'bg-light text-dark'
            };
            return `<span class="badge rounded-pill px-3 ${clases[valor] || 'bg-light text-dark'}">${valor}</span>`;
        }
        return valor;
    }

    _etiquetaColumna(campo) {
        return campo.charAt(0).toUpperCase() + campo.slice(1);
    }

    _anchoColumna(campo) {
        const anchos = {
            entidad: '7%', campo: '8%', NumDef: '5%', NumPrueba: '5%',
            descripcion: '12%', accion: '6%', valorprueba: '15%',
            respuestaesperada: '11%', resultadoprueba: '9%',
            pruebastatus: '8%', textoidiomaerror: '14%',
            backend_status: '11%', backend_code: '13%'
        };
        return anchos[campo] || 'auto';
    }
}
