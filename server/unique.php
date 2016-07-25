<?php
/**
* Пример проверки уникальности значения например email
*/

// Заголовки для выполнения кросдоменных запросов

header('Pragma: no-cache');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('X-Content-Type-Options: nosniff');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: OPTIONS, HEAD, GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: X-File-Name, X-File-Type, X-File-Size, Content-Type, Content-Range, Content-Disposition');

$value=$_POST['value'];

sleep(3);
//По результатам проверки значения возвращаем строкой "true" или "false"
if($value !== 'example@gmail.com'){
$result=['success'=>true];
}else{
$result=['success'=>false];}
header('Content-Type: application/json');
echo json_encode($result);
exit();
