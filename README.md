# Weather Service

Ever wonder why your phone shows weather data of your immediate vicinity on your travel?  This project demonstrates the use of Navigator.geolocation API that is part of NodeJS to pinpoint your immediate location.  The geolocation method gets the current position in longitude and latitude.  The weather app uses these values to call a weather service API for weather data.  This non-interactive process happens automatically for your convenience.

## The Value of Weather Information 

Weather information is powerful knowledge used in forecasting the production of certain operations to help determine the economic bottom line.  There are countless human endeavors affected by weather factors.  Rain is good for growers, and forewarning is valuable in extreme weather, while the sunny sky and windy days could be good for energy production.  For example, solar power production needs to know the number of hours of sunlight specific to geographical location.  Wind farm needs to know wind speed, direction, etc. The travel and hospitality industry is most affected by dynamic weather patterns.  From Agriculture to space-faring, weather plays a key role in the decision-making process.

There are weather detection stations situated in and around you.  The inner working of making data available is not of interest to the populous but it is vital to a functioning society.  Although, the National Weather Service is a government agency that disseminates data free of charge.  Weather data has been monetized by repackaging in ways the population can consume.  e.g. Local TV news reserve a segment devoted to weather ubiquitously.  Weather data is available at your finger tips.  It is all factored into a transferable cost by some service providers you're currently paying.

<br />

> Below is the template for rudimentary completion of an example on interfacing with a weather data provider.  For indepth logics and real life data implementation, continue to [here](./public/README.md).

<br />

## NodeJS and Express

I recently wrote this Local Weather app using the cloud editor `replit` where the bootstraping of node JS is hidden.  All I had to do was to focus on the core logic in app.js, style.css, and index.html.  To create a fully functional development environment locally, I needed to bootstrap NodeJS, Express to my replit code.  

Here is how I add scalffolding my Nodejs project.

**Configure Project Development Environment for ES6**

>Let's assume you are using NodeJS with a version later than 13.  Then, it is required to configure the development environment to work for ExpressJS with dotenv and ES6 modules.

First, you will need to change your `package.json` to include:

```c
...
"type": "module",
...
```

Then, use imports in your `app.js`.  Here is an express start with dotenv:

```c
import dotenv  from "dotenv"
import express from "express"

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

app.get('/', (req, res) => {
  res.send("Local Weather.  Don't leave home without reading it")
})

app.listen(port, () => {
  console.log(`Local weather server is serving you from http://0.0.0.0:${port}`)
})
```

<br />

Step 1:  Migrate replit code to local VSCode.
    Create a folder for your project.  Create sub folders `views` and `public` to place client-side programming. 
    
    `mkdir views`

    `mkdir public`

Step 2:  Initialize the folder as a node project
    
    ` npm init -y`

Step 3:  Install *express* to confiure a lightweight Node server
    
    `npm install express`

Step 4:  Install *helmet* to configure runtime security
    
    `nmp install helmet`

Now, you are good to start developing and runing from VSCode.

### Project Layout

It is a typical NodeJS project layout.  

'app.js' - server file

'./public/script.js' - interface to https://weather-proxy.freecodecamp.rocks/api/

'./views/index.html' - client-side presentation. 

## Runtime

`npm start`

<strong>Output</strong>

![codepen.io output](./public/Runtime.PNG)

## Build and Run Docker Image

Build a docker image base on the given Dockerfile and .dockerignore is this folder.  After successful docker build, run the image to verify correctness.  Then it can be pushed to dockerhub or your favorite cloud provider.  

### Build
Docker container is built and saved to current working directory.  Replace tag name 'hurricanemark' with your own username.

`docker build -t hurricanemark/localweather:1.0 .`

```c
[+] Building 139.3s (11/11) FINISHED
 => [internal] load build definition from Dockerfile                                              0.1s 
 => => transferring dockerfile: 210B                                                              0.1s 
 => [internal] load .dockerignore           
...
 => [internal] load build context                                                                 0.8s 
 => => transferring context: 143.24kB                                                             0.6s 
 => [2/5] WORKDIR /app                                                                            1.2s 
 => [3/5] COPY package.json ./                                                                    0.1s 
 => [4/5] RUN npm install                                                                         6.6s 
 => [5/5] COPY . .                                                                                0.2s 
 => exporting to image                                                                            0.4s 
 => => exporting layers                                                                           0.3s 
 => => writing image sha256:bb89b0646be41055287fdac18ea1e405a2a19ef4b2919a0a02c213b9dc947b34      0.0s 
 => => naming to docker.io/hurricanemark/localweather:1.0    
```

** List the image **

```c
PS D:\DEVEL\NODEJS\BrainUnscramblers\LocalWeather> docker image ls
REPOSITORY                   TAG         IMAGE ID       CREATED         SIZE
hurricanemark/localweather   1.0         bb89b0646be4   6 minutes ago   949MB
```

### Run docker

Note that Dockerfile exposes port 8080.  This needs to be forwarded to a port on your local machine.  i.e. `LOCAL_PORT:CONTAINER_PORT` for example  *4321:8080*

`docker run -p 4321:8080 bb89b0646be4`

```c
PS D:\DEVEL\NODEJS\BrainUnscramblers\LocalWeather> docker run -p 4321:8080 bb89b0646be4

> LocalWeather@1.0.0 start /app
> node app.js

Local Weather is listening on port 8080
```

<br />

To access the Local Weather app running in docker container, point your browser to the forwarding port 4321.

`http:/localhost:4321`