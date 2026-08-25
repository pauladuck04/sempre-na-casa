class Data_Test {

    static abrirVentanaResultados() {
        const anchoVentana = screen.availWidth;
        const altoVentana  = screen.availHeight;
        const newWindow = window.open("", "Nueva Ventana", `width=${anchoVentana},height=${altoVentana}`);
        if (!newWindow) return null;
        newWindow.moveTo(0, 0);
        newWindow.resizeTo(anchoVentana, altoVentana);
        newWindow.focus();
        return newWindow;
    }

    /**
     *
     * @param {declaracion de la entidad} entidad
     * @param {Window|null} ventanaResultados ventana ya abierta por abrirVentanaResultados(), o
     *   null para que se pinte en #resultados_panel dentro de la propia página (ver
     *   data_test_class()).
     */
    constructor(entidad, ventanaResultados) {


        this.actions = ["ADD", "EDIT", "SEARCH"];
        this.ventanaResultados = ventanaResultados || null;

        // se crea la entidad indicada en modo test
        this.entidad = new entidad('test');
        this.dom = new DOM_class();

        // se almacena la variable de definicion de test, pruebas no file y pruebas file
        this.array_def_tests = eval(this.entidad.entidad + '_def_tests');
        this.array_pruebas_nofile = eval(this.entidad.entidad + '_tests_fields');
        this.array_pruebas_file = eval(this.entidad.entidad + '_tests_files');

        // se crea el formulario de test con los campos exactos que necesitan las pruebas
        this._crear_formulario_test('contenedor_IU_form');

        // se invoca la realizacion de pruebas
        this.data_test_class();

    }

    data_test_data_nofile() {

        var pruebas = this.array_pruebas_nofile;

        var salidapruebas = [];

        var resultadopruebas = {
            entidad: "",
            campo: '',
            NumDef: '',
            NumPrueba: '',
            descripcion: '',
            accion: '',
            valorprueba: '',
            respuestaesperada: '',
            resultadoprueba: '',
            pruebastatus: '',
            textoidiomaerror: ''
        };

        var contadorpruebas = 0;

        // recorro todas las pruebas definidas

        for (let i = 0; i < pruebas.length; i++) {

            // se regenera el formulario de test para este ciclo
            this._crear_formulario_test('contenedor_IU_form');

            resultadopruebas.entidad = pruebas[i][0];
            resultadopruebas.campo = pruebas[i][1];
            resultadopruebas.NumDef = pruebas[i][2];
            resultadopruebas.NumPrueba = pruebas[i][3];
            resultadopruebas.descripcion = '';
            resultadopruebas.accion = pruebas[i][4];



            for (var j = 0; j < pruebas[i][5].length; j++) {

                for (var clave in pruebas[i][5][j]) {

                    var nombrecampo = clave;
                    var valorcampo = pruebas[i][5][j][nombrecampo];
                    resultadopruebas.valorprueba += nombrecampo + '=' + valorcampo + '<br>';

                }

            }

            resultadopruebas.respuestaesperada = pruebas[i][6];


            // recupero el test correspondiente a la prueba que realizo
            var def = this.devolver_def(resultadopruebas.NumDef);
            resultadopruebas.descripcion = def[4];
            var tipoelemento = def[2];

            // creo objeto html sino tengo cargado el formulario (para crear cada elemento dinamicamente dentro del form)           

            //meto valor en objeto (esto depende del tipo de elemento de formulario)
            for (var j = 0; j < pruebas[i][5].length; j++) {

                for (var clave in pruebas[i][5][j]) {

                    var nombrecampo = clave;
                    var valorcampo = pruebas[i][5][j][nombrecampo];

                    switch (tipoelemento) {
                        case 'textarea':
                            document.getElementById(nombrecampo).innerText = valorcampo;
                            break;
                        case 'input':
                            document.getElementById(nombrecampo).value = valorcampo;
                            break;
                        case 'select':
                            this.rellenarvalorselect(nombrecampo, valorcampo);
                            break;
                        case 'checkbox':
                            this.rellenarvalorcheckbox(nombrecampo, valorcampo)
                            break;
                        case 'radio':
                            this.rellenarvalorradio(nombrecampo, valorcampo);
                            break;
                        default:
                            alert('no hay tipo de elemento definido en el test ' + resultadopruebas.NumDef);

                    }

                }

            }


            //llamo a la funcion de validacion del campo según su accion
            var resultadoprueba = eval('this.entidad.' + resultadopruebas.accion + '_' + resultadopruebas.campo + '_validation()');
            resultadopruebas.resultadoprueba = resultadoprueba;


            // compruebo si el resultado del test y la respuesta esperada es la misma
            if (resultadoprueba == resultadopruebas.respuestaesperada) {
                resultadopruebas.pruebastatus = 'CORRECTO';
            }
            else {
                resultadopruebas.pruebastatus = 'INCORRECTO';
            }

            resultadopruebas.textoidiomaerror = this.obtenerMensajeErrorTest(resultadopruebas.entidad, resultadopruebas.respuestaesperada);

            salidapruebas[contadorpruebas] = resultadopruebas;
            contadorpruebas++;
            resultadopruebas =
            {
                entidad: '',
                campo: '',
                NumDef: '',
                NumPrueba: '',
                descripcion: '',
                accion: '',
                valorprueba: '',
                respuestaesperada: '',
                resultadoprueba: '',
                pruebastatus: '',
                textoidiomaerror: ''
            };

        }

        return salidapruebas;
    }

    data_test_data_file() {

        var pruebas = this.array_pruebas_file;

        var salidapruebas = [];

        var resultadopruebas = {
            entidad: "",
            campo: '',
            NumDef: '',
            NumPrueba: '',
            descripcion: '',
            accion: '',
            valorprueba: '',
            respuestaesperada: '',
            resultadoprueba: '',
            pruebastatus: '',
            textoidiomaerror: ''
        };

        var contadorpruebas = 0;

        // recorro todas las pruebas definidas

        for (let i = 0; i < pruebas.length; i++) {
            this._crear_formulario_test('contenedor_IU_form');

            resultadopruebas.entidad = pruebas[i][0];
            resultadopruebas.campo = pruebas[i][1];
            resultadopruebas.NumDef = pruebas[i][2];
            resultadopruebas.NumPrueba = pruebas[i][3];
            resultadopruebas.accion = pruebas[i][4];
            //resultadopruebas.descripcion = pruebas[i][5];



            for (var j = 0; j < pruebas[i][6].length; j++) {

                for (var clave in pruebas[i][6][j]) {

                    var nombrecampo = clave;
                    var valorcampo = pruebas[i][6][j][nombrecampo];
                    resultadopruebas.valorprueba += nombrecampo + ':' + valorcampo + '<br>';

                }

            }

            resultadopruebas.respuestaesperada = pruebas[i][7];


            // recupero el test correspondiente a la prueba que realizo
            var def = this.devolver_def(resultadopruebas.NumDef);
            resultadopruebas.descripcion = def[4];

            // creo objeto html sino tengo cargado el formulario (para crear cada elemento dinamicamente dentro del form)
            //construyo objeto file y relleno valor para prueba
            if (pruebas[i][6].length != 0) {

                var nombrefichero = pruebas[i][6][0].format_name_file;
                var tipomime = pruebas[i][6][1].type_file;
                var maxsize = pruebas[i][6][2].max_size_file;


                var file = new File([new ArrayBuffer(maxsize)], nombrefichero, { type: tipomime, webkitRelativePath: "C:\\fakepath\\" + nombrefichero });

                // Create a data transfer object. Similar to what you get from a `drop` event as `event.dataTransfer`
                const dataTransfer = new DataTransfer();

                // Add your file to the file list of the object
                dataTransfer.items.add(file);

                // Save the file list to a new variable
                const fileList = dataTransfer.files;

                // Set your input `files` to the file list
                document.getElementById(resultadopruebas.campo).files = fileList;


            }



            //llamo a la funcion de validacion del campo según su accion
            var resultadoprueba = eval('this.entidad.' + resultadopruebas.accion + '_' + resultadopruebas.campo + '_validation()');
            resultadopruebas.resultadoprueba = resultadoprueba;


            // compruebo si el resultado del test y la respuesta esperada es la misma
            if (resultadoprueba == resultadopruebas.respuestaesperada) {
                resultadopruebas.pruebastatus = 'CORRECTO';
            }
            else {
                resultadopruebas.pruebastatus = 'INCORRECTO';
            }

            resultadopruebas.textoidiomaerror = this.obtenerMensajeErrorTest(resultadopruebas.entidad, resultadopruebas.respuestaesperada);


            salidapruebas[contadorpruebas] = resultadopruebas;
            contadorpruebas++;
            resultadopruebas =
            {
                entidad: '',
                campo: '',
                NumDef: '',
                NumPrueba: '',
                descripcion: '',
                accion: '',
                valorprueba: '',
                respuestaesperada: '',
                resultadoprueba: '',
                pruebastatus: '',
                textoidiomaerror: ''
            };

        }

        return salidapruebas;

    }


    /**
     *  se comprueban las pruebas definidas contra la clase para la que son definidas.
     * 
     *      @return un objeto con un objeto con clase asociativa para cada prueba
     */

    data_test_class() {
    var salidapruebasnofile = this.data_test_data_nofile();
    let marcados = {
        pruebastatus: { value: 'INCORRECTO', clase: 'table-danger' }
    };

    // Renderizamos los datos primero en el documento principal
    this.dom.showData('IU_Test_result_nofile', salidapruebasnofile, marcados);
    let htmlContenido = document.getElementById('IU_Test_result_nofile').innerHTML;
    document.getElementById('IU_Test_result_nofile').style.display = 'none';

    if (this.array_pruebas_file.length > 0) {
        var salidapruebasfile = this.data_test_data_file();
        this.dom.showData('IU_Test_result_file', salidapruebasfile, marcados);
        htmlContenido += document.getElementById('IU_Test_result_file').innerHTML;
        document.getElementById('IU_Test_result_file').style.display = 'none';
    }

    const newWindow = (this.ventanaResultados && !this.ventanaResultados.closed) ? this.ventanaResultados : null;

    if (!newWindow) {
        const panel = document.getElementById('resultados_panel');
        if (panel) {
            panel.innerHTML = `<h5 class="fw-bold mb-3">Resultados: ${this.entidad.entidad}</h5>${htmlContenido}`;
            panel.style.display = 'block';
        }
        return true;
    }

    // Inyección limpia y síncrona de todo el documento HTML
    newWindow.document.open();
    newWindow.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Resultados de pruebas</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <link rel="stylesheet" href="../../frontend/css/main.css?v=3">
            <style>
            * { box-sizing: border-box !important; }
            html, body { height: 100% !important; margin: 0 !important; padding: 0 !important; }
            body { display: flex !important; flex-direction: column !important; overflow: hidden !important; }
            
            /* Contenedor principal: activa scroll vertical y horizontal si no caben las columnas */
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
                font-size: 0.25rem !important;
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

    /**
     * Rellenado de un select de elección única
     * UPDATE: pendiente la modificación para select multiple
     * @param {String} id id del elemento html select
     * @param {String} valor valor con el que inicializar el elemento. Si ya existe se pone como selected, sino existe
     * se crea como option, se pone el valor y se pone como selected.
     */
    rellenarvalorselect(id, valor) {

        var opciones = document.getElementById(id).options;

        // comprobar si existe el valor en el select
        // si existe se pone como seleccionado
        var indexvalor = -1;
        for (var i = 0; i < opciones.length; i++) {
            if (opciones[i].value == valor) {
                opciones.selectedIndex = i;
                indexvalor = i;
            }
        }

        // si no existe se crea un option con ese valor y se coloca como seleccionado
        if (indexvalor == -1) {
            var mioption = document.createElement('option');
            mioption.value = valor;
            opciones[opciones.length] = mioption;
            opciones.selectedIndex = opciones.length - 1;
        }

    }

    /**
     * se recorren todos los elementos checkbox con el mismo nombre
     * si el valor esta en uno de los elementos se coloca como seleccionado
     * si no esta el valor se crea un elemento con ese valor y se coloca como seleccionado
     * @param {String} name valor del parametro name que deben tener todos los elementos del checkbox 
     * @param {String} valor a comprobar en el checkbox
     */
    rellenarvalorcheckbox(name, valor) {

        // se obtiene el elemento de check si existe en el formulario cargado
        var opcionescheck = document.getElementsByName(name);
        // si hay un solo elemento con ese nombre
        if (opcionescheck.length == 1) {
            opcionescheck.value = valor;
            opcionescheck.checked = true;
        }
        // si hay mas de un elemento con ese nombre
        // comprobamos si el valor esta y si esta lo ponemos como checked
        // si no esta lo creamos y lo ponemos checked
        else {
            var encontrado = false;
            for (var i = 0; i < opcionescheck.length; i++) {
                // si recibiesemos un array de valores deberiamos comprobarlos todos 
                // posiblemente con un (opcionescheck.includes(valor))
                if (opcionescheck[i].value == valor) {
                    opcionescheck[i].checked = true;
                    encontrado = true;
                }
                else {
                    opcionescheck[i].checked = false;
                }
            }
            if (!encontrado) {
                var micheck = document.createElement('input');
                micheck.type = 'checkbox';
                micheck.name = name;
                micheck.value = valor;
                micheck.checked = true;
                document.getElementById('form_iu').append(micheck);
            }

        }
    }

    /**
     * se recorren todos los elementos radio con el mismo nombre
     * si el valor esta en uno de los elementos se coloca como seleccionado
     * si no esta el valor se crea un elemento con ese valor y se coloca como seleccionado
     * @param {String} name valor del parametro name que deben tener todos los elementos del radio 
     * @param {String} valor a comprobar en el radio
     */
    rellenarvalorradio(name, valor) {

        // se obtiene el elemento de check si existe en el formulario cargado
        var opcionesradio = document.getElementsByName(name);
        // si hay un solo elemento con ese nombre
        if (opcionesradio.length == 1) {
            opcionesradio[0].value = valor;
            opcionesradio[0].checked = true;
        }
        else {
            var encontrado = false;
            for (var i = 0; i < opcionesradio.length; i++) {
                if (opcionesradio[i].value == valor) {
                    opcionesradio[i].checked = true;
                    encontrado = true;
                }
                else {
                    opcionesradio[i].checked = false;
                }
            }
            if (!encontrado) {
                var micheck = document.createElement('input');
                micheck.type = 'radio';
                micheck.name = name;
                micheck.value = valor;
                micheck.checked = true;
                document.getElementById('form_iu').append(micheck);
            }

        }
    }


    /**
     * Construye un formulario minimo de test con exactamente los campos que definen las pruebas.
     * Usa type="text" para todo excepto file e select, evitando que browsers
     * descarten valores invalidos (como fechas en type="date" o letras en type="number").
     */
    _crear_formulario_test(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const campos = new Map();
        for (const t of this.array_def_tests) {
            campos.set(t[1], t[2]); // campo -> tipo
        }
        let html = '<div>';
        campos.forEach((tipo, campo) => {
            if (tipo === 'inputfile') {
                html += `<input type="file" id="${campo}" name="${campo}">`;
            } else if (tipo === 'select') {
                html += `<select id="${campo}" name="${campo}"><option value=""></option></select>`;
            } else {
                html += `<input type="text" id="${campo}" name="${campo}" value="">`;
            }
        });
        html += '</div>';
        container.innerHTML = html;
    }

    devolver_def(num_def) {

        for (let i = 0; i < this.array_def_tests.length; i++) {
            if (this.array_def_tests[i][3] == num_def) {
                return this.array_def_tests[i];
            }
        }
    }

    /**
     * Traduce el código KO esperado por la prueba
     */
    obtenerMensajeErrorTest(entidad, respuestaesperada) {
        if (typeof t !== 'function') return String(respuestaesperada);
        if (respuestaesperada === true) return t('pruebas.correct');

        const motivos = [
            'min_size', 'max_size', 'format',
            'not_exist_file', 'type_file', 'max_size_file', 'min_size_name', 'max_size_name', 'format_name_file'
        ];
        const motivo = motivos.find(m => respuestaesperada.endsWith('_' + m + '_KO'));
        if (!motivo) return respuestaesperada;

        const campo = respuestaesperada.slice(0, -(motivo.length + 4));
        return `${campo}: ${t('pruebas.' + motivo)}`;
    }

}