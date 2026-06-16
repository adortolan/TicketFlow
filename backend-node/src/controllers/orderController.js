const Order = require('../models/Order');
const Event = require('../models/Event');
const { getChannel } = require('../config/rabbitmq');
const { AppError, ErrorCodes } = require('../utils/errors');

const createOrder = async (req, res, next) => {
  try {
    const { eventId, quantity } = req.body;
    const user_id = req.user.id;

    // Get event details
    const event = await Event.findById(eventId);
    if (!event) {
      throw new AppError('Event not found', 404, ErrorCodes.EVENT_NOT_FOUND);
    }

    // Check availability
    if (event.available_tickets < quantity) {
      throw new AppError('Not enough tickets available', 400, ErrorCodes.INVALID_INPUT);
    }

    // Calculate total price
    const total_price = event.price * quantity;

    // Create order with PENDING status
    const orderId = await Order.create({
      user_id,
      event_id: eventId,
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
        eventId: eventId,
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

    res.status(202).json({
      message: 'Order created and is being processed',
      orderId,
      status: 'PROCESSING'
    });
  } catch (error) {
    console.error('Create order error:', error);
    next(error); // Pass to global error handler
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      throw new AppError('Order not found', 404, ErrorCodes.ORDER_NOT_FOUND);
    }

    // Check if user owns the order or is admin
    if (order.user_id !== req.user.id && req.user.role !== 'ADMIN') {
      throw new AppError('Access denied', 403, ErrorCodes.INSUFFICIENT_PERMISSIONS);
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    next(error); // Pass to global error handler
  }
};

const getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.findByUserId(req.user.id);
    res.json(orders);
  } catch (error) {
    console.error('Get user orders error:', error);
    next(error); // Pass to global error handler
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders
};
