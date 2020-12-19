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

    // Validating the request and defining the object to be returned
    if (is_null($countryCode)) {
        $output['status']['code'] = '404';
        $output['status']['message'] = 'not found';
    } else {
        $output['data'] = $countryCode;
        $output['status']['code'] = '200';
        $output['status']['message'] = 'ok';
    }


    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode($output); 

    ?>