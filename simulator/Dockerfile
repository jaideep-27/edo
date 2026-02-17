FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN apt-get update && apt-get install -y maven && \
    mvn clean package -q -DskipTests && \
    apt-get purge -y maven && apt-get autoremove -y

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/simulator.jar ./simulator.jar
CMD ["java", "-jar", "simulator.jar"]
