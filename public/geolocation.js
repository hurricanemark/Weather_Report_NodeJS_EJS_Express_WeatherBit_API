
import CryptoJS from 'crypto-js';
let decrypt = (data) => {
  return CryptoJS.enc.Base64.parse(data).toString(CryptoJS.enc.Utf8);
};
// global params
let longitude, latitude = "";
let result;


export default function showPosition() {
    
    // Store the element where the page displays the result
    result = document.getElementById("geoLatLng");
    
    // If geolocation is available, try to get the visitor's position
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
        //result.innerHTML = "<textarea>"Detecting geological location..</textarea>";
        //this.geoMsg = "Detecting geological location...";
    } else {
        alert("Sorry, your browser does not support HTML5 geolocation.");
        //this.geoMsg = "Sorry, your browser does not support HTML5 geolocation.";
    }
}

// Define callback function for successful attempt
function successCallback(position) {
    longitude = position.coords.longitude;
    latitude = position.coords.latitude;
    let secret = document.getElementById("xcree");
let key = document.getElementById("xcode").value;
alert("key: "+ decrypt(key));
    result.innerHTML = "Your current position is (" + "Latitude: " + latitude + ", " + "Longitude: " + longitude + ")";

    // passing lng/let to weather api call
    geoMsg = "Your geoLocation is (" + longitude +", "+ latitude +").  ";
    getLocalWeather(longitude, latitude, secret, 0);
}

// Define callback function for failed attempt
function errorCallback(error) {
    if(error.code == 1) {
        geoMsg += "You've decided not to share your position, but it's OK. We won't ask you again.  ";
    } else if(error.code == 2) {
        geoMsg += "The network is down or the positioning service can't be reached.  ";
    } else if(error.code == 3) {
        geoMsg += "The attempt timed out before it could get the location data.  ";
    } else {
        geoMsg += "Geolocation failed due to unknown error.  ";
    }
    result.innerHTML = "<textarea>"+  geoMsg + "Showing weather in London instead.</textarea>";
    getLocalWeather(51.509865, -0.118092, geoMsg, 1);

}

function getWeatherBitWeatherData(longitude, latitude, message, defaultLocale=0) {
    let xhttp = new XMLHttpRequest();
    let apisecret = decrypt(message);
    let urlStr = "https://api.weatherbit.io/v2.0/";

    let apiURL = `${urlStr}current?units=I&lon=${longitude}&lat=${latitude}&key=${apisecret}`;
    console.log(apiURL);
    xhttp.onreadystatechange = function() {
        if( this.readyState == 4 && this.status == 200) {
            let response = JSON.parse(xhttp.responseText);

            let html = `<textarea>${response}</textarea>`;
            let condition_data = document.querySelector('.currentConds');
            condition_data.innerHTML = html;
          }
      }
    xhttp.open("GET", urlStr, true);
    xhttp.send();
}

showPosition();
