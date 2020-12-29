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
    if (!$decode['status']) {
    $output['GeoInfo'] = $decode['geonames'][0];
    $output['GeoInfo']['status']['message'] = 'ok';
    $output['GeoInfo']['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    } else {
        $output['GeoInfo']['status']['message'] = $decode['status']['message'];
    }
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

    // Modifying the data so it can be used by API's
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

    // Setting up some asynchronous API Calls

    $attractions_url = 'https://www.triposo.com/api/20201111/poi.json?location_id=' . $cityID . '&tag_labels=topattractions&count=10&account=' . $account. '&token=' . $token;
    $restaurants_url = 'https://www.triposo.com/api/20201111/poi.json?location_id=' . $cityID . '&tag_labels=cuisine&count=10&account=' . $account. '&token=' . $token;
    $hotels_url = 'https://www.triposo.com/api/20201111/poi.json?location_id=' . $cityID . '&tag_labels=hotels&count=10&account=' . $account. '&token=' . $token;
    $weather_key = 'cfdde55e3e994683d2f49995d1215fed';
    $weather_url = 'api.openweathermap.org/data/2.5/weather?lat='. $cityLat . '&lon=' . $cityLon . '&units=metric&appid=' . $weather_key;
    $forecast_key = '2ae19805acbcf4bbe1649d5d2635a30e';
    $forecast_url = 'https://api.openweathermap.org/data/2.5/onecall?lat=' . $cityLat . '&lon=' . $cityLon . '&units=metric&exclude=current,minutely,hourly&appid=' . $forecast_key;
    
    $executionStartTime = microtime(true);
    $attractions = curl_init($attractions_url);
    $restaurants = curl_init($restaurants_url);
    $hotels = curl_init($hotels_url);
    $weather = curl_init($weather_url);
    $forecast = curl_init($forecast_url);

    curl_setopt($attractions, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($attractions, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($restaurants, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($restaurants, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($hotels, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($hotels, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($weather, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($weather, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($forecast, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($forecast, CURLOPT_RETURNTRANSFER, true);

    $mh = curl_multi_init();

    curl_multi_add_handle($mh, $attractions);
    curl_multi_add_handle($mh, $restaurants);
    curl_multi_add_handle($mh, $hotels);
    curl_multi_add_handle($mh, $weather);
    curl_multi_add_handle($mh, $forecast);

    $running = null;
    do {
        curl_multi_exec($mh, $running);
    } while ($running);

    curl_multi_remove_handle($mh, $attractions);
    curl_multi_remove_handle($mh, $restaurants);
    curl_multi_remove_handle($mh, $hotels);
    curl_multi_remove_handle($mh, $weather);
    curl_multi_remove_handle($mh, $forecast);
    curl_multi_close($mh);

    // Outputing Asynchronous API calls
    $attractions_response = curl_multi_getcontent($attractions);
    $decode = json_decode($attractions_response,true);
    $output['CapitalTopAttractions']['data'] = $decode['results'];
    $restaurants_response = curl_multi_getcontent($restaurants);
    $decode = json_decode($restaurants_response,true);
    $output['CapitalRestaurants']['data'] = $decode['results'];
    $hotels_response = curl_multi_getcontent($hotels);
    $decode = json_decode($hotels_response,true);
    $output['CapitalHotels']['data'] = $decode['results'];
    $weather_response = curl_multi_getcontent($weather);
    $decode = json_decode($weather_response,true);
    $output['CurrentWeather'] = $decode;
    $forecast_response = curl_multi_getcontent($forecast);
    $decode = json_decode($forecast_response,true);
    $output['Forecast'] = $decode['daily'];
    $output['multiRequest']['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode($output); 
    
?>