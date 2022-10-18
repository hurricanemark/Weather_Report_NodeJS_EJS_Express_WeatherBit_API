FROM node:16.17.0 AS build

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm install --dotenv-extend

# install package.json and clean cache.
RUN npm ci --production && npm cache clean --force

COPY . .

ENV NODE_ENV=awsdeploy
ENV PORT=8080
ENV WEATHERBIT_URI=https://api.weatherbit.io/v2.0/
ENV WEATHERBIT_KEY=U2FsdGVkX18HMV5UUT9rJN76hOtIHDw1bH0beQYWH8a6E7uzKqskdgHvc6Nq2lO6O+GAb2vrcL+X8ZDqcGPuLw== 

EXPOSE 8080

CMD [ "node", "index.js" ]