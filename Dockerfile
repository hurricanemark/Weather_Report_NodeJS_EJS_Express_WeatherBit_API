FROM node:16.17.0 AS build

WORKDIR /usr/src/app

#COPY package.json package-lock.json ./
COPY . .

# install package.json and clean cache.
RUN npm ci --production && npm cache clean --force

ENV NODE_ENV=production
ENV PORT=8080
ENV WEATHERBIT_URI=https://api.weatherbit.io/v2.0/

# ENV WEATHERBIT_KEY=XXXXXXX  <-- expect as container parameter! 

EXPOSE 8080

CMD [ "node", "index.js" ]