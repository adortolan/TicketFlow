const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getChannel } = require('../config/rabbitmq');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const register = async (req, res) => {
  try {
    const { nome, email, senha, cpf } = req.body;

    // Validate required fields
    if (!nome || !email || !senha || !cpf) {
      return res.status(400).json({ error: 'Missing required fields: nome, email, senha, cpf' });
    }

    // Check if user already exists by email
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Check if CPF already exists
    const existingUserByCpf = await User.findByCpf(cpf);
    if (existingUserByCpf) {
      return res.status(409).json({ error: 'CPF already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Create user
    const userId = await User.create({
      name: nome,
      email,
      password: hashedPassword,
      cpf
    });

    // Publish user registered event to RabbitMQ
    try {
      const channel = getChannel();
      await channel.sendToQueue(
        process.env.RABBITMQ_QUEUE_USER_REGISTERED || 'user.registered',
        Buffer.from(JSON.stringify({ userId, email, name: nome }))
      );
    } catch (error) {
      console.error('Error publishing to RabbitMQ:', error);
    }

    res.status(201).json({
      message: 'User registered successfully',
      userId
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(senha, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  register,
  login,
  getProfile
};
