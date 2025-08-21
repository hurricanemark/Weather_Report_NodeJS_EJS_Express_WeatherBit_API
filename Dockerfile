FROM node:16.17.0 AS build

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm install --dotenv-extend

# install package.json and clean cache.
RUN npm ci --production && npm cache clean --force

COPY . .

ENV NODE_ENV=awsdeploy
ENV PORT=8080
ENV WEATHERBIT_URI=http://api.weatherbit.io/v2.0/
ENV WEATHERBIT_KEY=ec6c67acdbd84e72a367dc98290cb149
EXPOSE 8080

CMD [ "node", "index.js" ]
