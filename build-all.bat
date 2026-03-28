@echo off
echo Building Eureka...
cd EurekaServerWeb && mvnw clean package -DskipTests && cd ..

echo Building MS_Order...
cd MS_Order && mvnw clean package -DskipTests && cd ..

echo Building API Gateway...
cd ApiGatewayWeb && mvnw clean package -DskipTests && cd ..

echo All built!