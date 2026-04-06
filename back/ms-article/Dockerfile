FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY target/*.jar app.jar
RUN mkdir -p /app/uploads
ENTRYPOINT ["java", "-jar", "app.jar"]