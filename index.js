import * as dotenv from 'dotenv';
import request from 'request';
import express from 'express';
import bodyParser from 'body-parser';
import {encryptAES, decryptAES} from './crypto.js';
import { data as currencyCodes } from 'currency-codes';
import awssdk from 'aws-sdk';

// application secrets
import { keys } from './config/keys.js';  

// routes handler for Currency Exchange methods
import { router as currencyExchangeRoutes } from './routes/currency-exchange-routes.js';

// routes handler for WeatherBit.io API methods
import { router as weatherbitRoutes } from './routes/weatherbit-routes.js';

let WEATHERBIT_KEY = "";
let WEATHERBIT_URI = "";

dotenv.config();

if (process.env.NODE_ENV === 'awsdeploy') {
  WEATHERBIT_URI="https://api.weatherbit.io/v2.0/";
  WEATHERBIT_KEY="U2FsdGVkX18HMV5UUT9rJN76hOtIHDw1bH0beQYWH8a6E7uzKqskdgHvc6Nq2lO6O+GAb2vrcL+X8ZDqcGPuLw==";
  console.log("AWSDEPLOY mode!");
} else {
  // Code for Development Mode
  // WEATHERBIT_KEY = process.env.WEATHERBIT_KEY;
  // WEATHERBIT_URI = process.env.WEATHERBIT_URI;

  WEATHERBIT_KEY = keys.weatherbitapi.APIKEY;
  WEATHERBIT_URI = keys.weatherbitapi.URI;
}



// Create network routing
const app = express();

// EJS is accessed by default in the views directory.
app.set('view engine', 'ejs');

// Allow access to 'public' folder where resources are available to this app
app.use(express.static('public'));

// Parse incoming request bodies in a middleware before your handlers, available under the `req.body` property.
app.use(bodyParser.urlencoded({ extended: true }));

// Set up all routes related to currency exchange rate methods
app.use('/exchange', currencyExchangeRoutes);

// Set up all routes to WeatherBit reports
app.use('/weatherbit', weatherbitRoutes);

// Homepage: get the locale from the client-side via the ejs form
app.get('/', (req, res) => {
  let apikey = encryptAES(WEATHERBIT_KEY);
  res.render('index', {xkey: apikey});
})

// about page
app.get('/about', function(req, res) {
  res.render('pages/about');
});


let port = process.env.PORT || 3000;

// creating a server that is listening on ${port} for connections.
app.listen(port, () => {
    console.log(`TechRolEmi is listening on port ${port}`);
}).on('error', (e) => {
  console.log('Error happened: ', e.message);
  // try different port
  try {
    port = process.env.PORT2;
    app.listen(port, () => {
      console.log(`TechRolEmi is listening on port ${port}`);
    })
  } catch (e) {
    console.log('Sorry, failed to launch.');
  }
});
