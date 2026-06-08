const amqp = require('amqplib');

let connection = null;
let channel = null;

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

async function connectRabbitMQ() {
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    
    // Declare queues
    await channel.assertQueue(process.env.RABBITMQ_QUEUE_ORDER_CREATED || 'order.created', { durable: true });
    await channel.assertQueue(process.env.RABBITMQ_QUEUE_USER_REGISTERED || 'user.registered', { durable: true });
    
    console.log('Connected to RabbitMQ');
    return channel;
  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error);
    throw error;
  }
}

function getChannel() {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized. Call connectRabbitMQ first.');
  }
  return channel;
}

async function closeConnection() {
  if (connection) {
    await connection.close();
    console.log('RabbitMQ connection closed');
  }
}

module.exports = {
  connectRabbitMQ,
  getChannel,
  closeConnection
};
