<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=utf-8");

$server   = "svr-sql-ctezo.southcentralus.cloudapp.azure.com";
$database = "db_DesaWebDevUMG";
$username = "usr_DesaWebDevUMG";
$password = "!ngGuast@360";

// conexion a sql server
$connectionInfo = [
    "Database" => $database,
    "UID"      => $username,
    "PWD"      => $password,
    "CharacterSet" => "UTF-8"
];

$conn = sqlsrv_connect($server, $connectionInfo);

if (!$conn) {
    echo json_encode(["error" => sqlsrv_errors()]);
    exit;
}

//consulta para traer los mensajes
$sql = "SELECT TOP 1000 Login_Emisor, Contenido, FechaHora 
        FROM Chat_Mensaje 
        ORDER BY FechaHora DESC";

$stmt = sqlsrv_query($conn, $sql);

$mensajes = [];

while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    $row["FechaHora"] = $row["FechaHora"]->format("Y-m-d H:i:s");
    $mensajes[] = $row;
}

echo json_encode($mensajes, JSON_UNESCAPED_UNICODE);

sqlsrv_close($conn);
?>
