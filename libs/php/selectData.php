<?php

    // Getting Country Info from GeoNames
    $url='http://api.geonames.org/countryInfoJSON?formatted=true&country=' . $_REQUEST['countryCode'] . '&username=ollyijb&style=full';

    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($curl);
    curl_close($curl);
    $decode = json_decode($result,true);

    // Storing useful part of response under GeoInfo
    $output['GeoInfo'] = $decode['geonames'][0];

    // Storing Capital city so it can be passed into weather API for current weather
    $city = $decode['geonames'][0]['capital'];
    $countryName = $decode['geonames'][0]['countryName'];

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

    // Getting Country Info from GeoNames
    $key = "92c6ebcaed0b46eaa17eff05b0dc0a1e";
    $url = "https://api.opencagedata.com/geocode/v1/json?q=" . $_REQUEST['countryCode'] . "&key=" . $key . "&pretty=1";

    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($curl);
    curl_close($curl);
    $decode = json_decode($result,true);	
    
    $output['GeoNames'] = $decode['results'][0];
    
    // API Call to Open Weather
    $key = 'cfdde55e3e994683d2f49995d1215fed';
    $url = 'api.openweathermap.org/data/2.5/weather?q='. $city . '&units=metric&appid=' . $key;

    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($curl);
    curl_close($curl); 
    $decode = json_decode($result,true);

    $output['CurrentWeather'] = $decode;

    // Storing Capital city Lat & Long coordinates
    $cityLat = $decode['coord']['lat'];
    $cityLon = $decode['coord']['lon'];

    $output['capitalCoords'] = $decode['coord'];

    // API Call to Open Weather
    $key = '2ae19805acbcf4bbe1649d5d2635a30e';
    $url = 'https://api.openweathermap.org/data/2.5/onecall?lat=' . $cityLat . '&lon=' . $cityLon . '&units=metric&exclude=current,minutely,hourly&appid=' . $key;

    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($curl);
    curl_close($curl); 
    $decode = json_decode($result,true);

    $output['Forecast'] = $decode['daily'];


    // Triposo API Call which gives information about top 10 cities within the country

    if (stripos($countryName, ' ')) {
        $country = str_replace(' ', '_', $countryName);
    } else {
        $country = $countryName;
    }

    if (stripos($city, ' ')) {
        $cityName = str_replace(' ', '_', $city);
    } else {
        $cityName = $city;
    }

    if ($city == 'Vienna') {
        $cityName = 'wv__Vienna';
    }

    $account = 'C50AK397';
    $token = 'j3z2565mhit6vlidfk6skusr4kolptxn';
    $url = 'https://www.triposo.com/api/20201111/location.json?part_of=' . $country . '&tag_labels=city&count=10&fields=all&order_by=-score&account=' . $account . '&token=' . $token;
    
    
    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($curl);
    curl_close($curl); 
    $decode = json_decode($result,true);

    $output['Cities'] = $decode['results'];

    // Top Rated National Parks
    $url = 'https://www.triposo.com/api/20201111/location.json?part_of=' . $country . '&tag_labels=national_park&count=10&fields=all&order_by=-score&account=' . $account . '&token=' . $token;

    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($curl);
    curl_close($curl); 
    $decode = json_decode($result,true);

    $output['NationalParks'] = $decode['results'];

    // Best Places in Capital
    $url = 'https://www.triposo.com/api/20201111/poi.json?location_id=' . $cityName . '&tag_labels=topattractions&count=10&account=' . $account. '&token=' . $token;

    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($curl);
    curl_close($curl); 
    $decode = json_decode($result,true);

    $output['CapitalTopAttractions'] = $decode['results'];

    // Top Restaurants in Capital
    $url = 'https://www.triposo.com/api/20201111/poi.json?location_id=' . $cityName . '&tag_labels=cuisine&count=10&account=' . $account. '&token=' . $token;

    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($curl);
    curl_close($curl); 
    $decode = json_decode($result,true);

    $output['CapitalRestaurants'] = $decode['results'];

    // Top Hotels in Capital
    $url = 'https://www.triposo.com/api/20201111/poi.json?location_id=' . $cityName . '&tag_labels=hotels&count=10&account=' . $account. '&token=' . $token;

    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($curl);
    curl_close($curl); 
    $decode = json_decode($result,true);

    $output['CapitalHotels'] = $decode['results'];

    // Top Tours in Capital
    $url = 'https://www.triposo.com/api/20201111/tour.json?location_ids=' . $cityName . '&count=10&account=' . $account . '&token=' . $token;

    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($curl);
    curl_close($curl); 
    $decode = json_decode($result,true);

    $output['CapitalTours'] = $decode['results'];

    header('Content-Type: application/json; charset=UTF-8');
    //http_response_code(400);

	echo json_encode($output); 
    
?>