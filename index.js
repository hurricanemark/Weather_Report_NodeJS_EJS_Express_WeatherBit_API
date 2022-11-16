import * as dotenv from 'dotenv';
import request from 'request';
import express from 'express';
import bodyParser from 'body-parser';
import {encryptAES, decryptAES} from './crypto.js';


// application secrets
import { keys } from './config/keys.js';  

// routes handler for Currency Exchange methods
import { router as currencyExchangeRoutes } from './routes/currency-exchange-routes.js';

// routes handler for WeatherBit.io API methods
import { router as weatherbitRoutes } from './routes/weatherbit-routes.js';

// routes handler for OAuth20 methods
import { router as oauth20Routes } from './routes/auth-routes.js';

// dev env
dotenv.config();

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
