<?php
$params=$_POST;
$result=array('success'=>true,'params'=>$params);
header('Content-Type: application/json');

echo json_encode($result);





