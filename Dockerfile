FROM node:14.17.0

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD [ "npm", "start" ]