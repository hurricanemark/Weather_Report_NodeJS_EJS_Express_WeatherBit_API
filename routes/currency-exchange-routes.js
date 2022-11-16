import { data as currencyCodes } from 'currency-codes';
import request from 'request';
import express from 'express';
import { EXCHANGE_RATE_APIKEY, EXCHANGE_BASE_URI } from '../index.js';


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
        let URLStr = EXCHANGE_BASE_URI + EXCHANGE_RATE_APIKEY + '/pair/' + fromCurrency + '/' + toCurrency + '/' + amount;
  console.log(URLStr);
        try {
          if (fromCurrency === undefined) {
            URLStr = EXCHANGE_BASE_URI + EXCHANGE_RATE_APIKEY + '/pair/EUR/GBP/1';
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