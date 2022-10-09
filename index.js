import * as dotenv from 'dotenv';
dotenv.config()
import request from 'request';
import express from 'express';
import bodyParser from 'body-parser';
import {encrypt, decrypt} from './crypto.js';


// Create network routing
const app = express();

// EJS is accessed by default in the views directory.
app.set('view engine', 'ejs');

// Allow access to 'public' folder where resources are available to this app
app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));

// get the locale from the client-side via the ejs form
app.get('/', (req, res) => {
  // console.dir(req.params);
  // console.dir(req.body);
  let apikey = encrypt(process.env.WEATHERBIT_KEY);
  res.render('index', {xkey: apikey});
})



app.get('/weatherbit', (req, res) => {
  // console.log('render get weatherbit:');
  // console.dir(req.params)
  // console.dir(req.body);
  res.render('pages/weatherbit');
})

// Posting data to the client-side requires two API calls.
// We implement the Promise.all() below to call and wait for all data to come back.

app.post('/weatherbit', (req, res) => {
  let city = req.body.locale;
  let coords = [ req.body.lat, req.body.lng ];
  let promisedData;
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
function getWeatherBitCurrentConditions(city){
  return new Promise(resolve => {
    if (Array.isArray(city) === true && typeof(city[0]) === "string") {
      city = "&lat=" + city[0] + "&lon=" + city[1];
    } else {
      city = "&city=" + city;
    }
    setTimeout(() => {
      let apiKey = process.env.WEATHERBIT_KEY;
      let url = process.env.WEATHERBIT_URI;
      let uriWeatherBitStr = `${url}current?units=I${city}&key=${apiKey}`;
      let retCode;
      // console.log(uriWeatherBitStr);
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
    setTimeout(() => {
      let apiKey = process.env.WEATHERBIT_KEY;
      let url = process.env.WEATHERBIT_URI;
      let uriWeatherBitStr = `${url}forecast/daily?units=I${city}&key=${apiKey}`;
      let retCode;
      // console.log(uriWeatherBitStr);
      try {
        request(uriWeatherBitStr, async function (err, response, body) {
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
    setTimeout(() => {
      let apiKey = process.env.WEATHERBIT_KEY;
      let url = process.env.WEATHERBIT_URI;
      let e =  new Date().toISOString().slice(0, 16).replace('T', ' ')
      
      let enddate = e.split(' ')[0];
      // add 1 day to enddate
      let s = new Date(enddate);
      s.setDate(s.getDate() - 1);
      s = s.toISOString().slice(0, 16).replace('T', ' ');
      let startdate = s.split(' ')[0];

      let retCode;
      let uriWeatherBitAPIStr = `${url}history/airquality${city}&start_date=${startdate}&end_date=${enddate}&key=${apiKey}`;

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
  const [dailyForecast, currentConditions, airQuality,] = await Promise.all([
    getWeatherBitDailyForecast(city),
    getWeatherBitCurrentConditions(city),
    getWeatherBitAirQuality(city)
  ]);


  // Make sure all promisses fulfilled.
  if (dailyForecast  !== null && airQuality !== null && currentConditions !== null ) {
    let currentHour = new Date().getHours(); 
    // combine 3 promises into a huge rendering passing paramters: 
    let combinedData = { locale: city, curStatus: 200, curData: currentConditions, foreStatus: 200, foreData: dailyForecast, airqStatus: 200, airqData: airQuality.data[currentHour], error: null };
    return combinedData;
  } else {
    return { locale: city, curStatus: 400, curData: null, foreStatus: 400, foreData: null, airqStatus: 400, airqData: null, error: null };
  }
}

// about page
app.get('/about', function(req, res) {
    res.render('pages/about');
});

let port = process.env.PORT || 3000;

// creating a server that is listening on ${port} for connections.
app.listen(port, () => {
    console.log(`StagingWeather report app is listening on port ${port}`);
});

