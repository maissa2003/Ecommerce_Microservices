# 🐰 RabbitMQ Integration for Order Service - Summary

## 📋 Overview
RabbitMQ has been integrated with the MS-Order service to publish events when:
1. Items are added to cart
2. Orders are confirmed/created
3. Order status is updated

## 🗂️ Files Created/Modified

### 1. **Dependencies Added** (pom.xml)
- Added: `spring-boot-starter-amqp`

### 2. **Configuration** (application.properties)
```properties
spring.rabbitmq.host=localhost
spring.rabbitmq.port=5672
spring.rabbitmq.username=admin
spring.rabbitmq.password=admin
spring.rabbitmq.virtual-host=/
```

### 3. **New Files Created**

#### **RabbitMQConfig.java**
- Queue: `order.queue`
- Exchange: `order.exchange` (Topic)
- Routing Key: `order.created`
- MessageConverter: Jackson2JsonMessageConverter

#### **RabbitMQService.java**
Publishing methods:
- `publishOrderCreated(Order order)`
- `publishOrderStatusUpdated(Order order)`
- `publishItemAddedToCart(Long userId, String articleName, Double price, Integer quantity)`

#### **RabbitMQConsumerService.java**
Consumer methods:
- `receiveOrderMessage(OrderMessage message)`
- `receiveCartItemMessage(CartItemMessage message)`

#### **DTOs Created**
- **OrderMessage.java**: For order events
- **CartItemMessage.java**: For cart item events

### 4. **Modified Files**

#### **OrderService.java**
Added RabbitMQ publishing in:
- `addToCart()` - publishes cart item added event
- `confirmOrder()` - publishes order created event
- `updateStatus()` - publishes order status updated event

## 🚀 Testing with Postman

### 1. **Start RabbitMQ Container**
```powershell
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 -e RABBITMQ_DEFAULT_USER=admin -e RABBITMQ_DEFAULT_PASS=admin rabbitmq:3.12-management
```

### 2. **Verify RabbitMQ is Running**
- Management UI: http://localhost:15672
- Username: admin
- Password: admin

### 3. **Test Scenarios**

#### **Scenario 1: Add Item to Cart**
```http
POST http://localhost:8080/api/orders/cart/1/add
Content-Type: application/x-www-form-urlencoded

articleId=1&articleName=Laptop&price=999.99&quantity=2
```
**Expected**: Cart item added message published to RabbitMQ

#### **Scenario 2: Confirm Order**
```http
POST http://localhost:8080/api/orders/cart/1/confirm
Content-Type: application/x-www-form-urlencoded
```
**Expected**: Order created message published to RabbitMQ

#### **Scenario 3: Update Order Status**
```http
PUT http://localhost:8080/api/orders/1/status
Content-Type: application/x-www-form-urlencoded

status=SHIPPED
```
**Expected**: Order status updated message published to RabbitMQ

## 📊 Viewing Messages

### 1. **In Application Logs**
Check Docker logs for MS-Order:
```powershell
docker logs ms-order --follow
```

### 2. **In RabbitMQ Management UI**
1. Go to: http://localhost:15672
2. Login: admin/admin
3. Navigate to "Queues and Streams"
4. Click on "order.queue"
5. Click "Get Messages" to see published messages

### 3. **Message Format**

#### **Order Created Message**
```json
{
  "orderId": 1,
  "userId": 1,
  "status": "CONFIRMED",
  "total": 1999.98,
  "timestamp": "2026-04-06T15:30:00",
  "message": "Order created successfully"
}
```

#### **Cart Item Added Message**
```json
{
  "userId": 1,
  "articleName": "Laptop",
  "price": 999.99,
  "quantity": 2,
  "timestamp": "2026-04-06T15:30:00",
  "message": "Item added to cart"
}
```

## 🔄 Next Steps

### Rebuild and Restart
```powershell
# Rebuild MS-Order with RabbitMQ integration
docker-compose down
docker-compose up --build ms-order

# Or rebuild all services
docker-compose down
docker-compose up --build
```

### Test Flow
1. Add items to cart via Postman
2. Check RabbitMQ Management UI for messages
3. Confirm order via Postman
4. Check logs for published messages
5. Update order status via Postman
6. Verify status update message

## 📝 Troubleshooting

### **RabbitMQ Connection Issues**
- Verify RabbitMQ is running: `docker ps | findstr rabbitmq`
- Check RabbitMQ logs: `docker logs rabbitmq`
- Verify connection settings in application.properties

### **Messages Not Publishing**
- Check MS-Order logs: `docker logs ms-order`
- Verify queue exists in RabbitMQ Management UI
- Check for serialization errors in logs

### **Build Issues**
- Clean and rebuild: `mvn clean install` in MS_Order directory
- Check for dependency conflicts in pom.xml

## 🎯 Architecture

```
Frontend (Postman) 
    ↓
API Gateway (8080)
    ↓
MS-Order Service (8084) 
    ↓
RabbitMQ Publisher → Exchange → Queue → Consumer
    ↓
Logs/Management UI
```

All order events are now published to RabbitMQ for real-time monitoring and integration with other services! 🎉
