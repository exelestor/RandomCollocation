<?php
function getIndexNumber($number) {
    if ((isset($number)) and ($number)) {
        $numberd = $number;
    } else {
        $idFile = fopen("../logs/id", "r"); 
        $numberd = fgets($idFile);
        fclose($idFile);

        $numberd++;
        
        $idFile = fopen("../logs/id", "w"); 
        fwrite($idFile, $numberd);
        fclose($idFile);
    }
    
    $sym = "0123456789abcdefghijklmnopqrstuvwxyz";
    $radix = strlen($sym);
    
    $resultd = "";
    
    while ($numberd >= $radix) {
    	$resultd = $sym[$numberd % $radix] . $resultd;
    	$numberd = floor($numberd / $radix);
    }
    
    return ($sym[(int)$numberd] . $resultd);
}
?>