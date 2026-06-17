import * as amqp from 'amqplib';

let connection: any = null;
let channel: amqp.Channel | null = null;

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

async function connectRabbitMQ(): Promise<amqp.Channel> {
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

function getChannel(): amqp.Channel {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized. Call connectRabbitMQ first.');
  }
  return channel;
}

async function closeConnection(): Promise<void> {
  if (connection) {
    await connection.close();
    console.log('RabbitMQ connection closed');
  }
}

export {
  connectRabbitMQ,
  getChannel,
  closeConnection
};
