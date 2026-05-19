FROM node:22.20.0 AS build

WORKDIR /app

COPY package*.json ./


ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL


RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
