import * as dotenv from 'dotenv';
let WEATHERBIT_KEY = "";
let WEATHERBIT_URI = "";

dotenv.config();

// dotenv.config()
import request from 'request';
import express from 'express';
import bodyParser from 'body-parser';
import {encryptAES, decryptAES} from './crypto.js';


import awssdk from 'aws-sdk';




if (process.env.NODE_ENV === 'awsdeploy') {
  WEATHERBIT_URI="https://api.weatherbit.io/v2.0/";
  WEATHERBIT_KEY="U2FsdGVkX18HMV5UUT9rJN76hOtIHDw1bH0beQYWH8a6E7uzKqskdgHvc6Nq2lO6O+GAb2vrcL+X8ZDqcGPuLw==";
console.log("AWSDEPLOY mode!");
} else {
  // Code for Development Mode
  WEATHERBIT_KEY = process.env.WEATHERBIT_KEY;
  WEATHERBIT_URI = process.env.WEATHERBIT_URI;
}


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
  let apikey = encryptAES(WEATHERBIT_KEY);
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
 * function get AWS environment variables
 */
function getAwsSecrets() {
  var AWS = awssdk,
  region = "us-east-1",
  secretName = "techrolemi_weather_secret",
  secret,
  decodedBinarySecret;

  // Create a Secrets Manager client
  var client = new AWS.SecretsManager({
    region: region
  });


  client.getSecretValue({SecretId: secretName}, function(err, data) {
    if (err) {
      if (err.code === 'DecryptionFailureException')
          // Secrets Manager can't decrypt the protected secret text using the provided KMS key.
          // Deal with the exception here, and/or rethrow at your discretion.
          throw err;
      else if (err.code === 'InternalServiceErrorException')
          // An error occurred on the server side.
          // Deal with the exception here, and/or rethrow at your discretion.
          throw err;
      else if (err.code === 'InvalidParameterException')
          // You provided an invalid value for a parameter.
          // Deal with the exception here, and/or rethrow at your discretion.
          throw err;
      else if (err.code === 'InvalidRequestException')
          // You provided a parameter value that is not valid for the current state of the resource.
          // Deal with the exception here, and/or rethrow at your discretion.
          throw err;
      else if (err.code === 'ResourceNotFoundException')
          // We can't find the resource that you asked for.
          // Deal with the exception here, and/or rethrow at your discretion.
          throw err;
    }
    else {
      // Decrypts secret using the associated KMS key.
      // Depending on whether the secret is a string or binary, one of these fields will be populated.
      // console.log(data);
      if ('SecretString' in data) {
        secret = data.SecretString;
        var aesParams = JSON.parse(secret);
        // console.log(data.Name + " : " + data.SecretString);
        Object.entries(aesParams).forEach((entry) => {
          var [key, value] = entry;
          if (`${key}` === "WEATHERBIT_KEY") {
            WEATHERBIT_KEY = `${value}`;
            console.log("WEATHERBIT_KEY="+ WEATHERBIT_KEY);
          }
          else if (`${key}` === "WEATHERBIT_URI") {
            WEATHERBIT_URI = `${value}`;
            console.log("WEATHERBIT_URI="+WEATHERBIT_URI);
          }
        });
          
      } else {
          let buff = new Buffer(data.SecretBinary, 'base64');
          decodedBinarySecret = buff.toString('ascii');
          console.log("decodedBinarySecret: " + decodedBinarySecret);
      }
    }
  })
}


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


  // Make sure all promisses fulfilled.
  if (dailyForecast  !== null && alerts !== null && airQuality !== null && currentConditions !== null ) {
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

// about page
app.get('/about', function(req, res) {
    res.render('pages/about');
});

let port = process.env.PORT || 3000;

// creating a server that is listening on ${port} for connections.
app.listen(port, () => {
    console.log(`TechRolEmi weather report is listening on port ${port}`);
});

