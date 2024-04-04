const express = require('express');
const app = express();
const port = 3001;
const amqp = require('amqplib');
const fs = require('fs');
const path = require('path');
const { db } = require("./services/database");
const promBundle = require('express-prom-bundle');
const metricsMiddleware = promBundle({includeMethod: true, includePath: true, includeStatusCode: true, normalizePath: true, promClient: {collectDefaultMetrics: {}}});
app.use(metricsMiddleware);

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
  
      channel.consume(q.queue, async (msg) => { // Make sure this function is async to use await inside
        if (msg.content) {
          console.log(" [x] Received %s", msg.content.toString());
          const user = JSON.parse(msg.content.toString());
  
          // Ensure the userfiles directory exists
          const userFilesDir = path.join(__dirname, 'userfiles');
          if (!fs.existsSync(userFilesDir)){
            fs.mkdirSync(userFilesDir);
          }
  
          // Define the path for the output file using the user's ID
          const outputPath = path.join(userFilesDir, `${user.id}.txt`);
          
          // Save the received message to the file
          fs.writeFileSync(outputPath, JSON.stringify(user, null, 2), 'utf8');
          console.log(`User info saved to ${outputPath}`);
  
          // Save or update the received message in the database
          try {
            await db.collection('users').insertOne(user).then((result) => {
              console.log('User added to database');
            });

            console.log(`User info saved to database with ID: ${user.id}`);
          } catch (dbError) {
            console.error('Error saving user to database:', dbError);
          }
        }
      }, {
        noAck: true
      });
    } catch (error) {
      console.error('Failed to start RabbitMQ consumer:', error);
    }
  }

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/user/:id', (req, res) => {
    const userId = req.params.id;
    const userFilesDir = path.join(__dirname, 'userfiles');
    const userFilePath = path.join(userFilesDir, `${userId}.txt`);
  
    // Check if the file for the given user ID exists
    if (fs.existsSync(userFilePath)) {
      // Read the file and parse the JSON content
      fs.readFile(userFilePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading user file:', err);
          return res.status(500).send('Error reading user data');
        }
        // Send the user data as JSON
        res.json(JSON.parse(data));
      });
    } else {
      // If the file does not exist, respond with an error
      res.status(404).send('User not found');
    }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
  // Check if the environment is not test before starting the RabbitMQ consumer
  if (process.env.NODE_ENV !== 'test') {
    startRabbitMQConsumer();
  }
});