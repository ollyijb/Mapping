<?php

    $executionStartTime = microtime(true);
    // Getting Country Info from GeoNames
    $url='http://api.geonames.org/countryInfoJSON?formatted=true&country=' . $_REQUEST['countryCode'] . '&username=ollyijb&style=full';

    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($curl);
    curl_close($curl);
    $decode = json_decode($result,true);

    // Storing useful part of response under GeoInfo
   /* if (!$decode['status']) {
    $output['GeoInfo'] = $decode['geonames'][0];
    $output['GeoInfo']['status']['message'] = 'ok';
    $output['GeoInfo']['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    } else {
        $output['GeoInfo']['status']['message'] = $decode['status']['message'];
    }*/
    $output['GeoInfo'] = $decode['geonames'][0];

    // Storing Capital city so it can be passed into weather API for current weather
    $city = $decode['geonames'][0]['capital'];
    $countryName = $decode['geonames'][0]['countryName'];
    $countryCode = $_REQUEST['countryCode'];

    $executionStartTime = microtime(true);

    // Getting Border Coordinates and info from GeoJson file
    $countries = json_decode(file_get_contents('../Resources/countryBorders.geo.json'), true);

    foreach($countries['features'] as $feature) {
        if ($feature['properties']['name'] == $countryName ||
        $feature['properties']['iso_a2'] == $countryCode) {
            $filtered =  $feature;
        }
    }

    // Storing Border Info returned from file in Borders
    $output['Borders'] = $filtered['geometry'];
    $output['Borders']['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

    /*// Getting Country Info from GeoNames
    $key = "92c6ebcaed0b46eaa17eff05b0dc0a1e";
    $url = "https://api.opencagedata.com/geocode/v1/json?q=" . $_REQUEST['countryCode'] . "&key=" . $key . "&pretty=1";

    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($curl);
    curl_close($curl);
    $decode = json_decode($result,true);	
    
    $output['GeoNames'] = $decode['results'][0];*/
    

    if (stripos($countryName, ' ')) {
        $country = str_replace(' ', '_', $countryName);
    } elseif ($countryName == 'Bahamas') {
        $country = "The_Bahamas";
    } else {
        $country = $countryName;
    }

    if (stripos($city, ' ')) {
        $cityName = str_replace(' ', '_', $city);
    } else {
        $cityName = $city;
    }

    // Getting Country Info from GeoNames
    $executionStartTime = microtime(true);
    $key = "92c6ebcaed0b46eaa17eff05b0dc0a1e";
    $url = "https://api.opencagedata.com/geocode/v1/json?q=" . $country . "&key=" . $key . "&pretty=1";

    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($curl);
    curl_close($curl);
    $decode = json_decode($result,true);	
    
    $output['GeoNames'] = $decode['results'][0];
    $output['GeoNames']['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

    // Triposo API Call which gives information about top 10 cities within the country
    $executionStartTime = microtime(true);
    $account = 'C50AK397';
    $token = 'j3z2565mhit6vlidfk6skusr4kolptxn';
    $url = 'https://www.triposo.com/api/20201111/location.json?part_of=' . $country . '&tag_labels=city&count=10&fields=all&order_by=-score&account=' . $account . '&token=' . $token;
    
    
    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($curl);
    curl_close($curl); 
    $decode = json_decode($result,true);

    $output['Cities']['data'] = $decode['results'];
    $output['Cities']['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

    // Top Rated National Parks
    $executionStartTime = microtime(true);
    $url = 'https://www.triposo.com/api/20201111/location.json?part_of=' . $country . '&tag_labels=national_park&count=10&fields=all&order_by=-score&account=' . $account . '&token=' . $token;

    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($curl);
    curl_close($curl); 
    $decode = json_decode($result,true);

    $output['NationalParks']['data'] = $decode['results'];
    $output['NationalParks']['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

    // Getting City ID & Accurate coordinates
    $executionStartTime = microtime(true);
    $url = 'https://www.triposo.com/api/20201111/location.json?part_of=' . $country . '&tag_labels=city&annotate=trigram:' . $cityName . '&trigram=>0.7&fields=id,coordinates&count=1&account=' . $account . '&token=' . $token;
    
    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($curl);
    curl_close($curl); 
    $decode = json_decode($result,true);

    $cityID = $decode['results'][0]['id'];

    $output['capitalCoords'] = $decode['results'][0]['coordinates'];
    $output['capitalCoords']['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    $cityLat = $decode['results'][0]['coordinates']['latitude'];
    $cityLon = $decode['results'][0]['coordinates']['longitude'];

    // Best Places in Capital
    $executionStartTime = microtime(true);
    $url = 'https://www.triposo.com/api/20201111/poi.json?location_id=' . $cityID . '&tag_labels=topattractions&count=10&account=' . $account. '&token=' . $token;

    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($curl);
    curl_close($curl); 
    $decode = json_decode($result,true);

    $output['CapitalTopAttractions']['data'] = $decode['results'];
    $output['CapitalTopAttractions']['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

    // Top Restaurants in Capital
    $executionStartTime = microtime(true);
    $url = 'https://www.triposo.com/api/20201111/poi.json?location_id=' . $cityID . '&tag_labels=cuisine&count=10&account=' . $account. '&token=' . $token;

    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($curl);
    curl_close($curl); 
    $decode = json_decode($result,true);

    $output['CapitalRestaurants']['data'] = $decode['results'];
    $output['CapitalRestaurants']['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

    // Top Hotels in Capital
    $executionStartTime = microtime(true);
    $url = 'https://www.triposo.com/api/20201111/poi.json?location_id=' . $cityID . '&tag_labels=hotels&count=10&account=' . $account. '&token=' . $token;

    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($curl);
    curl_close($curl); 
    $decode = json_decode($result,true);

    $output['CapitalHotels']['data'] = $decode['results'];
    $output['CapitalHotels']['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

    // API Call to Open Weather to get current Weather

    $key = 'cfdde55e3e994683d2f49995d1215fed';
    $url = 'api.openweathermap.org/data/2.5/weather?lat='. $cityLat . '&lon=' . $cityLon . '&units=metric&appid=' . $key;

    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($curl);
    curl_close($curl); 
    $decode = json_decode($result,true);

    $output['CurrentWeather'] = $decode;


    // API Call to Open Weather to get Week of Forecasts

    $key = '2ae19805acbcf4bbe1649d5d2635a30e';
    $url = 'https://api.openweathermap.org/data/2.5/onecall?lat=' . $cityLat . '&lon=' . $cityLon . '&units=metric&exclude=current,minutely,hourly&appid=' . $key;

    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($curl);
    curl_close($curl); 
    $decode = json_decode($result,true);

    $output['Forecast'] = $decode['daily'];


    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode($output); 
    
?>