FROM eclipse-temurin:21-jdk AS build

RUN apt-get update && apt-get install -y maven

WORKDIR /assettrack-backend

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jdk

WORKDIR /assettrack-backend
COPY --from=build /assettrack-backend/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]