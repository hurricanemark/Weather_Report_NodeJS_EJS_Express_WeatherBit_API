import * as dotenv from 'dotenv';
import request from 'request';
import express from 'express';
import bodyParser from 'body-parser';
import {encryptAES, decryptAES} from './crypto.js';

// dev env
dotenv.config();

let EXCHANGE_RATE_APIKEY;
let BASE_URI;
let SAMPLE2_URI;
let WEATHERBIT_KEY;
let WEATHERBIT_URI;
let GoogleclientID;
let GoogleclientSecret;
// if (process.env.NODE_ENV === "production") {
    EXCHANGE_RATE_APIKEY = process.env.EXCHANGE_RATE_APIKEY;
    BASE_URI = process.env.EXCHANGE_BASE_URI;
    SAMPLE2_URI = process.env.SAMPLE2_URI;
    WEATHERBIT_KEY = process.env.WEATHERBIT_KEY;
    WEATHERBIT_URI = process.env.WEATHERBIT_URI;
    GoogleclientID = process.env.GoogleclientID;
    GoogleclientSecret = process.env.GoogleclientSecret;    

//} else {
//     // dynamically importing keys.js:
//     let AppKeys = await import('./config/keys.js');
//     EXCHANGE_RATE_APIKEY = AppKeys.exchangerateapi.APIKEY;
//     BASE_URI = AppKeys.exchangerateapi.BASE_URI;
//     SAMPLE2_URI = AppKeys.exchangerateapi.SAMPLE2_URI;
//     WEATHERBIT_KEY = AppKeys.weatherbitapi.APIKEY;
//     WEATHERBIT_URI = AppKeys.weatherbitapi.BASE_URI;
//     GoogleclientID = AppKeys.google.clientID;
//     GoogleclientSecret = AppKeys.google.clientSecre;
// }



// Create network routing
const app = express();

// application secrets
import { keys } from './config/keys.js';  

// routes handler for Currency Exchange methods
import { router as currencyExchangeRoutes } from './routes/currency-exchange-routes.js';

// routes handler for WeatherBit.io API methods
import { router as weatherbitRoutes } from './routes/weatherbit-routes.js';

// routes handler for OAuth20 methods
import { router as oauth20Routes } from './routes/auth-routes.js';


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

// Set up all routes related to oauth2 methods
app.use('/auth', oauth20Routes);

// Homepage: get the locale from the client-side via the ejs form
app.get('/', (req, res) => {
  res.render('index', {xkey: 'hey'});
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

export { EXCHANGE_RATE_APIKEY, BASE_URI, SAMPLE2_URI, WEATHERBIT_KEY, WEATHERBIT_URI,  GoogleclientID, GoogleclientSecret };
