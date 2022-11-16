import { data as currencyCodes } from 'currency-codes';
import request from 'request';
import express from 'express';
import { EXCHANGE_RATE_APIKEY, BASE_URI, SAMPLE2_URI } from '../index.js';

// let EXCHANGE_RATE_APIKEY;
// let BASE_URI;
// let SAMPLE2_URI;
// if (process.env.NODE_ENV === "production") {
//     EXCHANGE_RATE_APIKEY = process.env.EXCHANGE_RATE_APIKEY;
//     BASE_URI = process.env.EXCHANGE_BASE_URI;
//     SAMPLE2_URI = process.env.SAMPLE2_URI;
// } else {
//     EXCHANGE_RATE_APIKEY = keys.exchangerateapi.APIKEY;
//     BASE_URI = keys.exchangerateapi.BASE_URI;
//     SAMPLE2_URI = keys.exchangerateapi.SAMPLE2_URI;
// }

const router = express.Router();


router.get('/', (req, res) => {
    // console.log(currencyCodes);
    let cdat = JSON.stringify(currencyCodes);
    res.render('pages/exchangeRate', { Cdata: cdat });
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
        // console.log("Exchange data: " + data.conversion_result);
        res.render('pages/exchangeRate', {  Cdata: cdat, amount: amnt, frC: Fc, toC: Tc, exchange: data});
    });
});

function getExchangeRateData(fromCurrency, toCurrency, amount) {
    return new Promise(resolve => {
      setTimeout(() => {
        let URLStr = BASE_URI + EXCHANGE_RATE_APIKEY + '/pair/' + fromCurrency + '/' + toCurrency + '/' + amount;
  console.log(URLStr);
        try {
          if (fromCurrency === undefined) {
            URLStr = SAMPLE2_URI;
          }
          console.log("Calling URL: " + URLStr);
          request(URLStr, async function (err, response, body) {
            console.log(response.statusCode);
            if (response.statusCode == 429) {
              console.log("WARNING: You have exceeded your API call limit of 1500 calls per month!");
              resolve(null);
            }          
            if (response.statusCode == 200) {
                let result = await JSON.parse(body);
  
                resolve(result);
            } else {
              // Ignoring grainular status codes for now.
              resolve(null);
            }
          })
        } catch (err) {
          console.log(err);
        }
        
      }, 200);
    })};

export { router };    