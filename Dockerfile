# ── Stage 1: Build the Java simulator fat JAR ──
FROM maven:3.9-eclipse-temurin-17-alpine AS sim-builder
WORKDIR /build
COPY simulator/pom.xml .
# Cache Maven dependencies
RUN mvn dependency:go-offline -B
COPY simulator/src ./src
RUN mvn package -DskipTests -B

# ── Stage 2: Runtime — Node + Python + JRE ──
FROM node:20-alpine

# Python3 for the optimizer, JRE for CloudSim simulator
RUN apk add --no-cache python3 py3-pip py3-numpy openjdk21-jre-headless

# ── Server (Node.js) ──
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server/ .

# ── Optimizer (Python) ──
WORKDIR /app/optimizer
COPY optimizer/ .

# ── Simulator JAR (from build stage) ──
WORKDIR /app/simulator/target
COPY --from=sim-builder /build/target/simulator.jar ./simulator.jar

# ── Run ──
WORKDIR /app/server
ENV NODE_ENV=production
EXPOSE 5001
CMD ["node", "src/server.js"]
