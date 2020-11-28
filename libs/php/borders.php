<?php
    $countryBorders = json_decode(file_get_contents("../Resources/countryBorders.geo.json"), true);

    foreach($countryBorders['features'] as $feature) {
        $name = $feature['properties']['name'];

        echo "<option val=" . "'" . $name . "'>" . $name . "</option>";
    }
    //header('Content-Type: application/json; charset=UTF-8');

    //echo json_encode($features);

    /*foreach($countryBorders['features'] as $feature) {
        $names = array($feature['properties']['name']);
        $nameInfo = array_filter($names, function ($n) {
            if ($n == $_REQUEST['name']) {
                return true;
            }
        });
        $bordersArr = $nameInfo['geometry']['coordinates'];
        echo json_encode($bordersArr);
    }*/


?>