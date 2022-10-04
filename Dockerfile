FROM node:16.17.0

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

ENV NODE_ENV=production
ENV PORT=8080
ENV WEATHER_VISUALCROSSING_API_BASE_URI_4LNG_LAT=https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/weatherdata/forecast?aggregateHours=24&contentType=json&unitGroup=us
ENV WEATHER_VISUALCROSSING_API_BASE_URI=https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/
ENV WEATHERBIT_URI=https://api.weatherbit.io/v2.0/
# ENV WEATHER_VISUALCROSSING_API_KEY=XXXXX
# ENV WEATHERBIT_KEY=XXXXXXX

EXPOSE 8080

CMD [ "npm", "start" ]