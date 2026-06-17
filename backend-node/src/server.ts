import 'dotenv/config';
import express, { Request, Response, NextFunction, Application } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import orderRoutes from './routes/orderRoutes';
import eventRoutes from './routes/eventRoutes';
import pool from './config/database';
import { connectRabbitMQ } from './config/rabbitmq';
import { sendErrorResponse } from './utils/errors';

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/events', eventRoutes);

// Health check
app.get('/health', async (req: Request, res: Response) => {
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
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  sendErrorResponse(res, err);
});

const PORT = process.env.PORT || 3001;

async function startServer(): Promise<void> {
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

// Only start server if this file is run directly
if (require.main === module) {
  startServer();
}

export default app;
