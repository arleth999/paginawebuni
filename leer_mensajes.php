<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=utf-8");

$server   = "svr-sql-ctezo.southcentralus.cloudapp.azure.com";
$database = "db_DesaWebDevUMG";
$username = "usr_DesaWebDevUMG";
$password = "!ngGuast@360";

$connectionInfo = [
    "Database" => $database,
    "UID"      => $username,
    "PWD"      => $password,
    "CharacterSet" => "UTF-8"
];

$conn = sqlsrv_connect($server, $connectionInfo);

// error de conexion
if (!$conn) {
    die(json_encode([
        "conexion_error" => sqlsrv_errors(),
        "mensaje" => "X No se pudo conectar al SQL Server"
    ], JSON_UNESCAPED_UNICODE));
}

// Consulta SQL
$sql = "SELECT TOP 1000 Cod_Sala, Login_Emisor, Contenido 
        FROM Chat_Mensaje 
        Where Login_Emisor='slopezm24' ";

$stmt = sqlsrv_query($conn, $sql);

//error de consulta
if ($stmt === false) {
    die(json_encode([
        "sql_error" => sqlsrv_errors(),
        "mensaje" => "X La consulta SQL falló"
    ], JSON_UNESCAPED_UNICODE));
}

$mensajes = [];

while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
  
    $mensajes[] = $row;
}

echo json_encode($mensajes, JSON_UNESCAPED_UNICODE);

sqlsrv_close($conn);
?>
