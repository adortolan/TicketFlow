import pool from '../config/database';
import { UserRole } from '../types';

export interface IUser {
  id: number;
  name: string;
  email: string;
  cpf: string;
  role: UserRole;
  password: string;
  created_at: Date;
}

export interface IUserCreate {
  name: string;
  email: string;
  password: string;
  cpf: string;
  role?: UserRole;
}

class User {
  static async create(data: IUserCreate): Promise<number> {
    const { name, email, password, cpf, role = 'CLIENTE' } = data;
    const result = await pool.execute(
      'INSERT INTO users (name, email, password, cpf, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, password, cpf, role]
    );
    const insertResult = result[0] as { insertId: number };
    return insertResult.insertId;
  }

  static async findByEmail(email: string): Promise<IUser | undefined> {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    const userRows = rows as IUser[];
    return userRows[0];
  }

  static async findByCpf(cpf: string): Promise<IUser | undefined> {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE cpf = ?',
      [cpf]
    );
    const userRows = rows as IUser[];
    return userRows[0];
  }

  static async findById(id: number): Promise<Omit<IUser, 'password'> | undefined> {
    const [rows] = await pool.execute(
      'SELECT id, name, email, cpf, role, created_at FROM users WHERE id = ?',
      [id]
    );
    const userRows = rows as Omit<IUser, 'password'>[];
    return userRows[0];
  }

  static async findAll(): Promise<Omit<IUser, 'password'>[]> {
    const [rows] = await pool.execute(
      'SELECT id, name, email, cpf, role, created_at FROM users'
    );
    return rows as Omit<IUser, 'password'>[];
  }
}

export default User;
