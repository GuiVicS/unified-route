FROM node:20-alpine

WORKDIR /app

# Criar diretório de dados
RUN mkdir -p /app/data

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/app/data

EXPOSE 3000

# Volume para persistência de dados
VOLUME ["/app/data"]

CMD ["node", "serve.js"]
