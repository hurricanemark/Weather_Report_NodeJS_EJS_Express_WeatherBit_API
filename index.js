import * as dotenv from 'dotenv';
dotenv.config()
import request from 'request';
import express from 'express';
import bodyParser from 'body-parser';

// Create network routing
const app = express();

// EJS is accessed by default in the views directory.
app.set('view engine', 'ejs');

// Allow access to 'public' folder where resources are available to this app
app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));

// get the locale from the client-side via the ejs form
app.get('/', (req, res) => {
    res.render('index');
})

app.get('/weatherbit', (req, res) => {
  res.render('weatherbit');
})

// Posting data to the client-side requires two API calls.
// We implement the Promise.all() below to call and wait for all data to come back.
app.post('/weatherbit', (req, res) => {
  let city = req.body.locale;
  let promisedData = gatherWeatheBits(city);
  promisedData.then( (data) => {
    res.render('weatherbit', data);
  })
});

/* 
 * Function retrieves weatherbit.io current conditions.
 * Used in the Promise call below. 
*/
function getWeatherBitCurrentConditions(city){
  return new Promise(resolve => {
    setTimeout(() => {
      let apiKey = process.env.WEATHERBIT_KEY;
      let url = process.env.WEATHERBIT_URI;
      let uriWeatherBitStr = `${url}current?units=I&city=${city}&key=${apiKey}`;
      let retCode;
      console.log(uriWeatherBitStr);
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
    setTimeout(() => {
      let apiKey = process.env.WEATHERBIT_KEY;
      let url = process.env.WEATHERBIT_URI;
      let uriWeatherBitStr = `${url}forecast/daily?units=I&city=${city}&key=${apiKey}`;
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

/*
 * Return multiple promises consists of currentConditions and dailyForecast data.
 */
async function gatherWeatheBits(city) {
  const [currentConditions, dailyForecast] = await Promise.all([
    getWeatherBitCurrentConditions(city),
    getWeatherBitDailyForecast(city)
  ]);

  // Since daily forecast might take longer, check its promise here.
  if (dailyForecast  !== null) {
    // combine 2 promises: 
    let combinedData = { locale: city, curStatus: 200, curData: currentConditions, foreStatus: 200, foreData: dailyForecast, error: null };
    return combinedData;
  } else {
    return { locale: city, curStatus: 400, curData: null, foreStatus: 400, foreData: null, error: null };
  }
}

// post weather data to the client-side
app.post('/', (req, res) => {
    console.log(req.body.locale);
    // call weatherAPI for data
    let apiKey = process.env.WEATHER_VISUALCROSSING_API_KEY;
    let city = req.body.locale;
    let url = process.env.WEATHER_VISUALCROSSING_API_BASE_URI;

    /*VISUALCROSSING_URI=https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=us&contentType=json&key=${apiKey} */
    let uriStr = `${url}${city}?unitGroup=us&contentType=json&key=${apiKey}`;
    // console.log(uriStr);
    try {
      request(uriStr, async function (err, response, body) {
        console.log(response.statusCode);
        
        if (response.statusCode == 429) {
          console.log("You have exceeded your API call limit with visualcrossing.com!");
          res.render('index', { locale: city, status: response.statusCode, data: null,  error: "Visualcrossing API call limit exceeded." });
        }
        if (response.statusCode == 400) {
          res.render('index', { locale: city, status: response.statusCode, data: null,  error: "Please check your input." });
        } 
        if (response.statusCode === 200) {
          
            let weather = await JSON.parse(body);
            res.render('index', { locale: city, status: response.statusCode, data: weather, error: null });
        } else {
          res.render('index', { locale: city, status: response.statusCode, data: null, error: 'Error, please check your input.'});
        }

      });
  
    } catch (err) {
      res.render('index', { locale: city, data: null, forecast: null, error: err.message });
    }
});


// about page
app.get('/about', function(req, res) {
    res.render('about');
});

let port = process.env.PORT || 3210;

// creating a server that is listening on ${port} for connections.
app.listen(port, () => {
    console.log(`StagingWeather report app is listening on port ${port}`);
});

