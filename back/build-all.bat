@echo off
setlocal enabledelayedexpansion

set ROOT=%cd%

echo ========================================
echo Building Eureka Server...
echo ========================================
cd /d "%ROOT%\EurekaServerWeb"
call mvn clean package -DskipTests
if %errorlevel% neq 0 ( echo FAILED: EurekaServerWeb & exit /b 1 )

echo ========================================
echo Building Config Server...
echo ========================================
cd /d "%ROOT%\config-server"
call mvn clean package -DskipTests
if %errorlevel% neq 0 ( echo FAILED: config-server & exit /b 1 )

echo ========================================
echo Building MS_Order...
echo ========================================
cd /d "%ROOT%\MS_Order"
call mvn clean package -DskipTests
if %errorlevel% neq 0 ( echo FAILED: MS_Order & exit /b 1 )

echo ========================================
echo Building MS_Category...
echo ========================================
cd /d "%ROOT%\MS_Category"
call mvn clean package -DskipTests
if %errorlevel% neq 0 ( echo FAILED: MS_Category & exit /b 1 )

echo ========================================
echo Building ms-article...
echo ========================================
cd /d "%ROOT%\ms-article"
call mvn clean package -DskipTests
if %errorlevel% neq 0 ( echo FAILED: ms-article & exit /b 1 )

echo ========================================
echo Building API Gateway...
echo ========================================
cd /d "%ROOT%\ApiGatewayWeb"
call mvn clean package -DskipTests
if %errorlevel% neq 0 ( echo FAILED: ApiGatewayWeb & exit /b 1 )

echo ========================================
echo All services built successfully!
echo Now run: docker-compose up --build
echo ========================================