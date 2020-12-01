<?php
    $countryBorders = json_decode(file_get_contents("../Resources/countryBorders.geo.json"), true);
    
    $features = $countryBorders['features'];
    
    function cmp($a, $b) {
        return strcmp($a->name, $b->name);
    }

    $my_arr = array();

    for ($i = 0; $i < count($features); $i++) {
        array_push($my_arr, (object)$features[$i]['properties']);
    }

    usort($my_arr, 'cmp');

    foreach($my_arr as $item) {
        $name = $item->name;
        $countrycode = $item->iso_a2;
        echo "<option value=" . "'" . $countrycode . "'>" . $name . "</option>";
    }

?>