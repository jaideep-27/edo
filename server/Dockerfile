FROM node:20-alpine

# Python3 for the optimizer, JRE for CloudSim simulator
RUN apk add --no-cache python3 py3-pip py3-numpy openjdk21-jre-headless

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 5001
CMD ["node", "src/server.js"]
