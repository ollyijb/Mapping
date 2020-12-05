// Default User Position object
const defaultPosition = { coords: { latitude: 51.5, longitude: -0.10 } };

// Used to Store User Location Data
let useObj;

// Stores data received from API Routines
let dataStore = [];

/*----------------------------- Run ----------------------------*/
$(document).ready(function () {
    if (!navigator.geolocation) {

        /*********************** Set Default Map! ***************/
        alert(`Geolocation denied or not supported so rendering default map`);
        firstAPICall(defaultPosition.coords).then((result) => {
            setBorders(result);
            dropCitiesWrapperFunction(result);
            dropParksWrapper(result);
            fillCountryWrapper(result);
            dropRestaurantsWrapper(result);
            dropAttractionsWrapper(result);
            dropHotelsWrapper(result);
            dataStore.unshift(result);
        }).catch((err) => {
            console.error(err.message);
        });

    } else {
        getUserLocation().then((position) => {

            useUsersLocation(position);

            useObj = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };

            firstAPICall(useObj).then((result) => {
                //console.log(result.capitalCoords);
                setBorders(result);
                dropCitiesWrapperFunction(result);
                dropParksWrapper(result);
                fillCountryWrapper(result);
                dropRestaurantsWrapper(result);
                dropAttractionsWrapper(result);
                dropHotelsWrapper(result);
                dataStore.unshift(result);
            });

        }).catch((err) => {
            //console.error(`Error: ${err.message}`);
            alert(`Geolocation denied or not supported so rendering default map`);
            firstAPICall(defaultPosition.coords).then((result) => {
                setBorders(result);
                dropCitiesWrapperFunction(result);
                dropParksWrapper(result);
                fillCountryWrapper(result);
                dropRestaurantsWrapper(result);
                dropAttractionsWrapper(result);
                dropHotelsWrapper(result);
                dataStore.unshift(result);
            });
        });
    }
});
/*------------------------------------- Location Functions -------------------------*/

// Gets User Location
const getUserLocation = (options) => {
    return new Promise(function (resolve, reject) {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
};

// Uses User Location to create marker and set initial map view
const useUsersLocation = (position) => {
    let lat = position.coords.latitude.toFixed(6);
    let long = position.coords.longitude.toFixed(6);
    let userCoords = { latitude: lat, longitude: long };
    let userMarker = L.marker([lat, long], { icon: homeIcon }).addTo(map);
    let userPopUp = "<h4> You are Here!</h4>";
    userMarker.bindPopup(userPopUp).addTo(map);
    map.setView([lat, long], 6);
    return userCoords;
};

// Makes the first call to the API's
const firstAPICall = (coordsObj) => {
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
};

// AJAX Routine for users selected country in Select Box
const getSelectLocationData = (code) => {
    return new Promise(function (resolve, reject) {
        $('#preloader').show();
        $('#status').show();
        $.ajax({
            url: "libs/php/selectData.php",
            type: "POST",
            dataType: "JSON",
            data: {
                countryCode: code
            },
            success: function (result) {
                console.log(result);
                resolve(result);
                $('#preloader').fadeOut(200);
                $('#status').fadeOut(200);
                $('.navbar-collapse').collapse('hide');
            },
            error: (err) => {
                console.log(err);
                reject(err);
            }
        });
    });
};

// Sets borders retrieved from API call & Sets new Optimum View
const setBorders = (borderObj) => {
    let borders = borderObj.Borders;
    let border = L.geoJSON(borders).addTo(map);
    map.fitBounds(border.getBounds());
};

// A helper function for adding and removing layers such as weather layers to the map
const displayMapLayer = (layer) => {
    if (map.hasLayer(layer)) {
        $(this).removeClass('selected');
        map.removeLayer(layer);
    } else {
        map.addLayer(layer);
        $(this).addClass('selected');
    }
};

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

/*-------------------------------------- Map Icons ----------------------------------------------------*/

// Setting Home Icon
let homeIcon = L.AwesomeMarkers.icon({
    icon: 'location',
    iconColor: 'black',
    markerColor: 'purple',
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

/*-------------------------------------- Info Functions ----------------------------------------------------*/

// Custom Marker generator to pass various Markers
const generateMarker = (coordsList, iconVar) => {
    let marker = L.marker([coordsList.lat, coordsList.lon], { icon: iconVar }).addTo(map);
    return marker;
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

//Park Validator
const parkValidator = (park) => {
    let parkObj = {
        name: park.name,
        coords: {
            lat: park.coordinates.latitude,
            lon: park.coordinates.longitude
        },
        image: park.images[0].sizes.thumbnail.url,
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
        parkObj.image = '/Resouces/image-not-found.png';
    }
    return parkObj;
};

// Top Cities Generator
const generateCitiesPopUp = (city) => {
    let cityTemplate = `
    <h4>${city.name}</h4>
    <p>${city.snippet}</p>
    <p>Score: ${city.score}</p>
    <p>Population: ${city.population}</p>
    <a href="${city.url}" target="_blank">Click to Learn More about ${city.name}</a>
    <img src="${city.image}" alt="${city.alt} image">`;
    return cityTemplate;
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
        url: city.attribution[1].url,
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
        cityObj.url = 'No Website Found';
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
}

// Validating Country Information
const countryValidator = (result) => {
    let country = {
        name: result.GeoInfo.countryName,
        flag: result.GeoNames.annotations.flag,
        population: result.GeoInfo.population,
        capital: result.GeoInfo.capital,
        callingCode: result.GeoNames.annotations.callingcode,
        currencyCode: result.GeoNames.annotations.currency.iso_code,
        currencyName: result.GeoNames.annotations.currency.name,
        currencySybol: result.GeoNames.annotations.currency.symbol,
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
    }
    if (!country.callingCode) {
        country.callingCode = "Not found";
    }
    if (!country.currencyCode) {
        country.currencyCode = "Not found";
    }
    if (!country.currencyName) {
        country.currencyCode = "Not found";
    }
    if (!country.currencySybol) {
        country.currencySybol = "Not found";
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

// Filling Country Info
const countryTemplate = (country) => {
    let template = `
    <h4>${country.name}</h4>
    <p><b>Flag: </b>${country.flag}</p>
    <p><b>Population: </b>${country.population}</p>
    <p><b>Capital: </b>${country.capital}</p>
    <p><b>Calling Code: </b>${country.callingCode}</p>
    <h5>Currency Info</h5>
    <p><b>Code: </b>${country.currencyCode}</p>
    <p><b>Name: </b>${country.currencyName}</p>
    <p><b>Symbol: </b>${country.currencySybol}</p>
    <h5>Driving Info</h5>
    <p><b>Side of Road: </b>${country.drivingSide}</p>
    <p><b>Speed in: </b>${country.drivingUnits}</p>
    <h5>Weather</h5>
    <p><img src=${country.weatherIcon} alt=${country.weatherDescription} ><b>${country.weatherDescription}</b></p>
    <p><b>Temperature: </b>${country.temperature}</p>
    <p><b>Sunrise: </b>${country.sunrise}</p>
    <p><b>Sunset: </b>${country.sunset}</p>`;
    return template;
};

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

/*------------------------------------ Wrapper Functions ------------------------------------*/

// Adds Restaurants to Map
const dropRestaurantsWrapper = (result) => {
    let restaurantlist = result.CapitalRestaurants;
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

// Adds Cities to Map
const dropCitiesWrapperFunction = (result) => {
    let Cities = result.Cities;
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

// Adds Parks to Map
const dropParksWrapper = (result) => {
    let parks = result.NationalParks;
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

// Adds Attractions to Map
const dropAttractionsWrapper = (result) => {
    let attractions = result.CapitalTopAttractions;
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

// Adds Hotels to Map
const dropHotelsWrapper = (result) => {
    let hotels = result.CapitalHotels;
    if (!hotels) {
        return;
    } else {
        for (let i = 0; i < hotels.length; i++) {
            let hotel = attractionValidator(hotels[i]);
            let hotelMarker = generateMarker(hotel.coords, hotelIcon);
            hotelMarker.bindPopup(generateAttractionPopUp(hotel), hotelOptions);
        }
    }
}

// Fills Country Info 
const fillCountryWrapper = (result) => {
    $('#countryInfo').html(countryTemplate(countryValidator(result)));
};

/*----------------------------- Events ----------------------------*/

// Calling php to call json to populate select dropdown menu with countries
$('#select').load('libs/php/borders.php', function () {
});

// User Selects Country and Generates a new map with new markers
$('#select').change(function () {

    getSelectLocationData($(this).val()).then((result) => {

        setBorders(result);
        dropCitiesWrapperFunction(result);
        dropParksWrapper(result);
        fillCountryWrapper(result);
        dropRestaurantsWrapper(result);
        dropAttractionsWrapper(result);
        dropHotelsWrapper(result);
        dataStore.unshift(result);
    });
});

// Adding and removing clouds layer to map on show clouds button
$('#showClouds').click(function (event) {
    event.preventDefault();
    $('.navbar-collapse').collapse('hide');
    displayMapLayer(clouds);
});

// Adding and removing Precipitation layer to map on show clouds button
$('#showPercipitation').click(function (event) {
    event.preventDefault();
    $('.navbar-collapse').collapse('hide');
    displayMapLayer(precipitation);
});

// Adding and removing Pressure layer to map on show clouds button
$('#showPressure').click(function (event) {
    event.preventDefault();
    $('.navbar-collapse').collapse('hide');
    displayMapLayer(pressure);
});

// Adding and removing WindSpeed layer to map on show clouds button
$('#showWind').click(function (event) {
    event.preventDefault();
    $('.navbar-collapse').collapse('hide');
    displayMapLayer(wind);
});

// Adding and removing Temperature layer to map on show clouds button
$('#showTemperture').click(function (event) {
    event.preventDefault();
    $('.navbar-collapse').collapse('hide');
    displayMapLayer(temp);
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

// Fills and shows Week of Weather Forecasts
$('#weatherForecast').click(function () {
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
    $('#weatherInfo').toggle();
});

// Toggling the display country info
$('#showInfo').click(function () {
    $('#countryInfo').toggle();
});


