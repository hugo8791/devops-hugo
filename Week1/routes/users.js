var express = require('express');
var router = express.Router();
const { db } = require("../services/database");
const amqp = require('amqplib');
const amqpUrl = 'amqp://messagebus';
async function publishToRabbitMQ(message) {
  try {
    const conn = await amqp.connect(amqpUrl);
    const channel = await conn.createChannel();
    const exchangeName = 'userAdded';
    const routingKey = 'user.added'; // Adjust routing key as needed
    
    // Ensure the exchange exists
    await channel.assertExchange(exchangeName, 'topic', { durable: false });

    // Publish the message to the exchange with the routing key
    channel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify(message)));

    console.log(" [x] Sent '%s'", message);

    // Close the connection and exit
    await channel.close();
    await conn.close();
  } catch (error) {
    console.error('Error publishing message to RabbitMQ:', error);
  }
}

/* GET users listing. */

router.get('/', async function(req, res, next) { // eslint-disable-line no-unused-vars
  let users = await db.collection('users').find().toArray();

  res.json(users);

});

 

router.post('/', async function(req, res, next){ // eslint-disable-line no-unused-vars
  db.collection('users').insertOne(req.body)
    .then(async (user) => {
      // Successfully inserted user, now publish message to RabbitMQ
      const userMessage = {
        id: user.insertedId,
        ...req.body
      };
      await publishToRabbitMQ(userMessage);

      res.status(201).json({ "id": user.insertedId });
    })
    .catch(err => res.status(500).json(err));
});

 

module.exports = router;