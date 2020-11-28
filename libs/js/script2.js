let defualtCoords = [51.5, -0.10];
let defLat = 51.5;
let defLng = -0.10;
let latitude;
let longitude;

let ajaxInitResult = [];

let mymap = L.map('mapid');
// Adding a tile to map
let tiles = new L.TileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 18,
    ext: 'png'
});
mymap.addLayer(tiles);

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

L.AwesomeMarkers.Icon.prototype.options.prefix = 'ion';

if (navigator) {
    navigator.geolocation.getCurrentPosition((position) => {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        // Add location marker + Binding a Popup
        let homeIcon = L.AwesomeMarkers.icon({
            icon: 'home',
            iconColor: 'black',
            markerColor: 'purple'
        });
        let marker = L.marker([latitude, longitude], { icon: homeIcon }).addTo(mymap)

        /*let marker = L.marker([latitude, longitude], {
            color: "red"
        }).addTo(mymap);*/
        marker.bindPopup("<h4>You are Here!<h4/>").openPopup();
        mymap.setView([latitude, longitude], 6);
        let trimLat = latitude.toFixed(6);
        let trimLng = longitude.toFixed(6);

        // AJAX Call chain call
        $.ajax({
            url: "libs/php/chain.php",
            type: "POST",
            dataType: "JSON",
            data: {
                lat: trimLat,
                lng: trimLng
            },
            success: function (result) {
                ajaxInitResult.push(result);
                // Setting current Country Border
                let border = L.geoJSON(result.Borders).addTo(mymap);
                // Setting the Optimum View
                mymap.fitBounds(border.getBounds());
                // Logging object returned
                console.log(result);

                // Working through Triposo Top 10 cities and adding them to the map
                let cities = result.Cities;
                let i = 0
                while (i < 10) {
                    let city = {
                        name: cities[i].name,
                        lat: cities[i].coordinates.latitude,
                        lon: cities[i].coordinates.longitude
                    };
                    let cityIcon = L.AwesomeMarkers.icon({
                        icon: 'location',
                        iconColor: 'black',
                        markerColor: 'blue',
                        prefix: 'ion'
                    });
                    let cityMarker = L.marker([city.lat, city.lon], { icon: cityIcon }).addTo(mymap);
                    cityMarker.bindPopup(
                        `<h4>${city.name}</h4>
                        <p>${cities[i].snippet}</p>
                        <p>Score: ${cities[i].score.toFixed(2)}</p>
                        <p>Population: ${cities[i].properties[0].value}</p>
                        <a href="${cities[i].attribution[1].url}" target="_blank">Click to Learn More about ${city.name}</a>
                        <img src="${cities[i].images[0].sizes.thumbnail.url}" alt="${city.name} image">`, {
                        keepInView: true,
                        className: 'CitiesPopUp'
                    });
                    console.log(city);
                    i++;
                }

                // Adding National Parks to the Map
                let parks = result.NationalParks;
                let p = 0;
                while (p < 10) {
                    let park = {
                        name: parks[p].name,
                        lat: parks[p].coordinates.latitude,
                        lon: parks[p].coordinates.longitude,
                        img: parks[p].images[0].sizes.thumbnail.url,
                        score: parks[p].score,
                        snip: parks[p].snippet,
                        wiki: parks[p].attribution[0].url
                    };
                    let parkIcon = L.AwesomeMarkers.icon({
                        icon: 'leaf',
                        iconColor: 'black',
                        markerColor: 'green',
                        prefix: 'ion'
                    });
                    let parkMarker = L.marker([park.lat, park.lon], { icon: parkIcon }).addTo(mymap);
                    parkMarker.bindPopup(`
                    <h4>${park.name}</h4>
                    <p>Score: ${park.score.toFixed(2)}</p>
                    <p>${park.snip}</p>
                    <a href="${park.wiki}" target="_blank">Click to Learn More about ${park.name}</a>
                    <img src="${park.img}" alt="${park.name} image">`, {
                        keepInView: true,
                        className: 'ParksPopUp'
                    });
                    p++;
                }
                //mymap.fitBounds(cityMarker);
                // Filling in Show Country Info
                $('#countryInfo').html(`
                <h4>${result.GeoInfo.countryName}</h4>
                <p><b>Flag:</b> ${result.GeoNames.annotations.flag}</p>
                <p><b>Population:</b> ${result.GeoInfo.population}</p>
                <p><b>Capital:</b> ${result.GeoInfo.capital}</p>
                <p><b>Calling Code:</b> +${result.GeoNames.annotations.callingcode}</p>
                <h5>Currency Info</h5>
                <p><b>Code:</b> ${result.GeoNames.annotations.currency.iso_code} </p>
                <p><b>Name:</b> ${result.GeoNames.annotations.currency.name} </p>
                <p><b>Symbol:</b> '${result.GeoNames.annotations.currency.symbol}'</p>
                <h5>Driving Info</h5>
                <p><b>Side of Road: </b>${result.GeoNames.annotations.roadinfo.drive_on}</p>
                <p><b>Speed in: </b>${result.GeoNames.annotations.roadinfo.speed_in}</p>
                <h5>Weather</h5>
                <p>
                <img src="http://openweathermap.org/img/wn/${result.CurrentWeather.weather[0].icon}@2x.png" alt="${result.CurrentWeather.weather[0].description}">
                <b>${result.CurrentWeather.weather[0].description}</b></p>
                <p><b>Temperature: </b>${result.CurrentWeather.main.temp} celsius</p>
                <p><b>Sunrise: </b>${new Date(result.CurrentWeather.sys.sunrise * 1000).toLocaleTimeString({ hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                <p><b>Sunset: </b>${new Date(result.CurrentWeather.sys.sunset * 1000).toLocaleTimeString({ hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                `);
            },
            error: function (err) {
                console.log(err);
            }
        });
    }, (error) => {
        console.log(error);
        $.ajax({
            url: "libs/php/chain.php",
            type: "POST",
            dataType: "JSON",
            data: {
                lat: defualtCoords[0],
                lng: defualtCoords[1]
            },
            success: function (result) {
                mymap.setView([defLat, defLng], 6);
                let border = L.geoJSON(result.Borders).addTo(mymap);
                mymap.fitBounds(border.getBounds());
                //console.log(result);
            },
            error: function (err) {
                console.log(err);
            }
        });
    });
} else {
    $.ajax({
        url: "libs/php/chain.php",
        type: "POST",
        dataType: "JSON",
        data: {
            lat: defualtCoords[0],
            lng: defualtCoords[1]
        },
        success: function (result) {
            mymap.setView([defLat, defLng], 6);
            let border = L.geoJSON(result.Borders).addTo(mymap);
            mymap.fitBounds(border.getBounds());
        },
        error: function (err) {
            console.log(err);
        }
    });
}

console.log(ajaxInitResult);

function renderRestaurant(restaurant) {
    let restaurantIcon = L.AwesomeMarkers.icon({
        icon: 'fork',
        iconColor: 'black',
        markerColor: 'red',
        prefix: 'ion'
    });
    let restaurantMarker = L.marker([restaurant.coordinates.latitude, restaurant.coordinates.longitude], { icon: restaurantIcon }).addTo(mymap);
    let link;
    let image;
    if (!restaurant.attribution[1]) {
        link = { url: 'empty', text: 'No links found' };
    } else {
        link = { url: restaurant.attribution[1].url, text: 'Click Here to Find Out More' };
    }
    if (!restaurant.images[0]) {
        image = { src: '/Resouces/image-not-found.png', alt: "no image found" };
    } else {
        image = { src: restaurant.images[0].sizes.thumbnail.url, alt: restaurant.name + 'image' };
    }
    restaurantMarker.bindPopup(`
    <h4>${restaurant.name}</h4>
    <p>Score: ${restaurant.score.toFixed(2)}</p>
    <p>${restaurant.snippet}</p>
    <a href="${link.url}" target="_blank">${link.text}</a>
    <img src="${image.src}" alt="${image.alt}">`, {
        keepInView: true,
        className: 'RestaurantPopUp'
    });
}

// Calling php to call json to populate select dropdown menu with countries
$('#select').load('libs/php/borders.php', function () {
});

// event Handler function for toggling map layers
function displayLayer(layer) {
    //event.preventDefault();
    if (mymap.hasLayer(layer)) {
        $(this).removeClass('selected');
        mymap.removeLayer(layer);
    } else {
        mymap.addLayer(layer);
        $(this).addClass('selected');
    }
}

// Adding and removing clouds layer to map on show clouds button
$('#showClouds').click(function (event) {
    event.preventDefault();
    displayLayer(clouds);
});

// Adding and removing Precipitation layer to map on show clouds button
$('#showPercipitation').click(function (event) {
    event.preventDefault();
    displayLayer(precipitation);
});

// Adding and removing Pressure layer to map on show clouds button
$('#showPressure').click(function (event) {
    event.preventDefault();
    displayLayer(pressure);
});

// Adding and removing WindSpeed layer to map on show clouds button
$('#showWind').click(function (event) {
    event.preventDefault();
    displayLayer(wind);
});

// Adding and removing Temperature layer to map on show clouds button
$('#showTemperture').click(function (event) {
    event.preventDefault();
    displayLayer(temp);
});

// Toggling the display country info
$('#showInfo').click(function () {
    $('#countryInfo').toggle();
});

// Show Restaurants
$('#restaurants').click(function () {
    let r = 0;
    let restaurantMarkers = [];
    while (r < 10) {
        renderRestaurant(ajaxInitResult[0].CapitalRestaurants[r]);
        // restaurantMarkers.push(renderRestaurant(ajaxInitResult[0].CapitalRestaurants[r]));
        r++;
    }
    //L.featureGroup([restaurantMarkers]).getBounds();
});

// Show Forecast
$('#weatherForecast').click(function () {
    let Forecast = ajaxInitResult[0].Forecast;

    console.log(Forecast);
    for (let i = 0; i < Forecast.length; i++) {
        $('#WeatherList').html(`
        <li>
        <h4>${new Date(Forecast[i].dt * 1000).toDateString()}</h4>
        <p><img src="http://openweathermap.org/img/wn/${Forecast[i].weather[0].icon}@2x.png" alt="${Forecast[i].weather[0].description}">
        ${Forecast[i].weather[0].description}</p>
        <p>Humidity: ${Forecast[i].humidity}</p>
        </li>`);
    }

    $('#WeatherInfo').toggle();
});