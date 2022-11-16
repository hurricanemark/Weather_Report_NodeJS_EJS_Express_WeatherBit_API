import express from 'express';
import request from 'request';
import { keys } from '../config/keys.js';
const router = express.Router();

let WEATHERBIT_KEY = keys.weatherbitapi.APIKEY;
let WEATHERBIT_URI = keys.weatherbitapi.URI;



router.get('/', (req, res) => {
    res.render('pages/weatherbit');
});
  
// Posting data to the client-side requires multiple API calls.
// We implement the Promise.all() below to call and wait for all data to come back.
router.post('/', (req, res) => {
    let city = req.body.locale;
    let coords = [ req.body.lat, req.body.lng ];
    let promisedData;
    // console.log(coords[0], coords[1]);
    if (city.length > 0) {
        // get data by address
        promisedData = gatherWeatheBits(city);
    } else if (typeof(coords[0]) === "string") {
        // get data by latitude/longitude
        promisedData = gatherWeatheBits(coords);
    }

    promisedData.then( (data) => {
        res.render('pages/weatherbit', data);
    })
});
  

/* 
 * Function retrieves weatherbit.io current conditions.
 * Used in the Promise call below. 
*/
function getWeatherAlerts(city){
    return new Promise(resolve => {
      if (Array.isArray(city) === true && typeof(city[0]) === "string") {
        city = "&lat=" + city[0] + "&lon=" + city[1];
      } else {
        city = "&city=" + city;
      }
  
      var Xcode = "";
      if (process.env.NODE_ENV === 'awsdeploy') {
        Xcode = JSON.parse(decryptAES(WEATHERBIT_KEY)).text;
      } else { 
        Xcode = WEATHERBIT_KEY;
      }
  
      setTimeout(() => {
        // https://api.weatherbit.io/v2.0/alerts?lat=39.75895&lon=-84.19161&key=API_KEY
        let uriWeatherBitStr = `${WEATHERBIT_URI}alerts?units=I${city}&key=${Xcode}`;
        let retCode;
        if (WEATHERBIT_URI.length === 0) {
          console.log('Failed to get API URI!');
          return null;
        } 
        // else {
        //   console.log(uriWeatherBitStr);
        // }
        try {
          request(uriWeatherBitStr, async function (err, response, body) {
            console.log(response.statusCode);
            if (response.statusCode == 429) {
              console.log("WARNING: You have exceeded your API call limit with weatherbit.io!");
              resolve(null);
            }          
            if (response.statusCode == 200) {
                let alerts = await JSON.parse(body).alerts[0];
                // console.log(JSON.parse(body).alerts);
                resolve(alerts);
            } else {
              // Ignoring grainular status codes for now.
              resolve(null);
            }
          })
        } catch (err) {
          console.log(err);
        }
      })
    }, 500);
  }
  
  
  /* 
   * Function retrieves weatherbit.io current conditions.
   * Used in the Promise call below. 
  */
  function getWeatherBitCurrentConditions(city){
    return new Promise(resolve => {
      if (Array.isArray(city) === true && typeof(city[0]) === "string") {
        city = "&lat=" + city[0] + "&lon=" + city[1];
      } else {
        city = "&city=" + city;
      }
  
      var Xcode = "";
      if (process.env.NODE_ENV === 'awsdeploy') {
        Xcode = JSON.parse(decryptAES(WEATHERBIT_KEY)).text;
      } else { 
        Xcode = WEATHERBIT_KEY;
      }
  
      setTimeout(() => {
  
        let uriWeatherBitStr = `${WEATHERBIT_URI}current?units=I${city}&key=${Xcode}`;
        let retCode;
        if (WEATHERBIT_URI.length === 0) {
          console.log('Failed to get aws secrets!');
          return null;
        } 
        // else {
        //   console.log(uriWeatherBitStr);
        // }
        try {
          request(uriWeatherBitStr, async function (err, response, body) {
            console.log(response.statusCode);
            if (response.statusCode == 429) {
              console.log("WARNING: You have exceeded your API call limit with weatherbit.io!");
              resolve(null);
            }          
            if (response.statusCode == 200) {
                let weather = await JSON.parse(body).data[0];
                resolve(weather);
            } else {
              resolve(null);
            }
          })
        } catch (err) {
          console.log(err);
        }
      })
    }, 300);
  }
  
  
  /* 
   * Function retrieves weatherbit.io daily forecast.
   * Used in the Promise call below.
  */
  function getWeatherBitDailyForecast(city){
    return new Promise(resolve => {
      if (Array.isArray(city) === true && typeof(city[0]) === "string") {
        city = "&lat=" + city[0] + "&lon=" + city[1];
      } else {
        city = "&city=" + city;
      }
  
      var Xcode = "";
      if (process.env.NODE_ENV === 'awsdeploy') {
        Xcode = JSON.parse(decryptAES(WEATHERBIT_KEY)).text;
      } else { 
        Xcode = WEATHERBIT_KEY;
      }
  
      setTimeout(() => {
        let uriWeatherBitStr = `${WEATHERBIT_URI}forecast/daily?units=I${city}&key=${Xcode}`;
        let retCode;
        // console.log(uriWeatherBitStr);
        try {
          request(uriWeatherBitStr, async function (err, response, body) {
            if (response.statusCode == 429) {
              console.log("WARNING: You have exceeded your API call limit with weatherbit.io!");
              resolve(null);
            }
            if (response.statusCode == 403) {
              console.log("WARNING: Free plan limit is used up.  Data will be available again on the 3rd of next month.");
              retCode = JSON.parse(body);
              resolve(retCode);
            }
            if (response.statusCode == 200) {
              retCode = await JSON.parse(body);
              resolve(retCode);
            } else {
              resolve(null);
            }
          })
        } catch (err) {
          console.log(err);
        }
      }, 500);
    })
  }
  
  function getWeatherBitAirQuality(city) {
    /* API_URL = https://api.weatherbit.io/v2.0/history/airquality?city=${city}&start_date=2022-10-03&end_date=2022-10-04&tz=local&key=${apikey} */
    return new Promise(resolve => {
      if (Array.isArray(city) === true && typeof(city[0]) === "string") {
        city = "?lat=" + city[0] + "&lon=" + city[1];
      } else {
        city = "?city=" + city;
      }
  
      var Xcode = "";
      if (process.env.NODE_ENV === 'awsdeploy') {
        Xcode = JSON.parse(decryptAES(WEATHERBIT_KEY)).text;
      } else { 
        Xcode = WEATHERBIT_KEY;
      }
  
      setTimeout(() => {
        let e =  new Date().toISOString().slice(0, 16).replace('T', ' ')
        let enddate = e.split(' ')[0];
        // add 1 day to enddate
        let s = new Date(enddate);
        s.setDate(s.getDate() - 1);
        s = s.toISOString().slice(0, 16).replace('T', ' ');
        let startdate = s.split(' ')[0];
  
        let retCode;
        let uriWeatherBitAPIStr = `${WEATHERBIT_URI}history/airquality${city}&start_date=${startdate}&end_date=${enddate}&key=${Xcode}`;
  
        // console.log(uriWeatherBitAPIStr);
        try {
          request(uriWeatherBitAPIStr, async function (err, response, body) {
            console.log(response.statusCode);
  
            if (response.statusCode == 429) {
              console.log("WARNING: You have exceeded your API call limit with weatherbit.io!");
              resolve(null);
            }
            if (response.statusCode == 200) {
              retCode = await JSON.parse(body);
              resolve(retCode);
            } else {
              resolve(null);
            }
          })
        } catch (err) {
          console.log(err);
        }
      }, 300);
  
    })
  }
  
  
  /*
   * Return multiple promises consists of currentConditions and dailyForecast data.
   */
  async function gatherWeatheBits(city) {
    const [dailyForecast, alerts, currentConditions, airQuality,] = await Promise.all([
      getWeatherBitDailyForecast(city),
      getWeatherAlerts(city),
      getWeatherBitCurrentConditions(city),
      getWeatherBitAirQuality(city)
    ]);
  
  
    // Check is the service trial expired
    if (dailyForecast.error === 'API key not valid, or not yet activated.') {
      return { locale: city, alertStatus: 403, alertData: null, curStatus: 403, curData: null, foreStatus: 403, foreData: null, airqStatus: 403, airqData: null, error: 'Free plan has reached its limit.  Data will be available again on the 3rd of next month.' };    
    } 
    // Make sure all promisses fulfilled.
    else if (dailyForecast  !== null && alerts !== null && airQuality !== null && currentConditions !== null ) {
      let currentHour = new Date().getHours(); 
      let aStatus = 200;
      let aData = alerts;
      if (alerts !== null) {
        aStatus = 400;
        aData = null;
      }
      // combine 3 promises into a huge rendering passing paramters: 
      let combinedData = { locale: city, alertStatus: aStatus, alertData: aData, curStatus: 200, curData: currentConditions,  foreStatus: 200, foreData: dailyForecast, airqStatus: 200, airqData: airQuality.data[currentHour], error: null };
      return combinedData;
    } else {
      return { locale: city, alertStatus: 400, alertData: null, curStatus: 400, curData: null, foreStatus: 400, foreData: null, airqStatus: 400, airqData: null, error: null };
    }
}

export { router };