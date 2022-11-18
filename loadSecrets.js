/* IMPORTANT SECRETS */
/*
 * To load environment variables, this file must be initialized 
 * at the top of the application 
 * 
 * This file depends on ./config/keys.js in development mode!
 */

import * as dotenv from 'dotenv';

// dev env
dotenv.config();
let EXCHANGE_RATE_APIKEY;
let WEATHERBIT_KEY;
let GoogleclientID;
let GoogleclientSecret;
let MongoDBConString;
let WEATHERBIT_URI='https://api.weatherbit.io/v2.0/';
let EXCHANGE_RATE_URI='https://v6.exchangerate-api.com/v6/';
let CookieKey = 'c93da061ab7f984267e36c8431645035d611bc892c58f0e64614c68a4384a179126e7ed0b5829e460f292f72e9ef4facb68a0894cb2425ba046b82a3bae0b529';

if (process.env.NODE_ENV === "production") {
  EXCHANGE_RATE_APIKEY = process.env.EXCHANGERATE_APIKEY;
  WEATHERBIT_KEY = process.env.WEATHERBIT_KEY;
  GoogleclientID = process.env.GOOGLECLIENT_ID;
  GoogleclientSecret = process.env.GOOGLECLIENT_SECRET;    
  MongoDBConString = process.env.MONGODB_URI;
  console.log('Loaded keys from dotenv');
} else {
    // dynamically importing keys.js using promise:
    let secrets = await getSecrets();
    // console.log(secrets);
    if(secrets) {
      EXCHANGE_RATE_APIKEY = secrets.keys.exchangerateapi.EXCHANGERATE_APIKEY;
      WEATHERBIT_KEY = secrets.keys.weatherbitapi.WEATHERBIT_APIKEY;
      GoogleclientID = secrets.keys.google.GOOGLECLIENT_ID;
      GoogleclientSecret = secrets.keys.google.GOOGLECLIENT_SECRET;
      MongoDBConString = secrets.keys.mongodb.MONGODB_CONSTR;
    };
}

/*
 * Async function loading keys dynamically from ./config/keys.js
 * IMPORTANT NOTE: ./config/keys.js is not saved in the archive!
 * It is meant to be used in development environment only.
 * For `production` build, you must change NODE_ENV accordingly.
 */
function getSecrets(){
    return new Promise(resolve => {
      setTimeout(() => {
        try {
            import('./config/keys.js').then((secrets) => {
                resolve(secrets);
            });
        } catch (err) {
            console.log(err);
            resolve(null);
        }
      })
    }, 200);
}


export { EXCHANGE_RATE_APIKEY, EXCHANGE_RATE_URI, WEATHERBIT_KEY, WEATHERBIT_URI, GoogleclientID, GoogleclientSecret, CookieKey, MongoDBConString };