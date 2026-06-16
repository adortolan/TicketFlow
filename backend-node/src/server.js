require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const eventRoutes = require('./routes/eventRoutes');
const pool = require('./config/database');
const { connectRabbitMQ } = require('./config/rabbitmq');
const { sendErrorResponse } = require('./utils/errors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/events', eventRoutes);

// Health check
app.get('/health', async (req, res) => {
  try {
    // Check MySQL connection
    let mysqlStatus = 'disconnected';
    try {
      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();
      mysqlStatus = 'connected';
    } catch (error) {
      mysqlStatus = 'disconnected';
    }

    // Check RabbitMQ connection
    let rabbitmqStatus = 'disconnected';
    try {
      const { getChannel } = require('./config/rabbitmq');
      const channel = getChannel();
      if (channel) {
        rabbitmqStatus = 'connected';
      }
    } catch (error) {
      rabbitmqStatus = 'disconnected';
    }

    const overallStatus = (mysqlStatus === 'connected' && rabbitmqStatus === 'connected') ? 'ok' : 'degraded';

    res.json({
      status: overallStatus,
      mysql: mysqlStatus,
      rabbitmq: rabbitmqStatus
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      mysql: 'unknown',
      rabbitmq: 'unknown',
      error: 'Health check failed'
    });
  }
});

// Global error handler (must be last)
app.use((err, req, res, next) => {
  sendErrorResponse(res, err);
});

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Test MySQL connection
    await pool.getConnection();
    console.log('Database connected');
    
    // Connect to RabbitMQ
    await connectRabbitMQ();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
