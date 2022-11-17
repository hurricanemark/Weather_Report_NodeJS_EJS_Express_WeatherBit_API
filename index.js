import * as dotenv from 'dotenv';
import request from 'request';
import express from 'express';
import bodyParser from 'body-parser';
import cookieSession from 'cookie-session';
import passport from 'passport';
import mongoose from 'mongoose';
import { compile } from 'ejs';
import { serialize, deserialize, googleStrategy } from './config/passport-setup.js';
import {encryptAES, decryptAES} from './crypto.js';

// dev env
dotenv.config();

// application secrets
// import { keys } from './config/keys.js';  

let EXCHANGE_RATE_APIKEY;
let EXCHANGE_BASE_URI='https://v6.exchangerate-api.com/v6/';
let WEATHERBIT_KEY;
let WEATHERBIT_URI='https://api.weatherbit.io/v2.0/';
let GoogleclientID;
let GoogleclientSecret;
let MongoDBConString;
let CookieKey = 'c93da061ab7f984267e36c8431645035d611bc892c58f0e64614c68a4384a179126e7ed0b5829e460f292f72e9ef4facb68a0894cb2425ba046b82a3bae0b529';

if (process.env.NODE_ENV === "production") {
    EXCHANGE_RATE_APIKEY = process.env.EXCHANGE_RATE_APIKEY;
    WEATHERBIT_KEY = process.env.WEATHERBIT_KEY;
    GoogleclientID = process.env.GoogleclientID;
    GoogleclientSecret = process.env.GoogleclientSecret;    
    MongoDBConString = process.env.MONGODB_URI;
} else {
    // dynamically importing keys.js using promise:
    import('./config/keys.js').then((secrets) => {
      EXCHANGE_RATE_APIKEY = secrets.keys.exchangerateapi.EXCHANGE_APIKEY;
      WEATHERBIT_KEY = secrets.keys.weatherbitapi.WEATHERBIT_APIKEY;
      GoogleclientID = secrets.keys.google.clientID;
      GoogleclientSecret = secrets.keys.google.clientSecret;
      MongoDBConString = secrets.keys.mongodb.connectionString;
    });
}


// Create network routing
const app = express();


// routes handler for Currency Exchange methods
import { router as currencyExchangeRoutes } from './routes/currency-exchange-routes.js';

// routes handler for WeatherBit.io API methods
import { router as weatherbitRoutes } from './routes/weatherbit-routes.js';

// routes handler for OAuth20 methods
import { router as oauth20Routes } from './routes/auth-routes.js';

// routes handler for profile
import { router as profileRoutes } from './routes/profile-routes.js';

// EJS is accessed by default in the views directory.
app.set('view engine', 'ejs');

// Allow access to 'public' folder where resources are available to this app
app.use(express.static('public'));

// Parse incoming request bodies in a middleware before your handlers, available under the `req.body` property.
app.use(bodyParser.urlencoded({ extended: true }));



// cookie!
app.use(cookieSession({
  maxAge: 24 * 60 * 60 * 1000,
  keys: [CookieKey]
}));


// Initialize passport
app.use(passport.initialize());
app.use(passport.session());


// connect to mongodb
mongoose.connect(MongoDBConString, () => {
        console.log('Connected to MongoDB.');
    });





// Set up all routes related to currency exchange rate methods
app.use('/exchange', currencyExchangeRoutes);

// Set up all routes to WeatherBit reports
app.use('/weatherbit', weatherbitRoutes);

// Set up all routes related to oauth2 methods
app.use('/auth', oauth20Routes);

// set up routes for user info after logged in
app.use('/profile', profileRoutes);

// Homepage: get the locale from the client-side via the ejs form
app.get('/', (req, res) => {
  res.render('index', {user: req.user, xkey: 'hey'});
})

// about page
app.get('/about', function(req, res) {
  res.render('pages/about', {user: req.user});
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

export { EXCHANGE_RATE_APIKEY, EXCHANGE_BASE_URI, WEATHERBIT_KEY, WEATHERBIT_URI,  GoogleclientID, GoogleclientSecret };
