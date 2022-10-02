# Core Logic

To obtain the pinpoint weather data, earth location is a required parameter.  For this, the longitude and latitude would suffice programmatically.  For the interactive option, a physical postal address (partial address of City, State, or Country) is required.  Optionally, you could also register with the google map service (*additional charge will incur*).  Then, integrate google-map API where the user can point to a location on the map to trigger a localized weather report.

* The geolocation of a known address can be obtained by using the client-side javascript [Windows Navigator](https://www.w3schools.com/jsref/obj_navigator.asp).  Your browser uses different types and sources of information to identify your location. These include your IP address, geolocation via HTML5 in your browser, and your PC's language and time settings.  For more detail on how Navigator.geolocation is determined, [read more here](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition).

Sample code for client-side geolocation:

```c
    <script type=javascript>
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
        } else {
            document.getElementById("geo-coord").innerHTML =
            "Geolocation is not supported by this browser.";
        }

        function showPosition(position) {
            document.getElementById("geo-coord").innerHTML =
            "Latitude: " + position.coords.latitude +
            "Longitude: " + position.coords.longitude;
        }
    </script>
```

* The API query for weather data can be describe as follow.

    > <https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/LOCATION?unitGroup=metric&key=API_ACCESS_KEY&contentType=json>

    Where, **LOCATION** can be City, State

    and **API_ACCESS_KEY** can be obtained from registering with an API provider.

* With the return JSON object representing the weather data, you wrap the individual data objects in a grid to make it user-friendly.

<br />

# Getting Real Data from A Paid API Provider

Replace freecodecamp proxy URI (file: public/scripts.js) for weather data provider via a paid subscription. In this project, you can use the API service from the [VisualCrossing.com](https://www.visualcrossing.com).  The good news is if you registered to use the free tier, a good fit for demonstration purposes, there is no charge as long as you stay within the allowed call limit.  Read [here](https://www.visualcrossing.com/resources/blog/five-easy-weather-api-calls-to-get-the-weather-data-you-need/) to learn ways to make weather API calls.

<br />

# Steps to Integrate A New API Provider

1. Register with a weather reporting service.  Consult with their API documentation on how to call their APIs.
2. Obtain the API access key from the same provider above.
3. Build an API https query and manually test it out.
4. Write an async function to incorporate the API call and retrieve the weather data.


> On the server, the `API_KEY` is hidden in the `.env` file.  By design, environment variables are not accessible to the client. For the client to directly query weather data, the API_KEY has to be available on the browser.  This will break the security of our application!

**Options**:

* Make the API calls on the server-side and then send response containing the weather data to the client;
* or, require the client to use their own API keys;
* or, using the serverless option with locked down to a service.  *This bad option multiplies your cost as your user base grows*.

**Decision:**  

You would want to live free and die harder, let's make the client calls the server which in turn requests weather data and sends responses back.  The client then can parse the response into a grid for display.  This means the server will need to provide GET requests!

---

**Options**: 

You need to implement a middleware to retrieve weather data and serve it to the client using either
- `EJS` embedded templates 
- or `ReactJS`.

Obviously, many developers have accountered this issue.  Lucky for us, `EJS`, `ReactJS` typically solves this problem.  EJS is an easier choice having less of a learning curve.

**Decision:**  
Let's introduce the Embedded Javascript ([EJS](https://www.npmjs.com/package/ejs)) middleware template rendering weather data upon client requestt.

e.g. 
```c
    app.post("/geoLngLatWeather", (req, res) => {...})

    app.get("/geoLngLatWeather", (req, res) => {...})

    app.get("/physicalAddrWeather", (req, res, next) => {...})
```
<br />

<strong><span style="color:gray; font-size:18px"> Staying within the Free Tier Limit</span> </strong>

A typical free daily allowance cycle consists of up to 1000 free API queries.  In this case, the user has to wait until the beginning of the next free tier cycle.  To avoid being charged, this source code has a *a server-side accounting logic* to pause querying the weathercrossing API once its periodic allowance has been reached.  Unpause is automatic once the clock rolls to the beginning of a new daily free tier cycle.

>*Potential development needed to notify the server admin if demands grew and if there are ways to monetize it.*

<strong><span style="color:gray; font-size:18px">Caching the Weather Data</span></strong>

Weather forecast data from `visualcrossing.com` typically contains information spanning 15 days, each day contains 24 hourly objects.  Additional queries within the same period would usually result in the same data.  We need to cache this information so as not to incur needless and sometimes costly API calls.  

We could elect to use the DOM Storage API, also called the [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API) methods: `Window.sessionStorage` where data persists as long as the session is running, or `Window.localStorage` which has no expiration.  Note: when the last private tab is closed, data stored in the localStorage object of a site opened in a private tab or incognito mode is cleared.

<br />

<span style="color:green">**IMPORTANT:**</span>  Web Storage API needs to be implemented on the browser side (client with the DOM).  In this case, we make sure to place the javascript script at the bottom of the HTML body section.

>Another option is to use no-sql storage such as `redis`.  A topic not in the scope of this exercise.  

A sample of Web Storage API test:

```c
/* client-side script */
    <script type=javascript>
        function storageAvailable(type) {
            let storage;
            try {
                storage = window[type];
                const x = '__storage_test__';
                storage.setItem(x, x);
                storage.removeItem(x);
                return true;
            }
            catch (e) {
                return e instanceof DOMException && (
                    // everything except Firefox
                    e.code === 22 ||
                    // Firefox
                    e.code === 1014 ||
                    // test name field too, because code might not be present
                    // everything except Firefox
                    e.name === 'QuotaExceededError' ||
                    // Firefox
                    e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
                    // acknowledge QuotaExceededError only if there's something already stored
                    (storage && storage.length !== 0);
            }
        }

        if (storageAvailable(methodString)) {
            // Yippee! We can use localStorage awesomeness
            // Save data to sessionStorage
            sessionStorage.setItem("lw_name", "marcus");

            // Get saved data from sessionStorage
            let data = sessionStorage.getItem("lw_name");

            alert(methodString +' says my name is ' + data);
            // Remove saved data from sessionStorage
            sessionStorage.removeItem("lw_name");
        }
        else {
            // Too bad, no localStorage for us
            alert(methodString + ' says Web Storage API is disabled.')
        }
    </script>
```


## Next Phases

The followings are potential developments in subsequent iterations of this weather report project:

* Integrate the server with auth0 and/or passport authentication

* Registered members have access to a full-blown dashboard with maritime alerts, historical weather data, extended forecasts, etc.

* Build and make mobile apps available to subscribed members.