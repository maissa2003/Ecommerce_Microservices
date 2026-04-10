import pika
import time
import json

# RabbitMQ connection parameters
RABBITMQ_HOST = 'localhost'
RABBITMQ_PORT = 5672
RABBITMQ_USER = 'admin'
RABBITMQ_PASS = 'admin'
RABBITMQ_QUEUE = 'test_queue'

def send_message():
    """Send a message to RabbitMQ"""
    try:
        # Create connection
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(
                host=RABBITMQ_HOST,
                port=RABBITMQ_PORT,
                credentials=pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
            )
        )
        channel = connection.channel()
        
        # Declare queue
        channel.queue_declare(queue=RABBITMQ_QUEUE, durable=True)
        
        # Send message
        message = {
            'timestamp': time.time(),
            'message': 'Hello from Python!',
            'type': 'test'
        }
        
        channel.basic_publish(
            exchange='',
            routing_key=RABBITMQ_QUEUE,
            body=json.dumps(message),
            properties=pika.BasicProperties(
                delivery_mode=2,  # make message persistent
            )
        )
        
        print(f" [✅] Sent message: {message}")
        connection.close()
        
    except Exception as e:
        print(f" [❌] Error sending message: {e}")

def receive_message():
    """Receive messages from RabbitMQ"""
    try:
        # Create connection
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(
                host=RABBITMQ_HOST,
                port=RABBITMQ_PORT,
                credentials=pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
            )
        )
        channel = connection.channel()
        
        # Declare queue
        channel.queue_declare(queue=RABBITMQ_QUEUE, durable=True)
        
        def callback(ch, method, properties, body):
            """Callback function for received messages"""
            message = json.loads(body)
            print(f" [📥] Received message: {message}")
            ch.basic_ack(delivery_tag=method.delivery_tag)
        
        # Set up consumer
        channel.basic_consume(
            queue=RABBITMQ_QUEUE,
            on_message_callback=callback,
            auto_ack=False
        )
        
        print(' [*] Waiting for messages. To exit press CTRL+C')
        channel.start_consuming()
        
    except Exception as e:
        print(f" [❌] Error receiving message: {e}")

if __name__ == '__main__':
    print("🐰 RabbitMQ Python Test")
    print("Choose option:")
    print("1. Send message")
    print("2. Receive messages")
    
    choice = input("Enter choice (1 or 2): ")
    
    if choice == '1':
        send_message()
    elif choice == '2':
        receive_message()
    else:
        print("Invalid choice")
