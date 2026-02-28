FROM node:22.20.0

WORKDIR /app

COPY package*.json  .

RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 8080

CMD ["npx", "nodemon"]