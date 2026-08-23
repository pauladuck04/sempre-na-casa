class DOM_class {

    // Abre (o reutiliza) la ventana emergente de resultados. Compartido por los runners de
    // backend (Backend_Test) y de escenarios (Escenario_Test), que antes tenian cada uno su
    // propia copia identica de este metodo.
    static abrirVentanaResultados(nombreVentana) {
        const anchoVentana = screen.availWidth;
        const altoVentana  = screen.availHeight;
        const newWindow = window.open("", nombreVentana, `width=${anchoVentana},height=${altoVentana}`);
        if (!newWindow) return null;
        newWindow.moveTo(0, 0);
        newWindow.resizeTo(anchoVentana, altoVentana);
        newWindow.focus();
        return newWindow;
    }

    mostrarResultadosEnVentana({ contenedorId, salida, marcados, ventana, nombreVentana, tituloDocumento }) {
        this.showData(contenedorId, salida, marcados);
        const contenedor = document.getElementById(contenedorId);
        const htmlContenido = contenedor.innerHTML;
        contenedor.style.display = 'none';

        const newWindow = (ventana && !ventana.closed) ? ventana : DOM_class.abrirVentanaResultados(nombreVentana);

        if (newWindow) {
            newWindow.document.open();
            newWindow.document.write(`
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <title>${tituloDocumento}</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                    <link rel="stylesheet" href="../../frontend/css/main.css?v=3">
                    <style>
                    * { box-sizing: border-box !important; }
                    html, body { height: 100% !important; margin: 0 !important; padding: 0 !important; }
                    body { display: flex !important; flex-direction: column !important; overflow: hidden !important; }

                    /* Contenedor principal: activa scroll vertical si no caben las filas */
                    #resultados-wrap {
                        flex: 1 1 0 !important;
                        min-height: 0 !important;
                        overflow-y: auto !important;
                        overflow-x: hidden !important; /* La tabla nunca debe ser más ancha que la ventana */
                        padding: 0 !important;
                    }

                    .table-responsive {
                        overflow: visible !important;
                        height: auto !important;
                        max-width: 100% !important;
                    }

                    table {
                        table-layout: fixed !important; /* Ancho de columnas fijado por el colgroup: la tabla no puede desbordar la ventana */
                        width: 100% !important;
                        max-width: 100% !important;
                        font-size: 0.65rem !important;
                        border-collapse: separate !important;
                        border-spacing: 0 !important;
                        margin: 0 !important;
                    }

                    /* 1. ENCABEZADOS: se ajustan al ancho de columna, partiendo el texto si hace falta */
                    thead th {
                        position: sticky !important;
                        top: 0 !important;
                        z-index: 9999 !important;
                        background-color: #e9ecef !important;
                        color: #000000 !important;
                        border-bottom: 2px solid #dee2e6 !important;
                        background-clip: padding-box !important;

                        /* REGLAS CLAVE PARA TÍTULOS */
                        white-space: normal !important; /* El título se parte si no cabe en la columna */
                        word-break: break-word !important;
                        overflow-wrap: anywhere !important;
                        padding: 0.6rem 0.8rem !important;
                        text-align: left !important;
                        font-size: 0.75rem !important; /* Independiente del tamaño de letra del cuerpo */
                    }

                    /* 2. CELDAS DE DATOS: Se adaptan al ancho fijado por el título y parten el texto si es largo */
                    tbody td {
                        white-space: normal !important;      /* Permite saltos de línea */
                        word-break: break-word !important;   /* Corta palabras largas o rutas */
                        overflow-wrap: anywhere !important;
                        padding: 0.35rem 0.6rem !important;
                        vertical-align: top !important;
                        font-size: 0.65rem !important;
                        line-height: 1.3 !important;
                    }

                    tbody tr, tbody td {
                        position: static !important;
                    }
                </style>
                </head>
                <body>
                    <div id="resultados-wrap">
                        ${htmlContenido}
                    </div>
                </body>
                </html>
            `);
            newWindow.document.close();
            return true;
        }

        return false;
    }

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
        if (columna === 'resultado') {
            const esOk = valor === 'OK';
            return `<span class="badge rounded-pill px-3 ${esOk ? 'bg-success' : 'bg-danger'}">${valor}</span>`;
        }

        if (typeof valor !== 'string') return valor;

        // valores de prueba largos (p.ej. 'D'.repeat(501) para probar max_size) desbordaban la
        // celda en muchas lineas y deformaban la fila; se recortan con el valor completo en el
        // title. Se escapa siempre porque algunos valores de prueba son literalmente HTML
        // (p.ej. '<script>' para probar que se rechacen etiquetas) y se volcaban sin escapar.
        const escapado = valor.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        if (valor.length <= 60) return escapado;

        const recortado = escapado.slice(0, 60);
        return `<span title="${escapado.replace(/"/g, '&quot;')}">${recortado}… <span class="text-muted small">(${valor.length} car.)</span></span>`;
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
            backend_status: '11%', backend_code: '13%',
            paso: '22%', esperado: '20%', obtenido: '24%', resultado: '9%'
        };
        return anchos[campo] || 'auto';
    }
}
