FROM node:10

RUN apt-get update && apt-get install -y postgresql-client

WORKDIR /app

COPY ./package.json ./package-lock.json ./

RUN npm install

COPY . .

CMD npm start
