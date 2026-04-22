# Build stage
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app

# Copy parent pom
COPY pom.xml .

# Copy all modules
COPY Eureka_project Eureka_project
COPY GestionExams GestionExams
COPY GestionSession GestionSession
COPY GestionFormation GestionFormation
COPY Recruitment Recruitment
COPY GestionPartner GestionPartner
COPY GestionUser GestionUser
COPY api_gateway_pi api_gateway_pi

# Build only API Gateway
RUN mvn clean package -DskipTests -pl api_gateway_pi -am

# Runtime stage
FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY --from=builder /app/api_gateway_pi/target/*.jar app.jar
EXPOSE 8090
ENTRYPOINT ["java", "-jar", "app.jar"]