import User from '../User';
import pool from '../../config/database';

jest.mock('../../config/database');

describe('User model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user and return insertId', async () => {
      const mockResult = { insertId: 1 };
      (pool.execute as jest.Mock).mockResolvedValue([mockResult]);

      const insertId = await User.create({
        name: 'Test User',
        email: 'test@test.com',
        password: 'hashedpassword',
        cpf: '12345678901',
        role: 'CLIENTE'
      });

      expect(insertId).toBe(1);
      expect(pool.execute).toHaveBeenCalledWith(
        'INSERT INTO users (name, email, password, cpf, role) VALUES (?, ?, ?, ?, ?)',
        ['Test User', 'test@test.com', 'hashedpassword', '12345678901', 'CLIENTE']
      );
    });

    it('should default role to CLIENTE if not provided', async () => {
      const mockResult = { insertId: 2 };
      (pool.execute as jest.Mock).mockResolvedValue([mockResult]);

      const insertId = await User.create({
        name: 'Test User',
        email: 'test@test.com',
        password: 'hashedpassword',
        cpf: '12345678901'
      });

      expect(insertId).toBe(2);
      expect(pool.execute).toHaveBeenCalledWith(
        'INSERT INTO users (name, email, password, cpf, role) VALUES (?, ?, ?, ?, ?)',
        ['Test User', 'test@test.com', 'hashedpassword', '12345678901', 'CLIENTE']
      );
    });
  });

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@test.com',
        cpf: '12345678901',
        role: 'CLIENTE',
        password: 'hashedpassword',
        created_at: new Date()
      };
      (pool.execute as jest.Mock).mockResolvedValue([[mockUser]]);

      const user = await User.findByEmail('test@test.com');

      expect(user).toEqual(mockUser);
      expect(pool.execute).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = ?',
        ['test@test.com']
      );
    });

    it('should return undefined when not found', async () => {
      (pool.execute as jest.Mock).mockResolvedValue([[]]);

      const user = await User.findByEmail('unknown@test.com');

      expect(user).toBeUndefined();
    });
  });

  describe('findByCpf', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@test.com',
        cpf: '12345678901',
        role: 'CLIENTE',
        password: 'hashedpassword',
        created_at: new Date()
      };
      (pool.execute as jest.Mock).mockResolvedValue([[mockUser]]);

      const user = await User.findByCpf('12345678901');

      expect(user).toEqual(mockUser);
      expect(pool.execute).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE cpf = ?',
        ['12345678901']
      );
    });

    it('should return undefined when not found', async () => {
      (pool.execute as jest.Mock).mockResolvedValue([[]]);

      const user = await User.findByCpf('00000000000');

      expect(user).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('should return user without password when found', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@test.com',
        cpf: '12345678901',
        role: 'CLIENTE',
        created_at: new Date()
      };
      (pool.execute as jest.Mock).mockResolvedValue([[mockUser]]);

      const user = await User.findById(1);

      expect(user).toEqual(mockUser);
      expect('password' in user!).toBe(false);
      expect(pool.execute).toHaveBeenCalledWith(
        'SELECT id, name, email, cpf, role, created_at FROM users WHERE id = ?',
        [1]
      );
    });

    it('should return undefined when not found', async () => {
      (pool.execute as jest.Mock).mockResolvedValue([[]]);

      const user = await User.findById(999);

      expect(user).toBeUndefined();
    });
  });

  describe('findAll', () => {
    it('should return array of users without password', async () => {
      const mockUsers = [
        {
          id: 1,
          name: 'Test User 1',
          email: 'test1@test.com',
          cpf: '12345678901',
          role: 'CLIENTE',
          created_at: new Date()
        },
        {
          id: 2,
          name: 'Test User 2',
          email: 'test2@test.com',
          cpf: '98765432109',
          role: 'ADMIN',
          created_at: new Date()
        }
      ];
      (pool.execute as jest.Mock).mockResolvedValue([mockUsers]);

      const users = await User.findAll();

      expect(users).toHaveLength(2);
      expect('password' in users[0]).toBe(false);
      expect('password' in users[1]).toBe(false);
      expect(pool.execute).toHaveBeenCalledWith(
        'SELECT id, name, email, cpf, role, created_at FROM users'
      );
    });

    it('should return empty array when no users', async () => {
      (pool.execute as jest.Mock).mockResolvedValue([[]]);

      const users = await User.findAll();

      expect(users).toEqual([]);
    });
  });
});
