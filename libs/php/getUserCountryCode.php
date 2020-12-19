<?php

    // Getting Country Name and Code from GeoNames
    $url='http://api.geonames.org/countryCodeJSON?formatted=true&lat=' . $_REQUEST['lat'] . '&lng=' . $_REQUEST['lng'] . '&username=ollyijb&style=full';

    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($curl);
    curl_close($curl);
    $decode = json_decode($result,true);	

    // Storing country Name and Code to variables
    $countryCode = $decode['countryCode'];

    $output = $countryCode;

    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode($output); 

    ?>