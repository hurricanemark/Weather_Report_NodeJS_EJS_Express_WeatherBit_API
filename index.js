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


// post weather data to the client-side
app.post('/', (req, res) => {
    console.log(req.body.locale);
    // call weatherAPI for data
    let apiKey = process.env.WEATHER_VISUALCROSSING_API_KEY;
    let city = req.body.locale;
    let url = process.env.WEATHER_VISUALCROSSING_API_BASE_URI;
    
    /* https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=us&contentType=json&key=${apiKey} */
    let uriStr = `${url}${city}?unitGroup=us&contentType=json&key=${apiKey}`;
    console.log(uriStr);
    request(uriStr, async function (err, response, body) {
      if(err){
        console.log('error:', err);
      } else {
        let weather = await JSON.parse(body).currentConditions;
        // console.log(weather);

        if (weather.datetime == undefined) {
            console.log("Something went wrong.  No weather data.");
            res.render('index', { data: null, error: 'Error, please check your input.'});
        } else {
            // console.log("currentConditions:\n");
            // console.log(weather);
            res.render('index', { locale: city ,data: weather, error: null });
        }
      }
    });

})


// about page
app.get('/about', function(req, res) {
    res.render('about');
});

let port = process.env.PORT || 3210;

// creating a server that is listening on ${port} for connections.
app.listen(port, () => {
    console.log(`StagingWeather report app is listening on port ${port}`);
});

