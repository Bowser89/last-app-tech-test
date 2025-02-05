FROM node:22.1.0

WORKDIR /app

COPY package*.json ./

RUN cp development.env .env

RUN npm install -g @nestjs/cli

COPY . .

EXPOSE 5000

CMD ["npm", "run", "start:dev"]
