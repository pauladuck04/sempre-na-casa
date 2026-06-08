<?php
 
include_once './Base/appServiceBase.php';

class criterio_SERVICE extends appServiceBase{

    public $modelo;

    //METODOS

    function __construct(){

        parent::__construct();

    }

    function inicializarRest(){

        $this->listaAtributos = array('id_criterio', 'nombre_criterio', 'descripcion_criterio', 'peso_criterio');

        $this->listaAtributosSelect = array('id_criterio', 'nombre_criterio', 'descripcion_criterio', 'peso_criterio');

        $this->notnull = array(
                        'ADD'=>array('nombre_criterio', 'descripcion_criterio', 'peso_criterio'),
                        'EDIT'=>array('id_criterio', 'nombre_criterio', 'descripcion_criterio', 'peso_criterio'),
                        'DELETE'=>array('id_criterio'),
                        );

        $this->modelo = $this->crearModelOne('criterio');

        function getAll() {
        // Limpia filtros para traer todos los registros activos
        $this->modelo->valores['id_criterio']         = '';
        $this->modelo->valores['nombre_criterio']     = '';
        $this->modelo->valores['fecha_alta_criterio'] = '';
        $this->modelo->valores['activo_criterio']     = '';
 
        $result = $this->modelo->SEARCH();
        return $result;
    }
    
}
?>
