const pool = require('../config/database');

class User {
  static async create({ name, email, password, cpf, role = 'CLIENTE' }) {
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, cpf, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, password, cpf, role]
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async findByCpf(cpf) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE cpf = ?',
      [cpf]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, name, email, cpf, role, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findAll() {
    const [rows] = await pool.execute(
      'SELECT id, name, email, cpf, role, created_at FROM users'
    );
    return rows;
  }
}

module.exports = User;
