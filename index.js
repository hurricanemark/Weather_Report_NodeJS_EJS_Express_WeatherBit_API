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

app.post('/weatherbit', (req, res) => {
  let apiKey = process.env.WEATHERBIT_KEY;
  let city = req.body.locale;
  let url = process.env.WEATHERBIT_URI;
  /*WEATHERBIT_URI=https://api.weatherbit.io/v2.0/current?city=HCM&country=Vietnam&units=I&key=${weatherbit_key} */
  let uriWeatherBitStr = `${url}&city=${city}&key=${apiKey}`;
  console.log(uriWeatherBitStr);
  try  {
    request(uriWeatherBitStr, async function (err, response, body) { 
      console.log(response.statusCode);
      if (response.statusCode === 400) {
        res.render('weatherbit', { locale: city, resStatus: 400, resData: null, error: "Please check your input." });
      } 
      if (response.statusCode == 200) {
          
          let weather = await JSON.parse(body).data[0];
          console.log(weather);

          res.render('weatherbit', { locale: city, resStatus: 200, resData: weather, error: null });
      } else {
        res.render('weatherbit', { locale: city, resStatus: 500, resData: null, error: 'Error, please check your input.'});
      }
    })
  } catch (err) {
    console.log(err);
  }
});

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

