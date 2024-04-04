// config.js
const path = require('path');

module.exports = {
  port: 3001,
  amqpUrl: 'amqp://messagebus',
  userFilesDir: path.join(__dirname, 'userfiles'),
};
