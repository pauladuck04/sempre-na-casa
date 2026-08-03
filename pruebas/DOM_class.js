// Utilidad mínima de DOM para el test runner: pinta el array de resultados de Data_Test como
// una tabla con el mismo aspecto que el resto de la app (tablas de los dashboards reales,
// ver p.ej. frontend/js/admin/solicitudes.js): Bootstrap "table table-hover align-middle"
// dentro de un "table-responsive", cabecera "table-light" y fila resaltada con la clase
// contextual "table-danger" en vez de un estilo inline (ver marcados en data.js). Para que
// estas clases se vean de verdad hace falta que la ventana donde se pinta tenga cargado el
// Bootstrap/CSS real de la app (ver data.js: data_test_class() inyecta esos estilos en la
// ventana emergente antes de copiar este HTML).
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

        // table-layout:fixed (ver data.js) reparte el ancho según este <colgroup> en vez de
        // hacerlo a partes iguales: sin esto, columnas de texto largo (valorprueba,
        // textoidiomaerror...) quedan tan estrechas como "NumDef" y el contenido se envuelve
        // en muchísimas líneas, disparando el alto de cada fila y el scroll vertical.
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

    // pruebastatus ('CORRECTO'/'INCORRECTO') y backend_status (ver pruebas/backend_fixtures.js)
    // se pintan como badge, igual que los estados de las tablas reales (ver p.ej.
    // dashboard-anfitrion.js: badge bg-success/bg-secondary).
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

    // Anchos pensados para las columnas fijas de resultadopruebas (ver data.js): las de
    // texto corto (ids, acción, estado) se quedan estrechas y el espacio sobrante se lo
    // llevan las de texto largo (descripción, valor de prueba, mensaje de error). Si algún
    // día se añade una columna nueva no listada aquí, se reparte el resto a partes iguales.
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
