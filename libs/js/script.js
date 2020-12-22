// Default User Position object
const defaultPosition = { coords: { latitude: 51.5, longitude: -0.10 } };
const defaultCountryCode = "GB";

// Used to Store User Location Data
let useObj;

// Stores data received from API Routines
let dataStore = [];

// List for icon classes used in Map Key
let keyIcons = ['location', 'compass', 'leaf', 'fork', 'home', 'star'];

// Colours for the icons used in Map Key
let keyColours = ['beige', 'blue', 'green', 'red', 'pink', 'orange'];

// Key Terms used in Map Key
let keyTerms = ['Your Location', 'Top Cities', 'Top National Parks', 'Top Restaurants', 'Top Hotels', 'Top Attractions'];
/*-------------------------------------- Creating Basic Map ----------------------------------------------------*/

let map = L.map('mapid');

let tiles = new L.TileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 18,
    ext: 'png'
});
map.addLayer(tiles);

/*-------------------------------------- Weather Layers ----------------------------------------------------*/

// Getting a clouds layer
let clouds = new L.TileLayer('https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={appid}', {
    layer: 'clouds_new',
    appid: '2ae19805acbcf4bbe1649d5d2635a30e'
});

//Getting a precipitation layer
let precipitation = new L.TileLayer('https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={appid}', {
    layer: 'precipitation_new',
    appid: '2ae19805acbcf4bbe1649d5d2635a30e'
});

//Getting a pressure layer
let pressure = new L.TileLayer('https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={appid}', {
    layer: 'pressure_new',
    appid: '2ae19805acbcf4bbe1649d5d2635a30e'
});

//Getting a precipitation layer
let wind = new L.TileLayer('https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={appid}', {
    layer: 'wind_new',
    appid: '2ae19805acbcf4bbe1649d5d2635a30e'
});

//Getting a precipitation layer
let temp = new L.TileLayer('https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={appid}', {
    layer: 'temp_new',
    appid: '2ae19805acbcf4bbe1649d5d2635a30e'
});

// List of Weather Layers
let weatherOverlays = {
    "Clouds": clouds,
    "Precipitation": precipitation,
    "Pressure": pressure,
    "Wind": wind,
    "Temperatures": temp
};

// Setting a layer control for the map
L.control.layers(null, weatherOverlays).addTo(map);

/*-------------------------------------- Map Icons ----------------------------------------------------*/

// Setting Home Icon
let homeIcon = L.AwesomeMarkers.icon({
    icon: 'location',
    iconColor: 'black',
    markerColor: 'beige',
    prefix: 'ion'
});

// Setting City Icon
let cityIcon = L.AwesomeMarkers.icon({
    icon: 'compass',
    iconColor: 'black',
    markerColor: 'blue',
    prefix: 'ion'
});

// Setting National Park Icon
let parkIcon = L.AwesomeMarkers.icon({
    icon: 'leaf',
    iconColor: 'black',
    markerColor: 'green',
    prefix: 'ion'
});

// Setting Restaurant Icon
let restaurantIcon = L.AwesomeMarkers.icon({
    icon: 'fork',
    iconColor: 'black',
    markerColor: 'red',
    prefix: 'ion'
});

// Setting Attraction Icon
let attractionIcon = L.AwesomeMarkers.icon({
    icon: 'star',
    iconColor: 'black',
    markerColor: 'orange',
    prefix: 'ion'
});

// Setting Tour Icon
let tourIcon = L.AwesomeMarkers.icon({
    icon: 'eye',
    iconColor: 'black',
    markerColor: 'white',
    prefix: 'ion'
});

// Setting Hotel Icon
let hotelIcon = L.AwesomeMarkers.icon({
    icon: 'home',
    iconColor: 'black',
    markerColor: 'pink',
    prefix: 'ion'
});

/*------------------------------------ Icon Options --------------------------------------------------*/
// Setting Popup options for City
let cityOptions = {
    keepInView: true,
    className: 'CitiesPopUp'
};

// Setting Popup options for Park
let parkOptions = {
    keepInView: true,
    className: 'ParksPopUp'
};

// Setting Popup options for Restaurant
let restaurantOptions = {
    keepInView: true,
    className: 'restaurantsPopUp'
};

// Setting Popup options for Attraction
let attractionsOptions = {
    keepInView: true,
    className: 'attractionsPopUp'
};

// Setting Popup options for Hotel
let hotelOptions = {
    keepInView: true,
    className: 'hotelsPopUp'
};

// Setting Popup options for Tour
let tourOptions = {
    keepInView: true,
    className: 'toursPopUp'
};


/*----------------------------- Run ----------------------------*/


$(document).ready(function () {

    $.ajax({
        url: "libs/php/countryCodes.php",
        type: "POST",
        dataType: "JSON",
        success: function (result) {
            let countries = result.data;
            let select = $('#select');
            for (country in countries) {
                let option = document.createElement('option');
                option.innerHTML = countries[country].name;
                option.value = countries[country].code;
                select.append(option);
            }
        }, error: (err) => {
            console.log(err);
            reject(err);
        }
    });

    if (!navigator.geolocation) {

        alert(`Geolocation denied or not supported so rendering default map`);
        getSelectLocationData(defaultCountryCode).then((result) => {
            setBorders(result);
            dropCitiesWrapperFunction(result);
            dropParksWrapper(result);
            dropRestaurantsWrapper(result);
            dropAttractionsWrapper(result);
            dropHotelsWrapper(result);
            $('#preloader').fadeOut(200);
            $('#status').fadeOut(200);
            dataStore.unshift(result);
        }).catch((err) => {
            console.error(err.message);
        });

    } else {
        getUserLocation().then((position) => {
            console.log(position);
            dropUsersLocation(position);

            useObj = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };

            getUserCountryCode(useObj).then((res) => {
                getSelectLocationData(res.data).then((result) => {
                    setBorders(result);
                    dropCitiesWrapperFunction(result);
                    dropParksWrapper(result);
                    dropRestaurantsWrapper(result);
                    dropAttractionsWrapper(result);
                    dropHotelsWrapper(result);
                    $('#preloader').fadeOut(200);
                    $('#status').fadeOut(200);
                    dataStore.unshift(result);
                });
            });

        }).catch((err) => {
            alert(`Geolocation denied or not supported so rendering default map`);
            getSelectLocationData(defaultCountryCode).then((result) => {
                setBorders(result);
                dropCitiesWrapperFunction(result);
                dropParksWrapper(result);
                dropRestaurantsWrapper(result);
                dropAttractionsWrapper(result);
                dropHotelsWrapper(result);
                $('#preloader').fadeOut(200);
                $('#status').fadeOut(200);
            });
        });
    }
});

/*-------------------------------------- Functions ----------------------------------------------------*/

// Validating attractions
const attractionValidator = (attraction) => {
    let attractionObj = {
        name: attraction.name,
        coords: {
            lat: attraction.coordinates.latitude,
            lon: attraction.coordinates.longitude
        },
        image: attraction.images[0],
        url: attraction.attribution[1],
        score: attraction.score,
        snippet: attraction.snippet,
        text: 'Click Here to Find Out More',
        pricing: {
            info: attraction.booking_info
        }
    };

    if (!attractionObj.pricing.info) {
        attractionObj.pricing.price = ' ?? ';
        attractionObj.pricing.currency = ' ?? ';
    } else {
        attractionObj.pricing.price = attraction.booking_info.price.amount;
        attractionObj.pricing.currency = attraction.booking_info.price.currency;
    }
    if (!attractionObj.image) {
        attractionObj.image = '/Resouces/image-not-found.png';
        attractionObj.alt = 'No image Found';
    } else {
        attractionObj.image = attraction.images[0].sizes.thumbnail.url;
        attractionObj.alt = attraction.name + 'image';
    }
    if (!attractionObj.url) {
        attractionObj.url = "No Website Found";
        attractionObj.text = "No links found";
    } else {
        attractionObj.url = attraction.attribution[1].url;
    }
    if (!attractionObj.snippet) {
        attractionObj.snippet = "No Description Found";
    }
    if (!attractionObj.score) {
        attractionObj.score = 'N/A';
    } else {
        attractionObj.score = attraction.score.toFixed(2);
    }
    return attractionObj;
};

// Validating City 
const cityValidator = (city) => {
    let cityObj = {
        name: city.name,
        coords: {
            lat: city.coordinates.latitude,
            lon: city.coordinates.longitude
        },
        snippet: city.snippet,
        score: city.score.toFixed(2),
        population: city.properties[0],
        url: city.attribution[1],
        image: city.images[0],
        alt: city.name
    };
    if (!cityObj.snippet) {
        cityObj.snippet = 'No snippet found';
    }
    if (!cityObj.score) {
        cityObj.score = 'N/A';
    }
    if (!cityObj.url) {
        cityObj.url = city.attribution[0].url;
    } else {
        cityObj.url = city.attribution[1].url;
    }
    if (!cityObj.url) {
        cityObj.url = "No Link Found";
    }
    if (!cityObj.population) {
        cityObj.population = "No Population Data Available";
    } else {
        cityObj.population = city.properties[0].value;
    }
    if (!cityObj.image) {
        cityObj.image = '/Resouces/image-not-found.png';
        cityObj.alt = "No Image Found";
    } else {
        cityObj.image = city.images[0].sizes.thumbnail.url;
    }
    return cityObj;
};

// Validating Country Information
const countryValidator = (result) => {
    let country = {
        name: result.GeoInfo.countryName,
        flag: result.GeoNames.annotations.flag,
        population: result.GeoInfo.population,
        capital: result.GeoInfo.capital,
        callingCode: result.GeoNames.annotations.callingcode,
        currencyInfo: result.GeoNames.annotations.currency,
        drivingSide: result.GeoNames.annotations.roadinfo.drive_on,
        drivingUnits: result.GeoNames.annotations.roadinfo.speed_in,
        weatherIcon: result.CurrentWeather.weather[0].icon,
        weatherAlt: result.CurrentWeather.weather[0].description,
        weatherDescription: result.CurrentWeather.weather[0].description,
        temperature: result.CurrentWeather.main.temp,
        sunrise: result.CurrentWeather.sys.sunrise,
        sunset: result.CurrentWeather.sys.sunset
    };
    if (!country.population) {
        country.population = "No population Data found";
    } else {
        country.population = formatPopulation(country.population);
    }
    if (!country.currencyInfo) {
        country.currencyInfo = {
            currencyCode: "Not found",
            currencyName: "Not found",
            currencySymbol: "Not found"
        };
    } else {
        country.currencyInfo = {
            currencyCode: result.GeoNames.annotations.currency.iso_code,
            currencyName: result.GeoNames.annotations.currency.name,
            currencySymbol: result.GeoNames.annotations.currency.symbol
        };
    }
    if (!country.callingCode) {
        country.callingCode = "Not found";
    }
    if (!country.currencyInfo.currencyCode) {
        country.currencyInfo.currencyCode = "Not found";
    }
    if (!country.currencyInfo.currencyName) {
        country.currencyInfo.currencyCode = "Not found";
    }
    if (!country.currencyInfo.currencySymbol) {
        country.currencyInfo.currencySymbol = "Not found";
    }
    if (!country.drivingSide) {
        country.drivingSide = "Not found";
    }
    if (!country.drivingUnits) {
        country.drivingUnits = "Not found";
    }
    if (!country.weatherIcon) {
        country.weatherIcon = "/Resouces/image-not-found.png";
    } else {
        country.weatherIcon = `http://openweathermap.org/img/wn/${result.CurrentWeather.weather[0].icon}@2x.png`;
    }
    if (!country.weatherDescription) {
        country.weatherDescription = "Not found";
    }
    if (!country.temperature) {
        country.temperature = "Not found";
    } else {
        country.temperature = `${result.CurrentWeather.main.temp} celsius`;
    }
    if (!country.sunrise) {
        country.sunrise = "Not found";
    } else {
        country.sunrise = new Date(result.CurrentWeather.sys.sunrise * 1000).toLocaleTimeString({ hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    if (!country.sunset) {
        country.sunset = "Not found";
    } else {
        country.sunset = new Date(result.CurrentWeather.sys.sunset * 1000).toLocaleTimeString({ hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    return country;
};

// Adds Attractions to Map
const dropAttractionsWrapper = (result) => {
    let attractions = result.CapitalTopAttractions.data;
    if (!attractions) {
        return;
    } else {
        for (let i = 0; i < attractions.length; i++) {
            let attraction = attractionValidator(attractions[i]);
            let attractionMarker = generateMarker(attraction.coords, attractionIcon);
            attractionMarker.bindPopup(generateAttractionPopUp(attraction), attractionsOptions);
        }
    }
};

// Adds Cities to Map
const dropCitiesWrapperFunction = (result) => {
    let Cities = result.Cities.data;
    if (!Cities) {
        return;
    } else {
        for (let i = 0; i < Cities.length; i++) {
            let city = cityValidator(Cities[i]);
            let cityMarker = generateMarker(city.coords, cityIcon);
            cityMarker.bindPopup(generateCitiesPopUp(city), cityOptions);
        }
    }
};

// Adds Hotels to Map
const dropHotelsWrapper = (result) => {
    let hotels = result.CapitalHotels.data;
    if (!hotels) {
        return;
    } else {
        for (let i = 0; i < hotels.length; i++) {
            let hotel = attractionValidator(hotels[i]);
            let hotelMarker = generateMarker(hotel.coords, hotelIcon);
            hotelMarker.bindPopup(generateAttractionPopUp(hotel), hotelOptions);
        }
    }
};

// Adds Parks to Map
const dropParksWrapper = (result) => {
    let parks = result.NationalParks.data;
    if (!parks) {
        return;
    } else {
        for (let i = 0; i < parks.length; i++) {
            let park = parkValidator(parks[i]);
            let parkMarker = generateMarker(park.coords, parkIcon);
            parkMarker.bindPopup(generateParkPopUp(park), parkOptions);
        }
    }
};

// Adds Restaurants to Map
const dropRestaurantsWrapper = (result) => {
    let restaurantlist = result.CapitalRestaurants.data;
    if (!restaurantlist) {
        return;
    } else {
        for (let i = 0; i < restaurantlist.length; i++) {
            let restaurant = restaurantValidator(restaurantlist[i]);
            let restuarantMarker = generateMarker(restaurant.coords, restaurantIcon);
            restuarantMarker.bindPopup(generateRestaurantPopUp(restaurant), restaurantOptions);
        }
    }
};

// Uses User Location to create marker and set initial map view
const dropUsersLocation = (position) => {
    let lat = position.coords.latitude.toFixed(6);
    let long = position.coords.longitude.toFixed(6);
    let userCoords = { latitude: lat, longitude: long };
    let userMarker = L.marker([lat, long], { icon: homeIcon }).addTo(map);
    let userPopUp = "<h4> You are Here!</h4>";
    userMarker.bindPopup(userPopUp).addTo(map);
    map.setView([lat, long], 6);
    return userCoords;
};

// Population Formatter
const formatPopulation = (x) => {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
};

// Generating Attraction Popup
const generateAttractionPopUp = (attraction) => {
    let attractionTemplate = `
    <h4>${attraction.name}</h4>
    <p>Score: ${attraction.score}</p>
    <p>Price: ${attraction.pricing.price} Currency: ${attraction.pricing.currency}</p>
    <p>${attraction.snippet}</p>
    <a href="${attraction.url}" target="_blank">${attraction.text}</a>
    <img src="${attraction.image}" alt="${attraction.alt}">`
    return attractionTemplate;
};

// Top Cities Generator
const generateCitiesPopUp = (city) => {
    let cityTemplate = `
    <h4>${city.name}</h4>
    <p>${city.snippet}</p>
    <p>Score: ${city.score}</p>
    <p>Population: ${formatPopulation(city.population)}</p>
    <a href="${city.url}" target="_blank">Click to Learn More about ${city.name}</a>
    <img src="${city.image}" alt="${city.alt} image">`;
    return cityTemplate;
};

// Custom Marker generator to pass various Markers
const generateMarker = (coordsList, iconVar) => {
    let marker = L.marker([coordsList.lat, coordsList.lon], { icon: iconVar }).addTo(map);
    return marker;
};

// Park PopUp Generator
const generateParkPopUp = (park) => {
    let parkTemplate = `
    <h4>${park.name}</h4>
    <p>${park.score}</p>
    <p>${park.snippet}</p>
    <a href="${park.url}" target="_blank">Click to Learn More about ${park.name}</a>
    <img src="${park.image}" alt="${park.name} image">`;
    return parkTemplate;
};

// Restaurant PopUp Generator
const generateRestaurantPopUp = (restaurant) => {
    let restaurantTemplate = `
    <h4>${restaurant.name}</h4>
    <p>Score: ${restaurant.score}</p>
    <p>${restaurant.snippet}</p>
    <a href="${restaurant.url}" target="_blank">${restaurant.text}</a>
    <img src="${restaurant.image}" alt="${restaurant.alt}">`
    return restaurantTemplate;
};

// AJAX Routine for users selected country in Select Box
const getSelectLocationData = (code) => {
    return new Promise(function (resolve, reject) {
        //$('#preloader').show();
        //$('#status').show();
        map.spin(true);
        $.ajax({
            url: "libs/php/getSelectedCountryData.php",
            type: "POST",
            dataType: "JSON",
            data: {
                countryCode: code
            },
            success: function (result) {
                console.log(result);
                resolve(result);
                //$('#preloader').fadeOut(200);
                //$('#status').fadeOut(200);
                $('.navbar-collapse').collapse('hide');
                map.spin(false);
            },
            error: (err) => {
                console.log(err);
                reject(err);
            }
        });
    });
};

// Returns Users Country Code
const getUserCountryCode = (coordsObj) => {
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: "libs/php/getUserCountryCode.php",
            type: "POST",
            dataType: "JSON",
            data: {
                lat: coordsObj.latitude,
                lng: coordsObj.longitude
            },
            success: function (res) {
                console.log(res);
                resolve(res);
            },
            error: (err) => {
                console.log(err);
                reject(err);
            }
        });
    });
}

// Gets User Location
const getUserLocation = (options) => {
    return new Promise(function (resolve, reject) {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
};

//Park Validator
const parkValidator = (park) => {
    let parkObj = {
        name: park.name,
        coords: {
            lat: park.coordinates.latitude,
            lon: park.coordinates.longitude
        },
        image: park.images[0],
        score: park.score,
        snippet: park.snippet,
        url: park.attribution[0].url,
    }
    if (!parkObj.snippet) {
        parkObj.snippet = 'No snippet found';
    }
    if (!parkObj.score) {
        parkObj.score = 'N/A';
    } else {
        parkObj.score = park.score.toFixed(2);
    }
    if (!parkObj.url) {
        parkObj.url = 'No Website Found';
    }
    if (!parkObj.image) {
        parkObj.image = "/Resouces/image-not-found.png"
    } else {
        parkObj.image = park.images[0].sizes.thumbnail.url;
    }
    if (!parkObj.image) {
        parkObj.image = '/Resouces/image-not-found.png';
    }
    return parkObj;
};

// Restuarant Validator
const restaurantValidator = (restaurant) => {
    let restaurantObj = {
        name: restaurant.name,
        coords: {
            lat: restaurant.coordinates.latitude,
            lon: restaurant.coordinates.longitude
        },
        score: restaurant.score,
        image: restaurant.images[0],
        url: restaurant.attribution[1],
        text: 'Click Here to Find Out More',
        snippet: restaurant.snippet
    }
    if (!restaurantObj.score) {
        restaurantObj.score = 'N/A';
    } else {
        restaurantObj.score = restaurant.score.toFixed(2);
    }
    if (!restaurantObj.image) {
        restaurantObj.image = '/Resouces/image-not-found.png';
        restaurantObj.alt = 'No image Found';
    } else {
        restaurantObj.image = restaurant.images[0].sizes.thumbnail.url;
        restaurantObj.alt = restaurant.name + 'image';
    }
    if (!restaurantObj.url) {
        restaurantObj.url = "No Website Found";
        restaurantObj.text = "No links found";
    } else {
        restaurantObj.url = restaurant.attribution[1].url;
    }
    if (!restaurantObj.snippet) {
        restaurantObj.snippet = "No Description Found";
    }
    return restaurantObj;
};

// Sets borders retrieved from API call & Sets new Optimum View
const setBorders = (borderObj) => {
    let borders = borderObj.Borders;
    let border = L.geoJSON(borders).addTo(map);
    map.fitBounds(border.getBounds());
};

/*----------------------------- jQuery Events ----------------------------*/

// User Selects Country and Generates a new map with new markers
$('#select').change(function () {

    getSelectLocationData($(this).val()).then((result) => {

        setBorders(result);
        dropCitiesWrapperFunction(result);
        dropParksWrapper(result);
        //fillCountryWrapper(result);
        dropRestaurantsWrapper(result);
        dropAttractionsWrapper(result);
        dropHotelsWrapper(result);
        dataStore.unshift(result);
    });
});

// Adding functionality to the show capital button
$('#showCapital').click(function () {
    if ($('#showCapital').html() == 'Show Capital') {
        map.setView([dataStore[0].capitalCoords.latitude, dataStore[0].capitalCoords.longitude], 11);
        $('.navbar-collapse').collapse('hide');
        $('#showCapital').html('Back to Country');
    } else {
        setBorders(dataStore[0]);
        $('#showCapital').html('Show Capital');
        $('.navbar-collapse').collapse('hide');
    }
});

// Fills and shows weather forecast list using handlebars template
$('#weatherForecast').click(function () {
    let forecastList = dataStore[0].Forecast;
    let forecasts = [];

    for (i = 0; i < forecastList.length; i++) {
        let weatherObj = {
            date: new Date(forecastList[i].dt * 1000).toDateString(),
            description: forecastList[i].weather[0].description,
            url: `http://openweathermap.org/img/wn/${forecastList[i].weather[0].icon}@2x.png`,
            humidity: forecastList[i].humidity,
            UVI: forecastList[i].uvi,
            max: forecastList[i].temp.max,
            min: forecastList[i].temp.min,
            feel: forecastList[i].feels_like.day
        }
        forecasts.push(weatherObj);
    }

    console.log(forecasts);
    let template = document.getElementById('forecast-list-template').innerHTML;
    let renderForecast = Handlebars.compile(template);
    document.getElementById('weatherList').innerHTML = renderForecast({
        forecasts: forecasts,
    });
});

/*let weatherHand = $('#weatherBtn').click(function () {
    let forecastList = dataStore[0].Forecast;
    let forecasts = [];

    for (i = 0; i < forecastList.length; i++) {
        let weatherObj = {
            date: new Date(forecastList[i].dt * 1000).toDateString(),
            description: forecastList[i].weather[0].description,
            url: `http://openweathermap.org/img/wn/${forecastList[i].weather[0].icon}@2x.png`,
            humidity: forecastList[i].humidity,
            UVI: forecastList[i].uvi,
            max: forecastList[i].temp.max,
            min: forecastList[i].temp.min,
            feel: forecastList[i].feels_like.day
        }
        forecasts.push(weatherObj);
    }

    console.log(forecasts);
    let template = document.getElementById('forecast-list-template').innerHTML;
    let renderForecast = Handlebars.compile(template);
    document.getElementById('weatherList').innerHTML = renderForecast({
        forecasts: forecasts,
    });
});*/

$('#showInfo2').click(function () {
    let country = countryValidator(dataStore[0]);
    $('#countryName').html(country.name);
    $('#flag').html(country.flag);
    $('#population').html(country.population);
    $('#capital').html(country.capital);
    $('#callingCode').html(country.callingCode);
    $('#currencyCode').html(country.currencyInfo.currencyCode);
    $('#currencyName').html(country.currencyInfo.currencyName);
    $('#currencySymbol').html(country.currencyInfo.currencySymbol);
    $('#drivingSide').html(country.drivingSide);
    $('#drivingUnits').html(country.drivingUnits);
    $('#weatherOverview').html(country.weatherDescription);
    $('#weatherTemperature').html(country.temperature);
    $('#weatherImage').attr("src", country.weatherIcon);
    $('#weatherImage').attr('alt', country.weatherDescription);
    $('#sunrise').html(country.sunrise);
    $('#sunset').html(country.sunset);

});

L.easyButton('icon ion-home', function () {
    if ($('#showCapital').html() == 'Show Capital') {
        map.setView([dataStore[0].capitalCoords.latitude, dataStore[0].capitalCoords.longitude], 11);
        $('.navbar-collapse').collapse('hide');
        $('#showCapital').html('Back to Country');
    } else {
        setBorders(dataStore[0]);
        $('#showCapital').html('Show Capital');
        $('.navbar-collapse').collapse('hide');
    }
}).addTo(map);

L.easyButton('icon ion-key', function () {
    $('#showKey');
}).addTo(map);

L.easyButton('icon ion-information', function () {
    $('#countryInfoModal2').toggle();
}).addTo(map);

/*var keyToggle = L.easyButton({
    id: 'infoButton',
    title: 'Country Info',
    icon: 'icon ion-information',
    states: [{
        stateName: 'clicked',
        onClick: function (control) {
            $('#showKey').show();
            control.state('unclicked');
        },
        stateName: 'unclicked',
        onClick: function (control) {
            $('#showKey').hide();
            control.state('clicked');
        },
    }]
});

keyToggle.addTo(map);*/

// Fills and shows Map key
/*$('#showKey').click(function () {
    $.each(keyTerms, function (index, value) {
        $('#keyContent').append(`
        <h4><svg width="50" height="50"><circle cx="25" cy="25" r="20" stroke="black" fill="${keyColours[index]}"></svg> : ${value}</h4>`);
    });
});*/

// Makes the first call to the API's
/*const firstAPICall = (coordsObj) => {
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: "libs/php/chain.php",
            type: "POST",
            dataType: "JSON",
            data: {
                lat: coordsObj.latitude,
                lng: coordsObj.longitude
            },
            success: function (result) {
                console.log(result);
                $('#preloader').fadeOut(200);
                $('#status').fadeOut(200);
                resolve(result);
            },
            error: (err) => {
                console.log(err);
                reject(err);
            }
        });
    });
});*/

// Fills Country Info 
/*const fillCountryWrapper = (result) => {
    //$('#countryInfo').html(countryTemplate(countryValidator(result)));
    $('#countryInfoContent').html(countryTemplate(countryValidator(result)));
};*/

// Filling Country Info
/*const countryTemplate = (country) => {
    let template = `
    <h4>${country.name}</h4>
    <p><b>Flag: </b>${country.flag}</p>
    <p><b>Population: </b>${country.population}</p>
    <p><b>Capital: </b>${country.capital}</p>
    <p><b>Calling Code: </b>${country.callingCode}</p>
    <h5>Currency Info</h5>
    <p><b>Code: </b>${country.currencyInfo.currencyCode}</p>
    <p><b>Name: </b>${country.currencyInfo.currencyName}</p>
    <p><b>Symbol: </b>${country.currencyInfo.currencySybol}</p>
    <h5>Driving Info</h5>
    <p><b>Side of Road: </b>${country.drivingSide}</p>
    <p><b>Speed in: </b>${country.drivingUnits}</p>
    <h5>Weather</h5>
    <p><img src=${country.weatherIcon} alt=${country.weatherDescription} ><b>${country.weatherDescription}</b></p>
    <p><b>Temperature: </b>${country.temperature}</p>
    <p><b>Sunrise: </b>${country.sunrise}</p>
    <p><b>Sunset: </b>${country.sunset}</p>`;
    return template;
};*/

// Fills and shows Week of Weather Forecasts
/*$('#weatherForecast').click(function () {
    let forecasts = dataStore[0].Forecast;
    $('#weatherList').empty();
    $.each(forecasts, function (index, value) {
        $('#weatherList').append(`
        <li>
            <h4>${new Date(value.dt * 1000).toDateString()}</h4>
            <p><img src="http://openweathermap.org/img/wn/${value.weather[0].icon}@2x.png" alt="${value.weather[0].description}">${value.weather[0].description}</p>
            <p>Humidity: ${value.humidity}</p>
            <p>UVI: ${value.uvi}</p>
            <h5>Temperatures</h5>
            <p>Max: ${value.temp.max} Celsius | Min: ${value.temp.min} Celsius</p>
            <p>Feels like: ${value.feels_like.day} Celsius</p>
        </li>`);
    });
});*/