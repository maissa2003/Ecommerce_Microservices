const amqp = require("amqplib");

// RabbitMQ connection parameters
const RABBITMQ_URL = "amqp://admin:admin@localhost:5672";
const RABBITMQ_QUEUE = "test_queue";

async function sendMessage() {
  try {
    // Create connection
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    // Declare queue
    await channel.assertQueue(RABBITMQ_QUEUE, { durable: true });

    // Send message
    const message = {
      timestamp: new Date().toISOString(),
      message: "Hello from JavaScript!",
      type: "test"
    };

    channel.sendToQueue(RABBITMQ_QUEUE, Buffer.from(JSON.stringify(message)), {
      persistent: true
    });

    console.log(" [✅] Sent message:", message);

    await channel.close();
    await connection.close();
  } catch (error) {
    console.error(" [❌] Error sending message:", error.message);
  }
}

async function receiveMessage() {
  try {
    // Create connection
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    // Declare queue
    await channel.assertQueue(RABBITMQ_QUEUE, { durable: true });

    console.log(" [*] Waiting for messages. To exit press CTRL+C");

    // Set up consumer
    await channel.consume(RABBITMQ_QUEUE, msg => {
      if (msg) {
        const message = JSON.parse(msg.content.toString());
        console.log(" [📥] Received message:", message);
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error(" [❌] Error receiving message:", error.message);
  }
}

// Main function
async function main() {
  console.log("🐰 RabbitMQ JavaScript Test");
  console.log("Choose option:");
  console.log("1. Send message");
  console.log("2. Receive messages");

  const readline = require("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question("Enter choice (1 or 2): ", async choice => {
    if (choice === "1") {
      await sendMessage();
    } else if (choice === "2") {
      await receiveMessage();
    } else {
      console.log("Invalid choice");
    }
    rl.close();
  });
}

main().catch(console.error);
