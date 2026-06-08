const Order = require('../models/Order');
const Event = require('../models/Event');
const { getChannel } = require('../config/rabbitmq');

const createOrder = async (req, res) => {
  try {
    const { event_id, quantity } = req.body;
    const user_id = req.user.id;

    // Get event details
    const event = await Event.findById(event_id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check availability
    if (event.available_tickets < quantity) {
      return res.status(400).json({ error: 'Not enough tickets available' });
    }

    // Calculate total price
    const total_price = event.price * quantity;

    // Create order with PENDING status
    const orderId = await Order.create({
      user_id,
      event_id,
      quantity,
      total_price,
      status: 'PENDING'
    });

    // Publish order to RabbitMQ for processing
    try {
      const channel = getChannel();
      const orderMessage = {
        orderId,
        userId: user_id,
        eventId: event_id,
        quantity,
        totalPrice: total_price
      };
      
      await channel.sendToQueue(
        process.env.RABBITMQ_QUEUE_ORDER_CREATED || 'order.created',
        Buffer.from(JSON.stringify(orderMessage)),
        { persistent: true }
      );
    } catch (error) {
      console.error('Error publishing to RabbitMQ:', error);
      // Continue anyway, order is saved
    }

    res.status(201).json({
      message: 'Order created and is being processed',
      orderId,
      status: 'PENDING'
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user owns the order or is admin
    if (order.user_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.findByUserId(req.user.id);
    res.json(orders);
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders
};
