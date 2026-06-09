<?php
 
include_once './Base/appServiceBase.php';

class criterio_SERVICE extends appServiceBase{

    public $modelo;

    //METODOS

    function __construct(){

        parent::__construct();

    }

    function inicializarRest(){

        $this->listaAtributos = array('id_criterio', 'nombre_criterio', 'fecha_alta_criterio', 'activo_criterio');

        $this->listaAtributosSelect = array('id_criterio', 'nombre_criterio', 'fecha_alta_criterio', 'activo_criterio');

        $this->notnull = array(
                        'ADD'=>array('nombre_criterio', 'nombre_criterio'),
                        'EDIT'=>array('id_criterio', 'nombre_criterio'),
                        'DELETE'=>array('id_criterio'),
                        );

        $this->modelo = $this->crearModelOne('criterio');
    }

        function getAll() {
        // Limpia filtros para traer todos los registros activos
        $this->modelo->valores['id_criterio']         = '';
        $this->modelo->valores['nombre_criterio']     = '';
        $this->modelo->valores['fecha_alta_criterio'] = '';
        $this->modelo->valores['activo_criterio']     = '';
 
        $result = $this->modelo->SEARCH();
        return $result;
    }

    function getById() {
        $id = $_POST['id'];

        foreach ($this->modelo->valores as $key => $value) {
            $this->modelo->valores[$key] = '';
        }

        $primaryKey = $this->modelo->clave[0];
        $this->modelo->valores[$primaryKey] = $id;

        $this->modelo->foraneas = [];
        $result = $this->modelo->SEARCH_BY();

        return $result;
    }
    
}
?>
