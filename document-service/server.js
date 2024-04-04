const app = require('./app'); // Import the Express application
const amqp = require('amqplib');
const fs = require('fs').promises; // Use promise-based fs module
const path = require('path');
const { port, amqpUrl, userFilesDir } = require('./config'); // Import configurations

async function startRabbitMQConsumer() {
  try {
    const conn = await amqp.connect(amqpUrl);
    const channel = await conn.createChannel();
    const exchangeName = 'userAdded';
    const queueName = 'userAddedQueue';
    const routingKey = 'user.added';

    await channel.assertExchange(exchangeName, 'topic', { durable: false });
    const q = await channel.assertQueue(queueName, { exclusive: false });

    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);
    await channel.bindQueue(q.queue, exchangeName, routingKey);

    channel.consume(q.queue, async (msg) => {
      if (msg.content) {
        console.log(" [x] Received %s", msg.content.toString());
        const user = JSON.parse(msg.content.toString());

        try {
          await fs.mkdir(userFilesDir, { recursive: true });
          const outputPath = path.join(userFilesDir, `${user.id}.txt`);
          await fs.writeFile(outputPath, JSON.stringify(user, null, 2), 'utf8');
          console.log(`User info saved to ${outputPath}`);

          // Database insertion logic here...
          // Note: This snippet assumes `db` logic is implemented elsewhere and is asynchronous.
          await db.collection('users').insertOne(user); // eslint-disable-line
          console.log(`User info saved to database with ID: ${user.id}`);
        } catch (error) {
          console.error('Error processing message:', error);
        }
      }
    }, { noAck: true });
  } catch (error) {
    console.error('Failed to start RabbitMQ consumer:', error);
  }
}

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
  startRabbitMQConsumer();
});
