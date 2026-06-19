<?php

class MappingBase {

    public $query;
    public $feedback = array();
    private static $conn = null;

    protected function getConn() {
        if (self::$conn === null) {
            self::$conn = new mysqli(host, user, pass, BD);
            if (self::$conn->connect_error) {
                self::$conn = null;
                return null;
            }
            self::$conn->set_charset('utf8');
        }
        return self::$conn;
    }

    function get_results_from_query() {
        $conn = $this->getConn();
        if (!$conn) {
            $this->feedback = array('ok' => false, 'code' => 'DB_CONNECTION_ERROR', 'resource' => '');
            return;
        }
        $result = $conn->query($this->query);
        if ($result === false) {
            $this->feedback = array('ok' => false, 'code' => 'QUERY_ERROR', 'resource' => $conn->error);
            return;
        }
        if ($result->num_rows == 0) {
            $this->feedback = array('ok' => true, 'code' => 'RECORDSET_VACIO', 'resource' => '');
            return;
        }
        $rows = array();
        while ($row = $result->fetch_assoc()) {
            $rows[] = $row;
        }
        $this->feedback = array('ok' => true, 'code' => 'RECORDSET_DATOS', 'resource' => $rows);
    }

    function execute_single_query() {
        $conn = $this->getConn();
        if (!$conn) {
            $this->feedback = array('ok' => false, 'code' => 'DB_CONNECTION_ERROR', 'resource' => '');
            return;
        }
        $result = $conn->query($this->query);
        if ($result === false) {
            $this->feedback = array('ok' => false, 'code' => 'QUERY_ERROR', 'resource' => $conn->error);
        } else {
            $this->feedback = array('ok' => true, 'code' => 'QUERY_OK', 'resource' => '');
            if ($conn->insert_id > 0) {
                $this->feedback['resource'] = $conn->insert_id;
            }
        }
    }

    function get_one_result_from_query() {
        $conn = $this->getConn();
        if (!$conn) {
            $this->feedback = array('ok' => false, 'code' => 'DB_CONNECTION_ERROR', 'resource' => '');
            return;
        }
        $result = $conn->query($this->query);
        if ($result === false) {
            $this->feedback = array('ok' => false, 'code' => 'QUERY_ERROR', 'resource' => '');
            return;
        }
        $row = $result->fetch_row();
        $this->feedback = array('ok' => true, 'code' => 'RECORDSET_DATOS', 'resource' => isset($row[0]) ? $row[0] : 0);
    }
}

?>
