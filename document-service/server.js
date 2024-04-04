// server.js
const app = require('./app'); // Import the Express application
const amqp = require('amqplib');
const port = 3001;

// RabbitMQ connection URL
const amqpUrl = 'amqp://messagebus';

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
        // eslint-disable-next-line no-undef
        const userFilesDir = path.join(__dirname, 'userfiles');
        // eslint-disable-next-line no-undef
        if (!fs.existsSync(userFilesDir)){
        // eslint-disable-next-line no-undef
          fs.mkdirSync(userFilesDir);
        }
        // eslint-disable-next-line no-undef
        const outputPath = path.join(userFilesDir, `${user.id}.txt`);
        // eslint-disable-next-line no-undef
        fs.writeFileSync(outputPath, JSON.stringify(user, null, 2), 'utf8');
        console.log(`User info saved to ${outputPath}`);

        try {
            // eslint-disable-next-line no-undef
          await db.collection('users').insertOne(user).then(() => {
            console.log('User added to database');
          });

          console.log(`User info saved to database with ID: ${user.id}`);
        } catch (dbError) {
          console.error('Error saving user to database:', dbError);
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
