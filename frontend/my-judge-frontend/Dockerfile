FROM node:22.20.0

WORKDIR /app

COPY package*.json  .

RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]