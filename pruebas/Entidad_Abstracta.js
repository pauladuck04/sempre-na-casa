// Clase base de la que extiende cada entidad probada por el test runner. `modo` lo pasa
// Data_Test (siempre 'test' aquí) por si alguna subclase necesita distinguir el contexto.
class Entidad_Abstracta extends Validaciones {
    constructor(modo) {
        super();
        this.modo = modo;
        this.entidad = '';
    }

    // Las subclases la sobrescriben si necesitan construir su propio formulario real; el
    // test runner no la usa (Data_Test genera su propio formulario simplificado), se deja
    // como parte del contrato de la clase.
    cargar_formulario_html(containerId) {}
}
