FROM eclipse-temurin:21-jdk AS build

RUN apt-get update && apt-get install -y maven

WORKDIR /assettrack-backend

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jdk

WORKDIR /assettrack-backend
COPY --from=build /assettrack-backend/target/*.jar app.jar
COPY scripts ./scripts

RUN apt-get update \
	&& apt-get install -y bash openssl \
	&& rm -rf /var/lib/apt/lists/* \
	&& chmod +x /assettrack-backend/scripts/*.sh

EXPOSE 8080
ENTRYPOINT ["/assettrack-backend/scripts/docker-entrypoint.sh"]