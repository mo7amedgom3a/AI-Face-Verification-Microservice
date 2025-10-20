FROM node:lts-slim 
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate

EXPOSE 3000
# Run database migrations before starting the server
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]