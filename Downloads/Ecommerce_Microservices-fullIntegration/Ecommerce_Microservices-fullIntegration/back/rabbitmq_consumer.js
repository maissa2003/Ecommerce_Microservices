const amqp = require("amqplib");

// RabbitMQ connection parameters
const RABBITMQ_URL = "amqp://guest:guest@localhost:5672";
const RABBITMQ_QUEUE = "order.queue";

async function consumeMessages() {
  try {
    // Create connection
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    // Declare queue
    await channel.assertQueue(RABBITMQ_QUEUE, { durable: true });

    console.log("🐰 RabbitMQ Message Consumer Started");
    console.log("=".repeat(50));
    console.log(`[*] Waiting for messages from queue: ${RABBITMQ_QUEUE}`);
    console.log("[*] Press CTRL+C to exit");
    console.log("=".repeat(50));

    // Set up consumer
    await channel.consume(RABBITMQ_QUEUE, msg => {
      if (msg) {
        try {
          const message = JSON.parse(msg.content.toString());

          console.log("\n📥 NEW MESSAGE RECEIVED:");
          console.log("-".repeat(40));

          // Display message based on type
          if (message.orderId) {
            console.log(`   📝 Order ID: ${message.orderId}`);
            console.log(`   👤 User ID: ${message.userId}`);
            console.log(`   📊 Status: ${message.status}`);
            console.log(`   💰 Total: $${message.total}`);
          } else if (message.articleName) {
            console.log(`   🛒 Article: ${message.articleName}`);
            console.log(`   👤 User ID: ${message.userId}`);
            console.log(`   💵 Price: $${message.price}`);
            console.log(`   📦 Quantity: ${message.quantity}`);
          }

          console.log(`   🕐 Timestamp: ${message.timestamp}`);
          console.log(`   💬 Message: ${message.message}`);
          console.log("=".repeat(50));

          // Acknowledge message
          channel.ack(msg);
        } catch (error) {
          console.log(`❌ Error decoding message: ${error.message}`);
          console.log(`Raw message: ${msg.content.toString()}`);
          channel.ack(msg);
        }
      }
    });
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Handle CTRL+C
process.on("SIGINT", () => {
  console.log("\n\n👋 Consumer stopped by user");
  process.exit(0);
});

// Start consumer
consumeMessages();
