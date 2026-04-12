@echo off
setlocal enabledelayedexpansion

set ROOT=%cd%

echo ========================================
echo Building Eureka Server...
echo ========================================
cd /d "%ROOT%\EurekaServerWeb"
call mvnw.cmd clean package -DskipTests
if %errorlevel% neq 0 ( echo FAILED: EurekaServerWeb & exit /b 1 )

echo ========================================
echo Building Config Server...
echo ========================================
cd /d "%ROOT%\config-server"
call mvnw.cmd clean package -DskipTests
if %errorlevel% neq 0 ( echo FAILED: config-server & exit /b 1 )

echo ========================================
echo Building MS_Order...
echo ========================================
cd /d "%ROOT%\MS_Order"
call mvnw.cmd clean package -DskipTests
if %errorlevel% neq 0 ( echo FAILED: MS_Order & exit /b 1 )

echo ========================================
echo Building MS_Category...
echo ========================================
cd /d "%ROOT%\MS_Category"
call mvnw.cmd clean package -DskipTests
if %errorlevel% neq 0 ( echo FAILED: MS_Category & exit /b 1 )

echo ========================================
echo Building ms-article...
echo ========================================
cd /d "%ROOT%\ms-article"
call mvnw.cmd clean package -DskipTests
if %errorlevel% neq 0 ( echo FAILED: ms-article & exit /b 1 )

echo ========================================
echo Building MS_Feedback...
echo ========================================
cd /d "%ROOT%\MS_Feedback"
call mvnw.cmd clean package -DskipTests
if %errorlevel% neq 0 ( echo FAILED: MS_Feedback & exit /b 1 )

echo ========================================
echo Building ManageUsers...
echo ========================================
cd /d "%ROOT%\ManageUsers"
call mvnw.cmd clean package -DskipTests
if %errorlevel% neq 0 ( echo FAILED: ManageUsers & exit /b 1 )

echo ========================================
echo Building API Gateway...
echo ========================================
cd /d "%ROOT%\ApiGatewayWeb"
call mvnw.cmd clean package -DskipTests
if %errorlevel% neq 0 ( echo FAILED: ApiGatewayWeb & exit /b 1 )

echo ========================================
echo All services built successfully!
echo Now run: docker-compose up --build
echo ========================================