<?php
set_time_limit(0);
error_reporting(E_ALL | E_STRICT | E_WARNING);
ob_start("ob_gzhandler", 7);
ini_set('display_errors', true);
header('Pragma: no-cache');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('X-Content-Type-Options: nosniff');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: OPTIONS, HEAD, GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: X-File-Name, X-File-Type, X-File-Size, Content-Type, Content-Range, Content-Disposition');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit();
}

function paging($input, $page, $show_per_page)
{
    $start = ($page - 1) * $show_per_page;
    $end = $start + $show_per_page;
    $count = count($input);

    // Conditionally return results
    if ($start < 0 || $count <= $start) {
        // Page is out of range
        return array();
    } else if ($count <= $end)
        // Partially-filled page
        return array_slice($input, $start);
    else
        // Full page
        return array_slice($input, $start, $end - $start);
}

$data = json_decode(file_get_contents('./select2.json'), true);


$dataSorted = $data;

//Количество результатов на странице
$limit=30;

//Текущая страница
$page = 1;
if (isset($_POST['page'])) {
    $page = $_POST['page'];
}



$result = array();
//Поиск
if (isset($_POST['search'])) {
    $search = $_POST['search'];
    $dataSorted=array_filter($dataSorted, function ($a) use($search) {
        if(strripos($a['text'],$search)){
            return true;
        }else{
            return false;
        }
    });
}

$result['limit']=$limit;
$result['total'] = count($dataSorted);
$result['rows'] = paging($dataSorted, $page, $limit);


header('Content-Type: application/json');
echo json_encode($result);