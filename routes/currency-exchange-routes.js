import { data as currencyCodes } from 'currency-codes';
import request from 'request';
import express from 'express';

import { EXCHANGE_RATE_APIKEY, EXCHANGE_RATE_URI } from '../loadSecrets.js';

const router = express.Router();


router.get('/', (req, res) => {
    // console.log(currencyCodes);
    let cdat = JSON.stringify(currencyCodes);
    res.render('pages/exchangeRate', { user: req.user, Cdata: cdat });
  });
  
router.post('/', (req, res) => {
    let cdat = JSON.stringify(currencyCodes);
    // console.log("POST exchange: " + JSON.stringify(req.body));
    let amnt = req.body.amount;
    let Fc = req.body.fromCurrency;
    let Tc = req.body.toCurrency;
    // console.log("Amount: " + amnt + " From: " + Fc + " To: " + Tc);

    // get currencyconversion
    let promiseData;
    promiseData = getExchangeRateData(Fc, Tc, amnt);

    promiseData.then ( (data) => {
      console.log(data);
      if (data != null && data.result === 'error') {
        console.log('Sending code 403: ' + data.result);

        res.render('pages/exchangeRate', { user: req.user, Cdata: cdat, amount: amnt, frC: Fc, toC: Tc, exchange: null, statusCode: 403, exchangeStatus: 'We apologize.  Free monthly plan has reached max quota, exchange data will be available again on the 7th of next month.  Please consider subscribe to a small monthly fee to continue normal usage.'}, ((err) => {
          console.log(err.message);
        }));
      } else if (data.result === 'success') {
        console.log("Exchange data: " + data.time_last_update_utc);
        res.render('pages/exchangeRate', { user: req.user, Cdata: cdat, amount: amnt, frC: Fc, toC: Tc, exchange: data, statusCode: 200, exchangeStatus: 'Ok'});
      }
    });
});

function getExchangeRateData(fromCurrency, toCurrency, amount) {
    return new Promise(resolve => {
      setTimeout(() => {
        let URLStr = EXCHANGE_RATE_URI + EXCHANGE_RATE_APIKEY + '/pair/' + fromCurrency + '/' + toCurrency + '/' + amount;
  console.log(URLStr);
  if (fromCurrency === toCurrency) {
    // no need to run request.
    let xdate = new Date();
    let retData = {
      result: 'success',
      time_last_update_utc: xdate,
      conversion_rate: amount,
      conversion_result: amount
    }

    console.log("No need to run request.")
    resolve(retData);
  } else {
      try {
        if (fromCurrency === undefined) {
          URLStr = EXCHANGE_RATE_URI + EXCHANGE_RATE_APIKEY + '/pair/EUR/GBP/1';
        }

        // console.log("Calling URL: " + URLStr);
        request(URLStr, async function (err, response, body) {
          console.log(response.statusCode);
          if (response.statusCode == 429) {
            console.log("WARNING: You have exceeded your API call limit of 1500 calls per month!");
            resolve(null);
          } 
          if (response.statusCode == 403) {
            console.log("WARNING: Free plan limit is used up.  Data will be available again on the 7th of next month.");
            let result = await JSON.parse(body);
            resolve(result);              
          }         
          if (response.statusCode == 200) {
            let result = await JSON.parse(body);
            console.log(result);
            resolve(result);
          } else {
            // Ignoring grainular status codes for now.
            resolve(null);
          }
        })
      } catch (err) {
        console.log(err);
      }
    }
  }, 200);    
})};

export { router };    